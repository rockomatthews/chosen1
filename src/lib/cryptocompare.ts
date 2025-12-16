const CRYPTOCOMPARE_BASE_URL = "https://min-api.cryptocompare.com";
const UPSTREAM_REVALIDATE_SECONDS = 60;

export type HistoMinutePoint = {
  time: number; // unix seconds
  close: number;
};

export class CryptoCompareError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "CryptoCompareError";
  }
}

function getApiKey(): string | undefined {
  const key = process.env.CRYPTOCOMPARE_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

export async function fetchHistoMinute({
  fsym,
  tsym = "USD",
  limit,
}: {
  fsym: string;
  tsym?: string;
  limit: number;
}): Promise<HistoMinutePoint[]> {
  const apiKey = getApiKey();
  const url = new URL("/data/v2/histominute", CRYPTOCOMPARE_BASE_URL);
  url.searchParams.set("fsym", fsym);
  url.searchParams.set("tsym", tsym);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: apiKey ? { authorization: `Apikey ${apiKey}` } : undefined,
    // Cache upstream responses; UI refreshes on a longer cadence than the 5m window.
    next: { revalidate: UPSTREAM_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new CryptoCompareError(
      `CryptoCompare HTTP ${res.status}`,
      res.status,
    );
  }

  const json = (await res.json()) as {
    Response?: string;
    Message?: string;
    Data?: { Data?: Array<{ time: number; close: number }> };
  };

  if (json.Response === "Error") {
    throw new CryptoCompareError(json.Message ?? "CryptoCompare error");
  }

  const points = json.Data?.Data ?? [];
  return points
    .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.close))
    .map((p) => ({ time: p.time, close: p.close }));
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;

  async function worker() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const current = idx++;
      if (current >= items.length) return;
      results[current] = await mapper(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}


