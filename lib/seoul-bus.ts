import { cached, fetchText, xmlItems, xmlTag } from "@/lib/http";
import { dataGoKrKey } from "@/lib/keys";
import type {
  TransitArrival,
  TransitFeedError,
  TransitStation,
  TransitVehicle,
} from "@/types/transit";

const BUS_BASE = "http://ws.bus.go.kr/api/rest";

function busUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${BUS_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function busXml(path: string, params: Record<string, string>): Promise<string> {
  const key = dataGoKrKey();
  if (!key) {
    throw new Error("missing-key");
  }
  const { ok, status, body } = await fetchText(busUrl(path, { ...params, serviceKey: key }));
  if (!ok) {
    throw new Error(`Seoul bus HTTP ${status}`);
  }
  const headerCd = xmlTag(body, "headerCd");
  if (headerCd && headerCd !== "0") {
    throw new Error(xmlTag(body, "headerMsg") ?? `Seoul bus header ${headerCd}`);
  }
  return body;
}

export async function fetchBusArrivals(
  station: TransitStation,
): Promise<{
  arrivals: TransitArrival[];
  routeIds: string[];
  error?: TransitFeedError;
}> {
  if (!dataGoKrKey()) {
    return {
      arrivals: [],
      routeIds: [],
      error: {
        feed: "bus",
        code: "missing-key",
        message:
          "DATA_GO_KR_SERVICE_KEY is unset. Apply on data.go.kr for 서울특별시 버스정보시스템 (정류소도착/버스위치).",
      },
    };
  }
  const search = station.busSearchKr ?? station.nameKr;
  try {
    const arsId = await cached(`bus-ars-${search}`, 10 * 60_000, () => lookupArsId(search));
    if (!arsId) {
      return {
        arrivals: [],
        routeIds: [],
        error: {
          feed: "bus",
          code: "empty",
          message: `No TOPIS stop matched “${search}”.`,
        },
      };
    }
    const xml = await cached(`bus-arr-${arsId}`, 12_000, () =>
      busXml("stationinfo/getStationByUid", { arsId }),
    );
    const items = xmlItems(xml, "itemList");
    const arrivals = items.flatMap((item, index) => arrivalsFromStop(station, item, index));
    const routeIds = unique(items.map((item) => item.busRouteId).filter(Boolean));
    return { arrivals, routeIds };
  } catch (error) {
    return {
      arrivals: [],
      routeIds: [],
      error: {
        feed: "bus",
        code: error instanceof Error && error.message === "missing-key" ? "missing-key" : "upstream",
        message:
          error instanceof Error ? error.message : "Seoul bus arrival feed failed.",
      },
    };
  }
}

export async function fetchBusVehicles(
  routeIds: string[],
): Promise<{ vehicles: TransitVehicle[]; error?: TransitFeedError }> {
  if (!dataGoKrKey()) {
    return {
      vehicles: [],
      error: {
        feed: "bus",
        code: "missing-key",
        message: "DATA_GO_KR_SERVICE_KEY is unset — no bus GPS.",
      },
    };
  }
  const limited = routeIds.slice(0, 4);
  try {
    const batches = await Promise.all(limited.map((id) => vehiclesForRoute(id)));
    return { vehicles: batches.flat() };
  } catch (error) {
    return {
      vehicles: [],
      error: {
        feed: "bus",
        code: "upstream",
        message: error instanceof Error ? error.message : "Seoul bus GPS feed failed.",
      },
    };
  }
}

async function lookupArsId(name: string): Promise<string | null> {
  const xml = await busXml("stationinfo/getStationByName", { stSrch: name });
  const first = xmlItems(xml, "itemList")[0];
  return first?.arsId ?? null;
}

async function vehiclesForRoute(busRouteId: string): Promise<TransitVehicle[]> {
  const xml = await cached(`bus-pos-${busRouteId}`, 12_000, () =>
    busXml("buspos/getBusPosByRtid", { busRouteId }),
  );
  return xmlItems(xml, "itemList").flatMap((item, index) => {
    const lng = Number.parseFloat(item.gpsX ?? "");
    const lat = Number.parseFloat(item.gpsY ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return [];
    }
    const vehicle: TransitVehicle = {
      id: `bus-${item.vehId ?? item.plainNo ?? `${busRouteId}-${index}`}`,
      mode: "bus",
      label: item.plainNo ?? "Bus",
      lineLabel: item.rtNm ?? busRouteId,
      coords: { lat, lng },
      stationName: item.stopFlag === "1" ? "at stop" : "en route",
      headingHint: item.dataTm ?? null,
      receivedAt: item.dataTm ?? null,
      precision: "wgs84-gps",
      source: "Seoul TOPIS getBusPosByRtid (WGS84)",
    };
    return [vehicle];
  });
}

function arrivalsFromStop(
  station: TransitStation,
  item: Record<string, string>,
  index: number,
): TransitArrival[] {
  const slots: Array<"1" | "2"> = ["1", "2"];
  return slots.flatMap((slot) => {
    const parsed = messageFromBus(item, slot);
    if (!parsed) return [];
    const vehicleKey = slot === "1" ? "plainNo1" : "plainNo2";
    const vehIdKey = slot === "1" ? "vehId1" : "vehId2";
    const arrival: TransitArrival = {
      id: `bus-${station.id}-${item.busRouteId ?? index}-${slot}`,
      mode: "bus",
      lineLabel: item.rtNm ?? item.busRouteAbrv ?? "Bus",
      direction: item.adirection ?? "",
      destination: item.adirection ?? "",
      message: parsed.message,
      locationHint: parsed.location,
      etaSeconds: parsed.etaSeconds,
      vehicleId: item[vehicleKey] ?? item[vehIdKey] ?? null,
      receivedAt: null,
      source: "Seoul TOPIS getStationByUid",
    };
    return [arrival];
  });
}

function messageFromBus(
  item: Record<string, string>,
  slot: "1" | "2",
): { message: string; location: string | null; etaSeconds: number | null } | null {
  const msg = item[`arrmsg${slot}`];
  if (!msg || msg === "운행종료") {
    return null;
  }
  const seconds = Number.parseInt(item[`traTime${slot}`] ?? "", 10);
  return {
    message: msg,
    location: item.nxtStn ?? item[`stationNm${slot}`] ?? null,
    etaSeconds: Number.isFinite(seconds) ? seconds : null,
  };
}

function unique(values: string[]): string[] {
  const seen: string[] = [];
  for (const value of values) {
    if (!seen.includes(value)) seen.push(value);
  }
  return seen;
}
