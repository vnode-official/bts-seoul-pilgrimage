import type { Spot } from "@/types";

export const SHARE_APP_NAME = "THE BTS SEOUL PILGRIMAGE & TRANSIT PASS";
export const SHARE_CANONICAL_ORIGIN = "https://bts-seoul-pilgrimage.vercel.app";
export const INVITE_REF_KEY = "bts_invite_ref";
export const INVITE_REF_AT_KEY = "bts_invite_ref_at";

const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;
const REF_PATTERN = /^[a-zA-Z0-9_-]{1,32}$/;

export function isSpotQueryToken(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function isInviteRef(value: string): boolean {
  return REF_PATTERN.test(value);
}

export function shareOrigin(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return window.location.origin;
    }
  }
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env && !/localhost|127\.0\.0\.1/.test(env)) {
    return env;
  }
  return SHARE_CANONICAL_ORIGIN;
}

export function spotShareUrl(slug: string, origin = shareOrigin()): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/?spot=${encodeURIComponent(slug)}`;
}

export function spotShareText(spot: Pick<Spot, "nameEn" | "nameKr" | "slug">): string {
  const line = `${spot.nameEn} (${spot.nameKr}) — independent Seoul + Goyang pin map.`;
  return `${SHARE_APP_NAME}\n${line}\n${spotShareUrl(spot.slug)}`;
}

export function readStoredInviteRef(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const value = window.localStorage.getItem(INVITE_REF_KEY);
    return value && isInviteRef(value) ? value : null;
  } catch {
    return null;
  }
}

/** First-touch invite ref. Strips `ref` from the address bar. No UI. */
export function captureInviteRefFromLocation(): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  const raw = url.searchParams.get("ref")?.trim() ?? "";
  if (raw && isInviteRef(raw)) {
    try {
      if (!window.localStorage.getItem(INVITE_REF_KEY)) {
        window.localStorage.setItem(INVITE_REF_KEY, raw);
        window.localStorage.setItem(INVITE_REF_AT_KEY, new Date().toISOString());
      }
    } catch {
      // Private mode — skip persistence.
    }
  }
  if (url.searchParams.has("ref")) {
    url.searchParams.delete("ref");
    const search = url.searchParams.toString();
    const next = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
    window.history.replaceState(null, "", next);
  }
}

export function syncSpotQuery(slug: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (slug && isSpotQueryToken(slug)) {
    url.searchParams.set("spot", slug);
  } else {
    url.searchParams.delete("spot");
  }
  url.searchParams.delete("ref");
  const search = url.searchParams.toString();
  const next = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current !== next) {
    window.history.replaceState(null, "", next);
  }
}

export function spotTokenFromLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const token = new URL(window.location.href).searchParams.get("spot")?.trim() ?? "";
  return token && isSpotQueryToken(token) ? token : null;
}
