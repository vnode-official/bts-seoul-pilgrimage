import { NextResponse } from "next/server";
import { verifyLemonSignature } from "@/lib/lemon";

export const runtime = "nodejs";

interface LemonEvent {
  meta?: { event_name?: string };
  data?: { id?: string; type?: string };
}

export async function POST(request: Request) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (secret) {
    const signature = request.headers.get("x-signature");
    if (!verifyLemonSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  } else {
    return NextResponse.json(
      {
        ok: false,
        ignored: true,
        message:
          "LEMON_SQUEEZY_WEBHOOK_SECRET is unset. Webhook accepted only after the secret is configured.",
      },
      { status: 202 },
    );
  }

  let payload: LemonEvent = {};
  try {
    payload = JSON.parse(rawBody) as LemonEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "unknown";
  const fulfilled =
    eventName === "order_created" || eventName === "subscription_created";

  return NextResponse.json({
    ok: true,
    eventName,
    fulfilled,
    orderId: payload.data?.id ?? null,
  });
}
