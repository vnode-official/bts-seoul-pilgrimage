"use client";

import { useEffect, useRef } from "react";
import { useLiveTransit } from "@/stores/live-transit";

export function KakaoPathLayer({ map }: { map: naver.maps.Map }) {
  const path = useLiveTransit((state) => state.kakaoPath);
  const lineRef = useRef<naver.maps.Polyline | null>(null);

  useEffect(() => {
    const maps = window.naver?.maps;
    if (!maps) return;
    lineRef.current?.setMap(null);
    lineRef.current = null;
    if (!path || path.length < 2) return;
    lineRef.current = new maps.Polyline({
      map,
      path: path.map((point) => new maps.LatLng(point.lat, point.lng)),
      strokeColor: "#8B5CF6",
      strokeWeight: 5,
      strokeOpacity: 0.88,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    });
    return () => {
      lineRef.current?.setMap(null);
      lineRef.current = null;
    };
  }, [map, path]);

  return null;
}
