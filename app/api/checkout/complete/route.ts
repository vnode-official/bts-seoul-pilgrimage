import { NextResponse } from "next/server";
import { lemonOrderIsPaid } from "@/lib/lemon";
import { sanitizeOrderId } from "@/lib/pass-unlock";
import {
  consumePendingCheckout,
  demoUnlockAllowed,
  lemonConfigured,
  setSessionCookie,
  signSession,
} from "@/lib/session";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: { orderId?: string; demo?: boolean } = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as { orderId?: string; demo?: boolean };
    }
  } catch {
    body = {};
  }

  const demo = url.searchParams.get("demo") === "1" || body.demo === true;
  if (demo) {
    if (!demoUnlockAllowed()) {
      return NextResponse.json(
        { error: "Demo unlock is not available in production." },
        { status: 403 },
      );
    }
    const token = await signSession({ tier: "premium", source: "demo" });
    setSessionCookie(token);
    return NextResponse.json({ ok: true, source: "demo" });
  }

  const orderId =
    sanitizeOrderId(body.orderId) ??
    sanitizeOrderId(url.searchParams.get("order_id")) ??
    sanitizeOrderId(url.searchParams.get("order"));

  if (!orderId) {
    return NextResponse.json(
      {
        error:
          "Missing Lemon order id. Complete checkout in Lemon Squeezy, then return via the success page.",
      },
      { status: 400 },
    );
  }

  if (lemonConfigured()) {
    const paid = await lemonOrderIsPaid(orderId);
    if (paid === false) {
      return NextResponse.json(
        { error: "Lemon Squeezy did not report this order as paid." },
        { status: 402 },
      );
    }
    if (paid === "unverified") {
      await consumePendingCheckout();
    }
  }

  const token = await signSession({
    tier: "premium",
    source: "jwt",
    checkoutId: orderId,
  });
  setSessionCookie(token);
  return NextResponse.json({ ok: true, source: "jwt", orderId });
}
