import type { GeoPoint } from "@/types";

export type HubKind = "airport" | "station";

export interface TransitHub {
  id: string;
  nameEn: string;
  nameKr: string;
  coords: GeoPoint;
  kind: HubKind;
  stationId?: string;
  lines: string[];
  naverName: string;
}

export const TRANSIT_HUBS: readonly TransitHub[] = [
  {
    id: "icn-t1",
    nameEn: "Incheon Airport T1",
    nameKr: "인천국제공항 T1",
    coords: { lat: 37.4475, lng: 126.4524 },
    kind: "airport",
    lines: ["AREX"],
    naverName: "인천국제공항 제1여객터미널",
  },
  {
    id: "icn-t2",
    nameEn: "Incheon Airport T2",
    nameKr: "인천국제공항 T2",
    coords: { lat: 37.4686, lng: 126.4335 },
    kind: "airport",
    lines: ["AREX"],
    naverName: "인천국제공항 제2여객터미널",
  },
  {
    id: "gmp",
    nameEn: "Gimpo Airport",
    nameKr: "김포공항",
    coords: { lat: 37.5585, lng: 126.7945 },
    kind: "airport",
    lines: ["Line 9", "AREX", "Line 5"],
    naverName: "김포국제공항",
  },
  {
    id: "hongik",
    nameEn: "Hongik University",
    nameKr: "홍대입구",
    coords: { lat: 37.5572, lng: 126.9245 },
    kind: "station",
    stationId: "hongik",
    lines: ["Line 2", "AREX"],
    naverName: "홍대입구역",
  },
  {
    id: "gangnam",
    nameEn: "Gangnam",
    nameKr: "강남",
    coords: { lat: 37.4979, lng: 127.0276 },
    kind: "station",
    stationId: "gangnam",
    lines: ["Line 2", "Shinbundang"],
    naverName: "강남역",
  },
  {
    id: "myeongdong",
    nameEn: "Myeongdong",
    nameKr: "명동",
    coords: { lat: 37.561, lng: 126.9861 },
    kind: "station",
    stationId: "myeongdong",
    lines: ["Line 4"],
    naverName: "명동역",
  },
  {
    id: "jamsil",
    nameEn: "Jamsil",
    nameKr: "잠실",
    coords: { lat: 37.5133, lng: 127.1002 },
    kind: "station",
    stationId: "jamsil",
    lines: ["Line 2", "Line 8"],
    naverName: "잠실역",
  },
  {
    id: "hangangjin",
    nameEn: "Hangangjin",
    nameKr: "한강진",
    coords: { lat: 37.5396, lng: 127.0017 },
    kind: "station",
    stationId: "hangangjin",
    lines: ["Line 6"],
    naverName: "한강진역",
  },
  {
    id: "seoul-station",
    nameEn: "Seoul Station",
    nameKr: "서울역",
    coords: { lat: 37.5547, lng: 126.9707 },
    kind: "station",
    lines: ["AREX", "Line 1", "Line 4"],
    naverName: "서울역",
  },
];

export function getTransitHub(id: string): TransitHub | undefined {
  return TRANSIT_HUBS.find((hub) => hub.id === id);
}
