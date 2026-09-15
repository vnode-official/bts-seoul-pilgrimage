import type { GeoPoint } from "@/types";

export interface NaverNamedPoint {
  name: string;
  coords: GeoPoint;
}

const APP = "bts.seoul.pilgrimage";

function placeSegment(point: NaverNamedPoint): string {
  const name = encodeURIComponent(point.name);
  return `${point.coords.lng},${point.coords.lat},${name},PLACE`;
}

export function naverTransitWebUrl(origin: NaverNamedPoint, dest: NaverNamedPoint): string {
  return `https://map.naver.com/p/directions/${placeSegment(origin)}/${placeSegment(dest)}/-/transit`;
}

export function naverWalkWebUrl(origin: NaverNamedPoint, dest: NaverNamedPoint): string {
  return `https://map.naver.com/p/directions/${placeSegment(origin)}/${placeSegment(dest)}/-/walk`;
}

export function naverTransitAppUrl(origin: NaverNamedPoint, dest: NaverNamedPoint): string {
  const params = new URLSearchParams({
    slat: String(origin.coords.lat),
    slng: String(origin.coords.lng),
    sname: origin.name,
    dlat: String(dest.coords.lat),
    dlng: String(dest.coords.lng),
    dname: dest.name,
    appname: APP,
  });
  return `nmap://route/public?${params.toString()}`;
}

export function openNaverDirections(appUrl: string, webUrl: string): void {
  const probe = window.open(appUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => {
    if (probe) {
      probe.location.href = webUrl;
    } else {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  }, 400);
}
