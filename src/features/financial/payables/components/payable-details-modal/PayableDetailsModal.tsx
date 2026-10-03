import { Dialog } from "primereact/dialog";
import { Payable } from "../../models/Payable";
import "./PayableDetailsModal.css";

interface Props {
  visible: boolean;
  payable: Payable | null;
  onHide: () => void;
}
export function PayableDetailsModal({ visible, payable, onHide }: Props) {
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
      className="payable-details-dialog"
      header="Detalhamento da Conta a Pagar"
      visible={visible}
      modal
      style={{ width: "720px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {payable ? (
        <div className="details-grid">
          <div>
            <span>Descrição</span>
            <strong>{payable.description || "-"}</strong>
          </div>
          <div>
            <span>Fornecedor</span>
            <strong>{payable.supplierName || "-"}</strong>
          </div>
          <div>
            <span>Funcionário</span>
            <strong>{payable.employeeName || "-"}</strong>
          </div>
          <div>
            <span>Valor original</span>
            <strong>{currency(payable.originalAmount)}</strong>
          </div>
          {payable.parentPayableId && (
            <div>
              <span>Valor da parcela</span>
              <strong>{currency(payable.amount)}</strong>
            </div>
          )}
          <div>
            <span>Saldo</span>
            <strong>{currency(payable.remainingBalance)}</strong>
          </div>
          <div>
            <span>Vencimento</span>
            <strong>{formatDate(payable.dueDate, false)}</strong>
          </div>
          <div>
            <span>Pagamento</span>
            <strong>{formatDate(payable.paymentDate, false)}</strong>
          </div>
          <div>
            <span>Forma</span>
            <strong>{payable.paymentMethodName || "-"}</strong>
          </div>
          <div>
            <span>Frequência</span>
            <strong>{payable.paymentFrequency || "-"}</strong>
          </div>
          <div>
            <span>Taxa</span>
            <strong>{currency(payable.fee)}</strong>
          </div>
          <div>
            <span>Juros</span>
            <strong>{currency(payable.lateInterest)}</strong>
          </div>
          <div>
            <span>Multa</span>
            <strong>{currency(payable.lateFee)}</strong>
          </div>
          <div>
            <span>Desconto</span>
            <strong>{currency(payable.discount)}</strong>
          </div>
          <div>
            <span>Criado por</span>
            <strong>{payable.createdByName || "-"}</strong>
          </div>
          <div>
            <span>Criado em</span>
            <strong>{formatDate(payable.createdAt, true)}</strong>
          </div>
          <div>
            <span>Atualizado por</span>
            <strong>{payable.updatedByName || "-"}</strong>
          </div>
          <div>
            <span>Atualizado em</span>
            <strong>{formatDate(payable.updatedAt, true)}</strong>
          </div>
          <div>
            <span>Pago por</span>
            <strong>{payable.paidByName || "-"}</strong>
          </div>
          <div className="wide">
            <span>Observação</span>
            <strong>{payable.note || "-"}</strong>
          </div>
        </div>
      ) : (
        <div className="empty">Carregando...</div>
      )}
    </Dialog>
  );
}
