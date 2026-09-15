"use client";

import { create } from "zustand";
import {
  TRANSIT_STATIONS,
  getTransitStation,
  stationForSpot,
} from "@/data/stations";
import type { GeoPoint, TransitConfigResponse, TransitSnapshot } from "@/types/transit";

interface LiveTransitState {
  stationId: string;
  snapshot: TransitSnapshot | null;
  config: TransitConfigResponse | null;
  loading: boolean;
  requestError: string | null;
  kakaoPath: GeoPoint[] | null;
  setStationId: (id: string) => void;
  setKakaoPath: (path: GeoPoint[] | null) => void;
  loadConfig: () => Promise<void>;
  refresh: () => Promise<void>;
  followSpot: (spotId: string | null) => void;
}

export const useLiveTransit = create<LiveTransitState>((set, get) => ({
  stationId: TRANSIT_STATIONS[0].id,
  snapshot: null,
  config: null,
  loading: false,
  requestError: null,
  kakaoPath: null,
  setStationId: (id) => {
    if (!getTransitStation(id)) return;
    set({ stationId: id });
    void get().refresh();
  },
  setKakaoPath: (path) => set({ kakaoPath: path }),
  followSpot: (spotId) => {
    if (!spotId) return;
    const station = stationForSpot(spotId);
    if (station && station.id !== get().stationId) {
      get().setStationId(station.id);
    }
  },
  loadConfig: async () => {
    try {
      const response = await fetch("/api/transit/config", { cache: "no-store" });
      if (!response.ok) return;
      const config = (await response.json()) as TransitConfigResponse;
      set({ config });
    } catch {
      /* chrome only — live panel still attempts /api/transit/live */
    }
  },
  refresh: async () => {
    const { stationId } = get();
    set({ loading: true, requestError: null });
    try {
      const response = await fetch(
        `/api/transit/live?stationId=${encodeURIComponent(stationId)}`,
        { cache: "no-store" },
      );
      const body: unknown = await response.json();
      if (!response.ok) {
        set({
          loading: false,
          snapshot: null,
          requestError: errorMessage(body, `Transit API ${response.status}`),
        });
        return;
      }
      set({
        snapshot: body as TransitSnapshot,
        loading: false,
        requestError: null,
      });
    } catch {
      set({
        loading: false,
        snapshot: null,
        requestError: "Could not reach /api/transit/live. No vehicles drawn.",
      });
    }
  },
}));

function errorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return fallback;
}
