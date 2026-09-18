import { effectLabel, shortMoney } from "../../game/format";
import type { Paycheck } from "../../game/types";
import { Icon } from "../icon/icon";
import "./payday-receipt.css";

export function PaydayReceipt({ paycheck }: { paycheck: Paycheck }) {
  return (
    <div className="payday-receipt">
      <Icon name="wallet" size={19} />
      <span>
        <strong>{paycheck.net < 0 ? "Gajian lewat. Dompet nombok." : "Gajian udah masuk."}</strong>
        <small>+{shortMoney(paycheck.salary)} gaji −{shortMoney(paycheck.livingCost)} biaya hidup</small>
        <small>−{shortMoney(paycheck.deduction)}: {paycheck.reason}</small>
      </span>
      <b>{effectLabel("dompet", paycheck.net)}</b>
    </div>
  );
}
