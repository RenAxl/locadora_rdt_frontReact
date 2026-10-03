import { Dialog } from "primereact/dialog";
import { Receivable } from "../../models/Receivable";
import "./ReceivableOverdueModal.css";

interface Props {
  visible: boolean;
  receivable: Receivable | null;
  onHide: () => void;
}
export function ReceivableOverdueModal({ visible, receivable, onHide }: Props) {
  const currency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <Dialog
      className="receivable-overdue-dialog"
      header="Conta vencida"
      visible={visible}
      modal
      style={{ width: "420px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {receivable ? (
        <div className="overdue-grid">
          <div className="overdue-line highlight">
            <span>Valor atual</span>
            <strong>
              {currency(
                Number(
                  receivable.currentAmountWithLateCharges ??
                    receivable.amount ??
                    0,
                ),
              )}
            </strong>
          </div>
          <div className="overdue-line">
            <span>Dias em atraso</span>
            <strong>{receivable.overdueDays ?? 0}</strong>
          </div>
          <div className="overdue-line">
            <span>Juros calculado</span>
            <strong>
              {currency(Number(receivable.calculatedLateInterest ?? 0))}
            </strong>
          </div>
          <div className="overdue-line">
            <span>Multa calculada</span>
            <strong>
              {currency(Number(receivable.calculatedLateFee ?? 0))}
            </strong>
          </div>
        </div>
      ) : (
        <div className="empty">Nenhuma conta selecionada.</div>
      )}
    </Dialog>
  );
}
