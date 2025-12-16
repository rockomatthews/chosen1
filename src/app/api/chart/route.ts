import { NextResponse } from "next/server";
import { fetchHistoMinute } from "@/lib/cryptocompare";

const TSYM = "USD";
const MAX_LIMIT = 360; // 6h of 1m candles
const CACHE_SECONDS = 60;

function parseSymbol(param: string | null): string | null {
  if (!param) return null;
  const s = param.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length < 2 || s.length > 12) return null;
  return s;
}

function parseLimit(param: string | null): number {
  if (!param) return 120;
  const n = Number(param);
  if (!Number.isFinite(n)) return 120;
  return Math.min(Math.max(Math.floor(n), 10), MAX_LIMIT);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = parseSymbol(searchParams.get("symbol"));
  const limit = parseLimit(searchParams.get("limit"));

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing symbol. Provide ?symbol=BTC" },
      { status: 400 },
    );
  }

  // limit=N returns N+1 points
  const points = await fetchHistoMinute({ fsym: symbol, tsym: TSYM, limit });

  return NextResponse.json(
    {
      symbol,
      quote: TSYM,
      ts: Date.now(),
      points: points.map((p) => ({ t: p.time * 1000, price: p.close })),
    },
    {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`,
      },
    },
  );
}


