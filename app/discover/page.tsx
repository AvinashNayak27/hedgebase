"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { AssetMark } from "@/app/components/asset-mark";
import { BottomNav } from "@/app/components/bottom-nav";
import { money } from "@/app/components/money";
import { usePortfolio } from "@/app/components/portfolio-provider";
import { TopBar } from "@/app/components/top-bar";

export default function DiscoverPage() {
  const { holdings } = usePortfolio();
  return <main className="screen bg-[var(--canvas)]"><TopBar /><section className="pt-3"><h1 className="text-[27px] font-bold tracking-[-.04em]">Discover stocks</h1><p className="mt-2 text-sm leading-6 text-[var(--slate)]">Buy tokenized stocks on Base and protect them when you’re ready.</p><div className="mt-5 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"><Search size={18} className="text-[var(--muted)]" /><input aria-label="Search stocks" placeholder="Search stocks" className="w-full bg-transparent text-sm outline-none" /></div></section><section className="mt-7 space-y-3">{holdings.map((holding) => <Link href={`/stocks/${holding.market.symbol.toLowerCase()}`} key={holding.market.symbol} className="app-card flex items-center gap-3 p-4"><AssetMark market={holding.market} /><div className="min-w-0 flex-1"><p className="font-bold">{holding.market.company}</p><p className="mt-1 text-xs text-[var(--muted)]">{holding.market.token} · Base</p></div><div className="text-right"><p className="text-sm font-semibold">{money(holding.price, 2)}</p><p className={`mt-1 text-[11px] ${holding.available ? "text-[var(--green)]" : "text-[var(--muted)]"}`}>{holding.available ? "Hedge available" : "Stock only"}</p></div><ArrowRight size={17} className="text-[var(--muted)]" /></Link>)}</section><BottomNav /></main>;
}
