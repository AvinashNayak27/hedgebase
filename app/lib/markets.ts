export type StockMarket = {
  symbol: "NVDA" | "TSLA" | "AMZN" | "META" | "AAPL" | "GOOG";
  company: string;
  token: string;
  tokenAddress: `0x${string}`;
  avantisSymbol: string;
  initials: string;
};

export const STOCK_MARKETS: StockMarket[] = [
  { symbol: "NVDA", company: "NVIDIA", token: "NVDAc", tokenAddress: "0xb20000000000000000000078ee7ce2fE4908108C", avantisSymbol: "NVDA/USD", initials: "NV" },
  { symbol: "TSLA", company: "Tesla", token: "TSLAc", tokenAddress: "0xb2000000000000000000001e800a7f5189430cD0", avantisSymbol: "TSLA/USD", initials: "TS" },
  { symbol: "AMZN", company: "Amazon", token: "AMZNc", tokenAddress: "0xb200000000000000000000d9192b6B456483C2E8", avantisSymbol: "AMZN/USD", initials: "AM" },
  { symbol: "META", company: "Meta", token: "METAc", tokenAddress: "0xb2000000000000000000008bC8786B856E61707C", avantisSymbol: "META/USD", initials: "ME" },
  { symbol: "AAPL", company: "Apple", token: "AAPLc", tokenAddress: "0xb200000000000000000000C2e324d24d7eEcd1fb", avantisSymbol: "AAPL/USD", initials: "AP" },
  { symbol: "GOOG", company: "Alphabet", token: "GOOGLc", tokenAddress: "0xb2000000000000000000002D0BA3164cc74f58B7", avantisSymbol: "GOOG/USD", initials: "GO" },
];

export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const USDC_DECIMALS = 6;
export const STOCK_TOKEN_DECIMALS = 8;

export function marketFor(symbol: string) {
  const normalized = symbol.toUpperCase() === "GOOGL" ? "GOOG" : symbol.toUpperCase();
  return STOCK_MARKETS.find((market) => market.symbol === normalized);
}
