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
    <Box sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container
        maxWidth="md"
        sx={{
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={{ xs: 2, md: 3 }} sx={{ alignItems: "center" }}>
          <Stack spacing={0.75} sx={{ textAlign: "center", width: "100%" }}>
            <Typography
              variant="h3"
              fontWeight={950}
              sx={{
                letterSpacing: -1,
                lineHeight: 1.05,
                fontFamily: '"Rushblade", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
                color: "secondary.main",
                textShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >
              BEST CRYPTO ATM
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              best crypto over the last 5 minutes
            </Typography>
          </Stack>

          <Box sx={{ width: "100%" }}>
            <WinnerModule />
          </Box>
          <Box sx={{ width: "100%" }}>
            <BuyModule />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}


