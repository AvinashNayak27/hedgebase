"use client";

import { Activity, ShieldCheck } from "lucide-react";
import { BottomNav } from "@/app/components/bottom-nav";
import { money } from "@/app/components/money";
import { usePortfolio } from "@/app/components/portfolio-provider";
import { TopBar } from "@/app/components/top-bar";

export default function ActivityPage() {
  const { holdings, connected } = usePortfolio(); const active = holdings.filter((item) => item.hedgeNotional > 0);
  return <main className="screen bg-[var(--canvas)]"><TopBar /><h1 className="pt-3 text-[27px] font-bold tracking-[-.04em]">Activity</h1><p className="mt-2 text-sm text-[var(--slate)]">Your live Avantis protection positions.</p><section className="mt-7 space-y-3">{active.map((holding) => <div key={holding.market.symbol} className="app-card flex items-center gap-3 p-4"><div className="grid size-11 place-items-center rounded-full bg-[var(--mint)] text-[var(--green)]"><ShieldCheck size={20} /></div><div className="flex-1"><p className="font-semibold">{holding.market.company} protection</p><p className="mt-1 text-xs text-[var(--muted)]">Open · {Math.round(holding.coverage)}% hedged</p></div><p className="text-sm font-semibold">{money(holding.hedgeNotional)}</p></div>)}{active.length === 0 ? <div className="app-card py-14 text-center"><Activity className="mx-auto text-[var(--muted)]" /><p className="mt-4 font-semibold">{connected ? "No protection activity yet" : "Connect your wallet"}</p><p className="mx-auto mt-2 max-w-56 text-sm leading-6 text-[var(--slate)]">Completed and active protection will appear here.</p></div> : null}</section><BottomNav /></main>;
}
