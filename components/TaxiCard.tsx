"use client";

import { useMemo, useState } from "react";
import { Car, ExternalLink } from "lucide-react";
import { AIRPORT_GANGNAM_CEILING_KRW, TAXI_ROUTES } from "@/data/taxi-matrix";
import { formatKrwRange } from "@/lib/format";
import { openKakaoT } from "@/lib/kakao";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/GlassPanel";
import { KakaoDriveEstimate } from "@/components/KakaoDriveEstimate";

export function TaxiCard() {
  const [routeId, setRouteId] = useState(TAXI_ROUTES[0].id);
  const route = useMemo(
    () => TAXI_ROUTES.find((item) => item.id === routeId) ?? TAXI_ROUTES[0],
    [routeId],
  );
  const showCeiling = route.id.includes("icn") && route.id.includes("gangnam");

  return (
    <div className="space-y-3 px-1">
      <p className="px-1 text-[11px] uppercase tracking-[0.14em] text-white/35">
        Pre-calculated KRW estimates · hail with Kakao T
      </p>
      <select
        value={routeId}
        onChange={(event) => setRouteId(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none"
      >
        {TAXI_ROUTES.map((item) => (
          <option key={item.id} value={item.id} className="bg-[#16161c] text-white">
            {item.fromShort} → {item.toShort}
          </option>
        ))}
      </select>
      <GlassPanel className="overflow-hidden rounded-[26px] bg-gradient-to-br from-white/10 to-white/[0.03]">
        <div className="flex items-start justify-between p-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              Seoul Taxi Estimate
            </p>
            <p className="mt-2 font-display text-[22px] tracking-tight text-white">
              {formatKrwRange(route.estimateKrwLow, route.estimateKrwHigh)}
            </p>
            <p className="mt-1 text-[12px] text-white/50">
              {route.durationMin}–{route.durationMax} min ·{" "}
              {route.tollsLikely ? "tolls likely extra" : "tolls uncommon"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent">
            <Car className="h-5 w-5" strokeWidth={1.7} />
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-[13px] font-medium text-white">
            {route.from} → {route.to}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-white/50">{route.notes}</p>
        </div>
        {showCeiling ? (
          <div className="border-t border-white/10 bg-accent/10 px-4 py-2.5 text-[12px] text-accent">
            ICN → Gangnam pause heuristic: {AIRPORT_GANGNAM_CEILING_KRW.toLocaleString("ko-KR")}원
          </div>
        ) : null}
      </GlassPanel>
      <KakaoDriveEstimate
        origin={route.origin}
        dest={route.dest}
        originName={route.originQuery}
        destName={route.destQuery}
      />
      <button
        type="button"
        onClick={() => openKakaoT(route.originQuery, route.destQuery)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-medium text-black",
        )}
      >
        Open in Kakao T
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
      <p className="px-1 text-[11px] leading-4 text-white/35">
        Subway and bus routing lives on the Transit tab (Naver Maps). This card is
        taxi only — Kakao T deep-link, not live GPS.
      </p>
    </div>
  );
}
