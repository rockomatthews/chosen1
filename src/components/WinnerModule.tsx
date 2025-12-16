"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { DEFAULT_COIN_OPTIONS, DEFAULT_SELECTED_SYMBOLS } from "@/lib/symbols";

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
  const theme = useTheme();
  const allSymbols = React.useMemo(
    () => DEFAULT_COIN_OPTIONS.map((c) => c.symbol),
    [],
  );
  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>(
    allSymbols,
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [best, setBest] = React.useState<BestResponse | null>(null);
  const [chart, setChart] = React.useState<ChartResponse | null>(null);
  const [isLoadingBest, setIsLoadingBest] = React.useState(false);
  const [isLoadingChart, setIsLoadingChart] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load persisted selection.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "default-all-collapse",
            hypothesisId: "H",
            location: "src/components/WinnerModule.tsx:loadSelection",
            message: "No saved selection; keeping default all",
            data: { selectedCount: allSymbols.length, allCount: allSymbols.length },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, ""))
          .filter((s) => s.length >= 2 && s.length <= 12);
        const unique = Array.from(new Set(cleaned)).slice(0, 20);

        // Requirement: default to ALL coins on load.
        // If a smaller selection was saved, override it back to ALL to avoid surprising "missing coins" on refresh.
        const shouldOverrideToAll = unique.length !== allSymbols.length;
        if (shouldOverrideToAll) {
          setSelectedSymbols(allSymbols);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allSymbols));
          } catch {
            // ignore
          }
          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId: "default-all-collapse",
              hypothesisId: "H",
              location: "src/components/WinnerModule.tsx:loadSelection",
              message: "Saved selection overridden to ALL on load",
              data: { savedCount: unique.length, allCount: allSymbols.length },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          return;
        }

        setSelectedSymbols(unique);
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "default-all-collapse",
            hypothesisId: "H",
            location: "src/components/WinnerModule.tsx:loadSelection",
            message: "Saved selection already ALL; keeping it",
            data: { savedCount: unique.length, allCount: allSymbols.length },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      }
    } catch {
      // ignore
    }
  }, [allSymbols]);

  // Persist selection.
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSymbols));
    } catch {
      // ignore
    }
  }, [selectedSymbols]);

  const filteredOptions = DEFAULT_COIN_OPTIONS;

  const setAll = React.useCallback(() => setSelectedSymbols(allSymbols), [allSymbols]);
  const setDefault = React.useCallback(
    () => setSelectedSymbols(DEFAULT_SELECTED_SYMBOLS),
    [],
  );
  const clearAll = React.useCallback(() => setSelectedSymbols([]), []);

  const toggleSymbol = React.useCallback(
    (symbol: string) => {
      setSelectedSymbols((prev) => {
        if (prev.includes(symbol)) return prev.filter((s) => s !== symbol);
        // Keep a hard cap at 20 (server max)
        if (prev.length >= 20) return prev;
        return [...prev, symbol];
      });
    },
    [],
  );

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

  React.useEffect(() => {
    const runId = "pre-fix";
    const card = document.querySelector('[data-testid="winner-card"]');
    const content = document.querySelector('[data-testid="winner-content"]');
    const cs = content ? window.getComputedStyle(content as Element) : null;
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "C",
        location: "src/components/WinnerModule.tsx:useEffect",
        message: "Winner padding/computed styles",
        data: {
          viewportW: window.innerWidth,
          cardRect: card ? (card as HTMLElement).getBoundingClientRect() : null,
          contentPadding: cs
            ? { pl: cs.paddingLeft, pr: cs.paddingRight, pt: cs.paddingTop, pb: cs.paddingBottom }
            : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  React.useEffect(() => {
    const runId = "remove-search";
    const input = document.querySelector('input[aria-label="Search coins"], input[name="Search coins"]');
    const wrapper = document.querySelector('[data-testid="winner-chip-wrap"]');
    const chipCount = wrapper ? wrapper.querySelectorAll(".MuiChip-root").length : null;
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "E",
        location: "src/components/WinnerModule.tsx:useEffect",
        message: "Search field removed + chip render count",
        data: {
          hasSearchInput: !!input,
          chipCount,
          optionCount: DEFAULT_COIN_OPTIONS.length,
          selectedCount: selectedSymbols.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [selectedSymbols.length]);

  React.useEffect(() => {
    const runId = "default-all-collapse";
    let hasSaved = false;
    try {
      hasSaved = !!localStorage.getItem(STORAGE_KEY);
    } catch {
      hasSaved = false;
    }
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "F",
        location: "src/components/WinnerModule.tsx:useEffect",
        message: "Default selection + persistence + picker state",
        data: {
          hasSavedSelection: hasSaved,
          selectedCount: selectedSymbols.length,
          allCount: allSymbols.length,
          pickerOpen,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [allSymbols.length, pickerOpen, selectedSymbols.length]);

  return (
    <Card data-testid="winner-card">
      <CardContent data-testid="winner-content" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          <Stack spacing={0.5} sx={{ px: { xs: 0.25, sm: 0 } }}>
            <Typography variant="h6" fontWeight={800}>
              Winner (last 5m)
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Pick your coin list below. We show one winner coin + its chart.
            </Typography>
          </Stack>

          <Accordion
            expanded={pickerOpen}
            onChange={(_, expanded) => {
              setPickerOpen(expanded);
              // #region agent log
              fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: "debug-session",
                  runId: "default-all-collapse",
                  hypothesisId: "G",
                  location: "src/components/WinnerModule.tsx:Accordion:onChange",
                  message: "Picker accordion toggled",
                  data: { expanded },
                  timestamp: Date.now(),
                }),
              }).catch(() => {});
              // #endregion
            }}
            disableGutters
            sx={{
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.10)",
              border: "1px solid",
              borderColor: "divider",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                <Typography fontWeight={800}>Coin list</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedSymbols.length}/{Math.min(20, allSymbols.length)} selected
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Stack direction="row" gap={1} sx={{ flexWrap: "wrap" }}>
                  <Button
                    onClick={setAll}
                    variant="contained"
                    color="secondary"
                    size="small"
                  >
                    Select all
                  </Button>
                  <Button onClick={setDefault} variant="outlined" size="small">
                    Reset
                  </Button>
                  <Button onClick={clearAll} variant="text" size="small">
                    Clear
                  </Button>
                </Stack>

                <Stack
                  data-testid="winner-chip-wrap"
                  direction="row"
                  gap={1}
                  sx={{ flexWrap: "wrap" }}
                >
                  {filteredOptions.map((c) => {
                    const selected = selectedSymbols.includes(c.symbol);
                    return (
                      <Chip
                        key={c.symbol}
                        label={c.symbol}
                        onClick={() => toggleSymbol(c.symbol)}
                        size="small"
                        color={selected ? "secondary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        sx={{
                          cursor: "pointer",
                          borderColor: selected
                            ? "transparent"
                            : "rgba(255,255,255,0.45)",
                          bgcolor: selected ? undefined : "rgba(255,255,255,0.08)",
                        }}
                      />
                    );
                  })}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Divider />

          <Stack spacing={1}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              gap={0.5}
              sx={{ px: { xs: 0.25, sm: 0 } }}
            >
              <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
                <Typography variant="h6" fontWeight={900}>
                  {winner ? winner.symbol : "—"}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color={
                    winner?.changePct5m != null
                      ? winner.changePct5m >= 0
                        ? "success.main"
                        : "error.main"
                      : "text.secondary"
                  }
                >
                  {winner ? formatPct(winner.changePct5m) : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {winner ? `Price: ${formatUsd(winner.price)}` : ""}
                </Typography>
                {(isLoadingBest || isLoadingChart) && <CircularProgress size={16} />}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : ""}
              </Typography>
            </Stack>

            <Stack
              sx={{
                height: { xs: 260, sm: 300, md: 340 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(0,0,0,0.12)",
                p: { xs: 1.25, sm: 1.75 },
              }}
            >
              {chart?.points?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart.points}>
                    <XAxis
                      dataKey="t"
                      tickFormatter={(t) =>
                        new Date(t as number).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }
                      minTickGap={40}
                    />
                    <YAxis
                      dataKey="price"
                      tickFormatter={(p) => Number(p).toFixed(2)}
                      width={60}
                    />
                    <Tooltip
                      labelFormatter={(t) => new Date(t as number).toLocaleString()}
                      formatter={(v) => [formatUsd(Number(v)), "Price"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      dot={false}
                      strokeWidth={3}
                      stroke={theme.palette.secondary.main}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : error ? (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {error.includes("chart failed") || error.includes("best failed")
                    ? "Data API error. Make sure CRYPTOCOMPARE_API_KEY is set in Vercel env vars."
                    : error}
                </Alert>
              ) : (
                <Stack sx={{ height: "100%" }} alignItems="center" justifyContent="center">
                  <Typography color="text.secondary">Loading…</Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


