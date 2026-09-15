"use client";

import { useEffect } from "react";
import { TRANSIT_REFRESH_MS } from "@/data/stations";
import { useLiveTransit } from "@/stores/live-transit";
import { useMapSession } from "@/stores/map-session";
import { useTransitGuide } from "@/stores/transit-guide";
import { isSpotUnlocked } from "@/lib/access";
import { getSpotById } from "@/data/spots";

export function LiveTransitSync() {
  const refresh = useLiveTransit((state) => state.refresh);
  const loadConfig = useLiveTransit((state) => state.loadConfig);
  const followSpot = useLiveTransit((state) => state.followSpot);
  const liveOn = useLiveTransit((state) => state.config?.liveTransitConfigured);
  const refreshMs = useLiveTransit((state) => state.config?.refreshMs);
  const selectedSpotId = useMapSession((state) => state.selectedSpotId);
  const tier = useMapSession((state) => state.tier);
  const setDestSpotId = useTransitGuide((state) => state.setDestSpotId);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    followSpot(selectedSpotId);
    if (!selectedSpotId) return;
    const spot = getSpotById(selectedSpotId);
    if (spot && isSpotUnlocked(spot, tier)) {
      setDestSpotId(spot.id);
    }
  }, [followSpot, selectedSpotId, setDestSpotId, tier]);

  useEffect(() => {
    if (!liveOn) return;
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, refreshMs ?? TRANSIT_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [liveOn, refresh, refreshMs]);

  return null;
}
