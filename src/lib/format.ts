export function fmtDate(d: string | Date | null): string {
  if (!d) return "–";
  const date = typeof d === "string" ? new Date(d) : d;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function fmtCurrencyShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
