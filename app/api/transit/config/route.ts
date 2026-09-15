import { NextResponse } from "next/server";
import { transitConfig } from "@/lib/keys";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(transitConfig());
}
