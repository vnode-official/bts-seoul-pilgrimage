"use client";

import { useEffect, useState } from "react";
import { useLiveTransit } from "@/stores/live-transit";
import { formatKrw } from "@/lib/format";
import type { GeoPoint } from "@/types";
import type { KakaoDirectionsResult } from "@/types/transit";

export function KakaoDriveEstimate({
  origin,
  dest,
}: {
  origin: GeoPoint;
  dest: GeoPoint;
  originName: string;
  destName: string;
}) {
  const kakaoOn = useLiveTransit((state) => state.config?.kakaoRestConfigured);
  const setKakaoPath = useLiveTransit((state) => state.setKakaoPath);
  const [result, setResult] = useState<KakaoDirectionsResult | null>(null);

  useEffect(() => {
    if (!kakaoOn) {
      setResult(null);
      setKakaoPath(null);
      return;
    }
    let cancelled = false;
    setResult(null);
    setKakaoPath(null);
    const params = new URLSearchParams({
      originLat: String(origin.lat),
      originLng: String(origin.lng),
      destLat: String(dest.lat),
      destLng: String(dest.lng),
    });
    void fetch(`/api/kakao/directions?${params.toString()}`, { cache: "no-store" })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (cancelled || !response.ok || !isKakaoResult(body)) return;
        setResult(body);
        setKakaoPath(body.path.length > 1 ? body.path : null);
      })
      .catch(() => {
        /* taxi card stays on the static KRW matrix */
      });
    return () => {
      cancelled = true;
    };
  }, [kakaoOn, dest.lat, dest.lng, origin.lat, origin.lng, setKakaoPath]);

  if (!kakaoOn || !result) return null;
  const fare =
    result.taxiFareKrw !== null ? ` · ${formatKrw(result.taxiFareKrw)} taxi hint` : "";
  return (
    <p className="px-1 text-[11px] leading-4 text-white/45">
      Optional Kakao Navi: {result.summary}
      {fare}
    </p>
  );
}

function isKakaoResult(body: unknown): body is KakaoDirectionsResult {
  return (
    typeof body === "object" &&
    body !== null &&
    "source" in body &&
    (body as KakaoDirectionsResult).source === "kakao-navi"
  );
}
