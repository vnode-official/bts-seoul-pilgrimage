"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, Polyline } from "leaflet";
import { TRANSIT_HUBS, getTransitHub } from "@/data/hubs";
import { getSpotById } from "@/data/spots";
import { pinInnerHtml } from "@/lib/pin-html";
import { buildTransitGuide } from "@/lib/transit-guide";
import { useMapSession } from "@/stores/map-session";
import { useTransitGuide } from "@/stores/transit-guide";
import type { Spot } from "@/types";

export function OsmGuideLayer({
  map,
  leaflet,
}: {
  map: LeafletMap;
  leaflet: typeof import("leaflet");
}) {
  const hubId = useTransitGuide((state) => state.hubId);
  const destSpotId = useTransitGuide((state) => state.destSpotId);
  const walkOverride = useTransitGuide((state) => state.walkOverride);
  const activePanel = useMapSession((state) => state.activePanel);
  const lineRef = useRef<Polyline | null>(null);

  useEffect(() => {
    const hub = getTransitHub(hubId) ?? TRANSIT_HUBS[3];
    const spot = destSpotId ? getSpotById(destSpotId) : undefined;
    lineRef.current?.remove();
    lineRef.current = null;
    if (!spot) return;
    const guide = buildTransitGuide(hub, spot);
    const path = walkOverride && walkOverride.length > 1 ? walkOverride : guide.walkPath;
    if (path.length > 1) {
      lineRef.current = leaflet
        .polyline(
          path.map((point) => [point.lat, point.lng]),
          { color: "#8B5CF6", weight: 5, opacity: 0.9 },
        )
        .addTo(map);
    }
    if (activePanel === "transit") {
      const bounds = leaflet.latLngBounds(
        [hub.coords.lat, hub.coords.lng],
        [spot.coords.lat, spot.coords.lng],
      );
      map.fitBounds(bounds, { padding: [56, 56] });
    }
    return () => {
      lineRef.current?.remove();
      lineRef.current = null;
    };
  }, [activePanel, destSpotId, hubId, leaflet, map, walkOverride]);

  return null;
}

export function paintOsmPins(
  leaflet: typeof import("leaflet"),
  map: LeafletMap,
  spots: Spot[],
  onSpot: (spot: Spot) => void,
  lockedIds: Set<string>,
): Marker[] {
  return spots.map((spot) => {
    const locked = lockedIds.has(spot.id);
    return leaflet
      .marker([spot.coords.lat, spot.coords.lng], {
        icon: leaflet.divIcon({
          className: "osm-pin",
          html: `<div class="bts-pin${locked ? " is-locked" : ""}">${pinInnerHtml({
            locked,
            category: spot.category,
            label: `${spot.nameEn} (${spot.nameKr})`,
          })}</div>`,
          iconSize: [1, 1],
          iconAnchor: [0, 0],
        }),
        zIndexOffset: locked ? 10 : 40,
        title: spot.nameEn,
      })
      .on("click", () => onSpot(spot))
      .addTo(map);
  });
}
