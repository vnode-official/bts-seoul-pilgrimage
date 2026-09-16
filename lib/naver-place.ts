import type { GeoPoint } from "@/types";
import { openNaverDirections } from "@/lib/naver-directions";

const APP = "bts.seoul.pilgrimage";

export interface NaverPlaceTarget {
  nameEn: string;
  nameKr: string;
  coords: GeoPoint;
}

/** Official nmap place scheme — opens Naver Map app at the pin. */
export function naverPlaceAppUrl(target: NaverPlaceTarget): string {
  const params = new URLSearchParams({
    lat: String(target.coords.lat),
    lng: String(target.coords.lng),
    name: target.nameKr || target.nameEn,
    appname: APP,
  });
  return `nmap://place?${params.toString()}`;
}

/**
 * Hybrid (satellite + labels) at coordinates.
 * Classic map.naver.com `mapMode=2` is the documented hybrid/satellite param.
 */
export function naverSatelliteWebUrl(target: NaverPlaceTarget): string {
  const url = new URL("https://map.naver.com/");
  url.searchParams.set("lat", String(target.coords.lat));
  url.searchParams.set("lng", String(target.coords.lng));
  url.searchParams.set("dlevel", "16");
  url.searchParams.set("mapMode", "2");
  url.searchParams.set("title", target.nameKr || target.nameEn);
  return url.toString();
}

export function naverPlaceSearchWebUrl(target: NaverPlaceTarget): string {
  const query = encodeURIComponent(target.nameKr || target.nameEn);
  return `https://map.naver.com/p/search/${query}?c=${target.coords.lng},${target.coords.lat},17,0,0,0,dh`;
}

export function openNaverPlace(target: NaverPlaceTarget): void {
  openNaverDirections(naverPlaceAppUrl(target), naverSatelliteWebUrl(target));
}
