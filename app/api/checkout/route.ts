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

  if (lemonConfigured()) {
    const pending = await signSession({
      tier: "free",
      source: "jwt",
      checkoutId: `pending-${Date.now()}`,
    });
    setPendingCheckoutCookie(pending);
    const checkoutUrl = await createLemonCheckoutUrl(successUrl);
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Lemon Squeezy checkout URL could not be built." },
        { status: 503 },
      );
    }
    const body: CheckoutResponse = {
      mode: "lemon",
      checkoutUrl,
      message: "Opening Lemon Squeezy checkout.",
    };
    return NextResponse.json(body);
  }

  if (!demoUnlockAllowed()) {
    const body: CheckoutResponse = {
      mode: "unconfigured",
      checkoutUrl: null,
      message:
        "Lemon Squeezy is not configured. Set NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID on Vercel.",
    };
    return NextResponse.json(body, { status: 503 });
  }

  const body: CheckoutResponse = {
    mode: "demo",
    checkoutUrl: `${successUrl}?demo=1`,
    message: "Local demo unlock — Lemon variant IDs are not set.",
  };
  return NextResponse.json(body);
}
