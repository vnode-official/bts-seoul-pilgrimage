export type SpotCategory = "bts" | "food";
export type AccessTier = "free" | "premium";
export type SessionSource = "none" | "jwt" | "demo";
export type SheetSnap = "peek" | "half" | "full";
export type MapFilter = "all" | "bts" | "food";
export type SpotRegion = "seoul" | "goyang";
export type RegionFilter = "all" | SpotRegion;
/** Editorial badge only — never a live scraped Naver API score. */
export type RatingSource = "curated";
export type SidePanel = "spots" | "taxi" | "transit";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface VisitWindow {
  days: string;
  hours: string;
  lastEntry?: string;
  notes: string;
}

export interface OrderingScript {
  situation: string;
  en: string;
  kr: string;
  romanization: string;
}

export interface SpotImage {
  kind: "unsplash" | "gradient";
  src?: string;
  alt: string;
  gradient: string;
}

export interface Spot {
  id: string;
  slug: string;
  nameEn: string;
  nameKr: string;
  category: SpotCategory;
  region: SpotRegion;
  tier: AccessTier;
  neighborhood: string;
  district: string;
  coords: GeoPoint;
  nearestStation: string;
  line: string;
  visit: VisitWindow;
  scripts: OrderingScript[];
  editorial: string;
  publicRecord?: string;
  tags: string[];
  image: SpotImage;
  /** Curated editorial figure in the 4.8+ style — not live Naver. */
  naverRatingSnapshot?: number;
  ratingSource?: RatingSource;
  naverPlaceQuery: string;
}

export interface TaxiRoute {
  id: string;
  from: string;
  to: string;
  fromShort: string;
  toShort: string;
  estimateKrwLow: number;
  estimateKrwHigh: number;
  durationMin: number;
  durationMax: number;
  tollsLikely: boolean;
  notes: string;
  originQuery: string;
  destQuery: string;
  origin: GeoPoint;
  dest: GeoPoint;
}

export interface TransitTip {
  id: string;
  title: string;
  body: string;
  lines?: string[];
  tier: AccessTier;
  kind: "airport" | "transfer" | "boarding" | "etiquette" | "night";
}

export interface SessionPayload {
  tier: AccessTier;
  source: SessionSource;
  checkoutId?: string;
}

export interface PublicSession {
  tier: AccessTier;
  source: SessionSource;
  expiresAt: string | null;
  demoUnlockAvailable: boolean;
  lemonConfigured: boolean;
}

export interface CheckoutResponse {
  mode: "lemon" | "demo" | "unconfigured";
  checkoutUrl: string | null;
  message: string;
}
