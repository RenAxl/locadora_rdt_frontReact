import { Dialog } from "primereact/dialog";
import { PaymentMethod } from "../../models/PaymentMethod";
import "./PaymentMethodDetailsModal.css";

interface Props {
  visible: boolean;
  paymentMethod: PaymentMethod | null;
  onHide: () => void;
}
export function PaymentMethodDetailsModal({
  visible,
  paymentMethod,
  onHide,
}: Props) {
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <Dialog
      className="payment-method-details-dialog"
      header="Detalhamento da Forma de Pagamento"
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {paymentMethod ? (
        <div className="details-grid">
          <div className="wide">
            <span>Nome</span>
            <strong>{paymentMethod.name || "-"}</strong>
          </div>
          <div>
            <span>Taxa</span>
            <strong>
              {paymentMethod.fee == null
                ? "-"
                : paymentMethod.fee.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) + "%"}
            </strong>
          </div>
          <div>
            <span>Data cadastro</span>
            <strong>{formatDate(paymentMethod.createdAt)}</strong>
          </div>
          <div>
            <span>Data atualização</span>
            <strong>{formatDate(paymentMethod.updatedAt)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{paymentMethod.createdBy || "-"}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{paymentMethod.updatedBy || "-"}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
