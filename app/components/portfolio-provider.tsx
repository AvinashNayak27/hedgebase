"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { formatUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { STOCK_MARKETS, STOCK_TOKEN_DECIMALS, USDC_BASE, USDC_DECIMALS, type StockMarket } from "@/app/lib/markets";

const stockAbi = [
  { type: "function", name: "scaledBalanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;
const usdcAbi = [{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] }] as const;

type RawTrade = { trade: { pairIndex: string; initialPosToken?: string; positionSizeUSDC: string; leverage: string; buy: boolean; index: string; openPrice: string }; liquidationPrice: string; tradeInfo?: { openInterestUSDC?: string } };
type Pair = { index: number; symbol: string; isPairListed: boolean; closeOnly: boolean; leverages: { maxLeverage: number }; schedule?: { isOpen: boolean }; lazerFeed?: { feedId: number } };
export type Holding = { market: StockMarket; quantity: number; price: number | null; priceTimestamp: number | null; livePriceAvailable: boolean; value: number | null; hedgeNotional: number; coverage: number; netExposure: number | null; status: "protected" | "partial" | "unprotected" | "overhedged"; available: boolean; trade?: RawTrade };
type PortfolioContextValue = { holdings: Holding[]; totalValue: number | null; protectedValue: number; protectionPercent: number; usdcBalance: number; loading: boolean; connected: boolean; pricesAvailable: boolean; refresh: () => void; pairs: Pair[] };

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

type AvantisPriceEvent = { timestampUs?: string; priceFeeds?: Array<{ priceFeedId?: number; price?: string; exponent?: number }> };
type BalanceSnapshot = { owner: `0x${string}`; stocks: Record<string, number>; usdc: number };

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [priceTimestamps, setPriceTimestamps] = useState<Record<string, number>>({});
  const [balanceSnapshot, setBalanceSnapshot] = useState<BalanceSnapshot | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]); const [trades, setTrades] = useState<RawTrade[]>([]); const [nonce, setNonce] = useState(0);

  const loadBalances = useCallback(async () => {
    if (!address || !publicClient) { setBalanceSnapshot(null); return; }
    const cancelled = false;
    try {
      const stockEntries = await Promise.all(STOCK_MARKETS.map(async (market) => {
        let raw: bigint | undefined;
        try {
          raw = await publicClient.readContract({ address: market.tokenAddress, abi: stockAbi, functionName: "scaledBalanceOf", args: [address] });
        } catch {
          try {
            raw = await publicClient.readContract({ address: market.tokenAddress, abi: stockAbi, functionName: "balanceOf", args: [address] });
          } catch {
            raw = undefined;
          }
        }
        return [market.symbol, raw === undefined ? 0 : Number(formatUnits(raw, STOCK_TOKEN_DECIMALS))] as const;
      }));
      let usdc = 0;
      try {
        const usdcRaw = await publicClient.readContract({ address: USDC_BASE, abi: usdcAbi, functionName: "balanceOf", args: [address] });
        usdc = Number(formatUnits(usdcRaw, USDC_DECIMALS));
      } catch { /* Keep stock holdings visible if the collateral read is unavailable. */ }
      if (!cancelled) setBalanceSnapshot({ owner: address, stocks: Object.fromEntries(stockEntries), usdc });
    } catch { if (!cancelled) setBalanceSnapshot({ owner: address, stocks: {}, usdc: 0 }); }
  }, [address, publicClient]);

  useEffect(() => {
    let cancelled = false;
    const refreshOnchainBalances = () => { if (!cancelled) void loadBalances(); };
    refreshOnchainBalances();
    const interval = window.setInterval(refreshOnchainBalances, 15_000);
    window.addEventListener("focus", refreshOnchainBalances);
    document.addEventListener("visibilitychange", refreshOnchainBalances);
    return () => { cancelled = true; window.clearInterval(interval); window.removeEventListener("focus", refreshOnchainBalances); document.removeEventListener("visibilitychange", refreshOnchainBalances); };
  }, [loadBalances]);

  useEffect(() => {
    const pricePromise = fetch("/api/uniswap/prices").then((response) => response.json());
    const pairsPromise = fetch("/api/avantis/pairs").then((response) => response.json());
    void Promise.all([pricePromise, pairsPromise]).then(([priceData, pairData]) => { setPrices(priceData.prices ?? {}); setPairs(pairData.data ?? []); }).catch(() => undefined);
  }, [nonce]);

  useEffect(() => {
    if (!address) return;
    void fetch(`/api/avantis/positions?trader=${address}`).then((response) => response.json()).then((payload) => setTrades(payload.data?.trades ?? [])).catch(() => setTrades([]));
  }, [address, nonce]);

  useEffect(() => {
    const marketBySymbol = new Map(STOCK_MARKETS.map((market) => [market.avantisSymbol, market]));
    const marketByFeed = new Map(pairs.flatMap((pair) => {
      const market = marketBySymbol.get(pair.symbol);
      return pair.lazerFeed?.feedId !== undefined && market ? [[pair.lazerFeed.feedId, market] as const] : [];
    }));
    const feedIds = [...marketByFeed.keys()];
    if (!feedIds.length) return;
    const source = new EventSource(`https://feed-v3.avantisfi.com/v1/stream?price_feed_ids=${feedIds.join(",")}`);
    const onPrice = (event: Event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as AvantisPriceEvent;
        const parsedTimestamp = payload.timestampUs ? Number(payload.timestampUs) / 1000 : Number.NaN;
        const timestamp = Number.isFinite(parsedTimestamp) ? Math.floor(parsedTimestamp) : Date.now();
        setPrices((current) => {
          const next = { ...current };
          for (const feed of payload.priceFeeds ?? []) {
            if (feed.price === undefined || feed.exponent === undefined) continue;
            const market = feed.priceFeedId === undefined ? undefined : marketByFeed.get(feed.priceFeedId);
            const price = Number(feed.price) * 10 ** feed.exponent;
            if (market && Number.isFinite(price) && price > 0) next[market.symbol] = price;
          }
          return next;
        });
        setPriceTimestamps((current) => {
          const next = { ...current };
          for (const feed of payload.priceFeeds ?? []) {
            const market = feed.priceFeedId === undefined ? undefined : marketByFeed.get(feed.priceFeedId);
            if (market) next[market.symbol] = timestamp;
          }
          return next;
        });
      } catch { /* EventSource reconnects automatically; retain the last verified prices. */ }
    };
    source.addEventListener("price_update", onPrice);
    return () => { source.removeEventListener("price_update", onPrice); source.close(); };
  }, [pairs]);

  const values = useMemo(() => {
    const pairByIndex = new Map(pairs.map((pair) => [pair.index, pair]));
    const balances = balanceSnapshot && balanceSnapshot.owner === address ? balanceSnapshot.stocks : {};
    return STOCK_MARKETS.map((market) => {
      const quantity = balances[market.symbol] ?? 0;
      const price = prices[market.symbol] ?? null; const priceTimestamp = priceTimestamps[market.symbol] ?? null; const value = price === null ? null : quantity * price;
      const pair = pairs.find((item) => item.symbol === market.avantisSymbol); const trade = trades.find((item) => Number(item.trade.pairIndex) === pair?.index && !item.trade.buy);
      const hedgeNotional = trade
        ? trade.tradeInfo?.openInterestUSDC
          ? Number(formatUnits(BigInt(trade.tradeInfo.openInterestUSDC), USDC_DECIMALS))
          : Number(formatUnits(BigInt(trade.trade.initialPosToken ?? trade.trade.positionSizeUSDC), USDC_DECIMALS)) * (Number(trade.trade.leverage) / 1e10)
        : 0;
      const coverage = value && value > 0 ? hedgeNotional / value * 100 : 0; const status = coverage > 110 ? "overhedged" : coverage >= 90 ? "protected" : coverage > 10 ? "partial" : "unprotected";
      return { market, quantity, price, priceTimestamp, livePriceAvailable: pair?.lazerFeed?.feedId !== undefined, value, hedgeNotional, coverage, netExposure: value === null ? null : value - hedgeNotional, status, available: Boolean(pair && pair.isPairListed && !pair.closeOnly && pairByIndex.has(pair.index)), trade } satisfies Holding;
    });
  }, [address, balanceSnapshot, pairs, prices, priceTimestamps, trades]);
  const totalValue = values.some((item) => item.value !== null) ? values.reduce((sum, item) => sum + (item.value ?? 0), 0) : null;
  const protectedValue = values.reduce((sum, item) => sum + Math.min(item.value ?? 0, item.hedgeNotional), 0); const protectionPercent = totalValue ? protectedValue / totalValue * 100 : 0;
  const balancesLoaded = balanceSnapshot?.owner === address;
  const usdcBalance = balanceSnapshot && balanceSnapshot.owner === address ? balanceSnapshot.usdc : 0;
  const refresh = useCallback(() => { void loadBalances(); setNonce((value) => value + 1); }, [loadBalances]);
  const value = useMemo(() => ({ holdings: values, totalValue, protectedValue, protectionPercent, usdcBalance, loading: Boolean(address) && !balancesLoaded, connected: isConnected, pricesAvailable: Object.values(prices).some((price) => price !== null), refresh, pairs }), [values, totalValue, protectedValue, protectionPercent, usdcBalance, address, balancesLoaded, isConnected, prices, refresh, pairs]);
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return context;
}
