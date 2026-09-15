"use client";

import { useState } from "react";
import { ArrivalList } from "@/components/ArrivalList";
import { formatClock } from "@/lib/format";
import { useLiveTransit } from "@/stores/live-transit";

export function LiveArrivalsOptional() {
  const config = useLiveTransit((state) => state.config);
  const snapshot = useLiveTransit((state) => state.snapshot);
  const loading = useLiveTransit((state) => state.loading);
  const refresh = useLiveTransit((state) => state.refresh);
  const [open, setOpen] = useState(false);

  if (!config?.liveTransitConfigured) {
    return null;
  }

  const upstream = (snapshot?.errors ?? []).filter((error) => error.code !== "missing-key");

  return (
    <div className="space-y-2 px-1 pb-3">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void refresh();
        }}
        className="w-full rounded-2xl border border-white/10 px-3 py-2 text-left text-[12px] text-white/60"
      >
        {open ? "Hide" : "Show"} live Seoul arrivals (optional)
      </button>
      {open ? (
        <div className="space-y-2">
          <p className="px-1 text-[11px] text-white/40">
            Last updated {snapshot?.fetchedAt ? formatClock(snapshot.fetchedAt) : loading ? "…" : "never"}
          </p>
          {upstream.map((error) => (
            <p
              key={`${error.feed}-${error.code}`}
              className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90"
            >
              {error.message}
            </p>
          ))}
          <ArrivalList arrivals={snapshot?.arrivals ?? []} loading={loading && !snapshot} />
        </div>
      ) : null}
    </div>
  );
}
