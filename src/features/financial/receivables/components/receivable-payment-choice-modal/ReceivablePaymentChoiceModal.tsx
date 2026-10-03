import { Dialog } from "primereact/dialog";
import "./ReceivablePaymentChoiceModal.css";

interface Props {
  visible: boolean;
  onHide: () => void;
  onEditCharges: () => void;
  onUseDefaultCharges: () => void;
}
export function ReceivablePaymentChoiceModal({
  visible,
  onHide,
  onEditCharges,
  onUseDefaultCharges,
}: Props) {
  return (
    <Dialog
      className="receivable-payment-choice-dialog"
      header="Conta vencida"
      visible={visible}
      modal
      style={{ width: "420px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      <div className="choice-actions">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onEditCharges}
        >
          Editar multa e juros
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onUseDefaultCharges}
        >
          Usar valores padrão
        </button>
      </div>
    </Dialog>
  );
}
