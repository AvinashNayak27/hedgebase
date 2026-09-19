"use client";

import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { money } from "@/app/components/money";
import { usePortfolio } from "@/app/components/portfolio-provider";

export function ProtectionSuccess({ symbol, coverage, amount }: { symbol: string; coverage: number; amount: number }) {
  const { holdings } = usePortfolio(); const holding = holdings.find((item) => item.market.symbol.toLowerCase() === symbol.toLowerCase()); const company = holding?.market.company ?? symbol.toUpperCase(); const net = Math.max(0, (holding?.value ?? amount) - amount);
  return <main className="screen-flow flex flex-col bg-[var(--canvas)]"><section className="flex flex-1 flex-col items-center justify-center py-12 text-center"><div className="relative grid size-24 place-items-center rounded-full bg-[var(--mint)] text-[var(--green)]"><ShieldCheck size={46} /><span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-[var(--green)] text-white ring-4 ring-[var(--canvas)]"><Check size={17} strokeWidth={3} /></span></div><h1 className="mt-8 text-[30px] font-bold tracking-[-.05em]">You’re protected! 🎉</h1><p className="mt-3 max-w-[280px] text-base leading-6 text-[var(--slate)]">{money(amount)} of your {company} is now protected.</p><section className="app-card mt-8 w-full p-5 text-left"><p className="font-bold">{company}</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--mint)] px-3 py-1.5 text-sm font-semibold text-[var(--green)]"><Check size={16} /> {Math.round(coverage)}% hedged</div><div className="mt-6 flex items-center justify-between border-t border-[var(--divider)] pt-5"><span className="text-sm text-[var(--slate)]">Net exposure</span><span className="font-bold">≈ {money(net)}</span></div></section></section><div><Link href={`/stocks/${symbol}`} className="cta grid min-h-14 place-items-center text-base font-bold">View position</Link><Link href="/" className="mt-3 grid min-h-12 place-items-center text-sm font-semibold text-[var(--slate)]">Done</Link></div></main>;
}
