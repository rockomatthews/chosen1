"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RampWidget from "./RampWidget";

export default function BuyModule() {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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


