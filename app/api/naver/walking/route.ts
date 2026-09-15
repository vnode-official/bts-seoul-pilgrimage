import { NextResponse } from "next/server";
import { parsePoint } from "@/lib/geo";
import { naverClientIdServer, naverMapSecret } from "@/lib/keys";
import { fetchNaverWalking } from "@/lib/naver-walking";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!naverClientIdServer() || !naverMapSecret()) {
    return NextResponse.json({ configured: false, path: [] as const });
  }
  const params = new URL(request.url).searchParams;
  const origin = parsePoint(params.get("originLat"), params.get("originLng"));
  const destination = parsePoint(params.get("destLat"), params.get("destLng"));
  if (!origin || !destination) {
    return NextResponse.json(
      { error: "originLat, originLng, destLat, and destLng are required." },
      { status: 400 },
    );
  }
  try {
    const result = await fetchNaverWalking(origin, destination);
    return NextResponse.json({ configured: true, ...result });
  } catch {
    return NextResponse.json({ configured: true, path: [] as const });
  }
}
