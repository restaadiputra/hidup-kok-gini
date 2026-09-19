import { useEffect, useState } from "react";
import { effectLabel, rupiah, STAT_LABELS } from "../../game/format";
import { statusLabel } from "../../game/statuses";
import type { Paycheck, Stat } from "../../game/types";
import { Dialog } from "../dialog/dialog";
import { Icon } from "../icon/icon";
import "./payday-dialog.css";

// The button sits where the roll button was, so a double-tap would skip the slip.
const READ_DELAY_MS = 500;

function Line({ label, amount, why, bad = false }: { label: string; amount: string; why?: string; bad?: boolean }) {
  return (
    <div className={bad ? "paycheck-line paycheck-bad" : "paycheck-line"}>
      <dt>{label}</dt>
      <dd>{amount}</dd>
      {why ? <dd className="paycheck-why">{why}</dd> : null}
    </div>
  );
}

export function PaydayDialog({ month, settlements, final, onContinue }: {
  month: number;
  settlements: Array<{ name: string; paycheck: Paycheck }>;
  final: boolean;
  onContinue: () => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  const proceed = () => ready && onContinue();

  return (
    <Dialog title={`Rekap bulan ${month}: semua sudah gajian`} onClose={proceed} dismissible={false}>
      <div className="paycheck">
        <p className="paycheck-punchline">Gaji masuk untuk semua pemain. Yang berbeda cuma alasan dompetnya langsung berkurang.</p>
        <div className="paycheck-roster">
          {settlements.map(({ name, paycheck }) => {
            const loss = paycheck.net < 0;
            const hasDebtLines = paycheck.interest > 0 || paycheck.installment > 0 || paycheck.statusEffects.length > 0;
            return (
              <details className={loss ? "paycheck-player paycheck-player-loss" : "paycheck-player"} key={name}>
                <summary>
                  <strong>{name}</strong>
                  <b>{effectLabel("dompet", paycheck.net)}</b>
                </summary>
                <dl className="paycheck-lines">
                  <Line label="Gaji masuk" amount={`+${rupiah(paycheck.salary)}`} />
                  <Line label="Biaya hidup" amount={`−${rupiah(paycheck.livingCost)}`} />
                  <Line label={paycheck.rare ? "Musibah edisi langka" : "Tagihan dadakan"} amount={`−${rupiah(paycheck.deduction)}`} why={paycheck.reason} />
                </dl>
                {hasDebtLines ? (
                  <dl className="paycheck-lines paycheck-debt">
                    {paycheck.interest > 0 ? <Line label="Bunga utang" amount={`+${rupiah(paycheck.interest)}`} bad /> : null}
                    {paycheck.installment > 0 ? <Line label="Cicilan debt collector" amount={`−${rupiah(paycheck.installment)}`} bad /> : null}
                    {paycheck.statusEffects.map(({ status, effects }) => (
                      <Line key={status} label={statusLabel(status)} amount={(Object.entries(effects) as [Stat, number][]).map(([stat, value]) => `${STAT_LABELS[stat]} ${effectLabel(stat, value)}`).join(", ")} />
                    ))}
                  </dl>
                ) : null}
              </details>
            );
          })}
        </div>
        <div className="paycheck-foot">
          <button className="primary-button" onClick={proceed}>
            {final ? "Lihat hasil akhir" : "Mulai bulan berikutnya"}
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </Dialog>
  );
}
