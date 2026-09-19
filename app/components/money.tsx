export function money(value: number | null, digits = 0) {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function quantity(value: number) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value); }
