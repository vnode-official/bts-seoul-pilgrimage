import { NextResponse } from "next/server";
import {
  demoUnlockAllowed,
  signSession,
  setSessionCookie,
} from "@/lib/session";

export async function POST() {
  if (!demoUnlockAllowed()) {
    return NextResponse.json(
      { error: "Demo unlock is disabled when Lemon webhooks are configured." },
      { status: 403 },
    );
  }
  const token = await signSession({ tier: "premium", source: "demo" });
  setSessionCookie(token);
  return NextResponse.json({ ok: true, tier: "premium", source: "demo" });
}
