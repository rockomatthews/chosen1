"use client";

import * as React from "react";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WinnerModule from "./WinnerModule";
import BuyModule from "./BuyModule";

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontWeight={700}>
            Momentum Winner
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Picks the best performer over the last 5 minutes from your list,
            refreshing every 5 seconds.
          </Typography>
        </Stack>

        <WinnerModule />
        <BuyModule />
      </Stack>
    </Container>
  );
}


