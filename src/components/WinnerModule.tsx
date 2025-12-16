"use client";

import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { DEFAULT_COIN_OPTIONS, DEFAULT_SELECTED_SYMBOLS, type CoinOption } from "@/lib/symbols";

type BestResponse = {
  ts: number;
  window: "5m";
  quote: string;
  winner: { symbol: string; changePct5m: number; price: number };
  rankings: Array<{ symbol: string; changePct5m: number; price: number }>;
};

type ChartResponse = {
  symbol: string;
  quote: string;
  ts: number;
  points: Array<{ t: number; price: number }>;
};

const POLL_MS = 60_000;
const STORAGE_KEY = "mw:selectedSymbols";

function formatPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 100 ? 2 : 6,
  }).format(n);
}

export default function WinnerModule() {
  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>(
    DEFAULT_SELECTED_SYMBOLS,
  );
  const [best, setBest] = React.useState<BestResponse | null>(null);
  const [chart, setChart] = React.useState<ChartResponse | null>(null);
  const [isLoadingBest, setIsLoadingBest] = React.useState(false);
  const [isLoadingChart, setIsLoadingChart] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load persisted selection.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, ""))
          .filter((s) => s.length >= 2 && s.length <= 12);
        if (cleaned.length > 0) setSelectedSymbols(cleaned.slice(0, 20));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist selection.
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSymbols));
    } catch {
      // ignore
    }
  }, [selectedSymbols]);

  const selectedOptions: CoinOption[] = React.useMemo(() => {
    const bySymbol = new Map(DEFAULT_COIN_OPTIONS.map((c) => [c.symbol, c]));
    return selectedSymbols.map((s) => bySymbol.get(s) ?? { symbol: s, name: s });
  }, [selectedSymbols]);

  const fetchBestAndChart = React.useCallback(
    async (signal?: AbortSignal) => {
      if (selectedSymbols.length === 0) return;
      setError(null);
      setIsLoadingBest(true);
      try {
        const bestRes = await fetch(
          `/api/best?symbols=${encodeURIComponent(selectedSymbols.join(","))}`,
          { signal },
        );
        if (!bestRes.ok) {
          const text = await bestRes.text();
          throw new Error(`best failed (${bestRes.status}): ${text}`);
        }
        const bestJson = (await bestRes.json()) as BestResponse;
        setBest(bestJson);
        setIsLoadingBest(false);

        // Always refresh chart every tick using the current winner.
        const winnerSymbol = bestJson.winner.symbol;
        setIsLoadingChart(true);
        const chartRes = await fetch(
          `/api/chart?symbol=${encodeURIComponent(winnerSymbol)}&limit=180`,
          { signal },
        );
        if (!chartRes.ok) {
          const text = await chartRes.text();
          throw new Error(`chart failed (${chartRes.status}): ${text}`);
        }
        const chartJson = (await chartRes.json()) as ChartResponse;
        setChart(chartJson);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoadingBest(false);
        setIsLoadingChart(false);
      }
    },
    [selectedSymbols],
  );

  // Poll every 5 seconds.
  React.useEffect(() => {
    const controller = new AbortController();
    void fetchBestAndChart(controller.signal);
    const id = window.setInterval(() => {
      void fetchBestAndChart(controller.signal);
    }, POLL_MS);
    return () => {
      controller.abort();
      window.clearInterval(id);
    };
  }, [fetchBestAndChart]);

  const winner = best?.winner;
  const updatedAt = best?.ts ? new Date(best.ts) : null;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Winner (last 5m, updates every 60s)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pick which coins compete. The chart below always shows the current
              winner.
            </Typography>
          </Stack>

          <Autocomplete
            multiple
            options={DEFAULT_COIN_OPTIONS}
            value={selectedOptions}
            onChange={(_, value) => setSelectedSymbols(value.map((v) => v.symbol))}
            getOptionLabel={(o) => `${o.symbol} — ${o.name}`}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filterable coin list (max 20)"
                placeholder="Add coin…"
              />
            )}
          />

          <Divider />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="subtitle1" fontWeight={700}>
                    {winner ? `${winner.symbol} ${formatPct(winner.changePct5m)}` : "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {winner ? `Price: ${formatUsd(winner.price)}` : ""}
                  </Typography>
                  {(isLoadingBest || isLoadingChart) && (
                    <CircularProgress size={16} />
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                    {updatedAt ? `Updated: ${updatedAt.toLocaleTimeString()}` : ""}
                  </Typography>
                </Stack>

                <Stack
                  sx={{
                    height: 320,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                    px: 1,
                    py: 1,
                  }}
                >
                  {chart?.points?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chart.points}>
                        <XAxis
                          dataKey="t"
                          tickFormatter={(t) => new Date(t as number).toLocaleTimeString()}
                          minTickGap={35}
                        />
                        <YAxis
                          dataKey="price"
                          tickFormatter={(p) => Number(p).toFixed(2)}
                          width={60}
                        />
                        <Tooltip
                          labelFormatter={(t) =>
                            new Date(t as number).toLocaleString()
                          }
                          formatter={(v) => [formatUsd(Number(v)), "Price"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          dot={false}
                          strokeWidth={2}
                          stroke="#7c4dff"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Stack
                      sx={{ height: "100%" }}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography color="text.secondary">
                        {error ? error : "Waiting for data…"}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Top movers (5m)
                </Typography>
                <List dense disablePadding>
                  {(best?.rankings ?? []).slice(0, 8).map((r) => (
                    <ListItem key={r.symbol} disableGutters sx={{ py: 0.25 }}>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" fontWeight={600}>
                              {r.symbol}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={r.changePct5m >= 0 ? "success.main" : "error.main"}
                            >
                              {formatPct(r.changePct5m)}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatUsd(r.price)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}


