import { SPOTS } from "../data/spots";
import {
  isValidNaverCoords,
  naverPlaceAppUrl,
  naverPlaceWebUrl,
} from "../lib/naver-place-urls";

const SAMPLE_IDS = [
  "hongdae-playground",
  "ilji-art-hall",
  "tosokchon",
  "goyang-stadium",
  "hyundai-kintex",
  "ilsan-lake-park",
] as const;

function fail(message: string): never {
  throw new Error(message);
}

function checkTarget(
  label: string,
  target: {
    nameEn: string;
    nameKr: string;
    query?: string;
    coords: { lat: number; lng: number };
  },
): void {
  if (!isValidNaverCoords(target.coords)) {
    fail(`${label}: invalid coords ${JSON.stringify(target.coords)}`);
  }
  const app = naverPlaceAppUrl(target);
  const web = naverPlaceWebUrl(target);
  if (!app.startsWith("nmap://place?")) {
    fail(`${label}: bad app scheme ${app}`);
  }
  if (app.includes("+") && app.includes("name=")) {
    const namePart = app.slice(app.indexOf("name="));
    if (namePart.includes("+")) {
      fail(`${label}: nmap name used + instead of %20: ${app}`);
    }
  }
  if (app.includes("undefined") || web.includes("undefined") || web.includes("NaN")) {
    fail(`${label}: empty token in URL`);
  }
  const parsed = new URL(web);
  if (parsed.protocol !== "https:" || parsed.hostname !== "map.naver.com") {
    fail(`${label}: web host ${web}`);
  }
  if (!parsed.pathname.startsWith("/p/search/")) {
    fail(`${label}: expected /p/search/ ${web}`);
  }
  const camera = parsed.searchParams.get("c") ?? "";
  if (!camera.startsWith(`${target.coords.lng.toFixed(6)},${target.coords.lat.toFixed(6)}`)) {
    fail(`${label}: camera ${camera}`);
  }
}

let checked = 0;
for (const spot of SPOTS) {
  checkTarget(spot.id, {
    nameEn: spot.nameEn,
    nameKr: spot.nameKr,
    query: spot.naverPlaceQuery,
    coords: spot.coords,
  });
  checked += 1;
}

for (const id of SAMPLE_IDS) {
  const spot = SPOTS.find((item) => item.id === id);
  if (!spot) {
    fail(`missing sample pin ${id}`);
  }
}

const seoul = SPOTS.filter((spot) => spot.region === "seoul").length;
const goyang = SPOTS.filter((spot) => spot.region === "goyang").length;
if (seoul < 1 || goyang < 1) {
  fail(`expected Seoul and Goyang pins, got ${seoul}/${goyang}`);
}

process.stdout.write(
  `naver-url-smoke ok: ${checked} pins (${seoul} seoul, ${goyang} goyang)\n`,
);
