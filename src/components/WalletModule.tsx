"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const STORAGE_KEY = "chosen1:walletAddress";

function isProbablyEvmAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export default function WalletModule({
  walletAddress,
  onChangeWalletAddress,
}: {
  walletAddress: string;
  onChangeWalletAddress: (next: string) => void;
}) {
  const helper =
    walletAddress.length === 0
      ? "Paste a wallet address (e.g. 0x… for EVM). Ramp will send purchases here."
      : isProbablyEvmAddress(walletAddress)
        ? "Looks like a valid EVM address."
        : "Address format varies by chain. Ensure this address matches what you’re buying.";

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={1}>
          <Stack spacing={0.25}>
            <Typography variant="h6" fontWeight={800}>
              Wallet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your Ramp purchases should be delivered to a wallet address.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1} alignItems="stretch">
            <TextField
              value={walletAddress}
              onChange={(e) => onChangeWalletAddress(e.target.value.trim())}
              label="Destination wallet address"
              placeholder="0x…"
              fullWidth
              size="small"
              helperText={helper}
            />
            <Stack direction="row" gap={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  try {
                    localStorage.setItem(STORAGE_KEY, walletAddress);
                  } catch {
                    // ignore
                  }
                }}
              >
                Save
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  onChangeWalletAddress("");
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch {
                    // ignore
                  }
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function useWalletAddressState() {
  const [walletAddress, setWalletAddress] = React.useState("");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWalletAddress(saved);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    try {
      if (walletAddress) localStorage.setItem(STORAGE_KEY, walletAddress);
    } catch {
      // ignore
    }
  }, [walletAddress]);

  return { walletAddress, setWalletAddress };
}


