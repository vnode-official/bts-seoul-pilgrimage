"use client";

import { Clock, MapPinned, TrainFront, X } from "lucide-react";
import { INDEPENDENT_DISCLAIMER, getSpotById } from "@/data/spots";
import { GlassPanel } from "@/components/GlassPanel";
import { NaverOpenButton } from "@/components/NaverOpenButton";
import { ScriptBlock } from "@/components/ScriptBlock";
import { isSpotUnlocked } from "@/lib/access";
import { useMapSession } from "@/stores/map-session";
import { useTransitGuide } from "@/stores/transit-guide";

export function SpotModal() {
  const selectedSpotId = useMapSession((s) => s.selectedSpotId);
  const setSelectedSpotId = useMapSession((s) => s.setSelectedSpotId);
  const setActivePanel = useMapSession((s) => s.setActivePanel);
  const setDestSpotId = useTransitGuide((s) => s.setDestSpotId);
  const tier = useMapSession((s) => s.tier);
  const spot = selectedSpotId ? getSpotById(selectedSpotId) : undefined;

  if (!spot || !isSpotUnlocked(spot, tier)) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center p-3 md:items-stretch md:justify-end md:p-4">
      <GlassPanel className="pointer-events-auto max-h-[86vh] w-full max-w-md overflow-y-auto rounded-[28px] md:my-0 md:max-h-none md:w-[400px]">
        <div
          className="relative h-44 w-full"
          style={{ background: spot.image.gradient }}
        >
          {spot.image.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={spot.image.src}
              alt={spot.image.alt}
              className="h-full w-full object-cover opacity-80"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <button
            type="button"
            onClick={() => setSelectedSpotId(null)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white"
            aria-label="Close pin"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
            {spot.category === "bts" ? "BTS Spot" : "Naver 4.8+ Food"}
          </span>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h2 className="font-display text-[22px] tracking-tight text-white">
              {spot.nameEn}
            </h2>
            <p className="mt-0.5 text-[14px] text-white/55">{spot.nameKr}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-white/45">
              <MapPinned className="h-3.5 w-3.5" />
              {spot.neighborhood} · {spot.nearestStation} · {spot.line}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-white/40">
              <Clock className="h-3.5 w-3.5" />
              Visit window
            </p>
            <p className="text-[13px] text-white">{spot.visit.days}</p>
            <p className="text-[13px] text-white/70">{spot.visit.hours}</p>
            {spot.visit.lastEntry ? (
              <p className="text-[12px] text-white/50">
                Last entry: {spot.visit.lastEntry}
              </p>
            ) : null}
            <p className="mt-1 text-[12px] text-white/45">{spot.visit.notes}</p>
          </div>
          <p className="text-[13px] leading-5 text-white/70">{spot.editorial}</p>
          {spot.publicRecord ? (
            <p className="text-[12px] leading-5 text-white/45">
              Public record: {spot.publicRecord}
            </p>
          ) : null}
          {spot.naverRatingSnapshot ? (
            <p className="text-[12px] text-white/50">
              Editorial Naver snapshot {spot.naverRatingSnapshot.toFixed(2)} — not
              a live API rating.
            </p>
          ) : null}
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/40">
              EN / KR scripts
            </p>
            {spot.scripts.map((script) => (
              <ScriptBlock key={script.situation} script={script} />
            ))}
          </div>
          <NaverOpenButton
            target={{
              nameEn: spot.nameEn,
              nameKr: spot.nameKr,
              coords: spot.coords,
            }}
            label="Open in Naver Map"
          />
          <p className="text-center text-[11px] leading-4 text-white/40">
            Opens the Naver Maps app for satellite and street detail. This page
            does not embed Naver Cloud tiles.
          </p>
          <button
            type="button"
            onClick={() => {
              setDestSpotId(spot.id);
              setActivePanel("transit");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-[13px] text-white/85"
          >
            <TrainFront className="h-4 w-4" />
            Subway / bus via Naver
          </button>
          <p className="text-[11px] leading-4 text-white/30">
            {INDEPENDENT_DISCLAIMER}
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
