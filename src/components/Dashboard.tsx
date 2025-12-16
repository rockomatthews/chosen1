"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WinnerModule from "./WinnerModule";
import BuyModule from "./BuyModule";

export default function Dashboard() {
  return (
    <Box sx={{ pb: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Stack spacing={0.75}>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
              Momentum Winner
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Best performer over the last 5 minutes, refreshing every 60 seconds.
            </Typography>
          </Stack>

          <WinnerModule />
          <BuyModule />
        </Stack>
      </Container>
    </Box>
  );
}


