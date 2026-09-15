import type { TransitConfigResponse } from "@/types/transit";
import { TRANSIT_REFRESH_MS } from "@/data/stations";

export function seoulSubwayKey(): string | undefined {
  const key = process.env.SEOUL_OPEN_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

function normalizeServiceKey(raw: string): string {
  if (!raw.includes("%")) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function dataGoKrKey(): string | undefined {
  const raw =
    process.env.DATA_GO_KR_SERVICE_KEY?.trim() ||
    process.env.SEOUL_BUS_API_KEY?.trim();
  if (!raw) return undefined;
  return normalizeServiceKey(raw);
}

export function kakaoRestKey(): string | undefined {
  const key = process.env.KAKAO_REST_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export function kakaoJsKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export function naverJsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?.trim());
}

export function transitConfig(): TransitConfigResponse {
  return {
    subwayConfigured: Boolean(seoulSubwayKey()),
    busConfigured: Boolean(dataGoKrKey()),
    kakaoRestConfigured: Boolean(kakaoRestKey()),
    kakaoJsConfigured: Boolean(kakaoJsKey()),
    naverJsConfigured: naverJsConfigured(),
    refreshMs: TRANSIT_REFRESH_MS,
  };
}
