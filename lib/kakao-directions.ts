import { fetchText } from "@/lib/http";
import { kakaoRestKey } from "@/lib/keys";
import type { GeoPoint, KakaoDirectionsResult } from "@/types/transit";

interface KakaoRoad {
  vertexes?: number[];
}

interface KakaoSection {
  roads?: KakaoRoad[];
}

interface KakaoFare {
  taxi?: number;
}

interface KakaoSummary {
  distance?: number;
  duration?: number;
  fare?: KakaoFare;
}

interface KakaoRoute {
  summary?: KakaoSummary;
  sections?: KakaoSection[];
}

interface KakaoDirectionsResponse {
  routes?: KakaoRoute[];
  code?: number;
  msg?: string;
}

export async function fetchKakaoDirections(
  origin: GeoPoint,
  destination: GeoPoint,
): Promise<KakaoDirectionsResult> {
  const key = kakaoRestKey();
  if (!key) {
    throw new Error(
      "KAKAO_REST_API_KEY is unset. Create a Kakao Developers app and copy the REST API key.",
    );
  }
  const url = new URL("https://apis-navi.kakaomobility.com/v1/directions");
  url.searchParams.set("origin", `${origin.lng},${origin.lat}`);
  url.searchParams.set("destination", `${destination.lng},${destination.lat}`);
  url.searchParams.set("priority", "RECOMMEND");
  url.searchParams.set("summary", "false");

  const { ok, status, body } = await fetchText(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${key}`,
      "Content-Type": "application/json",
    },
  });
  if (!ok) {
    throw new Error(`Kakao Navi HTTP ${status}: ${body.slice(0, 180)}`);
  }
  let json: KakaoDirectionsResponse;
  try {
    json = JSON.parse(body) as KakaoDirectionsResponse;
  } catch {
    throw new Error("Kakao Navi returned non-JSON.");
  }
  const route = json.routes?.[0];
  if (!route?.summary) {
    throw new Error(json.msg ?? "Kakao Navi returned no route.");
  }
  const path = (route.sections ?? []).flatMap((section) =>
    (section.roads ?? []).flatMap((road) => vertexesToPoints(road.vertexes ?? [])),
  );
  const duration = route.summary.duration ?? 0;
  const distance = route.summary.distance ?? 0;
  return {
    source: "kakao-navi",
    durationSeconds: duration,
    distanceMeters: distance,
    taxiFareKrw: route.summary.fare?.taxi ?? null,
    path,
    summary: `${Math.round(distance / 1000)} km · ${Math.round(duration / 60)} min (Kakao Navi drive)`,
  };
}

function vertexesToPoints(vertexes: number[]): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (let i = 0; i + 1 < vertexes.length; i += 2) {
    const lng = vertexes[i];
    const lat = vertexes[i + 1];
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      points.push({ lat, lng });
    }
  }
  return points;
}
