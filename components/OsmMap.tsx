"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SPOTS, SEOUL_CENTER } from "@/data/spots";
import { filterSpots, isSpotUnlocked } from "@/lib/access";
import { OsmGuideLayer, paintOsmPins } from "@/components/OsmGuideLayer";
import { useMapSession } from "@/stores/map-session";
import type { Spot } from "@/types";

export function OsmMap({
  onReady,
}: {
  onReady: (map: LeafletMap) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const tier = useMapSession((state) => state.tier);
  const categoryFilter = useMapSession((state) => state.categoryFilter);
  const search = useMapSession((state) => state.search);
  const selectedSpotId = useMapSession((state) => state.selectedSpotId);
  const setSelectedSpotId = useMapSession((state) => state.setSelectedSpotId);
  const requestUnlock = useMapSession((state) => state.requestUnlock);
  const visible = filterSpots(SPOTS, { tier, filter: categoryFilter, search, includeLocked: true });

  const onSpot = useCallback(
    (spot: Spot) => {
      if (!isSpotUnlocked(spot, tier)) requestUnlock();
      else setSelectedSpotId(spot.id);
    },
    [requestUnlock, setSelectedSpotId, tier],
  );

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((mod) => {
      if (!cancelled) setLeaflet(mod);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!leaflet || !hostRef.current) return;
    const instance = leaflet.map(hostRef.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 10,
      maxZoom: 18,
    }).setView([SEOUL_CENTER.lat, SEOUL_CENTER.lng], 12);
    leaflet
      .tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      })
      .addTo(instance);
    mapRef.current = instance;
    setMap(instance);
    onReadyRef.current(instance);
    return () => {
      instance.remove();
      mapRef.current = null;
    };
  }, [leaflet]);

  useEffect(() => {
    if (!leaflet || !map) return;
    markersRef.current.forEach((marker) => marker.remove());
    const lockedIds = new Set(
      visible.filter((spot) => !isSpotUnlocked(spot, tier)).map((spot) => spot.id),
    );
    markersRef.current = paintOsmPins(leaflet, map, visible, onSpot, lockedIds);
  }, [leaflet, map, onSpot, tier, visible]);

  useEffect(() => {
    if (!map || !selectedSpotId) return;
    const spot = visible.find((item) => item.id === selectedSpotId);
    if (!spot) return;
    map.flyTo([spot.coords.lat, spot.coords.lng], Math.max(map.getZoom(), 14), { duration: 0.45 });
  }, [map, selectedSpotId, visible]);

  return (
    <>
      <div ref={hostRef} className="h-full w-full" />
      {map && leaflet ? <OsmGuideLayer map={map} leaflet={leaflet} /> : null}
    </>
  );
}
