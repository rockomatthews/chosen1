export type CoinOption = {
  symbol: string;
  name: string;
};

export const DEFAULT_COIN_OPTIONS: CoinOption[] = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "BCH", name: "Bitcoin Cash" },
  { symbol: "TRX", name: "TRON" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "UNI", name: "Uniswap" },
  { symbol: "AAVE", name: "Aave" },
  { symbol: "SUI", name: "Sui" },
  { symbol: "TON", name: "Toncoin" },
  { symbol: "NEAR", name: "NEAR" },
];

export const DEFAULT_SELECTED_SYMBOLS = [
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "AVAX",
  "LINK",
  "MATIC",
];


