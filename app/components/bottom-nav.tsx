"use client";

import Link from "next/link";
import { Activity, Compass, House, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [{ href: "/", label: "Home", Icon: House }, { href: "/discover", label: "Discover", Icon: Compass }, { href: "/activity", label: "Activity", Icon: Activity }, { href: "/profile", label: "Profile", Icon: UserRound }];

export function BottomNav() {
  const pathname = usePathname();
  return <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 mx-auto border-t border-[var(--divider)] bg-white/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:max-w-[430px] sm:rounded-t-3xl"><div className="grid grid-cols-4">{items.map(({ href, label, Icon }) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium ${active ? "text-[var(--coral)]" : "text-[var(--muted)]"}`}><Icon size={21} strokeWidth={active ? 2.4 : 1.8} /><span>{label}</span></Link>; })}</div></nav>;
}
