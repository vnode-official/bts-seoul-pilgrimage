export interface GeoPoint {
  lat: number;
  lng: number;
}

export type TransitFeed = "subway" | "bus" | "kakao";

export interface TransitStation {
  id: string;
  nameEn: string;
  nameKr: string;
  subwayQueryKr: string;
  lineKr: string;
  lineEn: string;
  coords: GeoPoint;
  busSearchKr?: string;
  spotIds: string[];
}

export interface TransitArrival {
  id: string;
  mode: "subway" | "bus";
  lineLabel: string;
  direction: string;
  destination: string;
  message: string;
  locationHint: string | null;
  etaSeconds: number | null;
  vehicleId: string | null;
  receivedAt: string | null;
  source: string;
}

export interface TransitVehicle {
  id: string;
  mode: "subway" | "bus";
  label: string;
  lineLabel: string;
  coords: GeoPoint | null;
  stationName: string | null;
  headingHint: string | null;
  receivedAt: string | null;
  precision: "wgs84-gps" | "reported-station";
  source: string;
}

export interface TransitSnapshot {
  station: TransitStation;
  fetchedAt: string;
  arrivals: TransitArrival[];
  vehicles: TransitVehicle[];
  errors: TransitFeedError[];
  sources: TransitSourceStatus[];
}

export interface TransitFeedError {
  feed: TransitFeed;
  code: "missing-key" | "upstream" | "empty" | "invalid";
  message: string;
}

export interface TransitSourceStatus {
  feed: TransitFeed;
  configured: boolean;
  label: string;
}

export interface TransitConfigResponse {
  subwayConfigured: boolean;
  busConfigured: boolean;
  kakaoRestConfigured: boolean;
  kakaoJsConfigured: boolean;
  naverJsConfigured: boolean;
  naverWalkingConfigured: boolean;
  liveTransitConfigured: boolean;
  refreshMs: number;
}

export interface KakaoDirectionsResult {
  source: "kakao-navi";
  durationSeconds: number;
  distanceMeters: number;
  taxiFareKrw: number | null;
  path: GeoPoint[];
  summary: string;
}
