import {
  naverPlaceAppUrl,
  naverPlaceWebUrl,
  type NaverPlaceTarget,
} from "@/lib/naver-place-urls";
import { openNaverDirections } from "@/lib/naver-directions";

export type { NaverPlaceTarget } from "@/lib/naver-place-urls";
export {
  isValidNaverCoords,
  naverPlaceAppUrl,
  naverPlaceSearchWebUrl,
  naverPlaceWebUrl,
  naverSatelliteWebUrl,
} from "@/lib/naver-place-urls";

export function openNaverPlace(target: NaverPlaceTarget): void {
  openNaverDirections(naverPlaceAppUrl(target), naverPlaceWebUrl(target));
}
