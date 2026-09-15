import { NextResponse } from "next/server";
import { fetchKakaoDirections } from "@/lib/kakao-directions";
import { parsePoint } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const origin = parsePoint(params.get("originLat"), params.get("originLng"));
  const destination = parsePoint(params.get("destLat"), params.get("destLng"));
  if (!origin || !destination) {
    return NextResponse.json(
      { error: "originLat, originLng, destLat, and destLng are required numbers." },
      { status: 400 },
    );
  }
  try {
    const result = await fetchKakaoDirections(origin, destination);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kakao Navi directions failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
