"use client";

import { ChevronDown, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Address, type Hex } from "viem";
import { base } from "viem/chains";
import { useAccount, usePublicClient, useSendTransaction, useSwitchChain } from "wagmi";
import { money } from "@/app/components/money";
import { usePortfolio } from "@/app/components/portfolio-provider";
import { TopBar } from "@/app/components/top-bar";

type BuiltTransaction = { to: Address; data: Hex; value: string };

export function ReviewProtection({ symbol, initialCoverage }: { symbol: string; initialCoverage: number }) {
  const router = useRouter(); const { address, chainId } = useAccount(); const publicClient = usePublicClient(); const { sendTransactionAsync } = useSendTransaction(); const { switchChainAsync } = useSwitchChain(); const { holdings, usdcBalance, refresh } = usePortfolio();
  const holding = holdings.find((item) => item.market.symbol.toLowerCase() === symbol.toLowerCase()); const [leverage, setLeverage] = useState(2.5); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  if (!holding) return <main className="screen-flow"><TopBar back /><p>Stock unavailable.</p></main>;
  const currentHolding = holding;
  const notional = (holding.value ?? 0) * initialCoverage / 100; const margin = notional / leverage; const additionalMargin = Math.max(0, notional - holding.hedgeNotional) / leverage;
  async function confirm() {
    if (!address || !publicClient) return; setBusy(true); setError(null);
    try {
      if (chainId !== base.id) await switchChainAsync({ chainId: base.id });
      for (let step = 0; step < 2; step += 1) {
        const response = await fetch("/api/avantis/open", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trader: address, symbol: currentHolding.market.symbol, targetNotional: notional, leverage }) });
        const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.message ?? payload.error ?? "Unable to prepare protection.");
        if (payload.action === "none") { router.replace(`/stocks/${symbol}`); return; }
        const transaction = payload.data as BuiltTransaction; if (!transaction?.to || !transaction?.data || transaction.data === "0x") throw new Error("Avantis returned an invalid transaction.");
        const hash = await sendTransactionAsync({ to: transaction.to, data: transaction.data, value: BigInt(transaction.value || "0") });
        await publicClient.waitForTransactionReceipt({ hash });
        if (payload.action === "open" || payload.action === "close") { refresh(); router.replace(`/stocks/${symbol}/protect/success?coverage=${initialCoverage}&amount=${Math.round(notional)}`); return; }
      }
      throw new Error("USDC approval completed. Tap confirm again to open protection.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Protection could not be opened."); } finally { setBusy(false); }
  }
  return <main className="screen-flow flex flex-col bg-[var(--canvas)]"><TopBar back /><section className="flex flex-1 flex-col items-center pt-4"><div className="grid size-16 place-items-center rounded-[22px] bg-[var(--blush)] text-[var(--coral)]"><ShieldCheck size={30} /></div><h1 className="mt-5 text-center text-[27px] font-bold tracking-[-.045em]">Review your protection</h1><section className="app-card mt-7 w-full p-5"><ReviewRow label="Stock" value={`${holding.market.company} (${holding.market.token})`} /><ReviewRow label="Amount to protect" value={`${money(notional)} (${Math.round(initialCoverage)}%)`} /><ReviewRow label="Margin required" value={`≈ ${money(margin)} USDC`} last /></section><section className="mt-4 w-full rounded-3xl bg-[var(--blush)] p-5 text-sm leading-6 text-[var(--slate)]">Your {holding.market.company} stays in your wallet. Hedgr adjusts only the difference needed to reach this protection level.</section><details className="app-card group mt-4 w-full p-5"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">Advanced details <ChevronDown size={17} className="transition group-open:rotate-180" /></summary><div className="mt-5 space-y-4 border-t border-[var(--divider)] pt-4 text-sm"><div className="flex justify-between"><span className="text-[var(--slate)]">Execution</span><span>Avantis · Base</span></div><div className="flex justify-between"><span className="text-[var(--slate)]">Target hedge</span><span>{money(notional)}</span></div><div><div className="flex justify-between"><span className="text-[var(--slate)]">Leverage</span><span>{leverage}×</span></div><div className="mt-3 grid grid-cols-4 gap-2">{[2, 2.5, 5, 10].map((value) => <button key={value} onClick={() => setLeverage(value)} className={`rounded-xl py-2 text-xs font-semibold ${leverage === value ? "bg-[var(--coral)] text-white" : "bg-[#F7F7F6]"}`}>{value}×</button>)}</div></div><div className="flex justify-between"><span className="text-[var(--slate)]">Additional margin</span><span>{money(additionalMargin, 2)}</span></div><div className="flex justify-between"><span className="text-[var(--slate)]">Available USDC</span><span>{money(usdcBalance, 2)}</span></div></div></details>{error ? <p role="alert" className="mt-4 w-full rounded-2xl bg-[var(--risk-light)] px-4 py-3 text-sm text-[var(--risk)]">{error}</p> : null}</section><div className="w-full pt-7"><button disabled={busy || !address || !holding.available || usdcBalance < additionalMargin} onClick={confirm} className="cta flex min-h-14 w-full items-center justify-center gap-2 text-base font-bold disabled:opacity-50">{busy ? <LoaderCircle size={19} className="animate-spin" /> : <ShieldCheck size={19} />}{!address ? "Connect wallet to confirm" : !holding.available ? "Market unavailable" : usdcBalance < additionalMargin ? "Not enough USDC" : "Confirm protection"}</button></div></main>;
}

function ReviewRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <div className={`flex items-start justify-between gap-5 py-4 first:pt-0 ${last ? "pb-0" : "border-b border-[var(--divider)]"}`}><span className="text-sm text-[var(--slate)]">{label}</span><span className="max-w-[58%] text-right text-sm font-bold">{value}</span></div>; }
