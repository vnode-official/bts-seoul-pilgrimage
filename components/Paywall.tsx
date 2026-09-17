"use client";

import { Check, Ticket, X } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";
import { PREMIUM_PRICE_USD } from "@/lib/access";
import { formatUsd } from "@/lib/format";
import { SPOTS } from "@/data/spots";
import { useLemonCheckout } from "@/lib/use-lemon-checkout";
import { useMapSession } from "@/stores/map-session";

const INCLUDED = [
  `${SPOTS.length} editorial pins (Seoul + Goyang, BTS spots + curated Naver 4.8+ food)`,
  "Full subway transfer & boarding notes",
  "Airport–Gangnam taxi ceiling heuristic + route matrix",
  "EN / KR ordering scripts at every kitchen",
];

export function Paywall() {
  const open = useMapSession((s) => s.paywallOpen);
  const setPaywallOpen = useMapSession((s) => s.setPaywallOpen);
  const checkout = useLemonCheckout();

  if (!open) {
    return null;
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
            Free tier keeps public historical pins, a few Goyang landmarks, and
            two Seoul kitchens. The Pass unlocks the rest of Seoul and Goyang.
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
            disabled={checkout.disabled}
            onClick={() => void checkout.startCheckout()}
            className="mt-6 w-full rounded-2xl bg-accent py-3 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkout.busy
              ? "Opening Lemon checkout…"
              : checkout.canLemon
                ? `Unlock Pass · ${formatUsd(PREMIUM_PRICE_USD)}`
                : checkout.demoUnlockAvailable
                  ? "Local demo unlock"
                  : "Checkout not configured"}
          </button>
          {!checkout.canLemon ? (
            <p className="mt-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] leading-4 text-white/55">
              {checkout.demoUnlockAvailable
                ? "Local only: Lemon is unset, so this issues a labeled demo cookie — not a receipt."
                : "Set NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID and NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID on Vercel, then redeploy. Production will not fake an unlock."}
            </p>
          ) : (
            <p className="mt-3 text-[11px] leading-4 text-white/40">
              Lemon Squeezy overlay checkout. Hosted page opens if the overlay
              script is blocked.
            </p>
          )}
          {checkout.error ? (
            <p className="mt-3 text-[12px] text-red-300">{checkout.error}</p>
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
