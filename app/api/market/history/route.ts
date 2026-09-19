import { type NextRequest, NextResponse } from "next/server";
import { marketFor } from "@/app/lib/markets";

const FARCASTER_HISTORY_URL = "https://api.farcaster.xyz/v1/onchain/tokens/candlestick-chart";
const RESOLUTIONS = new Set(["m1", "m5", "m15", "m30", "h1", "h4", "d1"]);
const RESOLUTION_MS: Record<string, number> = { m1: 60_000, m5: 5 * 60_000, m15: 15 * 60_000, m30: 30 * 60_000, h1: 60 * 60_000, h4: 4 * 60 * 60_000, d1: 24 * 60 * 60_000 };

function integerParam(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const market = marketFor(request.nextUrl.searchParams.get("symbol") ?? "NVDA");
  const apiKey = process.env.FARCASTER_API_KEY;

  if (!market) {
    return NextResponse.json({ error: "This stock is not supported." }, { status: 404 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: "FARCASTER_API_KEY is not configured." }, { status: 503 });
  }

  const now = Date.now();
  const requestedResolution = request.nextUrl.searchParams.get("res") ?? "m5";
  const resolution = RESOLUTIONS.has(requestedResolution) ? requestedResolution : "m5";
  const countback = Math.min(500, Math.max(1, integerParam(request.nextUrl.searchParams.get("countback"), 288)));
  const to = integerParam(request.nextUrl.searchParams.get("to"), now);
  const defaultWindow = (RESOLUTION_MS[resolution] ?? RESOLUTION_MS.m5) * countback;
  const from = integerParam(request.nextUrl.searchParams.get("from"), to - defaultWindow);

  if (from >= to) {
    return NextResponse.json({ error: "The history range must end after it starts." }, { status: 400 });
  }

  const url = new URL(FARCASTER_HISTORY_URL);
  url.search = new URLSearchParams({
    chain: "base",
    ca: market.tokenAddress,
    res: resolution,
    from: String(from),
    to: String(to),
    countback: String(countback),
  }).toString();

  const response = await fetch(url, {
    headers: { accept: "*/*", authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Historical market data is temporarily unavailable." },
      { status: response.status },
    );
  }

  const payload = await response.json();
  return NextResponse.json(payload, { headers: { "Cache-Control": "private, no-store" } });
}
