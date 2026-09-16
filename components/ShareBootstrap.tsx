"use client";

import { useEffect, useState } from "react";
import { getSpotById, getSpotBySlug } from "@/data/spots";
import { isSpotUnlocked } from "@/lib/access";
import {
  captureInviteRefFromLocation,
  spotTokenFromLocation,
  syncSpotQuery,
} from "@/lib/share";
import { useMapSession } from "@/stores/map-session";

export function ShareBootstrap() {
  const hydrated = useMapSession((state) => state.hydrated);
  const tier = useMapSession((state) => state.tier);
  const selectedSpotId = useMapSession((state) => state.selectedSpotId);
  const setSelectedSpotId = useMapSession((state) => state.setSelectedSpotId);
  const requestUnlock = useMapSession((state) => state.requestUnlock);
  const setMobileSheet = useMapSession((state) => state.setMobileSheet);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    captureInviteRefFromLocation();
  }, []);

  useEffect(() => {
    if (!hydrated || urlReady) {
      return;
    }
    const token = spotTokenFromLocation();
    if (token) {
      const spot = getSpotBySlug(token);
      if (spot) {
        setSelectedSpotId(spot.id);
        setMobileSheet("half");
        if (!isSpotUnlocked(spot, tier)) {
          requestUnlock();
        }
      }
    }
    setUrlReady(true);
  }, [
    hydrated,
    requestUnlock,
    setMobileSheet,
    setSelectedSpotId,
    tier,
    urlReady,
  ]);

  useEffect(() => {
    if (!urlReady) {
      return;
    }
    const spot = selectedSpotId ? getSpotById(selectedSpotId) : undefined;
    syncSpotQuery(spot?.slug ?? null);
  }, [selectedSpotId, urlReady]);

  useEffect(() => {
    function onPopState(): void {
      const token = spotTokenFromLocation();
      if (!token) {
        setSelectedSpotId(null);
        return;
      }
      const spot = getSpotBySlug(token);
      setSelectedSpotId(spot?.id ?? null);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [setSelectedSpotId]);

  return null;
}
