import { FormEvent, useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import "./ReceivablePaymentChargesModal.css";

interface Props {
  visible: boolean;
  lateFee: number;
  lateInterest: number;
  onHide: () => void;
  onConfirm: (lateFee: number, lateInterest: number) => void;
}
export function ReceivablePaymentChargesModal({
  visible,
  lateFee,
  lateInterest,
  onHide,
  onConfirm,
}: Props) {
  const [editedLateFee, setEditedLateFee] = useState<number | null>(0);
  const [editedLateInterest, setEditedLateInterest] = useState<number | null>(
    0,
  );
  useEffect(() => {
    if (!visible) return;
    setEditedLateFee(lateFee);
    setEditedLateInterest(lateInterest);
  }, [visible, lateFee, lateInterest]);
  const confirm = (event: FormEvent) => {
    event.preventDefault();
    if (Number(editedLateFee) < 0 || Number(editedLateInterest) < 0) return;
    const fee = Math.round(Number(editedLateFee ?? 0) * 100) / 100;
    const interest = Math.round(Number(editedLateInterest ?? 0) * 100) / 100;
    onConfirm(fee, interest);
  };
  return (
    <Dialog
      className="receivable-payment-charges-dialog"
      header="Editar multa e juros"
      visible={visible}
      modal
      style={{ width: "460px", maxWidth: "95vw" }}
      onHide={onHide}
    >
      <form onSubmit={confirm} noValidate>
        <div className="row g-3 receivable-form-inputs">
          <div className="col-12 col-lg-6">
            <label className="form-label-custom" htmlFor="editedLateFee">
              Multa
            </label>
            <InputNumber
              inputId="editedLateFee"
              name="editedLateFee"
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              className="receivable-amount-control receivable-amount-input"
              min={0}
              minFractionDigits={2}
              maxFractionDigits={2}
              value={editedLateFee}
              onValueChange={(event) => setEditedLateFee(event.value ?? null)}
            />
          </div>
          <div className="col-12 col-lg-6">
            <label className="form-label-custom" htmlFor="editedLateInterest">
              Juros
            </label>
            <InputNumber
              inputId="editedLateInterest"
              name="editedLateInterest"
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              className="receivable-amount-control receivable-amount-input"
              min={0}
              minFractionDigits={2}
              maxFractionDigits={2}
              value={editedLateInterest}
              onValueChange={(event) =>
                setEditedLateInterest(event.value ?? null)
              }
            />
          </div>
        </div>
        <div className="receivable-form-buttons mt-4">
          <button
            type="submit"
            className="btn btn-primary receivable-form-button"
            disabled={
              Number(editedLateFee) < 0 || Number(editedLateInterest) < 0
            }
          >
            CONTINUAR
          </button>
        </div>
      </form>
    </Dialog>
  );
}
