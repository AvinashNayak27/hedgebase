import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { marketFor } from "@/app/lib/markets";

const isNonNegativeNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const AVANTIS_MIN_POSITION_USDC = 100;

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid hedge request." }, { status: 400 });
  }

  const { trader, symbol, targetNotional, leverage } = body as Record<string, unknown>;
  const market = typeof symbol === "string" ? marketFor(symbol) : undefined;
  if (!isAddress(typeof trader === "string" ? trader : "") || !market || !isNonNegativeNumber(targetNotional) || !isNonNegativeNumber(leverage) || leverage === 0) {
    return NextResponse.json({ error: "Check the wallet, market, margin, and leverage." }, { status: 400 });
  }
  if ((leverage as number) < 1 || (leverage as number) > 25) {
    return NextResponse.json({ error: "Hedge leverage must be between 1× and 25×." }, { status: 400 });
  }

  const [pairsResponse, positionsResponse] = await Promise.all([
    fetch("https://tx-builder.avantisfi.com/v2/pairs", { cache: "no-store" }),
    fetch(`https://tx-builder.avantisfi.com/v2/positions?trader=${trader}`, { cache: "no-store" }),
  ]);
  const [pairsPayload, positionsPayload] = await Promise.all([pairsResponse.json(), positionsResponse.json()]);
  const pair = pairsPayload.data?.find((item: { symbol: string }) => item.symbol === market.avantisSymbol);
  if (!pair?.isPairListed || pair.closeOnly) return NextResponse.json({ error: "This Avantis market is not open for adjustments." }, { status: 400 });
  if ((leverage as number) < pair.leverages.minLeverage || (leverage as number) > pair.leverages.maxLeverage) return NextResponse.json({ error: `Avantis allows ${pair.leverages.minLeverage}×–${pair.leverages.maxLeverage}× leverage for this market.` }, { status: 400 });
  const trade = positionsPayload.data?.trades?.find((item: { trade: { pairIndex: string; buy: boolean } }) => Number(item.trade.pairIndex) === pair.index && !item.trade.buy);
  const currentCollateral = trade ? Number(trade.trade.initialPosToken ?? trade.trade.positionSizeUSDC) / 1e6 : 0;
  const currentLeverage = trade ? Number(trade.trade.leverage) / 1e10 : 0;
  const currentNotional = trade?.tradeInfo?.openInterestUSDC !== undefined
    ? Number(trade.tradeInfo.openInterestUSDC) / 1e6
    : currentCollateral * currentLeverage;
  const delta = (targetNotional as number) - currentNotional;
  if (Math.abs(delta) < 1) return NextResponse.json({ ok: true, action: "none" });

  if (delta < 0 && trade) {
    const collateralToCloseUsdc = Math.min(currentCollateral, Math.abs(delta) / currentLeverage);
    const closeResponse = await fetch("https://tx-builder.avantisfi.com/v2/trade/close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pair: market.avantisSymbol, trader, tradeIndex: Number(trade.trade.index), collateralToCloseUsdc }) });
    const closePayload = await closeResponse.json();
    return NextResponse.json({ ...closePayload, action: "close" }, { status: closeResponse.ok ? 200 : 400 });
  }

  if (delta < AVANTIS_MIN_POSITION_USDC) {
    return NextResponse.json({ error: `Position size ${delta.toFixed(2)} USDC is below the minimum of ${AVANTIS_MIN_POSITION_USDC} USDC for ${market.avantisSymbol}.` }, { status: 400 });
  }
  const collateralUsdc = delta / (leverage as number);

  const allowanceResponse = await fetch(`https://tx-builder.avantisfi.com/v2/allowance?trader=${trader}`, { cache: "no-store" });
  const allowancePayload = await allowanceResponse.json();
  if (!allowanceResponse.ok) return NextResponse.json(allowancePayload, { status: 400 });
  if (allowancePayload.data.allowanceUsdc < collateralUsdc) {
    const approvalResponse = await fetch("https://tx-builder.avantisfi.com/v2/token/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trader, amountUsdc: collateralUsdc }),
    });
    const approvalPayload = await approvalResponse.json();
    return NextResponse.json({ ...approvalPayload, action: "approve" }, { status: approvalResponse.ok ? 200 : 400 });
  }

  const response = await fetch("https://tx-builder.avantisfi.com/v2/trade/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pair: market.avantisSymbol,
      trader,
      side: "short",
      orderType: "market",
      collateralUsdc,
      leverage,
      slippagePercent: 1,
    }),
  });
  const payload = await response.json();
  return NextResponse.json({ ...payload, action: "open" }, { status: response.ok ? 200 : 400 });
}
