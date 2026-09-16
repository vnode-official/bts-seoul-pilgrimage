export interface NaverPlaceTarget {
  nameEn: string;
  nameKr: string;
  /** Korean Naver search query when it differs from the display name. */
  query?: string;
  coords: { lat: number; lng: number };
}

export const NAVER_APPNAME = "bts.seoul.pilgrimage";

export function isValidNaverCoords(coords: { lat: number; lng: number } | undefined | null): boolean {
  return Boolean(
    coords &&
      Number.isFinite(coords.lat) &&
      Number.isFinite(coords.lng) &&
      coords.lat >= 33 &&
      coords.lat <= 39 &&
      coords.lng >= 124 &&
      coords.lng <= 132,
  );
}

function coord(value: number): string {
  return value.toFixed(6);
}

function placeName(target: NaverPlaceTarget): string {
  return (target.query || target.nameKr || target.nameEn).trim();
}

/** Official nmap place scheme. Names use %20, not application/x-www-form-urlencoded +. */
export function naverPlaceAppUrl(target: NaverPlaceTarget): string {
  const name = encodeURIComponent(placeName(target));
  const appname = encodeURIComponent(NAVER_APPNAME);
  return `nmap://place?lat=${coord(target.coords.lat)}&lng=${coord(target.coords.lng)}&name=${name}&appname=${appname}`;
}

/**
 * Current Naver web place URL: search + camera (`c=lng,lat,zoom`).
 * Homepage `map.naver.com/?lat=` is not a reliable place link.
 */
export function naverPlaceWebUrl(target: NaverPlaceTarget): string {
  const query = encodeURIComponent(placeName(target));
  const lat = coord(target.coords.lat);
  const lng = coord(target.coords.lng);
  return `https://map.naver.com/p/search/${query}?c=${lng},${lat},16,0,0,0,dh`;
}

/** @deprecated Use naverPlaceWebUrl — kept so older imports keep typechecking. */
export function naverSatelliteWebUrl(target: NaverPlaceTarget): string {
  return naverPlaceWebUrl(target);
}

export function naverPlaceSearchWebUrl(target: NaverPlaceTarget): string {
  return naverPlaceWebUrl(target);
}
