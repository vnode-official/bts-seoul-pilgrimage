# Seoul Pilgrimage Pass

Independent D2C map for fans visiting Seoul: editorial **BTS-era neighborhood pins**, **Naver 4.8+ food** (snapshot ratings, not live), **Naver Maps app routing**, and **Kakao T taxi hail**.

Not affiliated with BTS, HYBE, Big Hit, Naver, or Kakao.

## Monetization MVP — no Naver Cloud account

Core UX does **not** need `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` or any Naver Cloud registration.

- In-app map: dark Esri canvas + purple pins (guide overlay, not live GPS). No Carto/Leaflet marketing chrome.
- **Open in Naver Map** on every unlocked pin: mobile `nmap://place` deep-link, then `map.naver.com` hybrid/satellite fallback at that lat/lng
- Transit tab: subway/bus and walk still open in the Naver Maps app/web
- Taxi: static KRW card + Kakao T deep-link

Satellite and street detail live in **Naver Maps**, not inside this site. We never invent live vehicle GPS.

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

- **Free:** first 5 historical pins + airport taxi / T-money / AREX rules + Naver Map open + routing for those pins
- **Pass $19.99:** all pins as destinations + full subway hacks
- Kakao T: `kakaot://` then `taxi.kakao.com`

## Stack

Next.js 14 App Router, TypeScript, Tailwind, Lucide, Zustand, `jose`.
