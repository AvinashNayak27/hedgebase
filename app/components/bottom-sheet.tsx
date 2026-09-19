"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose, open]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end bg-[#111318]/30" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="mx-auto max-h-[92dvh] w-full max-w-[420px] overflow-y-auto rounded-t-[30px] bg-[var(--canvas)] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-10px_30px_rgba(16,24,40,.16)]">
      <div className="relative mb-4 flex items-center justify-center"><div><div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--divider)]" /><h2 className="text-center text-xl font-bold tracking-[-.03em]">{title}</h2></div><button type="button" onClick={onClose} aria-label="Close" className="absolute right-0 top-0 grid size-10 place-items-center rounded-full bg-white text-[var(--slate)] shadow-sm"><X size={18} /></button></div>
      {children}
    </section>
  </div>;
}
