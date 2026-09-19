"use client";

import { Liveline, type CandlePoint, type LivelinePoint } from "liveline";
import { CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AssetMark } from "@/app/components/asset-mark";
import { BottomSheet } from "@/app/components/bottom-sheet";
import { money, quantity } from "@/app/components/money";
import { usePortfolio } from "@/app/components/portfolio-provider";
import { TopBar } from "@/app/components/top-bar";
import { ProtectPage } from "./protect/page";
import { StockTrade } from "./trade/stock-trade";

type HistoryPoint = { timestamp: number; open: number; high: number; low: number; close: number; volume: number };
type History = { result?: { chart?: { points?: HistoryPoint[]; annotations?: unknown[] } } };
const MAX_CANDLES = 15;
const CHART_RANGES = { "1m": { resolution: "m1", countback: 15, candleSeconds: 60, windowSeconds: 15 * 60 }, "5m": { resolution: "m5", countback: 15, candleSeconds: 300, windowSeconds: 15 * 300 }, "1h": { resolution: "h1", countback: 15, candleSeconds: 3600, windowSeconds: 15 * 3600 }, "1d": { resolution: "d1", countback: 15, candleSeconds: 86400, windowSeconds: 15 * 86400 } } as const;
type ChartRange = keyof typeof CHART_RANGES;

function buildChart(history: History | null, livePrice: number | null, liveTimestamp: number | null, candleSeconds: number) {
  const points = [...(history?.result?.chart?.points ?? [])].sort((a, b) => a.timestamp - b.timestamp).slice(-MAX_CANDLES);
  const historical = points.map((point) => ({ time: Math.floor(point.timestamp / 1000), open: point.open, high: point.high, low: point.low, close: point.close })) as CandlePoint[];
  let liveCandle: CandlePoint | undefined;
  if (livePrice !== null) {
    const liveSeconds = liveTimestamp ? Math.floor(liveTimestamp / 1000) : Math.floor(Date.now() / 1000);
    const bucket = Math.floor(liveSeconds / candleSeconds) * candleSeconds;
    const matching = historical.find((candle) => candle.time === bucket);
    liveCandle = matching ? { ...matching, high: Math.max(matching.high, livePrice), low: Math.min(matching.low, livePrice), close: livePrice } : { time: bucket, open: livePrice, high: livePrice, low: livePrice, close: livePrice };
  }
  const committed = historical.filter((candle) => candle.time !== liveCandle?.time).slice(-(MAX_CANDLES - 1));
  const visibleCandles = liveCandle ? [...committed, liveCandle] : historical.slice(-MAX_CANDLES);
  return { line: visibleCandles.map(({ time, close }) => ({ time, value: close })) as LivelinePoint[], candles: liveCandle ? committed : visibleCandles.slice(0, -1), liveCandle };
}

