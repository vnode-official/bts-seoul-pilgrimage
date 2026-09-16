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
  const params = [
    `slat=${origin.coords.lat}`,
    `slng=${origin.coords.lng}`,
    `sname=${encodeURIComponent(origin.name)}`,
    `dlat=${dest.coords.lat}`,
    `dlng=${dest.coords.lng}`,
    `dname=${encodeURIComponent(dest.name)}`,
    `appname=${encodeURIComponent(APP)}`,
  ];
  return `nmap://route/public?${params.join("&")}`;
}

export function tryOpenNaverApp(appUrl: string): void {
  if (typeof document === "undefined") {
    return;
  }
  if (!/^nmap:\/\//.test(appUrl)) {
    return;
  }
  if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.src = appUrl;
  iframe.style.cssText = "display:none;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  window.setTimeout(() => iframe.remove(), 1500);
}

/** Open the https Naver URL in the same click; try the app scheme without blocking it. */
export function openNaverDirections(appUrl: string, webUrl: string): void {
  window.open(webUrl, "_blank", "noopener,noreferrer");
  tryOpenNaverApp(appUrl);
}
