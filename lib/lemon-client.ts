import { orderIdFromUnknown } from "@/lib/pass-unlock";

export function orderIdFromLemonEvent(event: {
  event?: string;
  data?: unknown;
}): string | null {
  if (event.event !== "Checkout.Success") {
    return null;
  }
  return orderIdFromUnknown(event.data);
}

export function openLemonOverlay(checkoutUrl: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  window.createLemonSqueezy?.();
  if (window.LemonSqueezy?.Url?.Open) {
    window.LemonSqueezy.Url.Open(checkoutUrl);
    return true;
  }
  return false;
}
