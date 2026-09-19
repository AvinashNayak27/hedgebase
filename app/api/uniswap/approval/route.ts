import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { marketFor, USDC_BASE } from "@/app/lib/markets";

const headers = (apiKey: string) => ({ "Content-Type": "application/json", "x-api-key": apiKey, "x-universal-router-version": "2.0", "x-agent-info": '{"integration_name":"swap-integration","decision_origin":"human_mediated","version":"1.5.0"}' });

export async function POST(request: NextRequest) {
  const apiKey = process.env.UNISWAP_API_KEY;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const market = typeof body?.symbol === "string" ? marketFor(body.symbol) : undefined;
  const walletAddress = typeof body?.walletAddress === "string" ? body.walletAddress : "";
  const side = body?.side === "sell" ? "sell" : "buy";
  const amount = typeof body?.amount === "string" ? body.amount : "";
  if (!apiKey || !market || !isAddress(walletAddress) || !/^[0-9]+$/.test(amount)) return NextResponse.json({ error: "Invalid approval request." }, { status: 400 });
  const response = await fetch("https://trade-api.gateway.uniswap.org/v1/check_approval", { method: "POST", headers: headers(apiKey), body: JSON.stringify({ walletAddress, token: side === "buy" ? USDC_BASE : market.tokenAddress, amount, chainId: 8453 }) });
  const payload = await response.json() as Record<string, unknown>;
  const approval = payload.approval ?? payload.approvalTransaction ?? null;
  return NextResponse.json({ ...payload, approval, needsApproval: Boolean(approval) }, { status: response.ok ? 200 : 400 });
}
