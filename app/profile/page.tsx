"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ExternalLink, ShieldCheck, WalletCards } from "lucide-react";
import { BottomNav } from "@/app/components/bottom-nav";
import { money } from "@/app/components/money";
import { usePortfolio } from "@/app/components/portfolio-provider";
import { TopBar } from "@/app/components/top-bar";

export default function ProfilePage() {
  const { usdcBalance } = usePortfolio();
  return <main className="screen bg-[var(--canvas)]"><TopBar /><h1 className="pt-3 text-[27px] font-bold tracking-[-.04em]">Profile</h1><section className="app-card mt-7 p-5"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full bg-[var(--blush)] text-[var(--coral)]"><WalletCards size={22} /></div><div><p className="font-semibold">Connected wallet</p><div className="mt-1"><ConnectButton accountStatus="address" chainStatus="none" showBalance={false} /></div></div></div><div className="mt-5 flex justify-between border-t border-[var(--divider)] pt-4 text-sm"><span className="text-[var(--slate)]">Available margin</span><span className="font-semibold">{money(usdcBalance, 2)} USDC</span></div></section><section className="app-card mt-4 p-5"><div className="flex gap-3"><ShieldCheck className="text-[var(--green)]" size={21} /><div><p className="font-semibold">Non-custodial by design</p><p className="mt-2 text-sm leading-6 text-[var(--slate)]">Your stocks remain in your wallet. Hedgr only prepares transactions for Avantis and Uniswap.</p></div></div><a href="https://basescan.org" target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between border-t border-[var(--divider)] pt-4 text-sm font-medium">View on BaseScan <ExternalLink size={16} /></a></section><BottomNav /></main>;
}
