"use client";

import { useState } from "react";
import { Check, Ticket, X } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";
import { FREE_SPOT_LIMIT, PREMIUM_PRICE_USD } from "@/lib/access";
import { formatUsd } from "@/lib/format";
import { SPOTS } from "@/data/spots";
import { useMapSession } from "@/stores/map-session";
import type { CheckoutResponse } from "@/types";

const INCLUDED = [
  `${SPOTS.length} editorial pins (legacy spots + Naver 4.8+ food)`,
  "Full subway transfer & boarding notes",
  "Airport–Gangnam taxi ceiling heuristic + route matrix",
  "EN/KR ordering scripts at every kitchen",
];

export function Paywall() {
  const open = useMapSession((s) => s.paywallOpen);
  const setPaywallOpen = useMapSession((s) => s.setPaywallOpen);
  const demoUnlockAvailable = useMapSession((s) => s.demoUnlockAvailable);
  const lemonConfigured = useMapSession((s) => s.lemonConfigured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function startCheckout(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = (await response.json()) as CheckoutResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Checkout unavailable.");
      }
      if (data.mode === "lemon" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      window.location.href = "/pass/success?demo=1";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm md:items-center">
      <GlassPanel className="relative w-full max-w-md overflow-hidden rounded-[28px]">
        <button
          type="button"
          onClick={() => setPaywallOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 pt-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent">
            <Ticket className="h-5 w-5" />
          </div>
          <p className="font-display text-[22px] tracking-tight text-white">
            Seoul Pilgrimage Pass
          </p>
          <p className="mt-1 text-[13px] text-white/50">
            {formatUsd(PREMIUM_PRICE_USD)} · one-time · independent fan editor
          </p>
          <p className="mt-3 text-[13px] leading-5 text-white/60">
            Free tier keeps the first {FREE_SPOT_LIMIT} historical pins and the
            airport taxi rules. The Pass unlocks the rest of the map.
          </p>
          <ul className="mt-4 space-y-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-2 text-[13px] text-white/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={busy}
            onClick={() => void startCheckout()}
            className="mt-6 w-full rounded-2xl bg-accent py-3 text-[14px] font-medium text-white disabled:opacity-60"
          >
            {busy
              ? "Opening checkout…"
              : lemonConfigured
                ? "Continue to Lemon Squeezy"
                : "Continue"}
          </button>
          {demoUnlockAvailable && !lemonConfigured ? (
            <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-4 text-amber-100/80">
              Local dev only: Lemon variant IDs are not set. Checkout will issue
              a signed demo Pass cookie after the success URL.
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 text-[12px] text-red-300">{error}</p>
          ) : null}
          <p className="mt-4 text-[11px] leading-4 text-white/35">
            Not affiliated with BTS, HYBE, Naver, or Kakao. No membership,
            concert ticket, or artist access is implied.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
