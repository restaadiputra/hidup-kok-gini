import { useEffect, useState } from "react";
import { effectLabel, rupiah, STAT_LABELS } from "../../game/format";
import { statusLabel } from "../../game/statuses";
import { PAYDAY_OPTIONS } from "../../game/payday";
import type { Paycheck, Stat, Stats } from "../../game/types";
import { Effects } from "../effects/effects";
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

export function PaydayDialog({ month, playerName, playerNumber, playerCount, paycheck, choiceEffects, onChoose }: {
  month: number;
  playerName: string;
  playerNumber: number;
  playerCount: number;
  paycheck: Paycheck;
  choiceEffects: Partial<Stats>[];
  onChoose: (index: number) => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), READ_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  const choose = (index: number) => ready && onChoose(index);
  const loss = paycheck.net < 0;
  const hasDebtLines = paycheck.interest > 0 || paycheck.installment > 0 || paycheck.statusEffects.length > 0;

  return (
    <Dialog title={`Payday bulan ${month}: ${playerName}`} onClose={() => undefined} dismissible={false}>
      <div className="paycheck">
        <p className="paycheck-punchline">Pemain {playerNumber} dari {playerCount}. Semua menerima gaji, tapi kamu yang memilih nasib uangmu.</p>
        <dl className="paycheck-lines">
          <Line label="Gaji masuk" amount={`+${rupiah(paycheck.salary)}`} why="Akhirnya ada notifikasi yang ditunggu." />
          <Line label="Biaya hidup" amount={`−${rupiah(paycheck.livingCost)}`} why="Kos, makan, listrik. Trio penunggu gajian." />
          <Line label={paycheck.rare ? "Musibah edisi langka" : "Tagihan dadakan"} amount={`−${rupiah(paycheck.deduction)}`} why={paycheck.reason} />
          <div className={`paycheck-total ${loss ? "paycheck-loss" : "paycheck-gain"}`}>
            <dt>{loss ? "Dompet nombok" : "Sisa masuk dompet"}</dt>
            <dd>{loss ? "−" : "+"}{rupiah(Math.abs(paycheck.net))}</dd>
          </div>
        </dl>
        {hasDebtLines ? (
          <dl className="paycheck-lines paycheck-debt">
            {paycheck.interest > 0 ? <Line label="Bunga utang" amount={`+${rupiah(paycheck.interest)}`} why="Ditambahkan ke Hutang." bad /> : null}
            {paycheck.installment > 0 ? <Line label="Cicilan debt collector" amount={`−${rupiah(paycheck.installment)}`} why="Dipotong dari Dompet." bad /> : null}
            {paycheck.statusEffects.map(({ status, effects }) => (
              <Line key={status} label={statusLabel(status)} amount={(Object.entries(effects) as [Stat, number][]).map(([stat, value]) => `${STAT_LABELS[stat]} ${effectLabel(stat, value)}`).join(", ")} />
            ))}
          </dl>
        ) : null}
        <span className="field-label choice-label">SETELAH GAJIAN, KAMU...</span>
        <div className="choices payday-choices">
          {PAYDAY_OPTIONS.map((option, index) => (
            <button className="choice" key={option.label} onClick={() => choose(index)}>
              <span className="choice-top"><strong>{option.label}</strong><Icon name="arrow" size={17} /></span>
              <Effects effects={choiceEffects[index]} />
              <small>{option.result}</small>
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
