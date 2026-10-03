import { Dialog } from "primereact/dialog";
import { Receivable } from "../../models/Receivable";
import "./ReceivableDetailsModal.css";

interface Props {
  visible: boolean;
  receivable: Receivable | null;
  onHide: () => void;
}
export function ReceivableDetailsModal({ visible, receivable, onHide }: Props) {
  const currency = (value?: number | null) => {
    if (value == null) return "";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  const formatDate = (
    value: Date | string | null | undefined,
    withTime: boolean,
  ) => {
    if (!value) return "-";
    let date = new Date(value);
    if (typeof value === "string" && value.length === 10)
      date = new Date(value + "T00:00:00");
    const day = new Intl.DateTimeFormat("pt-BR").format(date);
    if (!withTime) return day;
    const time = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
    return day + " " + time;
  };
  return (
    <Dialog
      className="receivable-details-dialog"
      header="Detalhamento da Conta a Receber"
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {receivable ? (
        <div className="details-grid">
          <div>
            <span>Descrição</span>
            <strong>{receivable.description || "-"}</strong>
          </div>
          <div>
            <span>Cliente</span>
            <strong>{receivable.customerName || "-"}</strong>
          </div>
          <div>
            <span>Valor original</span>
            <strong>{currency(receivable.originalAmount)}</strong>
          </div>
          {receivable.parentReceivableId && (
            <div>
              <span>Valor da parcela</span>
              <strong>{currency(receivable.amount)}</strong>
            </div>
          )}
          <div>
            <span>Saldo</span>
            <strong>{currency(receivable.remainingBalance)}</strong>
          </div>
          <div>
            <span>Vencimento</span>
            <strong>{formatDate(receivable.dueDate, false)}</strong>
          </div>
          <div>
            <span>Recebimento</span>
            <strong>{formatDate(receivable.paymentDate, false)}</strong>
          </div>
          <div>
            <span>Forma</span>
            <strong>{receivable.paymentMethodName || "-"}</strong>
          </div>
          <div>
            <span>Frequência</span>
            <strong>{receivable.paymentFrequency || "-"}</strong>
          </div>
          <div>
            <span>Taxa</span>
            <strong>{currency(receivable.fee)}</strong>
          </div>
          <div>
            <span>Juros</span>
            <strong>{currency(receivable.lateInterest)}</strong>
          </div>
          <div>
            <span>Multa</span>
            <strong>{currency(receivable.lateFee)}</strong>
          </div>
          <div>
            <span>Desconto</span>
            <strong>{currency(receivable.discount)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{receivable.createdByName || "-"}</strong>
          </div>
          <div>
            <span>Criado em</span>
            <strong>{formatDate(receivable.createdAt, true)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{receivable.updatedByName || "-"}</strong>
          </div>
          <div>
            <span>Atualizado em</span>
            <strong>{formatDate(receivable.updatedAt, true)}</strong>
          </div>
          <div>
            <span>Recebido por</span>
            <strong>{receivable.paidByName || "-"}</strong>
          </div>
          <div className="wide">
            <span>Observação</span>
            <strong>{receivable.note || "-"}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
