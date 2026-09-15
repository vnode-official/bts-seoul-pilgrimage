# Seoul Pilgrimage Pass

Independent D2C map for fans visiting Seoul: editorial **BTS-era neighborhood pins**, **Naver 4.8+ food** (snapshot ratings, not live), and **taxi / subway scam prevention**.

Not affiliated with BTS, HYBE, Big Hit, Naver, or Kakao. Concert years mentioned on venue cards are public event records, not invented visit diaries.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

App binds to **http://127.0.0.1:47501**.

Without `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`, the map shows a placeholder and mock geo dots. Pins, drawers, taxi estimates, transit notes, and checkout still work.

## Env

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | Naver Cloud Maps JavaScript API client id (`ncpClientId` / `ncpKeyId`) |
| `JWT_SECRET` | HS256 secret for httpOnly Pass cookies (`jose`) |
| `LEMON_SQUEEZY_VARIANT_ID` | Premium Pass variant |
| `NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID` | Same variant if you only have a buy link |
| `LEMON_SQUEEZY_API_KEY` | Optional Checkout API |
| `LEMON_SQUEEZY_STORE_ID` | Required with the API key |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | HMAC for `POST /api/webhooks/lemon` |
| `ALLOW_DEMO_UNLOCK` | `true` to keep the labeled local demo unlock |

Checkout success lands on `/pass/success` and writes a signed JWT cookie (`bts_pass`). If Lemon is unset, that path is a **local-dev demo unlock** and is labeled as such.

Webhook: when `LEMON_SQUEEZY_WEBHOOK_SECRET` is set, the raw body is HMAC-SHA256 checked against `X-Signature`. Browser unlock is still the success URL + pending cookie.

## Product

- **Free:** first 5 historical pins + airport taxi / T-money / AREX rules
- **Pass $19.99:** 50+ pins, food curation, full subway hacks
- Taxi card uses a **pre-calculated KRW matrix** (estimates, not live Kakao)
- Kakao T button deep-links `kakaot://` then `taxi.kakao.com`

## Stack

Next.js 14 App Router, TypeScript, Tailwind, Lucide, Zustand, `jose`.
