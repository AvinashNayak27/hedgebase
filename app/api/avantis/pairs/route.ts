import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  const response = await fetch("https://tx-builder.avantisfi.com/v2/pairs", {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Avantis market data is unavailable." }, { status: 502 });
  }

  return NextResponse.json(await response.json());
}
