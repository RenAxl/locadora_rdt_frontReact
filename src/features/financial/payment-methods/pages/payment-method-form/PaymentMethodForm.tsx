import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { PaymentMethod } from "../../models/PaymentMethod";
import { PaymentMethodMapper } from "../../mappers/payment-method.mapper";
import { paymentMethodService } from "../../services/payment-method.service";
import "./PaymentMethodForm.css";

export function PaymentMethodForm() {
  const [paymentMethod, setPaymentMethod] = useState(new PaymentMethod());
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { paymentMethodId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!paymentMethodId) return;
      try {
        const data = await paymentMethodService.findById(paymentMethodId);
        setPaymentMethod(PaymentMethodMapper.toModel(data));
      } catch {}
    };
    load();
  }, [paymentMethodId]);

  const invalid =
    paymentMethod.name.length < 3 || paymentMethod.name.length > 60;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, fee: true });
    if (invalid || saving) return;
    setSaving(true);
    try {
      if (paymentMethod.id != null) {
        await paymentMethodService.update(
          PaymentMethodMapper.toUpdateDTO(paymentMethod),
        );
      } else {
        await paymentMethodService.insert(
          PaymentMethodMapper.toInsertDTO(paymentMethod),
        );
      }
      notificationService.add({
        severity: "success",
        detail: paymentMethodId
          ? "Forma de pagamento atualizada com sucesso!"
          : "Forma de pagamento cadastrada com sucesso!",
      });
      navigate("/payment-methods/");
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payment-method-form-screen">
      <div className="payment-method-form-container">
        <div className="payment-method-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados da Forma de Pagamento</h1>
            </div>
            <div className="row g-3 payment-method-form-inputs">
              <div className="col-12 col-lg-8">
                <label className="form-label-custom" htmlFor="name">
                  Nome *
                </label>
                <InputText
                  id="name"
                  name="name"
                  placeholder="Nome"
                  className="form-control"
                  required
                  minLength={3}
                  maxLength={60}
                  value={paymentMethod.name}
                  onChange={(event) =>
                    setPaymentMethod(
                      new PaymentMethod({
                        ...paymentMethod,
                        name: event.target.value,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, name: true })}
                />
                <Message
                  visible={touched.name && !paymentMethod.name}
                  text="Informe o nome da forma de pagamento"
                />
                <Message
                  visible={
                    touched.name &&
                    !!paymentMethod.name &&
                    paymentMethod.name.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${paymentMethod.name.length}`}
                />
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label-custom" htmlFor="fee">
                  Taxa
                </label>
                <InputNumber
                  inputId="fee"
                  name="fee"
                  placeholder="Taxa"
                  className="fee-input-host"
                  inputClassName="form-control"
                  min={0}
                  suffix="%"
                  locale="pt-BR"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  value={paymentMethod.fee}
                  onValueChange={(event) =>
                    setPaymentMethod(
                      new PaymentMethod({
                        ...paymentMethod,
                        fee: event.value ?? null,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, fee: true })}
                />
              </div>
            </div>
            <div className="payment-method-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary payment-method-form-button"
              >
                SALVAR
              </button>
              <Link to="/payment-methods/">
                <button
                  type="button"
                  className="btn btn-outline-danger payment-method-form-button"
                >
                  CANCELAR
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
