"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Ticket } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";
import {
  orderIdFromSearchParams,
  writeStoredPassUnlock,
} from "@/lib/pass-unlock";
import { useMapSession } from "@/stores/map-session";

export default function PassSuccessPage() {
  const hydrate = useMapSession((s) => s.hydrate);
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [detail, setDetail] = useState("Confirming your Pass…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("demo") === "1";
    const orderId = orderIdFromSearchParams(params);

    async function finish(): Promise<void> {
      if (demo) {
        const response = await fetch("/api/checkout/complete?demo=1", {
          method: "POST",
        });
        const json = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(json.error ?? "Demo unlock is disabled.");
        }
        writeStoredPassUnlock({
          orderId: "demo",
          unlockedAt: new Date().toISOString(),
          source: "demo",
        });
        setDetail("Demo Pass unlocked for local development. Not a Lemon receipt.");
        return;
      }
      if (!orderId) {
        throw new Error(
          "Lemon did not return an order id. If you paid, open the overlay again or wait for the webhook.",
        );
      }
      writeStoredPassUnlock({
        orderId,
        unlockedAt: new Date().toISOString(),
        source: "lemon",
      });
      const response = await fetch("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not unlock the Pass.");
      }
      setDetail("Pass unlocked on this browser (signed cookie + order id).");
    }

    void finish()
      .then(async () => {
        setStatus("ok");
        await hydrate();
      })
      .catch((error: unknown) => {
        setStatus("error");
        setDetail(error instanceof Error ? error.message : "Unlock failed.");
      });
  }, [hydrate]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-ink p-4">
      <GlassPanel className="w-full max-w-md rounded-[28px] p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent">
          {status === "ok" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <Ticket className="h-6 w-6" />
          )}
        </div>
        <h1 className="font-display text-[24px] tracking-tight text-white">
          {status === "ok" ? "Pass unlocked" : status === "error" ? "Unlock failed" : "Almost there"}
        </h1>
        <p className="mt-2 text-[14px] leading-5 text-white/55">{detail}</p>
        <Link
          href="/"
          className="mt-6 block rounded-2xl bg-accent py-3 text-center text-[14px] font-medium text-white"
        >
          Open the map
        </Link>
      </GlassPanel>
    </main>
  );
}
