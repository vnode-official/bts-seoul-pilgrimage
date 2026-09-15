"use client";

import { useEffect } from "react";
import { TRANSIT_REFRESH_MS } from "@/data/stations";
import { useLiveTransit } from "@/stores/live-transit";
import { useMapSession } from "@/stores/map-session";

export function LiveTransitSync() {
  const refresh = useLiveTransit((state) => state.refresh);
  const loadConfig = useLiveTransit((state) => state.loadConfig);
  const followSpot = useLiveTransit((state) => state.followSpot);
  const refreshMs = useLiveTransit((state) => state.config?.refreshMs);
  const selectedSpotId = useMapSession((state) => state.selectedSpotId);

  useEffect(() => {
    void loadConfig();
    void refresh();
  }, [loadConfig, refresh]);

  useEffect(() => {
    followSpot(selectedSpotId);
  }, [followSpot, selectedSpotId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh();
    }, refreshMs ?? TRANSIT_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [refresh, refreshMs]);

  return null;
}
