import { Dialog } from "primereact/dialog";
import "./PayablePaymentChoiceModal.css";

interface Props {
  visible: boolean;
  onHide: () => void;
  onEditCharges: () => void;
  onUseDefaultCharges: () => void;
}
export function PayablePaymentChoiceModal({
  visible,
  onHide,
  onEditCharges,
  onUseDefaultCharges,
}: Props) {
  return (
    <Dialog
      className="payable-payment-choice-dialog"
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
