"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WinnerModule from "./WinnerModule";
import BuyModule from "./BuyModule";

export default function Dashboard() {
  React.useEffect(() => {
    const runId = "version-ping-2";
    const codeVersion = "2025-12-16T00:40Z-title-chosen1";

    const readMeta = () => {
      const ogImage = document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content");
      const ogTitle = document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content");
      const twImage = document
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute("content");
      const docTitle = document.title;
      return { ogTitle, ogImage, twImage, docTitle };
    };

    const initial = readMeta();
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "I",
        location: "src/components/Dashboard.tsx:useEffect",
        message: "Client bundle version ping + initial meta read",
        data: {
          codeVersion,
          href: window.location.href,
          ...initial,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // If meta tags aren't available yet, observe head changes and log once when they appear.
    if (!initial.ogImage || !initial.ogTitle) {
      const observer = new MutationObserver(() => {
        const next = readMeta();
        if (next.ogImage && next.ogTitle) {
          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId,
              hypothesisId: "K",
              location: "src/components/Dashboard.tsx:MutationObserver",
              message: "Meta tags detected after head mutation",
              data: {
                href: window.location.href,
                ...next,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          observer.disconnect();
        }
      });
      observer.observe(document.head, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  React.useEffect(() => {
    const runId = "pre-fix";
    const wrapper = document.querySelector('[data-testid="page-wrapper"]');
    const buy = document.querySelector('[data-testid="buy-card"]');
    const win = document.querySelector('[data-testid="winner-card"]');

    const toRect = (el: Element | null) => {
      if (!el) return null;
      const r = (el as HTMLElement).getBoundingClientRect();
      return {
        left: Math.round(r.left),
        right: Math.round(r.right),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    };

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "A",
        location: "src/components/Dashboard.tsx:useEffect",
        message: "Layout measurements (wrapper/winner/buy)",
        data: {
          viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
          wrapper: toRect(wrapper),
          winner: toRect(win),
          buy: toRect(buy),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "B",
        location: "src/components/Dashboard.tsx:useEffect",
        message: "Ordering (mobile vs desktop) for buy/winner",
        data: {
          buyBeforeWinner: !!(buy && win && (buy as HTMLElement).offsetTop < (win as HTMLElement).offsetTop),
          buyOffsetTop: buy ? (buy as HTMLElement).offsetTop : null,
          winnerOffsetTop: win ? (win as HTMLElement).offsetTop : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <Box sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      {/* Hard “wall” padding + centered max width so cards never touch edges */}
      <Box
        data-testid="page-wrapper"
        sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Stack spacing={0.75} sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              fontWeight={950}
              sx={{
                letterSpacing: -1,
                lineHeight: 1.05,
                fontFamily:
                  '"Rushblade", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
                color: "secondary.main",
                textShadow: "0 10px 30px rgba(0,0,0,0.35)",
                px: 1,
              }}
            >
              Chosen1
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, px: 1 }}>
              best crypto over the last 5 minutes
            </Typography>
          </Stack>

          {/* Per request: Buy goes below the chart */}
          <WinnerModule />
          <BuyModule />
        </Stack>
      </Box>
    </Box>
  );
}


