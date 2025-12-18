"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type WalletKind = "metamask" | "phantom";

type ConnectedWallet =
  | { kind: WalletKind; address: string }
  | { kind: null; address: null };

declare global {
  interface Window {
    ethereum?: { request?: (args: { method: string }) => Promise<unknown> };
    solana?: { isPhantom?: boolean; connect?: () => Promise<{ publicKey?: { toString(): string } }> };
  }
}

function shorten(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletStatusButton({
  onWalletAddress,
}: {
  onWalletAddress: (addr: string | undefined) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [wallet, setWallet] = React.useState<ConnectedWallet>({ kind: null, address: null });

  const connected = !!wallet.address;

  const label = connected
    ? `Connected${wallet.address ? ` • ${shorten(wallet.address)}` : ""}`
    : "Disconnected";

  async function connectMetaMask() {
    const ethereum = window.ethereum;
    const req = ethereum?.request;
    if (!req) throw new Error("MetaMask not detected");
    const accounts = (await req({ method: "eth_requestAccounts" })) as unknown;
    const addr = Array.isArray(accounts) ? String(accounts[0] ?? "") : "";
    if (!addr) throw new Error("No account returned");
    setWallet({ kind: "metamask", address: addr });
    onWalletAddress(addr);
  }

  async function connectPhantom() {
    const solana = window.solana;
    if (!solana?.isPhantom || !solana.connect) throw new Error("Phantom not detected");
    const resp = await solana.connect();
    const addr = resp?.publicKey?.toString?.() ?? "";
    if (!addr) throw new Error("No public key returned");
    setWallet({ kind: "phantom", address: addr });
    onWalletAddress(addr);
  }

  function disconnect() {
    setWallet({ kind: null, address: null });
    onWalletAddress(undefined);
  }

  return (
    <>
      <Button
        variant={connected ? "contained" : "outlined"}
        color={connected ? "secondary" : "primary"}
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={async () => {
            setAnchorEl(null);
            try {
              await connectMetaMask();
            } catch (e) {
              alert(e instanceof Error ? e.message : "Failed to connect MetaMask");
            }
          }}
        >
          <Stack>
            <Typography fontWeight={700}>Connect MetaMask</Typography>
            <Typography variant="caption" color="text.secondary">
              EVM wallet
            </Typography>
          </Stack>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            setAnchorEl(null);
            try {
              await connectPhantom();
            } catch (e) {
              alert(e instanceof Error ? e.message : "Failed to connect Phantom");
            }
          }}
        >
          <Stack>
            <Typography fontWeight={700}>Connect Phantom</Typography>
            <Typography variant="caption" color="text.secondary">
              Solana wallet
            </Typography>
          </Stack>
        </MenuItem>
        <MenuItem
          disabled={!connected}
          onClick={() => {
            setAnchorEl(null);
            disconnect();
          }}
        >
          Disconnect
        </MenuItem>
      </Menu>
    </>
  );
}


