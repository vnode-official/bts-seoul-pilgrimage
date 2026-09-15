import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { AccessTier, PublicSession, SessionPayload, SessionSource } from "@/types";

export const SESSION_COOKIE = "bts_pass";
export const PENDING_COOKIE = "bts_checkout_pending";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

interface TokenClaims extends JWTPayload {
  tier: AccessTier;
  source: SessionSource;
  checkoutId?: string;
}

function secretBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    throw new Error("JWT_SECRET must be set to a long random string.");
  }
  return new TextEncoder().encode("dev-only-bts-seoul-pass-secret");
}

export function lemonConfigured(): boolean {
  return Boolean(
    process.env.LEMON_SQUEEZY_VARIANT_ID ||
      process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID ||
      process.env.LEMON_SQUEEZY_API_KEY,
  );
}

export function demoUnlockAllowed(): boolean {
  if (process.env.ALLOW_DEMO_UNLOCK === "true") {
    return true;
  }
  if (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    return false;
  }
  return process.env.NODE_ENV !== "production";
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    tier: payload.tier,
    source: payload.source,
    checkoutId: payload.checkoutId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .setSubject("bts-seoul-pass")
    .sign(secretBytes());
}

export async function verifySessionToken(
  token: string,
): Promise<TokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretBytes());
    if (payload.tier !== "free" && payload.tier !== "premium") {
      return null;
    }
    if (
      payload.source !== "none" &&
      payload.source !== "jwt" &&
      payload.source !== "demo"
    ) {
      return null;
    }
    return payload as TokenClaims;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<PublicSession> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionToken(token) : null;
  return {
    tier: claims?.tier === "premium" ? "premium" : "free",
    source: claims?.source ?? "none",
    expiresAt:
      typeof claims?.exp === "number"
        ? new Date(claims.exp * 1000).toISOString()
        : null,
    demoUnlockAvailable: demoUnlockAllowed(),
    lemonConfigured: lemonConfigured(),
  };
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function setSessionCookie(token: string): void {
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE));
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", sessionCookieOptions(0));
}

export function setPendingCheckoutCookie(token: string): void {
  cookies().set(PENDING_COOKIE, token, sessionCookieOptions(60 * 60));
}

export async function consumePendingCheckout(): Promise<boolean> {
  const pending = cookies().get(PENDING_COOKIE)?.value;
  if (!pending) {
    return false;
  }
  const claims = await verifySessionToken(pending);
  cookies().set(PENDING_COOKIE, "", sessionCookieOptions(0));
  return Boolean(claims);
}
