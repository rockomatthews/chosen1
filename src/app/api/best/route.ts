import { NextResponse } from "next/server";
import { fetchHistoMinute, mapWithConcurrency } from "@/lib/cryptocompare";

const MAX_SYMBOLS = 20;
const TSYM = "USD";
const CACHE_SECONDS = 60;

function parseSymbols(param: string | null): string[] {
  if (!param) return [];
  const raw = param
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const cleaned = raw
    .map((s) => s.replace(/[^A-Z0-9]/g, ""))
    .filter((s) => s.length >= 2 && s.length <= 12);

  return Array.from(new Set(cleaned)).slice(0, MAX_SYMBOLS);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbols = parseSymbols(searchParams.get("symbols"));

  if (symbols.length === 0) {
    return NextResponse.json(
      {
        error:
          "Missing symbols. Provide ?symbols=BTC,ETH,... (max 20).",
      },
      { status: 400 },
    );
  }

  // We want a 5-minute change. Histominute with limit=5 returns 6 points (t-5 ... t).
  const limit = 5;

  const rows = await mapWithConcurrency(
    symbols,
    8,
    async (symbol): Promise<
      | {
          symbol: string;
          changePct5m: number;
          price: number;
        }
      | {
          symbol: string;
          error: string;
        }
    > => {
      try {
        const points = await fetchHistoMinute({
          fsym: symbol,
          tsym: TSYM,
          limit,
        });
        if (points.length < 2) {
          return { symbol, error: "insufficient data" };
        }
        const first = points[0]?.close;
        const last = points[points.length - 1]?.close;
        if (!first || !last || first <= 0) {
          return { symbol, error: "invalid prices" };
        }
        const changePct5m = ((last - first) / first) * 100;
        return {
          symbol,
          changePct5m,
          price: last,
        };
      } catch (e) {
        return {
          symbol,
          error: e instanceof Error ? e.message : "unknown error",
        };
      }
    },
  );

  const okRows = rows.filter(
    (r): r is { symbol: string; changePct5m: number; price: number } =>
      "changePct5m" in r && Number.isFinite(r.changePct5m),
  );

  if (okRows.length === 0) {
    return NextResponse.json(
      {
        error:
          "No symbols returned usable data (check API key / rate limits).",
        details: rows,
      },
      { status: 502 },
    );
  }

  okRows.sort((a, b) => b.changePct5m - a.changePct5m);
  const winner = okRows[0];

  return NextResponse.json(
    {
      ts: Date.now(),
      window: "5m",
      quote: TSYM,
      winner,
      rankings: okRows,
      failed: rows.filter((r) => "error" in r),
    },
    {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`,
      },
    },
  );
}


