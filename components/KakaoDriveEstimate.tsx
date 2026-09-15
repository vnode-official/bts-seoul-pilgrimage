"use client";

import { useEffect, useState } from "react";
import { useLiveTransit } from "@/stores/live-transit";
import { formatKrw } from "@/lib/format";
import { kakaoMapRouteUrl } from "@/lib/kakao";
import type { GeoPoint } from "@/types";
import type { KakaoDirectionsResult } from "@/types/transit";

export function KakaoDriveEstimate({
  origin,
  dest,
  originName,
  destName,
}: {
  origin: GeoPoint;
  dest: GeoPoint;
  originName: string;
  destName: string;
}) {
  const setKakaoPath = useLiveTransit((state) => state.setKakaoPath);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [result, setResult] = useState<KakaoDirectionsResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setResult(null);
    setMessage(null);
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
        if (cancelled) return;
        if (!response.ok || !isKakaoResult(body)) {
          setState("error");
          setMessage(readError(body) ?? `Kakao Navi HTTP ${response.status}`);
          return;
        }
        setResult(body);
        setKakaoPath(body.path.length > 1 ? body.path : null);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setState("error");
        setMessage("Kakao Navi request failed.");
      });
    return () => {
      cancelled = true;
    };
  }, [dest.lat, dest.lng, origin.lat, origin.lng, setKakaoPath]);

  const mapHref = kakaoMapRouteUrl(originName, origin, destName, dest);

  if (state === "loading") {
    return (
      <p className="px-1 text-[11px] text-white/40">
        Asking Kakao Navi REST for a live drive estimate…
      </p>
    );
  }
  if (state === "error") {
    return (
      <p className="px-1 text-[11px] leading-4 text-amber-100/80">
        Kakao Navi unavailable: {message} Static KRW matrix still shown. No live fare invented.{" "}
        <a href={mapHref} target="_blank" rel="noreferrer" className="text-accent">
          Open in Kakao Map
        </a>
      </p>
    );
  }
  if (!result) return null;
  const fare =
    result.taxiFareKrw !== null ? `${formatKrw(result.taxiFareKrw)} Kakao taxi hint` : "no taxi hint";
  return (
    <p className="px-1 text-[11px] leading-4 text-white/50">
      Kakao Navi: {result.summary} · {fare}. Overlay is the Kakao route on the Naver map.{" "}
      <a href={mapHref} target="_blank" rel="noreferrer" className="text-accent">
        Open in Kakao Map
      </a>
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

function readError(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "error" in body) {
    const value = (body as { error: unknown }).error;
    return typeof value === "string" ? value : null;
  }
  return null;
}
