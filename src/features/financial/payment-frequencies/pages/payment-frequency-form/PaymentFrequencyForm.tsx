import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { PaymentFrequency } from "../../models/PaymentFrequency";
import { PaymentFrequencyMapper } from "../../mappers/payment-frequency.mapper";
import { paymentFrequencyService } from "../../services/payment-frequency.service";
import "./PaymentFrequencyForm.css";

export function PaymentFrequencyForm() {
  const [paymentFrequency, setPaymentFrequency] = useState(
    new PaymentFrequency(),
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { paymentFrequencyId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!paymentFrequencyId) return;
      try {
        const data = await paymentFrequencyService.findById(paymentFrequencyId);
        setPaymentFrequency(PaymentFrequencyMapper.toModel(data));
      } catch {}
    };
    load();
  }, [paymentFrequencyId]);

  const invalid =
    paymentFrequency.frequency.length < 3 ||
    paymentFrequency.frequency.length > 60 ||
    paymentFrequency.days == null ||
    paymentFrequency.days < 0;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ frequency: true, days: true });
    if (invalid || saving) return;
    setSaving(true);
    try {
      if (paymentFrequency.id != null) {
        await paymentFrequencyService.update(
          PaymentFrequencyMapper.toUpdateDTO(paymentFrequency),
        );
      } else {
        await paymentFrequencyService.insert(
          PaymentFrequencyMapper.toInsertDTO(paymentFrequency),
        );
      }
      notificationService.add({
        severity: "success",
        detail: paymentFrequencyId
          ? "Frequência de pagamento atualizada com sucesso!"
          : "Frequência de pagamento cadastrada com sucesso!",
      });
      navigate("/payment-frequencies/");
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payment-frequency-form-screen">
      <div className="payment-frequency-form-container">
        <div className="payment-frequency-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados da Frequência de Pagamento</h1>
            </div>
            <div className="row g-3 payment-frequency-form-inputs">
              <div className="col-12 col-lg-8">
                <label className="form-label-custom" htmlFor="frequency">
                  Frequência *
                </label>
                <InputText
                  id="frequency"
                  name="frequency"
                  placeholder="Frequência"
                  className="form-control"
                  required
                  minLength={3}
                  maxLength={60}
                  value={paymentFrequency.frequency}
                  onChange={(event) =>
                    setPaymentFrequency(
                      new PaymentFrequency({
                        ...paymentFrequency,
                        frequency: event.target.value,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, frequency: true })}
                />
                <Message
                  visible={touched.frequency && !paymentFrequency.frequency}
                  text="Informe a frequência de pagamento"
                />
                <Message
                  visible={
                    touched.frequency &&
                    !!paymentFrequency.frequency &&
                    paymentFrequency.frequency.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${paymentFrequency.frequency.length}`}
                />
              </div>
              <div className="col-12 col-lg-4">
                <label className="form-label-custom" htmlFor="days">
                  Dias *
                </label>
                <InputNumber
                  inputId="days"
                  name="days"
                  placeholder="Dias"
                  className="days-input-host"
                  inputClassName="form-control"
                  min={0}
                  useGrouping={false}
                  maxFractionDigits={0}
                  required
                  value={paymentFrequency.days}
                  onValueChange={(event) =>
                    setPaymentFrequency(
                      new PaymentFrequency({
                        ...paymentFrequency,
                        days: event.value ?? null,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, days: true })}
                />
                <Message
                  visible={touched.days && paymentFrequency.days == null}
                  text="Informe a quantidade de dias"
                />
              </div>
            </div>
            <div className="payment-frequency-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary payment-frequency-form-button"
              >
                SALVAR
              </button>
              <Link to="/payment-frequencies/">
                <button
                  type="button"
                  className="btn btn-outline-danger payment-frequency-form-button"
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