export default function StockDetailPage() {
  const params = useParams<{ symbol: string }>();
  const { holdings, refresh } = usePortfolio();
  const holding = holdings.find((item) => item.market.symbol.toLowerCase() === params.symbol.toLowerCase());
  const [sheet, setSheet] = useState<"trade" | "protect" | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>("5m");
  const symbol = holding?.market.symbol;
  const range = CHART_RANGES[chartRange];

  useEffect(() => {
    if (!symbol) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ symbol, res: range.resolution, countback: String(range.countback) });
    void fetch(`/api/market/history?${query}`, { signal: controller.signal }).then((response) => response.ok ? response.json() : Promise.reject()).then(setHistory).catch(() => { if (!controller.signal.aborted) setHistory(null); });
    return () => controller.abort();
  }, [symbol, range.countback, range.resolution]);

  if (!holding) return <main className="screen-flow"><TopBar back /><p className="pt-20 text-center text-[var(--slate)]">This stock is not supported.</p></main>;
  const chart = buildChart(history, holding.price, holding.priceTimestamp, range.candleSeconds);
  const protectedState = holding.coverage >= 10;
  const tradingViewSymbol = `NASDAQ:${holding.market.symbol}`;
  const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tradingViewSymbol)}`;
  const chartTabs: Array<{ key: ChartRange; label: string }> = [{ key: "1m", label: "1 min" }, { key: "5m", label: "5 min" }, { key: "1h", label: "1 hour" }, { key: "1d", label: "1 day" }];

  return <>
    <main className="screen-flow bg-[var(--canvas)]">
      <TopBar back title="Position" />
      <section className="flex items-center justify-between gap-4 pt-2"><div className="flex min-w-0 items-center gap-3"><AssetMark market={holding.market} size={52} /><div className="min-w-0"><h1 className="truncate text-[25px] font-bold tracking-[-.04em]">{holding.market.company}</h1><p className="mt-1 text-sm text-[var(--slate)]">{holding.market.token}</p></div></div><p className="shrink-0 text-[24px] font-bold tracking-[-.045em]">{money(holding.price, 2)}</p></section>
      <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-[0_4px_16px_rgba(16,24,40,.04)]">
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-4 py-3"><div className="inline-flex rounded-xl bg-[#F7F7F6] p-1" aria-label="Chart timeframe">{chartTabs.map((tab) => <button type="button" key={tab.key} onClick={() => setChartRange(tab.key)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${chartRange === tab.key ? "bg-white shadow-sm" : "text-[var(--slate)]"}`}>{tab.label}</button>)}</div><Link href={tradingViewUrl} target="_blank" rel="noreferrer" aria-label={`Open ${holding.market.symbol} chart on TradingView`} className="text-xs font-semibold text-[var(--coral)]">Full chart ↗</Link></div>
        <div className="relative -mx-5 h-[320px] w-[420px]" >{chart.line.length && holding.price ? <Liveline key={`${symbol}-${chartRange}`} mode="candle" data={chart.line} candles={chart.candles} liveCandle={chart.liveCandle} candleWidth={range.candleSeconds} window={range.windowSeconds} value={holding.price} theme="light" color="#FF625D" grid badge badgeVariant="minimal" badgeTail={false} pulse fill scrub formatValue={(value) => money(value, 2)} /> : <div className="grid h-full place-items-center px-10 text-center"><div><p className="text-sm font-semibold">Chart data unavailable</p><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Historical prices are temporarily unavailable. Live pricing will reconnect automatically.</p></div></div>}</div>
      </section>
      <section className="app-card mt-6 p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Your position</h2><button type="button" onClick={refresh} aria-label="Refresh position" title="Refresh position" className="grid size-9 place-items-center rounded-full bg-[#F7F7F6] text-[var(--slate)] transition active:rotate-45"><RefreshCw size={16} /></button></div><div className="mt-5 flex justify-between"><span className="text-sm text-[var(--slate)]">{quantity(holding.quantity)} {holding.market.token}</span><span className="font-semibold">≈ {money(holding.value)}</span></div><div className="mt-5 border-t border-[var(--divider)] pt-5"><div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${protectedState ? "bg-[var(--mint)] text-[var(--green)]" : "bg-[var(--amber-light)] text-[#A66A00]"}`}>{protectedState ? <CheckCircle2 size={15} /> : <ShieldAlert size={15} />}{protectedState ? `${Math.round(holding.coverage)}% hedged` : "Not protected"}</div><div className="mt-5 flex justify-between"><span className="text-sm text-[var(--slate)]">Net exposure</span><span className="font-bold">{money(holding.netExposure)}</span></div></div></section>
      <section className="sticky bottom-0 -mx-5 mt-6 border-t border-[var(--divider)] bg-[var(--canvas)]/95 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4 backdrop-blur"><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setSheet("trade")} className="cta grid min-h-12 place-items-center text-sm font-semibold">Trade</button><button type="button" onClick={() => setSheet("protect")} className="grid min-h-12 place-items-center rounded-2xl bg-[var(--blush)] px-2 text-center text-sm font-semibold text-[var(--coral)]">{protectedState ? "Adjust protection" : "Protect"}</button></div></section>
    </main>
    <BottomSheet open={sheet !== null} title={sheet === "protect" ? "Protect position" : `Trade ${holding.market.token}`} onClose={() => setSheet(null)}>{sheet === "protect" ? <ProtectPage sheet onClose={() => setSheet(null)} /> : sheet === "trade" ? <StockTrade sheet symbol={holding.market.symbol} initialSide="buy" onClose={() => setSheet(null)} /> : null}</BottomSheet>
  </>;
}
