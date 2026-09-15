"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SPOTS, SEOUL_CENTER } from "@/data/spots";
import { filterSpots, isSpotUnlocked } from "@/lib/access";
import { loadNaverMaps, naverClientId, NAVER_MAP_OPTIONS } from "@/lib/naver";
import { createPinElement } from "@/lib/pin-html";
import { useMapSession } from "@/stores/map-session";
import { MapControls } from "@/components/MapControls";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import type { Spot } from "@/types";

export function MapCanvas() {
  const clientId = naverClientId();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const overlaysRef = useRef<naver.maps.Marker[]>([]);
  const [status, setStatus] = useState<"ready" | "missing" | "error" | "loading">(
    clientId ? "loading" : "missing",
  );
  const tier = useMapSession((s) => s.tier);
  const categoryFilter = useMapSession((s) => s.categoryFilter);
  const search = useMapSession((s) => s.search);
  const setSelectedSpotId = useMapSession((s) => s.setSelectedSpotId);
  const requestUnlock = useMapSession((s) => s.requestUnlock);

  const visible = filterSpots(SPOTS, {
    tier,
    filter: categoryFilter,
    search,
    includeLocked: true,
  });

  const onSpot = useCallback(
    (spot: Spot) => {
      if (!isSpotUnlocked(spot, tier)) requestUnlock();
      else setSelectedSpotId(spot.id);
    },
    [requestUnlock, setSelectedSpotId, tier],
  );

  const paintMarkers = useCallback(
    (maps: typeof naver.maps, map: naver.maps.Map, spots: Spot[]) => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = spots.map((spot) => {
        const locked = !isSpotUnlocked(spot, tier);
        const el = createPinElement(
          {
            locked,
            category: spot.category,
            label: `${spot.nameEn} (${spot.nameKr})`,
          },
          () => onSpot(spot),
        );
        return new maps.Marker({
          map,
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
        const map = new maps.Map(hostRef.current, {
          ...NAVER_MAP_OPTIONS,
          center: new maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
          zoom: 12,
        });
        mapRef.current = map;
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

  function withMap(mutate: (map: naver.maps.Map, maps: typeof naver.maps) => void) {
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
      <MapControls
        onZoomIn={() => withMap((map) => map.setZoom(map.getZoom() + 1, true))}
        onZoomOut={() => withMap((map) => map.setZoom(map.getZoom() - 1, true))}
        onRecenter={() =>
          withMap((map, maps) =>
            map.setCenter(new maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng)),
          )
        }
      />
    </div>
  );
}

function MockDotField({
  spots,
  onSpot,
}: {
  spots: Spot[];
  onSpot: (spot: Spot) => void;
}) {
  return (
    <div className="absolute inset-0 z-[1]">
      {spots.map((spot) => {
        const left = ((spot.coords.lng - 126.82) / 0.38) * 100;
        const top = (1 - (spot.coords.lat - 37.46) / 0.16) * 100;
        return (
          <button
            key={spot.id}
            type="button"
            onClick={() => onSpot(spot)}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_16px_rgba(139,92,246,0.85)]"
            style={{ left: `${Math.min(96, Math.max(4, left))}%`, top: `${Math.min(90, Math.max(8, top))}%` }}
            aria-label={spot.nameEn}
          />
        );
      })}
    </div>
  );
}
