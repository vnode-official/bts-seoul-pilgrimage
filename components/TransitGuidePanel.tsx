"use client";

import { ExternalLink, Footprints, TrainFront } from "lucide-react";
import { TRANSIT_HUBS, getTransitHub } from "@/data/hubs";
import { SPOTS } from "@/data/spots";
import { GuideSteps } from "@/components/GuideSteps";
import { isSpotUnlocked } from "@/lib/access";
import { tryOpenNaverApp } from "@/lib/naver-directions";
import { buildTransitGuide } from "@/lib/transit-guide";
import { useMapSession } from "@/stores/map-session";
import { useTransitGuide } from "@/stores/transit-guide";

export function TransitGuidePanel() {
  const hubId = useTransitGuide((state) => state.hubId);
  const setHubId = useTransitGuide((state) => state.setHubId);
  const destSpotId = useTransitGuide((state) => state.destSpotId);
  const setDestSpotId = useTransitGuide((state) => state.setDestSpotId);
  const tier = useMapSession((state) => state.tier);
  const requestUnlock = useMapSession((state) => state.requestUnlock);
  const hub = getTransitHub(hubId) ?? TRANSIT_HUBS[3];
  const unlocked = SPOTS.filter((spot) => isSpotUnlocked(spot, tier));
  const dest =
    unlocked.find((spot) => spot.id === destSpotId) ?? unlocked[0] ?? SPOTS[0];
  const guide = buildTransitGuide(hub, dest);

  return (
    <div className="space-y-3 px-1 pb-3">
      <div className="px-1">
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
          Naver subway / bus routing
        </p>
        <p className="mt-1 text-[12px] leading-4 text-white/50">
          Steps for this pin. Turn-by-turn and satellite open in the Naver Maps
          app — we do not invent live vehicle GPS.
        </p>
      </div>
      <label className="block px-0.5 text-[11px] text-white/40">
        From
        <select
          value={hub.id}
          onChange={(event) => setHubId(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none"
        >
          {TRANSIT_HUBS.map((item) => (
            <option key={item.id} value={item.id} className="bg-[#16161c]">
              {item.nameEn} · {item.nameKr}
            </option>
          ))}
        </select>
      </label>
      <label className="block px-0.5 text-[11px] text-white/40">
        To
        <select
          value={dest.id}
          onChange={(event) => {
            const next = SPOTS.find((spot) => spot.id === event.target.value);
            if (!next) return;
            if (!isSpotUnlocked(next, tier)) requestUnlock();
            else setDestSpotId(next.id);
          }}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none"
        >
          {unlocked.map((spot) => (
            <option key={spot.id} value={spot.id} className="bg-[#16161c]">
              {spot.nameEn} · {spot.nearestStation}
            </option>
          ))}
        </select>
      </label>
      {tier !== "premium" ? (
        <button
          type="button"
          onClick={requestUnlock}
          className="w-full rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-left text-[12px] text-accent"
        >
          Pass unlocks all {SPOTS.length} pins as Naver destinations.
        </button>
      ) : null}
      <GuideSteps steps={guide.steps} stationLabel={guide.destStation?.lineEn} />
      <a
        href={guide.naverTransitWeb}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => tryOpenNaverApp(guide.naverTransitApp)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-medium text-black"
      >
        <TrainFront className="h-4 w-4" />
        Open subway / bus in Naver Maps
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <a
        href={guide.naverWalkWeb}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-[12px] text-white/80"
      >
        <Footprints className="h-3.5 w-3.5" />
        Walk from station on Naver
      </a>
    </div>
  );
}
