import type { TransitHub } from "@/data/hubs";
import type { Spot } from "@/types";
import type { TransitStation } from "@/types/transit";

const LINE_2 = new Set([
  "hongik",
  "hapjeong",
  "gangnam",
  "jamsil",
  "sports-complex",
  "seongsu",
]);

export type GuideStepKind = "airport" | "rail" | "transfer" | "walk";

export interface GuideStep {
  id: string;
  kind: GuideStepKind;
  title: string;
  detail: string;
  lineLabel?: string;
}

export function buildSteps(
  hub: TransitHub,
  spot: Spot,
  destStation: TransitStation | null,
  walkMeters: number,
): GuideStep[] {
  const steps: GuideStep[] = [];
  if (hub.kind === "airport") {
    steps.push(airportStep(hub, destStation));
  }
  steps.push(railStep(hub, spot, destStation));
  steps.push({
    id: "walk",
    kind: "walk",
    title: `Walk ${formatWalk(walkMeters)} to the pin`,
    detail: destStation
      ? `Catalog straight-line from ${destStation.nameEn} — Naver walk directions has the sidewalks. Not live GPS.`
      : "No mapped station for this pin. Use Naver transit for the last hop.",
  });
  return steps;
}

function airportStep(hub: TransitHub, destStation: TransitStation | null): GuideStep {
  if (hub.id.startsWith("icn")) {
    const hongdae = destStation?.id === "hongik" || destStation?.id === "hapjeong";
    return {
      id: "arex",
      kind: "airport",
      title: hongdae ? "AREX all-stop to Hongik Univ." : "AREX, then city subway",
      detail: hongdae
        ? "All-stop AREX drops you at Hongik without Seoul Station. Express only serves Seoul Station."
        : "Express = Seoul Station only. All-stop hits DMC and Hongik. Let Naver Map pick the live sequence.",
      lineLabel: "AREX",
    };
  }
  return {
    id: "gmp",
    kind: "airport",
    title: "Line 9 express toward Gangnam",
    detail:
      destStation?.id === "hongik"
        ? "AREX / Line 5 / Line 6 can beat a taxi to Hongdae. Compare in Naver."
        : "Gold 급행 LED on Line 9 is the Gimpo cheat code to Sinnonhyeon / Sports Complex.",
    lineLabel: "Line 9",
  };
}

function railStep(
  hub: TransitHub,
  spot: Spot,
  destStation: TransitStation | null,
): GuideStep {
  const fromId = hub.stationId;
  const toId = destStation?.id;
  if (fromId && toId && fromId === toId) {
    return {
      id: "rail",
      kind: "rail",
      title: `Already at ${destStation.nameEn}`,
      detail: "Skip the transfer. Walk out to the pin.",
      lineLabel: destStation.lineEn,
    };
  }
  if (fromId && toId && LINE_2.has(fromId) && LINE_2.has(toId)) {
    return {
      id: "rail",
      kind: "rail",
      title: "Line 2 one-seat ride",
      detail: `Stay on the circle from ${hub.nameEn} to ${destStation.nameEn}. Check 내선/외선 on Naver.`,
      lineLabel: "Line 2",
    };
  }
  return {
    id: "rail",
    kind: "rail",
    title: destStation
      ? `Ride toward ${destStation.nameEn}`
      : `Ride toward ${spot.nearestStation}`,
    detail: destStation
      ? `${destStation.lineEn}. Open Naver Maps transit for the live subway/bus path and transfers.`
      : `${spot.line}. Open Naver Maps transit for the official routing.`,
    lineLabel: destStation?.lineEn ?? spot.line,
  };
}

function formatWalk(meters: number): string {
  if (meters < 80) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km (~${Math.max(1, Math.round(meters / 80))} min)`;
}
