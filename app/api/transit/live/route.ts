import { NextResponse } from "next/server";
import { getTransitStation } from "@/data/stations";
import { buildTransitSnapshot } from "@/lib/transit-snapshot";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const stationId = new URL(request.url).searchParams.get("stationId");
  if (!stationId) {
    return NextResponse.json({ error: "stationId is required." }, { status: 400 });
  }
  const station = getTransitStation(stationId);
  if (!station) {
    return NextResponse.json({ error: "Unknown stationId." }, { status: 400 });
  }
  const snapshot = await buildTransitSnapshot(station);
  return NextResponse.json(snapshot);
}
