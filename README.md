# Seoul Pilgrimage Pass

Independent D2C map for fans visiting Seoul: editorial **BTS-era neighborhood pins**, **Naver 4.8+ food** (snapshot ratings, not live), and **taxi / subway scam prevention** plus **live Seoul Metro / TOPIS arrivals**.

Not affiliated with BTS, HYBE, Big Hit, Naver, or Kakao. Concert years mentioned on venue cards are public event records, not invented visit diaries.

## Run locally

```bash
cp .env.example .env.local
# fill keys (see Env)
npm install
npm run dev
```

App binds to **http://127.0.0.1:47501**.

Without `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`, the map shows a banner and mock geo dots. Pins, drawers, taxi estimates, transit notes, and checkout still work. Live vehicles are **never** faked — missing transit keys produce an error state and an empty vehicle layer.

## Env

| Variable | Where | Client/server | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | [Naver Cloud](https://console.ncloud.com/) → AI·NAVER API → Maps | Public | Naver Maps JS (`ncpClientId` / `ncpKeyId`). UI uses `disableDefaultUI` and hides `logoControl`. |
| `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` | [Kakao Developers](https://developers.kakao.com/) → app → JavaScript key | Public | Kakao Map **static** station preview. Register your Web domain. |
| `KAKAO_REST_API_KEY` | Same Kakao app → REST API key | Server | Kakao Navi `GET /v1/directions` (drive duration, optional taxi hint, polyline on the Naver map). |
| `SEOUL_OPEN_API_KEY` | [data.seoul.go.kr OA-12764](https://data.seoul.go.kr/dataList/OA-12764/F/1/datasetView.do) | Server | Subway `realtimeStationArrival` + `realtimePosition`. Positions are **station-name reports**, not GPS. |
| `DATA_GO_KR_SERVICE_KEY` | [data.go.kr](https://www.data.go.kr/) TOPIS 정류소도착 / 버스위치 | Server | Bus stop arrivals (`getStationByUid`) and WGS84 GPS (`getBusPosByRtid`). Use the **Decoding** key. |
| `SEOUL_BUS_API_KEY` | same as above | Server | Optional alias for `DATA_GO_KR_SERVICE_KEY`. |
| `JWT_SECRET` | you | Server | HS256 secret for httpOnly Pass cookies (`jose`) |
| `LEMON_SQUEEZY_VARIANT_ID` | Lemon | Server | Premium Pass variant |
| `NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID` | Lemon | Public | Same variant if you only have a buy link |
| `LEMON_SQUEEZY_API_KEY` | Lemon | Server | Optional Checkout API |
| `LEMON_SQUEEZY_STORE_ID` | Lemon | Server | Required with the API key |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Lemon | Server | HMAC for `POST /api/webhooks/lemon` |
| `ALLOW_DEMO_UNLOCK` | you | Server | `true` to keep the labeled local demo unlock |
| `NEXT_PUBLIC_APP_URL` | you | Public | Canonical origin for Lemon redirects |

Checkout success lands on `/pass/success` and writes a signed JWT cookie (`bts_pass`). If Lemon is unset, that path is a **local-dev demo unlock** and is labeled as such.

Webhook: when `LEMON_SQUEEZY_WEBHOOK_SECRET` is set, the raw body is HMAC-SHA256 checked against `X-Signature`. Browser unlock is still the success URL + pending cookie.

## Vercel production

Project: `bts-seoul-pilgrimage` (production URL `https://bts-seoul-pilgrimage.vercel.app`).

In the Vercel dashboard → Settings → Environment Variables, add the same keys for **Production** (and Preview if you want live feeds there):

1. `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
2. `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`
3. `KAKAO_REST_API_KEY`
4. `SEOUL_OPEN_API_KEY`
5. `DATA_GO_KR_SERVICE_KEY`
6. Existing: `JWT_SECRET`, Lemon vars, `NEXT_PUBLIC_APP_URL=https://bts-seoul-pilgrimage.vercel.app`

`NEXT_PUBLIC_*` values are baked in at **build** time. After changing them, redeploy.

CLI equivalent (paste the secret when prompted; do not commit it):

```bash
npx vercel env add NEXT_PUBLIC_NAVER_MAP_CLIENT_ID production
npx vercel env add NEXT_PUBLIC_KAKAO_MAP_APP_KEY production
npx vercel env add KAKAO_REST_API_KEY production
npx vercel env add SEOUL_OPEN_API_KEY production
npx vercel env add DATA_GO_KR_SERVICE_KEY production
npx vercel --prod
```

Kakao Web platform must include `bts-seoul-pilgrimage.vercel.app`. Naver Maps Application must allow that domain.

## Live feeds (honest)

| Surface | Source | If the key is missing |
| --- | --- | --- |
| Base map | Naver Maps JS | Banner + mock dots. Catalog pins still work. |
| Subway arrivals | Seoul Metro Open API | Error chip. Empty arrival list. |
| Train “positions” | Seoul Metro `realtimePosition` | Station name only. Mapped onto this app’s station catalog. **No interpolation.** |
| Bus arrivals + GPS | TOPIS via data.go.kr | Error chip. No bus markers. |
| Drive ETA / route overlay | Kakao Navi REST | Error copy on the taxi card. Static KRW matrix remains. |
| Station static image | Kakao Map JS key | Hidden. “Open in Kakao Map” link still works. |
| Taxi hail | Kakao T deep-link | Always available (`kakaot://` then `taxi.kakao.com`). |

Routes: `GET /api/transit/live?stationId=`, `GET /api/transit/config`, `GET /api/kakao/directions`. Secrets stay server-side.

## Product

- **Free:** first 5 historical pins + airport taxi / T-money / AREX rules
- **Pass $19.99:** 50+ pins, food curation, full subway hacks
- Taxi card keeps a **pre-calculated KRW matrix** and, when keyed, a labeled Kakao Navi live drive estimate
- Kakao T button deep-links `kakaot://` then `taxi.kakao.com`

## Stack

Next.js 14 App Router, TypeScript, Tailwind, Lucide, Zustand, `jose`.
