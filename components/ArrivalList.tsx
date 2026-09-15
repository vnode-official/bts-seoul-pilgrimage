"use client";

import { Bus, TrainFront } from "lucide-react";
import type { TransitArrival } from "@/types/transit";
import { formatEtaSeconds } from "@/lib/format";

export function ArrivalList({
  arrivals,
  loading,
}: {
  arrivals: TransitArrival[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <p className="rounded-2xl border border-white/10 bg-black/25 px-3 py-4 text-[12px] text-white/45">
        Fetching Seoul Metro and TOPIS arrivals…
      </p>
    );
  }
  if (arrivals.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-black/25 px-3 py-4 text-[12px] text-white/45">
        No live arrivals returned. If a feed failed, the error is above — vehicles are not invented.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {arrivals.map((arrival) => (
        <li
          key={arrival.id}
          className="flex items-start gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2"
        >
          {arrival.mode === "subway" ? (
            <TrainFront className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          ) : (
            <Bus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white">
              {arrival.lineLabel}
              {arrival.destination ? ` → ${arrival.destination}` : ""}
            </p>
            <p className="text-[12px] leading-4 text-white/55">{arrival.message}</p>
            {arrival.locationHint ? (
              <p className="mt-0.5 text-[11px] text-white/35">{arrival.locationHint}</p>
            ) : null}
          </div>
          <span className="shrink-0 text-[11px] text-white/50">
            {formatEtaSeconds(arrival.etaSeconds) ?? arrival.direction}
          </span>
        </li>
      ))}
    </ul>
  );
}
