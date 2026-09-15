import { fetchText } from "@/lib/http";
import { naverClientIdServer, naverMapSecret } from "@/lib/keys";
import type { GeoPoint } from "@/types";

interface NaverLeg {
  summary?: { distance?: number; duration?: number };
  path?: number[][];
}

interface NaverWalkingResponse {
  code?: number;
  message?: string;
  route?: {
    traoptimal?: NaverLeg[];
    trawalking?: NaverLeg[];
  };
}

export interface NaverWalkingResult {
  source: "naver-walking";
  distanceMeters: number;
  durationSeconds: number;
  path: GeoPoint[];
}

const HOSTS = [
  "https://maps.apigw.ntruss.com/map-direction/v1/walking",
  "https://naveropenapi.apigw.ntruss.com/map-direction/v1/walking",
];

export async function fetchNaverWalking(
  origin: GeoPoint,
  destination: GeoPoint,
): Promise<NaverWalkingResult> {
  const keyId = naverClientIdServer();
  const secret = naverMapSecret();
  if (!keyId || !secret) {
    throw new Error("Naver Directions walking is not configured.");
  }
  let lastError = "Naver walking returned no route.";
  for (const host of HOSTS) {
    const url = new URL(host);
    url.searchParams.set("start", `${origin.lng},${origin.lat}`);
    url.searchParams.set("goal", `${destination.lng},${destination.lat}`);
    const { ok, status, body } = await fetchText(url.toString(), {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": keyId,
        "X-NCP-APIGW-API-KEY": secret,
      },
    });
    if (!ok) {
      lastError = `Naver walking HTTP ${status}`;
      continue;
    }
    const parsed = parseWalking(body);
    if (parsed) return parsed;
    lastError = "Naver walking JSON had no path.";
  }
  throw new Error(lastError);
}

function parseWalking(body: string): NaverWalkingResult | null {
  let json: NaverWalkingResponse;
  try {
    json = JSON.parse(body) as NaverWalkingResponse;
  } catch {
    return null;
  }
  const leg = json.route?.trawalking?.[0] ?? json.route?.traoptimal?.[0];
  if (!leg?.path || leg.path.length < 2) return null;
  const path: GeoPoint[] = [];
  for (const pair of leg.path) {
    const lng = pair[0];
    const lat = pair[1];
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      path.push({ lat, lng });
    }
  }
  if (path.length < 2) return null;
  return {
    source: "naver-walking",
    distanceMeters: leg.summary?.distance ?? 0,
    durationSeconds: leg.summary?.duration ?? 0,
    path,
  };
}
