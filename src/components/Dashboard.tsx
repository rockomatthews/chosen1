"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WinnerModule from "./WinnerModule";
import BuyModule from "./BuyModule";

export default function Dashboard() {
  return (
    <Box sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      {/* Hard “wall” padding + centered max width so cards never touch edges */}
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
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
              BEST CRYPTO ATM
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, px: 1 }}>
              best crypto over the last 5 minutes
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
            {/* Buy above the fold: first on mobile, sticky on desktop */}
            <Grid
              size={{ xs: 12, md: 5 }}
              sx={{ order: { xs: 1, md: 2 } }}
            >
              <Box sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
                <BuyModule />
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12, md: 7 }}
              sx={{ order: { xs: 2, md: 1 } }}
            >
              <WinnerModule />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Box>
  );
}


