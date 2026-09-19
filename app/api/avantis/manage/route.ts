import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { marketFor } from "@/app/lib/markets";

type ManageAction = "deposit" | "withdraw" | "close";
const MAX_HEDGE_LEVERAGE = 25;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const trader = typeof body?.trader === "string" ? body.trader : "";
  const symbol = typeof body?.symbol === "string" ? body.symbol : "";
  const action = body?.action as ManageAction;
  const collateralUsdc = Number(body?.collateralUsdc);
  const market = marketFor(symbol);
  if (!isAddress(trader) || !market || !["deposit", "withdraw", "close"].includes(action) || (action !== "close" && (!Number.isFinite(collateralUsdc) || collateralUsdc <= 0))) {
    return NextResponse.json({ error: "Check the wallet, position, action, and collateral amount." }, { status: 400 });
  }

  const [pairsResponse, positionsResponse] = await Promise.all([
    fetch("https://tx-builder.avantisfi.com/v2/pairs", { cache: "no-store" }),
    fetch(`https://tx-builder.avantisfi.com/v2/positions?trader=${trader}`, { cache: "no-store" }),
  ]);
  const [pairsPayload, positionsPayload] = await Promise.all([pairsResponse.json(), positionsResponse.json()]);
  const pair = pairsPayload.data?.find((item: { symbol: string }) => item.symbol === market.avantisSymbol);
  const trade = positionsPayload.data?.trades?.find((item: { trade: { pairIndex: string; buy: boolean } }) => Number(item.trade.pairIndex) === pair?.index && !item.trade.buy);
  if (!pair || !trade) return NextResponse.json({ error: "No active protection position was found." }, { status: 404 });

  const currentCollateral = Number(trade.trade.initialPosToken ?? trade.trade.positionSizeUSDC) / 1e6;
  if (action === "withdraw" && collateralUsdc >= currentCollateral) {
    return NextResponse.json({ error: "Use Close protection to withdraw the full position collateral." }, { status: 400 });
  }
  if (action === "withdraw") {
    const positionSize = trade.tradeInfo?.openInterestUSDC !== undefined
      ? Number(trade.tradeInfo.openInterestUSDC) / 1e6
      : currentCollateral * (Number(trade.trade.leverage) / 1e10);
    const projectedLeverage = positionSize / (currentCollateral - collateralUsdc);
    if (projectedLeverage > MAX_HEDGE_LEVERAGE) {
      return NextResponse.json({ error: `Removing ${collateralUsdc.toFixed(2)} USDC would increase leverage to ${projectedLeverage.toFixed(2)}x. Maximum leverage is ${MAX_HEDGE_LEVERAGE}x.` }, { status: 400 });
    }
  }

  if (action === "deposit") {
    const allowanceResponse = await fetch(`https://tx-builder.avantisfi.com/v2/allowance?trader=${trader}`, { cache: "no-store" });
    const allowancePayload = await allowanceResponse.json();
    if (!allowanceResponse.ok) return NextResponse.json(allowancePayload, { status: 400 });
    if (Number(allowancePayload.data?.allowanceUsdc ?? 0) < collateralUsdc) {
      const approvalResponse = await fetch("https://tx-builder.avantisfi.com/v2/token/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trader, amountUsdc: collateralUsdc }) });
      return NextResponse.json({ ...(await approvalResponse.json()), action: "approve" }, { status: approvalResponse.ok ? 200 : 400 });
    }
  }

  const endpoint = action === "close" ? "/v2/trade/close" : "/v2/margin/update";
  const payload = action === "close"
    ? { pair: market.avantisSymbol, trader, tradeIndex: Number(trade.trade.index), collateralToCloseUsdc: currentCollateral }
    : { pair: market.avantisSymbol, trader, tradeIndex: Number(trade.trade.index), action, collateralUsdc };
  const response = await fetch(`https://tx-builder.avantisfi.com${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return NextResponse.json({ ...(await response.json()), action }, { status: response.ok ? 200 : 400 });
}
