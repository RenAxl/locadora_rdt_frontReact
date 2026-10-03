import { Dialog } from "primereact/dialog";
import { Payable } from "../../models/Payable";
import "./PayableOverdueModal.css";

interface Props {
  visible: boolean;
  payable: Payable | null;
  onHide: () => void;
}
export function PayableOverdueModal({ visible, payable, onHide }: Props) {
  const currency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <Dialog
      className="payable-overdue-dialog"
      header="Conta vencida"
      visible={visible}
      modal
      style={{ width: "420px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {payable ? (
        <div className="overdue-grid">
          <div className="overdue-line highlight">
            <span>Valor atual</span>
            <strong>
              {currency(
                Number(
                  payable.currentAmountWithLateCharges ?? payable.amount ?? 0,
                ),
              )}
            </strong>
          </div>
          <div className="overdue-line">
            <span>Dias em atraso</span>
            <strong>{payable.overdueDays ?? 0}</strong>
          </div>
          <div className="overdue-line">
            <span>Juros calculado</span>
            <strong>
              {currency(Number(payable.calculatedLateInterest ?? 0))}
            </strong>
          </div>
          <div className="overdue-line">
            <span>Multa calculada</span>
            <strong>{currency(Number(payable.calculatedLateFee ?? 0))}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Nenhuma conta selecionada.</div>
      )}
    </Dialog>
  );
}
