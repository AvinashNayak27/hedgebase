import Image from "next/image";
import type { StockMarket } from "@/app/lib/markets";

export function AssetMark({ market, size = 44 }: { market: StockMarket; size?: number }) {
  const pair = market.avantisSymbol.replace("/", "-");
  return <div className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm" style={{ width: size, height: size }}><Image src={`https://www.avantisfi.com/images/pairs/equities/${pair}.svg`} alt={`${market.company} logo`} width={size} height={size} unoptimized className="size-full object-cover" /></div>;
}
