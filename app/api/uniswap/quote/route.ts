import { NextRequest, NextResponse } from "next/server";
import { isAddress, parseUnits } from "viem";
import { marketFor, STOCK_TOKEN_DECIMALS, USDC_BASE, USDC_DECIMALS } from "@/app/lib/markets";

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid swap quote request." }, { status: 400 });
  }
  const { swapper, symbol, amount, side: requestedSide } = body as Record<string, unknown>;
  const market = typeof symbol === "string" ? marketFor(symbol) : undefined;
  const validAmount = typeof amount === "string" && /^[0-9]+\.?[0-9]*$/.test(amount) && Number(amount) > 0;
  if (!market || !isAddress(typeof swapper === "string" ? swapper : "") || !validAmount) {
    return NextResponse.json({ error: "Check the wallet, asset, and USDC amount." }, { status: 400 });
  }
  if (!process.env.UNISWAP_API_KEY) {
    return NextResponse.json({ error: "UNISWAP_API_KEY is not configured." }, { status: 503 });
  }

  const side = requestedSide === "sell" ? "sell" : "buy";
  let baseUnits: string;
  try { baseUnits = parseUnits(amount, side === "buy" ? USDC_DECIMALS : STOCK_TOKEN_DECIMALS).toString(); } catch { return NextResponse.json({ error: "The amount has too many decimal places for this token." }, { status: 400 }); }
  const response = await fetch("https://trade-api.gateway.uniswap.org/v1/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.UNISWAP_API_KEY,
      "x-universal-router-version": "2.0",
      "x-agent-info": '{"integration_name":"swap-integration","decision_origin":"human_mediated","version":"1.5.0"}',
    },
    body: JSON.stringify({
      swapper,
      tokenIn: side === "buy" ? USDC_BASE : market.tokenAddress,
      tokenOut: side === "buy" ? market.tokenAddress : USDC_BASE,
      tokenInChainId: "8453",
      tokenOutChainId: "8453",
      amount: baseUnits,
      type: "EXACT_INPUT",
      slippageTolerance: 0.5,
      routingPreference: "BEST_PRICE",
    }),
  });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.ok ? 200 : 400 });
}
