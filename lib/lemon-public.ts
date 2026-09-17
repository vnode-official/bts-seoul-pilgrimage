const VARIANT_PATTERN = /^[a-zA-Z0-9_-]{1,80}$/;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/i;

export function publicLemonVariantId(): string | null {
  const value =
    process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID?.trim() ||
    process.env.LEMON_SQUEEZY_VARIANT_ID?.trim() ||
    "";
  return VARIANT_PATTERN.test(value) ? value : null;
}

/** Store slug (subdomain) or numeric store id. */
export function publicLemonStore(): string | null {
  const value =
    process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_SLUG?.trim() ||
    process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID?.trim() ||
    process.env.LEMON_SQUEEZY_STORE_ID?.trim() ||
    "";
  if (!value) {
    return null;
  }
  if (/^\d+$/.test(value) || SLUG_PATTERN.test(value)) {
    return value;
  }
  return null;
}

export function publicLemonConfigured(): boolean {
  return Boolean(publicLemonVariantId());
}

export function buildLemonOverlayCheckoutUrl(
  variantId: string,
  store: string | null,
  redirectUrl: string,
): string {
  const base =
    store && !/^\d+$/.test(store)
      ? `https://${store}.lemonsqueezy.com/checkout/buy/${variantId}`
      : `https://lemonsqueezy.com/checkout/buy/${variantId}`;
  const url = new URL(base);
  url.searchParams.set("embed", "1");
  url.searchParams.set("media", "0");
  url.searchParams.set("dark", "1");
  url.searchParams.set("logo", "0");
  url.searchParams.set("redirect_url", redirectUrl);
  url.searchParams.set("checkout[custom][product]", "bts-seoul-pass");
  return url.toString();
}

export function lemonOverlayCheckoutUrl(redirectUrl: string): string | null {
  const variantId = publicLemonVariantId();
  if (!variantId) {
    return null;
  }
  return buildLemonOverlayCheckoutUrl(variantId, publicLemonStore(), redirectUrl);
}
