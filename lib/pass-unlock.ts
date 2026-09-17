export const PASS_UNLOCK_STORAGE_KEY = "bts_pass_unlock";

export interface StoredPassUnlock {
  orderId: string;
  unlockedAt: string;
  source: "lemon" | "demo";
}

function isStoredUnlock(value: unknown): value is StoredPassUnlock {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.orderId === "string" &&
    record.orderId.length > 0 &&
    (record.source === "lemon" || record.source === "demo") &&
    typeof record.unlockedAt === "string"
  );
}

export function readStoredPassUnlock(): StoredPassUnlock | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(PASS_UNLOCK_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isStoredUnlock(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredPassUnlock(unlock: StoredPassUnlock): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(PASS_UNLOCK_STORAGE_KEY, JSON.stringify(unlock));
  } catch {
    // Private mode — cookie path still runs.
  }
}

export function clearStoredPassUnlock(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(PASS_UNLOCK_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function sanitizeOrderId(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const value = raw.trim();
  return /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : null;
}

export function orderIdFromUnknown(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as Record<string, unknown>;
  if (typeof record.id === "string" || typeof record.id === "number") {
    return sanitizeOrderId(String(record.id));
  }
  const nested = record.order;
  if (nested && typeof nested === "object") {
    const order = nested as Record<string, unknown>;
    const inner = order.data;
    if (inner && typeof inner === "object") {
      const innerRecord = inner as Record<string, unknown>;
      if (typeof innerRecord.id === "string" || typeof innerRecord.id === "number") {
        return sanitizeOrderId(String(innerRecord.id));
      }
    }
    if (typeof order.id === "string" || typeof order.id === "number") {
      return sanitizeOrderId(String(order.id));
    }
  }
  const attributes = record.attributes;
  if (attributes && typeof attributes === "object") {
    const attrs = attributes as Record<string, unknown>;
    if (typeof attrs.identifier === "string") {
      return sanitizeOrderId(attrs.identifier);
    }
  }
  return null;
}

export function orderIdFromSearchParams(params: URLSearchParams): string | null {
  return (
    sanitizeOrderId(params.get("order_id")) ??
    sanitizeOrderId(params.get("order")) ??
    sanitizeOrderId(params.get("checkout[order_id]"))
  );
}
