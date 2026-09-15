import type { GeoPoint } from "@/types";

export function parsePoint(latRaw: string | null, lngRaw: string | null): GeoPoint | null {
  if (!latRaw || !lngRaw) return null;
  const lat = Number.parseFloat(latRaw);
  const lng = Number.parseFloat(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
