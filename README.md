# Seoul Pilgrimage Pass

Independent D2C map for fans visiting **Seoul and Goyang**: editorial **BTS-era neighborhood pins**, **curated Naver 4.8+ style food** (editorial ratings, not live scraped scores), **Naver Maps app routing**, and **Kakao T taxi hail**.

Not affiliated with BTS, HYBE, Big Hit, Naver, or Kakao.

## Monetization MVP — no Naver Cloud account

Core UX does **not** need `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` or any Naver Cloud registration.

- In-app map: dark Esri canvas + purple pins (guide overlay, not live GPS). No Carto/Leaflet marketing chrome.
- **Open in Naver Map** on every unlocked pin: real `https://map.naver.com/p/search/...` link (clickable, new tab). Mobile also tries `nmap://place`. No popup-blocked delayed fallback.
- Transit tab: subway/bus and walk still open in the Naver Maps app/web
- Taxi: static KRW card + Kakao T deep-link

Satellite and street detail live in **Naver Maps**, not inside this site. We never invent live vehicle GPS.

## Regions

- **Seoul** — historical BTS-era pins + food (including a curated 4.8+ extra set)
- **Goyang** — 고양종합운동장 (concert-venue pilgrimage context, no invented dates), 현대백화점 킨텍스점, Ilsan / KINTEX / Deogyang places

Use the Seoul / Goyang filter in the sidebar. The map opens on a metro view so Goyang pins sit on the same canvas.

## Share

Each pin has **Share / Copy link**. Mobile uses the Web Share sheet; otherwise it copies ready-to-paste EN text:

```
THE BTS SEOUL PILGRIMAGE & TRANSIT PASS
Hongdae Playground (홍대 놀이터) — independent Seoul + Goyang pin map.
https://bts-seoul-pilgrimage.vercel.app/?spot=hongdae-playground
```

`/?spot=<slug>` opens that pin (and the Pass paywall if it is locked). Optional `?ref=` is stored first-touch in `localStorage` (`bts_invite_ref`) and stripped from the address bar — no invite chrome.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

App binds to **http://127.0.0.1:47501**.

## Env

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | For Pass cookies | HS256 secret (`jose`) |
| `NEXT_PUBLIC_APP_URL` | Recommended in prod | Canonical origin for Lemon redirects |
| Lemon vars | Optional | Real $19.99 checkout |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | **No** | Unused for core UX. Do not create a Naver Cloud account for this app. |
| Seoul / Kakao REST keys | **No** | Optional live arrivals / Navi ETA. Hidden when unset. Never faked. |

## Vercel

Production: **https://bts-seoul-pilgrimage.vercel.app**

No Naver Cloud client id is required to redeploy.

## Product

- **Free:** public historical pins, selected Goyang landmarks, two Seoul kitchens, airport taxi / T-money / AREX rules, Naver Map open + routing for those pins
- **Pass $19.99:** all Seoul + Goyang pins as destinations + full subway hacks
- Food ratings: `ratingSource: "curated"` editorial badges — **not** live Naver API scores
- Kakao T: `kakaot://` then `taxi.kakao.com`

## Stack

Next.js 14 App Router, TypeScript, Tailwind, Lucide, Zustand, `jose`.
