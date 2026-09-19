import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

export async function GET(request: NextRequest) {
  const trader = request.nextUrl.searchParams.get("trader") ?? "";
  if (!isAddress(trader)) return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  const response = await fetch(`https://tx-builder.avantisfi.com/v2/positions?trader=${trader}`, { cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.ok ? 200 : 502 });
}
