"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const DEFAULT_BASE_URL = "https://app.ramp.network";

function buildRampUrl({
  hostApiKey,
  defaultAsset,
  userAddress,
}: {
  hostApiKey: string;
  defaultAsset?: string;
  userAddress?: string;
}) {
  const url = new URL("/", DEFAULT_BASE_URL);
  url.searchParams.set("hostApiKey", hostApiKey);
  if (defaultAsset) url.searchParams.set("defaultAsset", defaultAsset);
  if (userAddress) url.searchParams.set("userAddress", userAddress);
  return url.toString();
}

export default function RampWidget({
  defaultAsset = "BTC",
}: {
  defaultAsset?: string;
}) {
  const hostApiKey = process.env.NEXT_PUBLIC_RAMP_WIDGET_API_KEY;

  if (!hostApiKey) {
    return (
      <Stack spacing={0.5} alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Missing <code>NEXT_PUBLIC_RAMP_WIDGET_API_KEY</code>.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Add it locally in <code>.env.local</code> and in Vercel Project Settings → Environment Variables.
        </Typography>
      </Stack>
    );
  }

  const src = buildRampUrl({ hostApiKey, defaultAsset });

  return (
    <iframe
      title="Buy crypto with Ramp"
      src={src}
      style={{
        width: "100%",
        height: "100%",
        border: 0,
        borderRadius: 12,
        background: "transparent",
      }}
      allow="clipboard-write; payment"
    />
  );
}


