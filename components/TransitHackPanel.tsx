"use client";

import { Lock, TrainFront } from "lucide-react";
import { TRANSIT_TIPS } from "@/data/transit";
import { useMapSession } from "@/stores/map-session";
import { cn } from "@/lib/cn";

export function TransitHackPanel() {
  const tier = useMapSession((s) => s.tier);
  const requestUnlock = useMapSession((s) => s.requestUnlock);

  return (
    <div className="space-y-2 px-1 pb-2">
      <p className="px-1 pb-1 text-[11px] uppercase tracking-[0.14em] text-white/35">
        Airport rules free · subway hacks on Pass
      </p>
      {TRANSIT_TIPS.map((tip) => {
        const locked = tip.tier === "premium" && tier !== "premium";
        return (
          <article
            key={tip.id}
            className={cn(
              "rounded-2xl border border-white/10 bg-black/25 p-3",
              locked && "relative overflow-hidden",
            )}
          >
            <div className="mb-1.5 flex items-center gap-2 text-accent">
              <TrainFront className="h-3.5 w-3.5" />
              <p className="text-[13px] font-medium text-white">{tip.title}</p>
            </div>
            <p
              className={cn(
                "text-[12px] leading-5 text-white/55",
                locked && "blur-[3px]",
              )}
            >
              {tip.body}
            </p>
            {tip.lines && !locked ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {tip.lines.map((line) => (
                  <span
                    key={line}
                    className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60"
                  >
                    {line}
                  </span>
                ))}
              </div>
            ) : null}
            {locked ? (
              <button
                type="button"
                onClick={requestUnlock}
                className="absolute inset-0 flex items-center justify-center bg-[#0F0F12]/40"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[11px] text-white">
                  <Lock className="h-3 w-3" />
                  Unlock with Pass
                </span>
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
