import type { AccessTier, MapFilter, RegionFilter, Spot } from "@/types";

export const FREE_SPOT_LIMIT = 11;
export const PREMIUM_PRICE_USD = 19.99;
export const PASS_NAME = "Seoul Pilgrimage Pass";

export function isSpotUnlocked(spot: Spot, tier: AccessTier): boolean {
  if (tier === "premium") {
    return true;
  }
  return spot.tier === "free";
}

export function filterSpots(
  spots: readonly Spot[],
  options: {
    tier: AccessTier;
    filter: MapFilter;
    region: RegionFilter;
    search: string;
    includeLocked: boolean;
  },
): Spot[] {
  const q = options.search.trim().toLowerCase();
  return spots.filter((spot) => {
    if (options.filter !== "all" && spot.category !== options.filter) {
      return false;
    }
    if (options.region !== "all" && spot.region !== options.region) {
      return false;
    }
    if (!options.includeLocked && !isSpotUnlocked(spot, options.tier)) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = [
      spot.nameEn,
      spot.nameKr,
      spot.neighborhood,
      spot.district,
      spot.nearestStation,
      spot.region,
      ...spot.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function unlockedCount(spots: readonly Spot[], tier: AccessTier): number {
  return spots.filter((spot) => isSpotUnlocked(spot, tier)).length;
}
