"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WinnerModule from "./WinnerModule";
import BuyModule from "./BuyModule";
import WalletStatusButton from "./WalletStatusButton";

export default function Dashboard() {
  const [walletAddress, setWalletAddress] = React.useState<string | undefined>(undefined);

  return (
    <Box sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      {/* Hard “wall” padding + centered max width so cards never touch edges */}
      <Box
        sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Stack spacing={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
            >
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
                }}
              >
                Chosen1
              </Typography>
              <WalletStatusButton onWalletAddress={setWalletAddress} />
            </Stack>
            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              best crypto over the last 5 minutes
            </Typography>
          </Stack>

          <Divider sx={{ opacity: 0.35 }} />

          {/* Per request: Buy goes below the chart */}
          <WinnerModule />
          <BuyModule walletAddress={walletAddress} />
        </Stack>
      </Box>
    </Box>
  );
}


