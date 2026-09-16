"use client";

import { useCallback, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { MapControls } from "@/components/MapControls";
import { MapHint } from "@/components/MapHint";
import { OsmMap } from "@/components/OsmMap";
import { mapViewForRegion } from "@/data/spots";
import { useMapSession } from "@/stores/map-session";

export function MapCanvas() {
  const mapRef = useRef<LeafletMap | null>(null);
  const regionFilter = useMapSession((state) => state.regionFilter);
  const onReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  return (
    <div className="absolute inset-0 z-0 isolate bg-[#0F0F12]">
      <OsmMap onReady={onReady} />
      <MapHint />
      <p className="pointer-events-none absolute bottom-2 left-3 z-[5] text-[9px] tracking-[0.08em] text-white/20 md:bottom-3 md:left-4">
        © Esri
      </p>
      <MapControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onRecenter={() => {
          const view = mapViewForRegion(regionFilter);
          mapRef.current?.setView([view.lat, view.lng], view.zoom);
        }}
      />
    </div>
  );
}
