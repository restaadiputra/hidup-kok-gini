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

export function PaydayDialog({ name, paycheck, steps, onContinue }: {
  name: string;
  paycheck: Paycheck;
  steps: number;
  onContinue: () => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  const proceed = () => ready && onContinue();

  const loss = paycheck.net < 0;
  const hasDebtLines = paycheck.interest > 0 || paycheck.installment > 0 || paycheck.statusEffects.length > 0;
  return (
    <Dialog title={`Selamat, ${name}! Gajian!`} onClose={proceed} dismissible={false}>
      <div className="paycheck">
        <dl className="paycheck-lines">
          <Line label="Gaji masuk" amount={`+${rupiah(paycheck.salary)}`} why="Akhirnya ada notifikasi yang ditunggu." />
          <Line label="Biaya hidup" amount={`−${rupiah(paycheck.livingCost)}`} why="Kos, makan, listrik. Trio penunggu gajian." />
          <Line
            label={paycheck.rare ? "Musibah edisi langka" : "Tagihan dadakan"}
            amount={`−${rupiah(paycheck.deduction)}`}
            why={paycheck.reason}
          />
          <div className={`paycheck-total ${loss ? "paycheck-loss" : "paycheck-gain"}`}>
            <dt>{loss ? "Dompet nombok" : "Sisa masuk dompet"}</dt>
            <dd>{loss ? "−" : "+"}{rupiah(Math.abs(paycheck.net))}</dd>
          </div>
        </dl>
        {hasDebtLines ? (
          <dl className="paycheck-lines paycheck-debt">
            {paycheck.interest > 0 ? (
              <Line label="Bunga utang" amount={`+${rupiah(paycheck.interest)}`} why="Ditambahkan ke Hutang." bad />
            ) : null}
            {paycheck.installment > 0 ? (
              <Line label="Cicilan debt collector" amount={`−${rupiah(paycheck.installment)}`} why="Dipotong dari Dompet." bad />
            ) : null}
            {paycheck.statusEffects.map(({ status, effects }) => (
              <Line
                key={status}
                label={statusLabel(status)}
                amount={(Object.entries(effects) as [Stat, number][])
                  .map(([stat, value]) => `${STAT_LABELS[stat]} ${effectLabel(stat, value)}`)
                  .join(", ")}
              />
            ))}
          </dl>
        ) : null}
        <p className="paycheck-punchline">
          {loss ? "Selamat atas gajinya. Turut berduka atas sisanya." : "Gaji mampir sebentar. Tagihan udah nunggu dari tadi."}
        </p>
        {loss ? <p className="paycheck-hint">Kalau Dompet nggak cukup, sisanya jadi Hutang.</p> : null}
        <div className="paycheck-foot">
          <button className="primary-button" onClick={proceed}>
            {steps > 0 ? `Lanjut ${steps} langkah` : "Lanjut ambil kartu"}
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </Dialog>
  );
}
