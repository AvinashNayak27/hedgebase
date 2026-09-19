export function ProtectionRing({ value, size = 88 }: { value: number; size?: number }) {
  const safe = Math.max(0, Math.min(100, value)); const radius = 36; const circumference = 2 * Math.PI * radius;
  return <div className="relative shrink-0" style={{ width: size, height: size }}><svg viewBox="0 0 88 88" className="-rotate-90"><circle cx="44" cy="44" r={radius} fill="none" stroke="#E9F8EF" strokeWidth="8" /><circle cx="44" cy="44" r={radius} fill="none" stroke="var(--green)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - safe / 100)} /></svg><span className="absolute inset-0 grid place-items-center text-[18px] font-bold">{Math.round(safe)}%</span></div>;
}
