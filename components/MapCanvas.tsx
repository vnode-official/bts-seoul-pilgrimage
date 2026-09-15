"use client";

import { SPOTS, SEOUL_CENTER } from "@/data/spots";
import { filterSpots, isSpotUnlocked } from "@/lib/access";
import { loadNaverMaps, naverClientId, NAVER_MAP_OPTIONS } from "@/lib/naver";
import { createPinElement } from "@/lib/pin-html";
import { useMapSession } from "@/stores/map-session";
import { KakaoPathLayer } from "@/components/KakaoPathLayer";
import { LiveVehicleLayer } from "@/components/LiveVehicleLayer";
import { MapControls } from "@/components/MapControls";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { MockDotField } from "@/components/MockDotField";
import type { Spot } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function MapCanvas() {
  const clientId = naverClientId();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const overlaysRef = useRef<naver.maps.Marker[]>([]);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [status, setStatus] = useState<"ready" | "missing" | "error" | "loading">(
    clientId ? "loading" : "missing",
  );
  const tier = useMapSession((state) => state.tier);
  const categoryFilter = useMapSession((state) => state.categoryFilter);
  const search = useMapSession((state) => state.search);
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

  const paintMarkers = useCallback(
    (maps: typeof naver.maps, instance: naver.maps.Map, spots: Spot[]) => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = spots.map((spot) => {
        const locked = !isSpotUnlocked(spot, tier);
        const el = createPinElement(
          { locked, category: spot.category, label: `${spot.nameEn} (${spot.nameKr})` },
          () => onSpot(spot),
        );
        return new maps.Marker({
          map: instance,
          position: new maps.LatLng(spot.coords.lat, spot.coords.lng),
          icon: { content: el, anchor: new maps.Point(0, 0) },
          zIndex: locked ? 10 : 40,
          title: spot.nameEn,
        });
      });
    },
    [onSpot, tier],
  );

  useEffect(() => {
    if (!clientId || !hostRef.current) return;
    let cancelled = false;
    void loadNaverMaps(clientId)
      .then((maps) => {
        if (cancelled || !hostRef.current) return;
        const instance = new maps.Map(hostRef.current, {
          ...NAVER_MAP_OPTIONS,
          center: new maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
          zoom: 12,
        });
        mapRef.current = instance;
        setMap(instance);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.naver?.maps) return;
    paintMarkers(window.naver.maps, mapRef.current, visible);
  }, [paintMarkers, status, visible]);

  function withMap(mutate: (instance: naver.maps.Map, maps: typeof naver.maps) => void) {
    if (!mapRef.current || !window.naver?.maps) return;
    mutate(mapRef.current, window.naver.maps);
  }

  const showFallback = status === "missing" || status === "error";

  return (
    <div className="absolute inset-0 z-0 bg-[#0F0F12]">
      {status === "missing" ? <MapPlaceholder reason="missing-key" /> : null}
      {status === "error" ? <MapPlaceholder reason="load-error" /> : null}
      {clientId ? <div ref={hostRef} className="h-full w-full" /> : null}
      {showFallback ? <MockDotField spots={visible} onSpot={onSpot} /> : null}
      {map && status === "ready" ? (
        <>
          <LiveVehicleLayer map={map} />
          <KakaoPathLayer map={map} />
        </>
      ) : null}
      <MapControls
        onZoomIn={() => withMap((instance) => instance.setZoom(instance.getZoom() + 1, true))}
        onZoomOut={() => withMap((instance) => instance.setZoom(instance.getZoom() - 1, true))}
        onRecenter={() =>
          withMap((instance, maps) =>
            instance.setCenter(new maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng)),
          )
        }
      />
    </div>
  );
}
