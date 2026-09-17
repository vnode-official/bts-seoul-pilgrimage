import { NextResponse } from "next/server";
import { verifyLemonSignature } from "@/lib/lemon";

export const runtime = "nodejs";

interface LemonEvent {
  meta?: { event_name?: string };
  data?: { id?: string; type?: string; attributes?: { status?: string } };
}

/**
 * Server-verified fulfillment hook.
 * This route cannot set the buyer's `bts_pass` cookie (Lemon calls us, not the browser).
 * Later: persist paid `data.id` and have `/api/checkout/complete` check that list / Lemon API.
 */
export async function POST(request: Request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        ignored: true,
        message:
          "Set LEMON_SQUEEZY_WEBHOOK_SECRET to verify order_created and persist paid order ids.",
      },
      { status: 202 },
    );
  }

  const signature = request.headers.get("x-signature");
  if (!verifyLemonSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: LemonEvent = {};
  try {
    payload = JSON.parse(rawBody) as LemonEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "unknown";
  const fulfilled =
    (eventName === "order_created" || eventName === "order_paid") &&
    payload.data?.attributes?.status !== "unpaid";

  return NextResponse.json({
    ok: true,
    eventName,
    fulfilled,
    orderId: payload.data?.id ?? null,
    note: "Buyer unlock still uses Checkout.Success / success URL + signed cookie. Webhook is the audit trail until an order store exists.",
  });
}
