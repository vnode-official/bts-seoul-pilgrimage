import type {
  AccessTier,
  OrderingScript,
  RatingSource,
  Spot,
  SpotImage,
  SpotRegion,
  VisitWindow,
} from "@/types";

export const PALACE: VisitWindow = {
  days: "Typically Tue–Sun (closed Tue at some palaces)",
  hours: "Check Naver the same day",
  notes: "Ticketing and last-entry rules change seasonally.",
};

export const VENUE: VisitWindow = {
  days: "Event days only unless noted",
  hours: "Box office hours vary",
  notes: "This is a public venue pin, not a guaranteed artist appearance.",
};

export const STREET: VisitWindow = {
  days: "Always viewable from public streets",
  hours: "Daylight recommended for photos",
  notes: "Do not enter private lobbies, offices, or residences.",
};

export const FOOD: VisitWindow = {
  days: "Most days; many kitchens close between lunch and dinner",
  hours: "Verify last order on Naver",
  notes: "Weekend queues are normal. Put your name in and walk the block.",
};

export const PARK: VisitWindow = {
  days: "Daily; some lawns close after dusk",
  hours: "Daylight recommended",
  notes: "Stay on public paths. Boat, fountain, and ticket hours change — check Naver.",
};

export const MALL: VisitWindow = {
  days: "Daily",
  hours: "Department-store floors typically 10:30–20:00",
  notes: "Restaurant floors may close earlier. Confirm on Naver the same day.",
};

export const G_NIGHT = "linear-gradient(160deg,#1a1428 0%,#3b2166 48%,#0F0F12 100%)";
export const G_RIVER = "linear-gradient(160deg,#102028 0%,#1e4a5c 50%,#0F0F12 100%)";
export const G_HALL = "linear-gradient(160deg,#16161c 0%,#2a2438 52%,#0F0F12 100%)";
export const G_FOOD = "linear-gradient(160deg,#2a1612 0%,#5a2a18 50%,#0F0F12 100%)";
export const G_STREET = "linear-gradient(160deg,#141820 0%,#2a3040 50%,#0F0F12 100%)";
export const G_PARK = "linear-gradient(160deg,#102418 0%,#1e4a32 50%,#0F0F12 100%)";

export function unsplash(id: string, alt: string, gradient: string): SpotImage {
  return {
    kind: "unsplash",
    src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=70`,
    alt,
    gradient,
  };
}

export function scripts(
  first: OrderingScript,
  extra: OrderingScript[] = [],
): OrderingScript[] {
  return [
    first,
    {
      situation: "Asking if they speak English",
      en: "Sorry — do you speak a little English?",
      kr: "죄송합니다, 영어 조금 가능하세요?",
      romanization: "Joesonghamnida, yeongeo jogeum ganeunghaseyo?",
    },
    ...extra,
  ];
}

type SpotDraft = Omit<Spot, "category" | "region" | "ratingSource"> & {
  region?: SpotRegion;
  ratingSource?: RatingSource;
  tier: AccessTier;
};

export function bts(partial: SpotDraft): Spot {
  return { region: "seoul", ...partial, category: "bts" };
}

export function food(partial: SpotDraft): Spot {
  return {
    region: "seoul",
    ratingSource: "curated",
    ...partial,
    category: "food",
  };
}
