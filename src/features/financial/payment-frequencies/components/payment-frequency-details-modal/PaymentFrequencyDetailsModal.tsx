import { Dialog } from "primereact/dialog";
import { PaymentFrequency } from "../../models/PaymentFrequency";
import "./PaymentFrequencyDetailsModal.css";

interface Props {
  visible: boolean;
  paymentFrequency: PaymentFrequency | null;
  onHide: () => void;
}
export function PaymentFrequencyDetailsModal({
  visible,
  paymentFrequency,
  onHide,
}: Props) {
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <Dialog
      className="payment-frequency-details-dialog"
      header="Detalhamento da Frequência de Pagamento"
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {paymentFrequency ? (
        <div className="details-grid">
          <div className="wide">
            <span>Frequência</span>
            <strong>{paymentFrequency.frequency || "-"}</strong>
          </div>
          <div>
            <span>Dias</span>
            <strong>{paymentFrequency.days ?? "-"}</strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(paymentFrequency.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(paymentFrequency.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{paymentFrequency.createdBy || "-"}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{paymentFrequency.updatedBy || "-"}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
