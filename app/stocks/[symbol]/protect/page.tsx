"use client";

import { Info, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { formatUnits, type Address, type Hex } from "viem";
import { base } from "viem/chains";
import { useAccount, usePublicClient, useSendTransaction, useSwitchChain } from "wagmi";
import { money } from "@/app/components/money";
import { usePortfolio } from "@/app/components/portfolio-provider";
import { TopBar } from "@/app/components/top-bar";

type BuiltTransaction = { to: Address; data: Hex; value: string };
const AVANTIS_MIN_POSITION_USDC = 100;
const MAX_HEDGE_LEVERAGE = 25;

export function ProtectPage({ sheet = false, onClose }: { sheet?: boolean; onClose?: () => void }) {
  const params = useParams<{ symbol: string }>();
  const router = useRouter();
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const { holdings, usdcBalance, refresh } = usePortfolio();
  const holding = holdings.find((item) => item.market.symbol.toLowerCase() === params.symbol.toLowerCase());
  const [coverage, setCoverage] = useState(Math.round(holding?.coverage || 75));
  const [leverage, setLeverage] = useState(Math.min(25, Math.max(1, holding?.trade ? Number(holding.trade.trade.leverage) / 1e10 : 5)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<"coverage" | "leverage" | "collateral" | "liquidation" | null>(null);
  const [marginAction, setMarginAction] = useState<"deposit" | "withdraw">("deposit");
  const [marginAmount, setMarginAmount] = useState("10");
  const [confirmClose, setConfirmClose] = useState(false);
  const [managingAction, setManagingAction] = useState<"deposit" | "withdraw" | "close" | null>(null);

  if (!holding) return <div className={sheet ? "py-8" : "screen-flow"}>{sheet ? null : <TopBar back />}<p>Stock unavailable.</p></div>;
  const currentHolding = holding;
  const targetNotional = (holding.value ?? 0) * coverage / 100;
  const additionalNotional = Math.max(0, targetNotional - holding.hedgeNotional);
  const collateralNeeded = additionalNotional / leverage;
  const positionBelowMinimum = additionalNotional > 0 && additionalNotional < AVANTIS_MIN_POSITION_USDC;
  const estimatedLiquidationPrice = holding.price ? holding.price * (1 + 1 / leverage) : null;
  const liquidationDeviation = holding.price && estimatedLiquidationPrice ? (estimatedLiquidationPrice - holding.price) / holding.price * 100 : null;

  function updateCoverage(value: number) {
    const snapped = [25, 50, 75, 100].find((stop) => Math.abs(stop - value) <= 2) ?? value;
    setCoverage(snapped);
    if ([25, 50, 75, 100].includes(snapped) && "vibrate" in navigator) navigator.vibrate(8);
  }

  async function confirmProtection() {
    if (!address || !publicClient) return;
    setBusy(true); setError(null);
    try {
      if (chainId !== base.id) await switchChainAsync({ chainId: base.id });
      for (let step = 0; step < 2; step += 1) {
        const response = await fetch("/api/avantis/open", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trader: address, symbol: currentHolding.market.symbol, targetNotional, leverage }) });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? payload.error ?? "Unable to prepare protection.");
        if (payload.action === "none") { refresh(); onClose?.(); return; }
        const transaction = payload.data as BuiltTransaction;
        if (!transaction?.to || !transaction?.data || transaction.data === "0x") throw new Error("Avantis returned an invalid transaction.");
        const hash = await sendTransactionAsync({ to: transaction.to, data: transaction.data, value: BigInt(transaction.value || "0") });
        await publicClient.waitForTransactionReceipt({ hash });
        if (payload.action === "open" || payload.action === "close") {
          refresh(); onClose?.();
          router.replace(`/stocks/${params.symbol}/protect/success?coverage=${coverage}&amount=${Math.round(targetNotional)}`);
          return;
        }
      }
      throw new Error("USDC approval completed. Confirm protection again to open the hedge.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Protection could not be opened."); }
    finally { setBusy(false); }
  }

  async function manageProtection(action: "deposit" | "withdraw" | "close") {
    if (!address || !publicClient) return;
    setBusy(true); setManagingAction(action); setError(null);
    try {
      if (chainId !== base.id) await switchChainAsync({ chainId: base.id });
      for (let step = 0; step < 2; step += 1) {
        const response = await fetch("/api/avantis/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trader: address, symbol: currentHolding.market.symbol, action, collateralUsdc: Number(marginAmount) }) });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? payload.error ?? "Unable to update protection.");
        const transaction = payload.data as BuiltTransaction;
        if (!transaction?.to || !transaction?.data || transaction.data === "0x") throw new Error("Avantis returned an invalid transaction.");
        const hash = await sendTransactionAsync({ to: transaction.to, data: transaction.data, value: BigInt(transaction.value || "0") });
        await publicClient.waitForTransactionReceipt({ hash });
        if (payload.action !== "approve") { refresh(); onClose?.(); return; }
      }
      throw new Error("USDC approval completed. Confirm the collateral deposit again.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Protection could not be updated."); }
    finally { setBusy(false); setManagingAction(null); }
  }

  if (holding.trade) {
    const positionSize = holding.hedgeNotional;
    const currentCollateral = Number(formatUnits(BigInt(holding.trade.trade.initialPosToken ?? holding.trade.trade.positionSizeUSDC), 6));
    const change = Number(marginAmount) || 0;
    const projectedCollateral = marginAction === "deposit" ? currentCollateral + change : currentCollateral - change;
    const currentLeverage = currentCollateral > 0 ? positionSize / currentCollateral : 0;
    const projectedLeverage = projectedCollateral > 0 ? positionSize / projectedCollateral : 0;
    const currentLiquidation = Number(holding.trade.liquidationPrice) / 1e10;
    const openPrice = Number(holding.trade.trade.openPrice) / 1e10;
    const projectedLiquidation = projectedLeverage > 0 && currentLeverage > 0 ? openPrice + (currentLiquidation - openPrice) * (currentLeverage / projectedLeverage) : null;
    const leverageTooHigh = marginAction === "withdraw" && projectedLeverage > MAX_HEDGE_LEVERAGE;
    const invalidMargin = change <= 0 || (marginAction === "deposit" ? change > usdcBalance : projectedCollateral <= 0) || leverageTooHigh;
    return <main className={`${sheet ? "flex flex-col" : "screen-flow flex flex-col"} bg-[var(--canvas)]`}>
      {sheet ? null : <TopBar back title="Adjust protection" />}
      <section className="flex-1 pt-3">
        <div className="rounded-2xl bg-[#F7F7F6] px-4 py-2 text-sm">
          <ComparisonRow label="Position size" current={`${money(positionSize, 2)} USDC`} projected={`${money(positionSize, 2)} USDC`} />
          <ComparisonRow label="Collateral" current={`${money(currentCollateral, 2)} USDC`} projected={`${money(projectedCollateral, 2)} USDC`} />
          <ComparisonRow label="Leverage" current={`${currentLeverage.toFixed(2)}×`} projected={projectedLeverage > 0 ? `${projectedLeverage.toFixed(2)}×` : "—"} />
          <ComparisonRow label="Liquidation price" current={money(currentLiquidation, 3)} projected={projectedLiquidation ? money(projectedLiquidation, 3) : "—"} />
        </div>
        <section className="app-card mt-4 p-4">
          <div className="grid grid-cols-2 rounded-2xl bg-[#F1F1F0] p-1">{(["deposit", "withdraw"] as const).map((action) => <button type="button" key={action} onClick={() => { setMarginAction(action); setError(null); }} className={`min-h-11 rounded-xl text-sm font-semibold ${marginAction === action ? "bg-white shadow-sm" : "text-[var(--slate)]"}`}>{action === "deposit" ? "Add collateral" : "Remove collateral"}</button>)}</div>
          <div className="mt-4 rounded-2xl bg-[#F7F7F6] p-4"><div className="flex items-center justify-between"><span className="text-xs text-[var(--muted)]">{marginAction === "deposit" ? "Collateral to add" : "Collateral to remove"}</span><div className="flex items-center gap-1"><span className="text-xs font-semibold text-[var(--slate)]">Available {money(marginAction === "deposit" ? usdcBalance : currentCollateral, 2)}</span><button type="button" onClick={refresh} aria-label="Refresh balances" className="grid size-7 place-items-center rounded-full text-[var(--muted)] active:rotate-45"><RefreshCw size={14} /></button></div></div><div className="mt-3 flex items-center gap-3"><input aria-label="Collateral amount" value={marginAmount} onChange={(event) => setMarginAmount(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-[34px] font-bold tracking-[-.05em] outline-none" /><span className="font-semibold">USDC</span></div></div>
          {leverageTooHigh ? <p role="alert" className="mt-3 rounded-2xl bg-[var(--risk-light)] px-4 py-3 text-sm text-[var(--risk)]">Removing this much collateral would increase leverage to {projectedLeverage.toFixed(2)}×. Maximum leverage is {MAX_HEDGE_LEVERAGE}×.</p> : null}
          {error ? <p role="alert" className="mt-3 rounded-2xl bg-[var(--risk-light)] px-4 py-3 text-sm text-[var(--risk)]">{error}</p> : null}
          <button disabled={busy || invalidMargin} onClick={() => manageProtection(marginAction)} className="cta mt-4 flex min-h-14 w-full items-center justify-center gap-2 text-base font-bold disabled:opacity-50">{managingAction === marginAction ? <LoaderCircle size={19} className="animate-spin" /> : null}{marginAction === "deposit" ? "Add collateral" : "Remove collateral"}</button>
        </section>
      </section>
      <div className="pt-2"><button type="button" disabled={busy} onClick={() => confirmClose ? manageProtection("close") : setConfirmClose(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-[var(--risk)] disabled:opacity-50">{managingAction === "close" ? <LoaderCircle size={17} className="animate-spin" /> : null}{confirmClose ? "Confirm close protection" : "Close protection"}</button></div>
    </main>;
  }

  return <main className={`${sheet ? "flex flex-col" : "screen-flow flex flex-col"} bg-[var(--canvas)]`}>
    {sheet ? null : <TopBar back title="Protect position" />}
    <section className="flex-1 pt-3">
      <section className="app-card p-5">
        <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className="text-sm font-semibold">Amount to protect</span><InfoButton label="Protection percentage" onClick={() => setInfo(info === "coverage" ? null : "coverage")} /></div><span className="text-xl font-bold">{coverage === 100 ? "100%" : `${coverage}%`}</span></div>
        {info === "coverage" ? <p className="mt-2 text-xs leading-5 text-[var(--slate)]">This sets the share of your stock holding offset by the Avantis short.</p> : null}
        <input aria-label="Protection percentage" type="range" min="0" max="100" step="1" value={coverage} onChange={(event) => updateCoverage(Number(event.target.value))} className="mt-4 h-3 w-full accent-[var(--coral)]" />
        <div className="mt-1 flex justify-between text-[11px] text-[var(--muted)]"><span>0%</span><span>{money(targetNotional)} hedged</span><span>100%</span></div>

        <div className="my-4 border-t border-[var(--divider)]" />

        <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className="text-sm font-semibold">Leverage</span><InfoButton label="Leverage" onClick={() => setInfo(info === "leverage" ? null : "leverage")} /></div><span className="text-xl font-bold">{leverage.toFixed(leverage % 1 ? 1 : 0)}×</span></div>
        {info === "leverage" ? <p className="mt-2 text-xs leading-5 text-[var(--slate)]">Higher leverage lowers collateral but moves liquidation closer to the current price.</p> : null}
        <input aria-label="Hedge leverage" type="range" min="1" max="25" step="0.5" value={leverage} onChange={(event) => setLeverage(Number(event.target.value))} className="mt-4 h-3 w-full accent-[var(--coral)]" />
        <div className="mt-1 flex justify-between text-[11px] text-[var(--muted)]"><span>1×</span><span>25×</span></div>
      </section>

      <section className="mt-3 rounded-2xl bg-[#F7F7F6] px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-3 py-2"><span className="text-[var(--slate)]">Avantis position size</span><span className="font-bold">{money(additionalNotional, 2)} USDC</span></div>
        <div className="flex items-center justify-between gap-3 py-2"><span className="flex items-center gap-1.5 text-[var(--slate)]">Collateral needed <InfoButton label="Collateral needed" onClick={() => setInfo(info === "collateral" ? null : "collateral")} /></span><span className="font-bold">{money(collateralNeeded, 2)} USDC</span></div>
        {info === "collateral" ? <p className="pb-2 text-xs leading-5 text-[var(--slate)]">Collateral equals position size divided by leverage. Avantis requires a minimum $100 position.</p> : null}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--divider)] py-2"><span className="flex items-center gap-1.5 text-[var(--slate)]">Est. liquidation <InfoButton label="Estimated liquidation price" onClick={() => setInfo(info === "liquidation" ? null : "liquidation")} /></span><div className="text-right"><span className="font-bold text-[var(--risk)]">{money(estimatedLiquidationPrice, 2)}</span><span className="ml-2 text-xs font-semibold text-[var(--risk)]">+{liquidationDeviation?.toFixed(1) ?? "—"}%</span></div></div>
        {info === "liquidation" ? <p className="pb-2 text-xs leading-5 text-[var(--slate)]">Approximate distance above the current price. Avantis determines the final value after execution.</p> : null}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--divider)] py-2"><span className="text-[var(--slate)]">Available USDC</span><div className="flex items-center gap-1"><span className="font-semibold">{money(usdcBalance, 2)}</span><button type="button" onClick={refresh} aria-label="Refresh USDC balance" title="Refresh balance" className="grid size-7 place-items-center rounded-full text-[var(--muted)] transition hover:bg-white active:rotate-45"><RefreshCw size={14} /></button></div></div>
      </section>
      {positionBelowMinimum ? <p role="alert" className="mt-3 rounded-2xl bg-[var(--amber-light)] px-4 py-3 text-sm text-[#A66A00]">Increase the amount to protect. Avantis requires a minimum position size of {money(AVANTIS_MIN_POSITION_USDC)}.</p> : null}
      {error ? <p role="alert" className="mt-3 rounded-2xl bg-[var(--risk-light)] px-4 py-3 text-sm text-[var(--risk)]">{error}</p> : null}
    </section>
    <div className="pt-4"><button disabled={busy || !address || !holding.available || coverage === 0 || positionBelowMinimum || usdcBalance < collateralNeeded} onClick={confirmProtection} className="cta flex min-h-14 w-full items-center justify-center gap-2 text-base font-bold disabled:opacity-50">{busy ? <LoaderCircle size={19} className="animate-spin" /> : <ShieldCheck size={19} />}{!address ? "Connect wallet to protect" : !holding.available ? "Market unavailable" : positionBelowMinimum ? "Minimum position is $100" : usdcBalance < collateralNeeded ? "Not enough USDC" : "Protect with Avantis"}</button></div>
  </main>;
}

export default function ProtectPageRoute() { return <ProtectPage />; }

function InfoButton({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" aria-label={`About ${label}`} title={label} onClick={onClick} className="grid size-5 place-items-center rounded-full text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"><Info size={14} /></button>; }

function ComparisonRow({ label, current, projected }: { label: string; current: string; projected: string }) { return <div className="flex items-center justify-between gap-3 border-b border-[var(--divider)] py-3 last:border-0"><span className="text-[var(--slate)]">{label}</span><div className="flex items-center gap-2 font-semibold"><span className="text-[var(--muted)] line-through decoration-[var(--muted)]/50">{current}</span><span>{projected}</span></div></div>; }
