"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RampWidget from "./RampWidget";

export default function BuyModule() {
  React.useEffect(() => {
    const runId = "pre-fix";
    const card = document.querySelector('[data-testid="buy-card"]');
    const content = document.querySelector('[data-testid="buy-content"]');
    const cs = content ? window.getComputedStyle(content as Element) : null;
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/48e77f11-88a7-4f89-bf80-e14339fcdc25", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "D",
        location: "src/components/BuyModule.tsx:useEffect",
        message: "Buy padding/computed styles",
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

  return (
    <Card data-testid="buy-card">
      <CardContent data-testid="buy-content" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={1}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            gap={1}
          >
            <Stack spacing={0.25}>
              <Typography variant="h6" fontWeight={700}>
                Buy crypto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Powered by Ramp (KYC handled by the provider).
              </Typography>
            </Stack>
          </Stack>

          <Stack
            sx={{
              // Keep above-the-fold on mobile while still usable.
              height: { xs: 420, sm: 480, md: 520 },
              borderRadius: 2,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              p: { xs: 1, sm: 1.5 },
            }}
          >
            <RampWidget />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


