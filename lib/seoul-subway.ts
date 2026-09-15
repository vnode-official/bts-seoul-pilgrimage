import { SUBWAY_ID_LABELS, TRANSIT_STATIONS } from "@/data/stations";
import { cached, fetchText } from "@/lib/http";
import { seoulSubwayKey } from "@/lib/keys";
import type {
  TransitArrival,
  TransitFeedError,
  TransitStation,
  TransitVehicle,
} from "@/types/transit";

interface SeoulArrivalRow {
  subwayId?: string;
  updnLine?: string;
  trainLineNm?: string;
  statnNm?: string;
  arvlMsg2?: string;
  arvlMsg3?: string;
  barvlDt?: string;
  btrainNo?: string;
  bstatnNm?: string;
  recptnDt?: string;
  btrainSttus?: string;
}

interface SeoulPositionRow {
  subwayNm?: string;
  subwayId?: string;
  statnNm?: string;
  trainNo?: string;
  updnLine?: string;
  trainSttus?: string;
  recptnDt?: string;
  statnTnm?: string;
  directAt?: string;
}

interface SeoulEnvelope {
  errorMessage?: { status?: number; code?: string; message?: string };
  realtimeArrivalList?: SeoulArrivalRow[];
  realtimePositionList?: SeoulPositionRow[];
}

const POSITION_STATUS: Record<string, string> = {
  "0": "entering",
  "1": "arrived",
  "2": "departed",
  "3": "left previous",
};

function subwayUrl(key: string, service: string, start: number, end: number, name: string): string {
  const encoded = encodeURIComponent(name);
  return `http://swopenapi.seoul.go.kr/api/subway/${encodeURIComponent(key)}/json/${service}/${start}/${end}/${encoded}`;
}

async function seoulJson(url: string): Promise<SeoulEnvelope> {
  const { ok, status, body } = await fetchText(url);
  if (!ok) {
    throw new Error(`Seoul Metro HTTP ${status}`);
  }
  try {
    return JSON.parse(body) as SeoulEnvelope;
  } catch {
    throw new Error("Seoul Metro returned non-JSON.");
  }
}

function assertOk(payload: SeoulEnvelope): void {
  const code = payload.errorMessage?.code;
  if (code && code !== "INFO-000" && code !== "INFO-200") {
    throw new Error(payload.errorMessage?.message ?? `Seoul Metro ${code}`);
  }
}

export async function fetchSubwayArrivals(
  station: TransitStation,
): Promise<{ arrivals: TransitArrival[]; error?: TransitFeedError }> {
  const key = seoulSubwayKey();
  if (!key) {
    return {
      arrivals: [],
      error: {
        feed: "subway",
        code: "missing-key",
        message:
          "SEOUL_OPEN_API_KEY is unset. Get a key at data.seoul.go.kr (서울시 지하철 실시간 도착정보, OA-12764).",
      },
    };
  }
  try {
    const payload = await cached(`sub-arr-${station.subwayQueryKr}`, 12_000, () =>
      seoulJson(subwayUrl(key, "realtimeStationArrival", 0, 12, station.subwayQueryKr)),
    );
    assertOk(payload);
    const rows = payload.realtimeArrivalList ?? [];
    const arrivals = rows.map((row, index) => toArrival(station, row, index));
    return { arrivals };
  } catch (error) {
    return {
      arrivals: [],
      error: {
        feed: "subway",
        code: "upstream",
        message:
          error instanceof Error
            ? error.message
            : "Seoul Metro arrival feed failed.",
      },
    };
  }
}

export async function fetchSubwayVehicles(
  station: TransitStation,
): Promise<{ vehicles: TransitVehicle[]; error?: TransitFeedError }> {
  const key = seoulSubwayKey();
  if (!key) {
    return {
      vehicles: [],
      error: {
        feed: "subway",
        code: "missing-key",
        message: "SEOUL_OPEN_API_KEY is unset — no train positions.",
      },
    };
  }
  try {
    const payload = await cached(`sub-pos-${station.lineKr}`, 12_000, () =>
      seoulJson(subwayUrl(key, "realtimePosition", 0, 200, station.lineKr)),
    );
    assertOk(payload);
    const rows = payload.realtimePositionList ?? [];
    const vehicles = rows.map((row, index) => toVehicle(row, index));
    return { vehicles };
  } catch (error) {
    return {
      vehicles: [],
      error: {
        feed: "subway",
        code: "upstream",
        message:
          error instanceof Error
            ? error.message
            : "Seoul Metro position feed failed.",
      },
    };
  }
}

function toArrival(
  station: TransitStation,
  row: SeoulArrivalRow,
  index: number,
): TransitArrival {
  const seconds = Number.parseInt(row.barvlDt ?? "", 10);
  return {
    id: `sub-${station.id}-${row.btrainNo ?? index}`,
    mode: "subway",
    lineLabel: SUBWAY_ID_LABELS[row.subwayId ?? ""] ?? station.lineKr,
    direction: row.updnLine ?? "",
    destination: row.bstatnNm ?? row.trainLineNm ?? "",
    message: row.arvlMsg2 ?? row.trainLineNm ?? "No arrival message",
    locationHint: row.arvlMsg3 ?? null,
    etaSeconds: Number.isFinite(seconds) ? seconds : null,
    vehicleId: row.btrainNo ?? null,
    receivedAt: row.recptnDt ?? null,
    source: "Seoul Metro realtimeStationArrival",
  };
}

function toVehicle(row: SeoulPositionRow, index: number): TransitVehicle {
  const stationMatch = TRANSIT_STATIONS.find(
    (item) => item.subwayQueryKr === row.statnNm || item.nameKr === row.statnNm,
  );
  const status = POSITION_STATUS[row.trainSttus ?? ""] ?? null;
  return {
    id: `sub-veh-${row.trainNo ?? index}`,
    mode: "subway",
    label: row.trainNo ? `Train ${row.trainNo}` : "Train",
    lineLabel: row.subwayNm ?? SUBWAY_ID_LABELS[row.subwayId ?? ""] ?? "",
    coords: stationMatch?.coords ?? null,
    stationName: row.statnNm ?? null,
    headingHint: [row.updnLine, status, row.statnTnm].filter(Boolean).join(" · ") || null,
    receivedAt: row.recptnDt ?? null,
    precision: "reported-station",
    source: "Seoul Metro realtimePosition (station report, not GPS)",
  };
}
