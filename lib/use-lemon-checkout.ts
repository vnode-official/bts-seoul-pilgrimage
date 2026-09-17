"use client";

import { useEffect, useState } from "react";
import { openLemonOverlay, orderIdFromLemonEvent } from "@/lib/lemon-client";
import { publicLemonConfigured } from "@/lib/lemon-public";
import { writeStoredPassUnlock } from "@/lib/pass-unlock";
import { useMapSession } from "@/stores/map-session";
import type { CheckoutResponse } from "@/types";

export function useLemonCheckout() {
  const lemonConfigured = useMapSession((s) => s.lemonConfigured);
  const demoUnlockAvailable = useMapSession((s) => s.demoUnlockAvailable);
  const hydrate = useMapSession((s) => s.hydrate);
  const setPaywallOpen = useMapSession((s) => s.setPaywallOpen);
  const paywallOpen = useMapSession((s) => s.paywallOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canLemon = lemonConfigured || publicLemonConfigured();

  useEffect(() => {
    if (!paywallOpen || !canLemon) {
      return;
    }
    window.createLemonSqueezy?.();
    window.LemonSqueezy?.Setup({
      eventHandler: (event) => {
        const orderId = orderIdFromLemonEvent(event);
        if (!orderId) {
          return;
        }
        writeStoredPassUnlock({
          orderId,
          unlockedAt: new Date().toISOString(),
          source: "lemon",
        });
        void fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }).then(async (response) => {
          if (!response.ok) {
            return;
          }
          window.LemonSqueezy?.Url.Close();
          setPaywallOpen(false);
          await hydrate();
        });
      },
    });
  }, [canLemon, hydrate, paywallOpen, setPaywallOpen]);

  async function startCheckout(): Promise<void> {
    if (!canLemon && !demoUnlockAvailable) {
      setError(
        "Checkout is not configured. Add NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID (and store id/slug) on Vercel.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = (await response.json()) as CheckoutResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? data.message ?? "Checkout unavailable.");
      }
      if (data.mode === "lemon" && data.checkoutUrl) {
        if (!openLemonOverlay(data.checkoutUrl)) {
          window.location.href = data.checkoutUrl;
        }
        setBusy(false);
        return;
      }
      if (data.mode === "demo" && data.checkoutUrl && demoUnlockAvailable) {
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error(data.message || "Lemon Squeezy is not configured.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBusy(false);
    }
  }

  return {
    busy,
    error,
    canLemon,
    demoUnlockAvailable,
    disabled: busy || (!canLemon && !demoUnlockAvailable),
    startCheckout,
  };
}
