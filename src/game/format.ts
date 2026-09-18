import { isMoney } from "./stats";
import type { Stat } from "./types";

export const STAT_LABELS: Record<Stat, string> = {
  dompet: "Dompet",
  kewarasan: "Kewarasan",
  relasi: "Relasi",
  hoki: "Hoki",
  hutang: "Hutang",
};
export const STAT_ICONS: Record<Stat, string> = {
  dompet: "wallet",
  kewarasan: "brain",
  relasi: "heart",
  hoki: "sparkles",
  hutang: "receipt",
};
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
export const rupiah = (value: number) => rupiahFormatter.format(value);
export function shortMoney(value: number): string {
  const absolute = Math.abs(value);
  const number =
    absolute >= 1_000_000
      ? `${(absolute / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} jt`
      : `${(absolute / 1_000).toLocaleString("id-ID")} rb`;
  return `${value < 0 ? "−" : ""}Rp${number}`;
}
export function effectLabel(stat: Stat, value: number): string {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${isMoney(stat) ? shortMoney(Math.abs(value)) : Math.abs(value)}`;
}
