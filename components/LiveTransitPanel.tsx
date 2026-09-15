"use client";

import { AlertTriangle, Bus, RefreshCw, TrainFront } from "lucide-react";
import { TRANSIT_REFRESH_MS, TRANSIT_STATIONS, getTransitStation } from "@/data/stations";
import { ArrivalList } from "@/components/ArrivalList";
import { FeedStatus } from "@/components/FeedStatus";
import { KakaoStationPreview } from "@/components/KakaoStationPreview";
import { useLiveTransit } from "@/stores/live-transit";
import { formatClock } from "@/lib/format";

export function LiveTransitPanel() {
  const stationId = useLiveTransit((state) => state.stationId);
  const setStationId = useLiveTransit((state) => state.setStationId);
  const snapshot = useLiveTransit((state) => state.snapshot);
  const config = useLiveTransit((state) => state.config);
  const loading = useLiveTransit((state) => state.loading);
  const requestError = useLiveTransit((state) => state.requestError);
  const refresh = useLiveTransit((state) => state.refresh);
  const station = snapshot?.station ?? getTransitStation(stationId) ?? TRANSIT_STATIONS[0];
  const intervalSec = Math.round((config?.refreshMs ?? TRANSIT_REFRESH_MS) / 1000);
  const gpsBuses = (snapshot?.vehicles ?? []).filter(
    (vehicle) => vehicle.mode === "bus" && vehicle.coords,
  ).length;
  const mappedTrains = (snapshot?.vehicles ?? []).filter(
    (vehicle) => vehicle.mode === "subway" && vehicle.coords,
  ).length;
  const unmappedTrains = (snapshot?.vehicles ?? []).filter(
    (vehicle) => vehicle.mode === "subway" && !vehicle.coords,
  );

  return (
    <div className="space-y-3 px-1 pb-3">
      <div className="flex items-start justify-between gap-2 px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
            Live arrivals · Seoul Open API
          </p>
          <p className="mt-1 text-[12px] text-white/50">
            Refresh every {intervalSec}s. Trains pin only at catalog stations — never interpolated.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white"
          aria-label="Refresh live transit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <select
        value={stationId}
        onChange={(event) => setStationId(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none"
      >
        {TRANSIT_STATIONS.map((item) => (
          <option key={item.id} value={item.id} className="bg-[#16161c]">
            {item.nameEn} · {item.nameKr}
          </option>
        ))}
      </select>
      <FeedStatus config={config} errors={snapshot?.errors ?? []} requestError={requestError} />
      <p className="px-1 text-[11px] text-white/40">
        Last updated{" "}
        {snapshot?.fetchedAt ? formatClock(snapshot.fetchedAt) : loading ? "…" : "never"}
      </p>
      {requestError ? (
        <div className="flex gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {requestError}
        </div>
      ) : null}
      <ArrivalList arrivals={snapshot?.arrivals ?? []} loading={loading && !snapshot} />
      <div className="flex gap-3 px-1 text-[11px] text-white/40">
        <span className="inline-flex items-center gap-1">
          <Bus className="h-3 w-3 text-sky-300" />
          {gpsBuses} bus GPS
        </span>
        <span className="inline-flex items-center gap-1">
          <TrainFront className="h-3 w-3 text-accent" />
          {mappedTrains} trains at catalog stops
        </span>
      </div>
      {unmappedTrains.length > 0 ? (
        <p className="px-1 text-[11px] leading-4 text-white/35">
          {unmappedTrains.length} trains reported on {station.lineKr} at stations outside this
          catalog — listed in the feed, not drawn on the map.
        </p>
      ) : null}
      <KakaoStationPreview station={station} />
    </div>
  );
}
