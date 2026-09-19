import { StockTrade } from "./stock-trade";

export default async function TradePage({ params, searchParams }: { params: Promise<{ symbol: string }>; searchParams: Promise<{ side?: string }> }) {
  const [{ symbol }, query] = await Promise.all([params, searchParams]);
  return <StockTrade symbol={symbol} initialSide={query.side === "sell" ? "sell" : "buy"} />;
}
