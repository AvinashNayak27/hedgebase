import { NextResponse } from "next/server";
import { STOCK_MARKETS, USDC_BASE } from "@/app/lib/markets";

const SWAPPER = "0x000000000000000000000000000000000000dEaD";
const AGENT_INFO = '{"integration_name":"swap-integration","decision_origin":"human_mediated","version":"1.5.0"}';
let cached: { expires: number; payload: { prices: Record<string, number | null>; source: string } } | undefined;

function outputAmount(payload: Record<string, unknown>) {
  const quote = payload.quote as Record<string, unknown> | undefined;
  const output = quote?.output as Record<string, unknown> | undefined;
  if (typeof output?.amount === "string") return output.amount;
  const orderInfo = quote?.orderInfo as Record<string, unknown> | undefined;
  const outputs = orderInfo?.outputs as Array<Record<string, unknown>> | undefined;
  return typeof outputs?.[0]?.startAmount === "string" ? outputs[0].startAmount : null;
}

export async function GET() {
  if (cached && cached.expires > Date.now()) return NextResponse.json(cached.payload);
  const apiKey = process.env.UNISWAP_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "UNISWAP_API_KEY is not configured." }, { status: 503 });
  const prices = await Promise.all(STOCK_MARKETS.map(async (market) => {
    const response = await fetch("https://trade-api.gateway.uniswap.org/v1/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "x-universal-router-version": "2.0", "x-agent-info": AGENT_INFO },
      body: JSON.stringify({ swapper: SWAPPER, tokenIn: market.tokenAddress, tokenOut: USDC_BASE, tokenInChainId: "8453", tokenOutChainId: "8453", amount: "100000000", type: "EXACT_INPUT", routingPreference: "BEST_PRICE", slippageTolerance: 0.5 }),
      cache: "no-store",
    });
    if (!response.ok) return [market.symbol, null] as const;
    const amount = outputAmount(await response.json() as Record<string, unknown>);
    return [market.symbol, amount ? Number(amount) / 1_000_000 : null] as const;
  }));
  const payload = { prices: Object.fromEntries(prices) as Record<string, number | null>, source: "Uniswap" };
  cached = { expires: Date.now() + 30_000, payload };
  return NextResponse.json(payload);
}
