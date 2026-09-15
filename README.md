# Seoul Pilgrimage Pass

Independent D2C map for fans visiting Seoul: editorial **BTS-era neighborhood pins**, **Naver 4.8+ food** (snapshot ratings, not live), **Naver Maps subway/bus routing**, and **Kakao T taxi hail**.

Not affiliated with BTS, HYBE, Big Hit, Naver, or Kakao.

## Monetization MVP (Naver-only)

The product path that should feel complete for **Pass** buyers needs **one Maps key**:

| Variable | Required | Where |
| --- | --- | --- |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | **Yes** (map tiles + in-app overlay) | [Naver Cloud](https://console.ncloud.com/) → AI·NAVER API → Maps Dynamic Map. Copy the Client ID (`ncpClientId` / `ncpKeyId`). Allow `bts-seoul-pilgrimage.vercel.app`. |

`NEXT_PUBLIC_*` is baked in at **build** time. After pasting it on Vercel Production, **redeploy**.

Also already used in production (not a Maps key): `JWT_SECRET` for Pass cookies. Lemon vars unlock paid checkout instead of the labeled demo path.

Everything else is optional and must not block the Transit tab.

## Run locally

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
npm install
npm run dev
```

App binds to **http://127.0.0.1:47501**.

Without the Naver client id, the map shows a banner and mock dots. **Naver Map transit/walk links still work** (they are public map.naver.com / `nmap://` URLs). Pins, taxi estimates, Pass checkout, and subway tips still work.

## What Pass buyers get with Naver-only

- Full pin set on the Naver map (when the client id is set)
- Transit tab: **from** airport/hub **to** unlocked pins, editorial subway/bus steps, walk-from-station overlay
- **Open subway / bus in Naver Maps** — official Naver transit directions (live trains/buses are Naver’s, not ours)
- Spot card: one-tap “Subway / bus via Naver”
- Taxi tab: static KRW matrix + **Kakao T** deep-link (`kakaot://` then `taxi.kakao.com`)

We **do not invent live vehicle GPS**.

## Optional keys

| Variable | Purpose if set |
| --- | --- |
| `NAVER_MAP_CLIENT_SECRET` | Same Naver app secret. Server walking polyline (Directions REST). If unset, the map uses the catalog station→pin segment only. |
| `SEOUL_OPEN_API_KEY` | Seoul Metro arrivals — **collapsed optional** block, not the default Transit UI |
| `DATA_GO_KR_SERVICE_KEY` | TOPIS bus arrivals / WGS84 GPS — same optional block. No fake markers if missing. |
| `KAKAO_REST_API_KEY` / `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` | Extra Kakao Navi ETA; taxi hail does **not** need them |
| Lemon vars | Real $19.99 checkout |

## Vercel

Project production URL: **https://bts-seoul-pilgrimage.vercel.app**

1. Settings → Environment Variables → Production: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
2. Redeploy (required for public env)

```bash
npx vercel env add NEXT_PUBLIC_NAVER_MAP_CLIENT_ID production
npx vercel --prod
```

## Product

- **Free:** first 5 historical pins + airport taxi / T-money / AREX rules + Naver routing for those pins
- **Pass $19.99:** all pins as map destinations + full subway hacks
- Kakao T button deep-links `kakaot://` then `taxi.kakao.com`

## Stack

Next.js 14 App Router, TypeScript, Tailwind, Lucide, Zustand, `jose`.
