import { createHmac, timingSafeEqual } from "crypto";
import {
  lemonOverlayCheckoutUrl,
  publicLemonStore,
  publicLemonVariantId,
} from "@/lib/lemon-public";

export interface LemonCheckoutConfig {
  variantId: string;
  apiKey: string | null;
  storeId: string | null;
}

export function getLemonConfig(): LemonCheckoutConfig | null {
  const variantId = publicLemonVariantId();
  if (!variantId) {
    return null;
  }
  const serverStore = process.env.LEMON_SQUEEZY_STORE_ID?.trim() || null;
  return {
    variantId,
    apiKey: process.env.LEMON_SQUEEZY_API_KEY?.trim() || null,
    storeId: serverStore && /^\d+$/.test(serverStore) ? serverStore : publicLemonStore(),
  };
}

export async function createLemonCheckoutUrl(
  successUrl: string,
): Promise<string | null> {
  const config = getLemonConfig();
  if (!config) {
    return null;
  }
  const overlayUrl = lemonOverlayCheckoutUrl(successUrl);
  const numericStore = config.storeId && /^\d+$/.test(config.storeId);
  if (!config.apiKey || !numericStore) {
    return overlayUrl;
  }

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: { dark: true, embed: true, media: false, logo: false },
          checkout_data: { custom: { product: "bts-seoul-pass" } },
          product_options: {
            redirect_url: successUrl,
            enabled_variants: [config.variantId],
            receipt_button_text: "Open the map",
          },
        },
        relationships: {
          store: { data: { type: "stores", id: config.storeId } },
          variant: { data: { type: "variants", id: config.variantId } },
        },
      },
    }),
  });

  if (!response.ok) {
    return overlayUrl;
  }
  const json = (await response.json()) as {
    data?: { attributes?: { url?: string } };
  };
  return json.data?.attributes?.url ?? overlayUrl;
}

export async function lemonOrderIsPaid(orderId: string): Promise<boolean | "unverified"> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY?.trim();
  if (!apiKey) {
    return "unverified";
  }
  const response = await fetch(
    `https://api.lemonsqueezy.com/v1/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );
  if (!response.ok) {
    return false;
  }
  const json = (await response.json()) as {
    data?: { attributes?: { status?: string } };
  };
  return json.data?.attributes?.status === "paid";
}

export function verifyLemonSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) {
    return false;
  }
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
