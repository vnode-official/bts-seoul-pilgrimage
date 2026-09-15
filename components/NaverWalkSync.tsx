"use client";

import { useEffect } from "react";
import { TRANSIT_HUBS, getTransitHub } from "@/data/hubs";
import { getSpotById } from "@/data/spots";
import { stationForSpotLoose } from "@/lib/transit-guide";
import { useLiveTransit } from "@/stores/live-transit";
import { useTransitGuide } from "@/stores/transit-guide";
import type { GeoPoint } from "@/types";

export function NaverWalkSync() {
  const hubId = useTransitGuide((state) => state.hubId);
  const destSpotId = useTransitGuide((state) => state.destSpotId);
  const setWalkOverride = useTransitGuide((state) => state.setWalkOverride);
  const walkingOn = useLiveTransit((state) => state.config?.naverWalkingConfigured);

  useEffect(() => {
    if (!walkingOn || !destSpotId) return;
    const hub = getTransitHub(hubId) ?? TRANSIT_HUBS[3];
    const spot = getSpotById(destSpotId);
    if (!spot) return;
    const origin = stationForSpotLoose(spot)?.coords ?? hub.coords;
    let cancelled = false;
    const params = new URLSearchParams({
      originLat: String(origin.lat),
      originLng: String(origin.lng),
      destLat: String(spot.coords.lat),
      destLng: String(spot.coords.lng),
    });
    void fetch(`/api/naver/walking?${params.toString()}`, { cache: "no-store" })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (cancelled || !hasPath(body)) return;
        setWalkOverride(body.path);
      })
      .catch(() => {
        /* keep catalog station→pin segment */
      });
    return () => {
      cancelled = true;
    };
  }, [destSpotId, hubId, setWalkOverride, walkingOn]);

  return null;
}

function hasPath(body: unknown): body is { path: GeoPoint[] } {
  if (typeof body !== "object" || body === null || !("path" in body)) return false;
  const path = (body as { path: unknown }).path;
  return Array.isArray(path) && path.length > 1;
}
