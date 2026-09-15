import { NextResponse } from "next/server";
import { publicOrigin } from "@/lib/origin";
import { createLemonCheckoutUrl } from "@/lib/lemon";
import {
  demoUnlockAllowed,
  lemonConfigured,
  setPendingCheckoutCookie,
  signSession,
} from "@/lib/session";
import type { CheckoutResponse } from "@/types";

export async function POST(request: Request) {
  const successUrl = `${publicOrigin(request)}/pass/success`;
  const pending = await signSession({
    tier: "free",
    source: "jwt",
    checkoutId: `pending-${Date.now()}`,
  });
  setPendingCheckoutCookie(pending);

  if (lemonConfigured()) {
    const checkoutUrl = await createLemonCheckoutUrl(successUrl);
    const body: CheckoutResponse = {
      mode: "lemon",
      checkoutUrl,
      message: "Redirecting to Lemon Squeezy.",
    };
    return NextResponse.json(body);
  }

  if (!demoUnlockAllowed()) {
    return NextResponse.json(
      { error: "Lemon Squeezy is not configured." },
      { status: 503 },
    );
  }

  const body: CheckoutResponse = {
    mode: "demo",
    checkoutUrl: `${successUrl}?demo=1`,
    message: "Local demo unlock — Lemon variant IDs are not set.",
  };
  return NextResponse.json(body);
}
