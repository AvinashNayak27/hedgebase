import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!process.env.UNISWAP_API_KEY) {
    return NextResponse.json({ error: "UNISWAP_API_KEY is not configured." }, { status: 503 });
  }
  const payload: unknown = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "An executable swap quote is required." }, { status: 400 });
  }
  const { quote, signature } = payload as { quote?: Record<string, unknown>; signature?: string };
  if (!quote) return NextResponse.json({ error: "An executable swap quote is required." }, { status: 400 });
  const cleanQuote = Object.fromEntries(Object.entries(quote).filter(([key]) => key !== "permitData" && key !== "permitTransaction"));
  const permitData = quote.permitData;
  const requestBody: Record<string, unknown> = { ...cleanQuote };
  const isUniswapX = quote.routing === "DUTCH_V2" || quote.routing === "DUTCH_V3" || quote.routing === "PRIORITY";
  if (signature) {
    requestBody.signature = signature;
    if (!isUniswapX && permitData && typeof permitData === "object") requestBody.permitData = permitData;
  }
  const response = await fetch("https://trade-api.gateway.uniswap.org/v1/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.UNISWAP_API_KEY,
      "x-universal-router-version": "2.0",
      "x-agent-info": '{"integration_name":"swap-integration","decision_origin":"human_mediated","version":"1.5.0"}',
    },
    body: JSON.stringify(requestBody),
  });
  const responsePayload = await response.json();
  return NextResponse.json(responsePayload, { status: response.ok ? 200 : 400 });
}
