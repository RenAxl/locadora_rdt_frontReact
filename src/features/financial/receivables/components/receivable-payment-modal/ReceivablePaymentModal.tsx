import { FormEvent, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Pagination } from "../../../../../core/models/Pagination";
import { Message } from "../../../../../shared/components/message/Message";
import { PaymentMethodDTO } from "../../../payment-methods/dtos/payment-method-dto";
import { paymentMethodService } from "../../../payment-methods/services/payment-method.service";
import { Receivable } from "../../models/Receivable";
import { ReceivablePaymentDTO } from "../../dtos/receivable-payment-dto";
import "./ReceivablePaymentModal.css";

interface Props {
  visible: boolean;
  receivable: Receivable | null;
  lateFee: number;
  lateInterest: number;
  saving: boolean;
  onHide: () => void;
  onPay: (payment: ReceivablePaymentDTO) => void;
}

export function ReceivablePaymentModal({
  visible,
  receivable,
  lateFee,
  lateInterest,
  saving,
  onHide,
  onPay,
}: Props) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  const roundMoney = (value: number) =>
    Math.round((Number(value ?? 0) + Number.EPSILON) * 100) / 100;
  const currency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const todayDateString = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  };

  const getOpenAmount = () => {
    if (receivable?.paid) return 0;
    const amount = Number(receivable?.amount ?? 0);
    let paidAmount = 0;
    if (receivable != null && (receivable.paid || receivable.paymentDate))
      paidAmount = Number(receivable.subtotal ?? 0);
    if (amount > 0 && paidAmount >= amount) return 0;
    if (amount > 0 && paidAmount > 0 && paidAmount < amount)
      return roundMoney(amount - paidAmount);
    const remaining = receivable?.remainingBalance;
    if (remaining != null && remaining > 0 && remaining < amount)
      return Number(remaining);
    return amount;
  };

  const isOverdue = () => {
    if (!receivable?.dueDate || receivable.paid || receivable.canceled)
      return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(receivable.dueDate + "T00:00:00");
    return dueDate.getTime() < today.getTime();
  };

  const getLateFee = () => {
    if (!isOverdue()) return 0;
    return roundMoney(lateFee);
  };
  const getLateInterest = () => {
    if (!isOverdue()) return 0;
    return roundMoney(lateInterest);
  };
  const getPaymentMethodFee = () => {
    for (const method of paymentMethods) {
      if (method.id === Number(paymentMethodId)) {
        const percent = Number(method.fee ?? 0);
        return roundMoney((getOpenAmount() * percent) / 100);
      }
    }
    return 0;
  };
  const getCurrentAmount = () =>
    roundMoney(
      getOpenAmount() +
        getPaymentMethodFee() +
        getLateFee() +
        getLateInterest(),
    );

  useEffect(() => {
    const load = async () => {
      try {
        const response = await paymentMethodService.list(
          new Pagination(0, 100, "ASC", "name"),
          "",
        );
        setPaymentMethods(response.content);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (!visible) return;
    setPaymentDate(todayDateString());
    setTouched(false);
    setPaymentMethodId(
      receivable?.paymentMethodId ?? paymentMethods[0]?.id ?? null,
    );
  }, [visible, receivable, paymentMethods]);

  useEffect(() => {
    if (visible) setPaymentAmount(getCurrentAmount());
  }, [
    visible,
    receivable,
    paymentMethodId,
    paymentMethods,
    lateFee,
    lateInterest,
  ]);

  const paidAmount = roundMoney(Number(paymentAmount ?? 0));
  const emptyAmount = paidAmount <= 0;
  const greaterAmount = paidAmount > getCurrentAmount();
  const invalid =
    !paymentMethodId || !paymentDate || emptyAmount || greaterAmount;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (invalid || saving) return;
    const payment = new ReceivablePaymentDTO({
      paymentAmount: paidAmount,
      paymentDate,
      paymentMethodId,
      subtotal: Number(receivable?.amount ?? 0),
      fee: getPaymentMethodFee(),
      lateInterest: getLateInterest(),
      lateFee: getLateFee(),
    });
    onPay(payment);
  };

  return (
    <Dialog
      className="receivable-payment-dialog"
      header="Baixar conta"
      visible={visible}
      modal
      style={{ width: "560px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      {receivable && (
        <form onSubmit={submit} noValidate>
          <div className="row g-3 receivable-form-inputs">
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Valor original</label>
              <input
                className="form-control"
                readOnly
                value={currency(
                  Number(receivable.originalAmount ?? receivable.amount ?? 0),
                )}
              />
            </div>
            {receivable.parentReceivableId && (
              <div className="col-12 col-lg-6">
                <label className="form-label-custom">Valor da parcela</label>
                <input
                  className="form-control"
                  readOnly
                  value={currency(Number(receivable.amount ?? 0))}
                />
              </div>
            )}
            <div className="col-12 col-lg-6">
              <label className="form-label-custom" htmlFor="payment-method">
                Forma de recebimento *
              </label>
              <select
                id="payment-method"
                name="paymentMethodId"
                className="form-control"
                required
                value={paymentMethodId ?? ""}
                onChange={(event) =>
                  setPaymentMethodId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                onBlur={() => setTouched(true)}
              >
                <option value="">Selecione</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              <Message
                visible={touched && !paymentMethodId}
                text="Informe a forma de recebimento"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom" htmlFor="payment-date">
                Data da baixa *
              </label>
              <input
                id="payment-date"
                name="paymentDate"
                className="form-control"
                type="date"
                required
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                onBlur={() => setTouched(true)}
              />
              <Message
                visible={touched && !paymentDate}
                text="Informe a data da baixa"
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">
                Multa <i className="pi pi-lock" aria-hidden="true" />
              </label>
              <input
                className="form-control receivable-readonly-input"
                readOnly
                title="Campo somente leitura"
                value={currency(getLateFee())}
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">
                Juros <i className="pi pi-lock" aria-hidden="true" />
              </label>
              <input
                className="form-control receivable-readonly-input"
                readOnly
                title="Campo somente leitura"
                value={currency(getLateInterest())}
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">
                Taxa da forma de pagamento{" "}
                <i className="pi pi-lock" aria-hidden="true" />
              </label>
              <input
                className="form-control receivable-readonly-input"
                readOnly
                title="Campo somente leitura"
                value={currency(getPaymentMethodFee())}
              />
            </div>
            <div className="col-12 col-lg-6">
              <label className="form-label-custom">Valor atual</label>
              <input
                className="form-control"
                readOnly
                value={currency(getCurrentAmount())}
              />
            </div>
            <div className="col-12">
              <label className="form-label-custom" htmlFor="payment-amount">
                Valor a receber *
              </label>
              <InputNumber
                inputId="payment-amount"
                name="paymentAmount"
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                className="receivable-amount-control receivable-amount-input"
                required
                min={0.01}
                minFractionDigits={2}
                maxFractionDigits={2}
                value={paymentAmount}
                onValueChange={(event) => setPaymentAmount(event.value ?? null)}
                onBlur={() => setTouched(true)}
              />
              <Message
                visible={touched && paymentAmount == null}
                text="Informe o valor a receber"
              />
              {greaterAmount && (
                <small className="text-danger">
                  O valor a ser recebido é maior que o Valor Atual.
                </small>
              )}
              {emptyAmount && (
                <small className="text-danger">
                  Informe um valor a receber maior que zero.
                </small>
              )}
            </div>
          </div>
          <div className="receivable-form-buttons mt-4">
            <button
              type="submit"
              className="btn btn-primary receivable-form-button"
              disabled={invalid || saving}
            >
              BAIXAR
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
