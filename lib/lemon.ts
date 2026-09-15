import { createHmac, timingSafeEqual } from "crypto";
import { lemonConfigured } from "@/lib/session";

export interface LemonCheckoutConfig {
  variantId: string;
  apiKey: string | null;
  storeId: string | null;
}

export function getLemonConfig(): LemonCheckoutConfig | null {
  const variantId =
    process.env.LEMON_SQUEEZY_VARIANT_ID ||
    process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID ||
    "";
  if (!variantId) {
    return null;
  }
  return {
    variantId,
    apiKey: process.env.LEMON_SQUEEZY_API_KEY ?? null,
    storeId: process.env.LEMON_SQUEEZY_STORE_ID ?? null,
  };
}

export function lemonBuyUrl(variantId: string, successUrl: string): string {
  const url = new URL(`https://lemonsqueezy.com/checkout/buy/${variantId}`);
  url.searchParams.set("redirect_url", successUrl);
  url.searchParams.set("media", "0");
  url.searchParams.set("dark", "1");
  return url.toString();
}

export async function createLemonCheckoutUrl(
  successUrl: string,
): Promise<string | null> {
  const config = getLemonConfig();
  if (!config) {
    return null;
  }
  if (!config.apiKey || !config.storeId) {
    return lemonBuyUrl(config.variantId, successUrl);
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
          checkout_options: { dark: true, embed: false },
          checkout_data: { custom: { product: "bts-seoul-pass" } },
          product_options: {
            redirect_url: successUrl,
            enabled_variants: [config.variantId],
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
    return lemonBuyUrl(config.variantId, successUrl);
  }
  const json = (await response.json()) as {
    data?: { attributes?: { url?: string } };
  };
  return json.data?.attributes?.url ?? lemonBuyUrl(config.variantId, successUrl);
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

export function lemonCheckoutReady(): boolean {
  return lemonConfigured();
}
