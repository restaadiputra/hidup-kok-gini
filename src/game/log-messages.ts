import { rupiah } from "./format";
import { statusLabel } from "./statuses";
import type { Choice, Paycheck, Stats } from "./types";

const MAX_LOG_ENTRIES = 60;

export const START_LOG = "Tahun baru, harapan baru. Saldo awal Rp2.500.000 per pemain.";

export function addToLog(log: string[], entry: string): string[] {
  return [entry, ...log].slice(0, MAX_LOG_ENTRIES);
}

const STAT_LABELS: Record<keyof Stats, string> = {
  dompet: "Dompet",
  kewarasan: "Kewarasan",
  relasi: "Relasi",
  hoki: "Hoki",
  hutang: "Hutang",
};

function signedAmount(stat: keyof Stats, value: number): string {
  const sign = value >= 0 ? "+" : "−";
  const amount = stat === "dompet" || stat === "hutang" ? rupiah(Math.abs(value)) : String(Math.abs(value));
  return `${STAT_LABELS[stat]} ${sign}${amount}`;
}

export function effectsMessage(effects: Partial<Stats>): string {
  const entries = (Object.entries(effects) as Array<[keyof Stats, number | undefined]>)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([stat, value]) => signedAmount(stat, value!));
  return entries.length ? ` Dampak: ${entries.join(" · ")}.` : "";
}

function paydayLine(paycheck: Paycheck): string {
  const outcome = paycheck.net < 0 ? "Dompet nombok" : "Masuk dompet";
  const statuses = paycheck.statusEffects.length ? ` Efek status: ${paycheck.statusEffects.map((effect) => statusLabel(effect.status)).join(", ")}.` : "";
  const interest = paycheck.interest ? ` Bunga utang ${rupiah(paycheck.interest)}.` : "";
  const installment = paycheck.installment ? ` Cicilan ke debt collector ${rupiah(paycheck.installment)}.` : "";
  return ` Mampir GAJIAN! Gaji ${rupiah(paycheck.salary)} − biaya hidup ${rupiah(paycheck.livingCost)} − tagihan dadakan ${rupiah(paycheck.deduction)}. ${paycheck.reason} ${outcome}: ${rupiah(Math.abs(paycheck.net))}.${statuses}${interest}${installment}`;
}

export function rollMessage(name: string, dice: number, tileLabel: string, paycheck: Paycheck | null): string {
  return `${name} melempar ${dice} → ${tileLabel}.${paycheck ? paydayLine(paycheck) : ""}`;
}

export interface StatusChanges { gained: string[]; lost: string[] }
const NO_CHANGES: StatusChanges = { gained: [], lost: [] };

export function choiceMessage(
  name: string,
  choice: Choice,
  borrowed = 0,
  changes: StatusChanges = NO_CHANGES,
  effects: Partial<Stats> = choice.effects,
): string {
  const debt = borrowed ? ` Ngutang ke debt collector: ${rupiah(borrowed)}.` : "";
  const gained = changes.gained.length ? ` Status baru: ${changes.gained.map((id) => statusLabel(id)).join(", ")}.` : "";
  const lost = changes.lost.length ? ` Lepas dari: ${changes.lost.map((id) => statusLabel(id)).join(", ")}.` : "";
  return `${name}: ${choice.label}. ${choice.result}${effectsMessage(effects)}${debt}${gained}${lost}`;
}
