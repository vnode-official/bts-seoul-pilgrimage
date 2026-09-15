import { TRANSIT_STATIONS, stationForSpot } from "@/data/stations";
import type { TransitHub } from "@/data/hubs";
import { haversineMeters } from "@/lib/geo";
import {
  naverTransitAppUrl,
  naverTransitWebUrl,
  naverWalkWebUrl,
} from "@/lib/naver-directions";
import { buildSteps } from "@/lib/transit-steps";
import type { GeoPoint, Spot } from "@/types";
import type { TransitStation } from "@/types/transit";

export type { GuideStep, GuideStepKind } from "@/lib/transit-steps";

export interface TransitGuide {
  hub: TransitHub;
  spot: Spot;
  destStation: TransitStation | null;
  walkMeters: number;
  steps: ReturnType<typeof buildSteps>;
  walkPath: GeoPoint[];
  naverTransitWeb: string;
  naverTransitApp: string;
  naverWalkWeb: string;
}

export function stationForSpotLoose(spot: Spot): TransitStation | undefined {
  const mapped = stationForSpot(spot.id);
  if (mapped) return mapped;
  const needle = spot.nearestStation.toLowerCase();
  return TRANSIT_STATIONS.find(
    (station) =>
      needle.includes(station.nameEn.toLowerCase()) ||
      needle.includes(station.nameKr),
  );
}

export function buildTransitGuide(hub: TransitHub, spot: Spot): TransitGuide {
  const destStation = stationForSpotLoose(spot) ?? null;
  const walkFrom = destStation?.coords ?? hub.coords;
  const walkMeters = Math.round(haversineMeters(walkFrom, spot.coords));
  const origin = { name: hub.naverName, coords: hub.coords };
  const dest = { name: spot.naverPlaceQuery || spot.nameKr, coords: spot.coords };
  return {
    hub,
    spot,
    destStation,
    walkMeters,
    steps: buildSteps(hub, spot, destStation, walkMeters),
    walkPath: walkMeters > 25 ? [walkFrom, spot.coords] : [spot.coords],
    naverTransitWeb: naverTransitWebUrl(origin, dest),
    naverTransitApp: naverTransitAppUrl(origin, dest),
    naverWalkWeb: naverWalkWebUrl(
      destStation
        ? { name: destStation.nameKr, coords: destStation.coords }
        : origin,
      dest,
    ),
  };
}
