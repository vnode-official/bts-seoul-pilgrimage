"use client";

import { create } from "zustand";
import { getTransitHub } from "@/data/hubs";
import type { GeoPoint } from "@/types";

interface TransitGuideState {
  hubId: string;
  destSpotId: string | null;
  walkOverride: GeoPoint[] | null;
  setHubId: (id: string) => void;
  setDestSpotId: (id: string | null) => void;
  setWalkOverride: (path: GeoPoint[] | null) => void;
}

export const useTransitGuide = create<TransitGuideState>((set) => ({
  hubId: "hongik",
  destSpotId: "hongdae-playground",
  walkOverride: null,
  setHubId: (id) => {
    if (!getTransitHub(id)) return;
    set({ hubId: id, walkOverride: null });
  },
  setDestSpotId: (id) => set({ destSpotId: id, walkOverride: null }),
  setWalkOverride: (path) => set({ walkOverride: path }),
}));
