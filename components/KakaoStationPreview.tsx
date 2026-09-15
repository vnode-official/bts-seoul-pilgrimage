"use client";

import { kakaoJsKey } from "@/lib/kakao-public";
import { kakaoMapPlaceUrl } from "@/lib/kakao";
import type { TransitStation } from "@/types/transit";

export function KakaoStationPreview({ station }: { station: TransitStation }) {
  const key = kakaoJsKey();
  const href = kakaoMapPlaceUrl(station.nameKr, station.coords);
  if (!key) {
    return (
      <p className="px-1 text-[11px] leading-4 text-white/35">
        Kakao Map JS key missing — no static preview. Drive ETA uses{" "}
        <span className="text-white/55">KAKAO_REST_API_KEY</span> on the server.{" "}
        <a href={href} target="_blank" rel="noreferrer" className="text-accent underline-offset-2 hover:underline">
          Open this station in Kakao Map
        </a>
        .
      </p>
    );
  }
  const src = new URL("https://dapi.kakao.com/v2/maps/staticmap");
  src.searchParams.set("appkey", key);
  src.searchParams.set("center", `${station.coords.lng},${station.coords.lat}`);
  src.searchParams.set("level", "5");
  src.searchParams.set("w", "320");
  src.searchParams.set("h", "140");
  src.searchParams.set("markers", `color:0x8B5CF6|${station.coords.lng},${station.coords.lat}`);

  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      {/* Kakao static map — labeled separately from the Naver canvas */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src.toString()}
        alt={`Kakao Map static preview of ${station.nameEn}`}
        className="h-[140px] w-full object-cover"
      />
      <figcaption className="flex items-center justify-between px-3 py-2 text-[11px] text-white/40">
        <span>Kakao Map static preview</span>
        <a href={href} target="_blank" rel="noreferrer" className="text-accent">
          Open in Kakao Map
        </a>
      </figcaption>
    </figure>
  );
}
