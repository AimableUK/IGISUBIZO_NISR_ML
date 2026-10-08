import type { Column } from "@/shared";

export function fmtNumber(v: number, decimals = 1) {
  return new Intl.NumberFormat("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}
export function fmtUnit(v: number, unit = "", decimals = 1) {
  const n = fmtNumber(v, decimals);
  return unit === "%" ? `${n}%` : unit ? `${n} ${unit}` : n;
}
export function fmtCell(v: string | number | null | undefined, col?: Column) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return col?.kind === "time" ? String(v) : fmtUnit(v, col?.unit ?? (col?.kind === "percent" ? "%" : ""));
  return v;
}
export const fmtDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
export const signed = (v: number, d = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${fmtNumber(Math.abs(v), d)}`;
