import { rupiah } from "../../game/format";
import type { Paycheck } from "../../game/types";
import { Dialog } from "../dialog/dialog";
import { Icon } from "../icon/icon";
import "./payday-dialog.css";

export function PaydayDialog({ name, paycheck, steps, onContinue }: {
  name: string;
  paycheck: Paycheck;
  steps: number;
  onContinue: () => void;
}) {
  const loss = paycheck.net < 0;
  return (
    <Dialog title={`Selamat, ${name}! Gajian!`} onClose={onContinue}>
      <div className="paycheck">
        <div className="paycheck-celebration">
          <Icon name="wallet" size={34} />
          <p>Satu putaran terlewati. Kerja kerasmu cair juga!</p>
        </div>
        <dl className="paycheck-lines">
          <div>
            <dt>Gaji masuk <small>Akhirnya ada notifikasi yang ditunggu.</small></dt>
            <dd>+{rupiah(paycheck.salary)}</dd>
          </div>
          <div>
            <dt>Biaya hidup <small>Kos, makan, listrik. Trio penunggu gajian.</small></dt>
            <dd>−{rupiah(paycheck.livingCost)}</dd>
          </div>
          <div>
            <dt>{paycheck.rare ? "Musibah edisi langka" : "Tagihan dadakan"}<small>{paycheck.reason}</small></dt>
            <dd>−{rupiah(paycheck.deduction)}</dd>
          </div>
          <div className={`paycheck-total ${loss ? "paycheck-loss" : "paycheck-gain"}`}>
            <dt>{loss ? "Dompet nombok" : "Sisa masuk dompet"}</dt>
            <dd>{loss ? "−" : "+"}{rupiah(Math.abs(paycheck.net))}</dd>
          </div>
        </dl>
        <p className="paycheck-punchline">
          {loss ? "Selamat atas gajinya. Turut berduka atas sisanya." : "Gaji mampir sebentar. Tagihan udah nunggu dari tadi."}
        </p>
        <p className="small-note">Sudah dihitung ke Dompet. {steps > 0 ? `Masih ada ${steps} langkah dari lemparan tadi.` : "Pas di GAJIAN. Sekarang ambil kartu kehidupan."}</p>
        <button className="primary-button" onClick={onContinue}>
          {steps > 0 ? `Lanjut ${steps} langkah` : "Lanjut ambil kartu"}
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </Dialog>
  );
}
