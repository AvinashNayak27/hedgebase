"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function TopBar({
  back = false,
  title,
}: {
  back?: boolean;
  title?: string;
}) {
  const router = useRouter();
  return (
    <header className="flex h-[72px] items-center justify-between">
      <div className="flex min-w-10 items-center gap-2">
        {back ? (
          <button
            aria-label="Go back"
            onClick={() => router.back()}
            className="grid size-10 place-items-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft size={21} />
          </button>
        ) : (
          <>
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--coral)] text-white">
              <Shield size={18} fill="currentColor" />
            </div>
            <span className="font-semibold tracking-[-.03em]">Hedgr</span>
          </>
        )}
      </div>
      {title ? <h1 className="text-[15px] font-semibold">{title}</h1> : null}
      <div className="flex min-w-10 items-center justify-end gap-2">
        <ConnectButton
          accountStatus="full"
          showBalance={false}
          chainStatus={{ largeScreen: "icon", smallScreen: "icon" }}
          label="Connect Wallet"
        />
      </div>
    </header>
  );
}
