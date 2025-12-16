# Momentum Winner

Next.js + Material UI app that:
- every **60 seconds** picks the **best performer over the last 5 minutes** from a **filterable coin list**
- shows a fresh **live-updating chart** for the current winner
- embeds a **Ramp** buy widget below the chart

## Local dev

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

Copy `ENV.example` to your own local env file (any name you like) and set values.

- **Server-side (API routes)**\n  - `CRYPTOCOMPARE_API_KEY`: used by `/api/best` + `/api/chart` to fetch minute candles.\n- **Client-side (Ramp iframe)**\n  - `NEXT_PUBLIC_RAMP_WIDGET_API_KEY`: Ramp “host API key” for widget embed.

## Deploy to Vercel (immediate)

1. Push this repo to GitHub.
2. In Vercel: **New Project** → Import the GitHub repo.
3. Add environment variables in **Project Settings → Environment Variables**:\n   - `CRYPTOCOMPARE_API_KEY` (Production)\n   - `NEXT_PUBLIC_RAMP_WIDGET_API_KEY` (Production)
4. Deploy. Vercel will build and host it automatically.

## Notes / troubleshooting

- **Polling & rate limits**: the UI polls every 60 seconds, and the server routes send `Cache-Control: s-maxage=60` to keep requests cheap on Vercel.\n- **Ramp params**: the embed URL is generated in `src/components/RampWidget.tsx`. If Ramp changes required query params for your account, update them there.\n- **API endpoints**:\n  - `GET /api/best?symbols=BTC,ETH,SOL`\n  - `GET /api/chart?symbol=BTC&limit=180`
