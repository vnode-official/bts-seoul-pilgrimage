import { NextResponse } from "next/server";
import {
  consumePendingCheckout,
  demoUnlockAllowed,
  setSessionCookie,
  signSession,
} from "@/lib/session";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get("demo") === "1";

  if (demo) {
    if (!demoUnlockAllowed()) {
      return NextResponse.json(
        { error: "Demo unlock is not available." },
        { status: 403 },
      );
    }
    const token = await signSession({ tier: "premium", source: "demo" });
    setSessionCookie(token);
    return NextResponse.json({ ok: true, source: "demo" });
  }

  const pending = await consumePendingCheckout();
  if (!pending) {
    return NextResponse.json(
      { error: "No pending checkout. If you already paid, wait for the webhook." },
      { status: 400 },
    );
  }
  const token = await signSession({ tier: "premium", source: "jwt" });
  setSessionCookie(token);
  return NextResponse.json({ ok: true, source: "jwt" });
}
