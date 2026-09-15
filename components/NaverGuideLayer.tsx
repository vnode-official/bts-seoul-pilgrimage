"use client";

import { useEffect, useRef } from "react";
import { TRANSIT_HUBS, getTransitHub } from "@/data/hubs";
import { getSpotById } from "@/data/spots";
import { buildTransitGuide } from "@/lib/transit-guide";
import { useMapSession } from "@/stores/map-session";
import { useTransitGuide } from "@/stores/transit-guide";

export function NaverGuideLayer({ map }: { map: naver.maps.Map }) {
  const hubId = useTransitGuide((state) => state.hubId);
  const destSpotId = useTransitGuide((state) => state.destSpotId);
  const walkOverride = useTransitGuide((state) => state.walkOverride);
  const activePanel = useMapSession((state) => state.activePanel);
  const lineRef = useRef<naver.maps.Polyline | null>(null);

  useEffect(() => {
    const maps = window.naver?.maps;
    const hub = getTransitHub(hubId) ?? TRANSIT_HUBS[3];
    const spot = destSpotId ? getSpotById(destSpotId) : undefined;
    lineRef.current?.setMap(null);
    lineRef.current = null;
    if (!maps || !spot) return;
    const guide = buildTransitGuide(hub, spot);
    const path = walkOverride && walkOverride.length > 1 ? walkOverride : guide.walkPath;
    if (path.length > 1) {
      lineRef.current = new maps.Polyline({
        map,
        path: path.map((point) => new maps.LatLng(point.lat, point.lng)),
        strokeColor: "#8B5CF6",
        strokeWeight: 5,
        strokeOpacity: 0.9,
        strokeLineCap: "round",
        strokeLineJoin: "round",
      });
    }
    if (activePanel === "transit") {
      const bounds = new maps.LatLngBounds(
        new maps.LatLng(hub.coords.lat, hub.coords.lng),
        new maps.LatLng(hub.coords.lat, hub.coords.lng),
      );
      bounds.extend(new maps.LatLng(spot.coords.lat, spot.coords.lng));
      map.fitBounds(bounds, { top: 56, right: 40, bottom: 56, left: 40 });
    }
    return () => {
      lineRef.current?.setMap(null);
      lineRef.current = null;
    };
  }, [activePanel, destSpotId, hubId, map, walkOverride]);

  return null;
}
