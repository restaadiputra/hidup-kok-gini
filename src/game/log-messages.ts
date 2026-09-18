import { rupiah } from "./format";
import type { Choice, Paycheck } from "./types";

const MAX_LOG_ENTRIES = 60;

export const START_LOG = "Tahun baru, harapan baru. Saldo awal Rp2.500.000 per pemain.";

export function addToLog(log: string[], entry: string): string[] {
  return [entry, ...log].slice(0, MAX_LOG_ENTRIES);
}

function paydayLine(paycheck: Paycheck): string {
  const outcome = paycheck.net < 0 ? "Dompet nombok" : "Masuk dompet";
  return ` Mampir GAJIAN! Gaji ${rupiah(paycheck.salary)} − biaya hidup ${rupiah(paycheck.livingCost)} − tagihan dadakan ${rupiah(paycheck.deduction)}. ${paycheck.reason} ${outcome}: ${rupiah(Math.abs(paycheck.net))}.`;
}

export function rollMessage(name: string, dice: number, tileLabel: string, paycheck: Paycheck | null): string {
  return `${name} melempar ${dice} → ${tileLabel}.${paycheck ? paydayLine(paycheck) : ""}`;
}

export function choiceMessage(name: string, choice: Choice): string {
  return `${name}: ${choice.label}. ${choice.result}`;
}
