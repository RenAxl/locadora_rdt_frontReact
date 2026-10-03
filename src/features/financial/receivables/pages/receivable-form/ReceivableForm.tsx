import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Pagination } from "../../../../../core/models/Pagination";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { CustomerDTO } from "../../../../organization/customers/dtos/customer-dto";
import { customerService } from "../../../../organization/customers/services/customer.service";
import { PaymentMethodDTO } from "../../../payment-methods/dtos/payment-method-dto";
import { paymentMethodService } from "../../../payment-methods/services/payment-method.service";
import { PaymentFrequencyDTO } from "../../../payment-frequencies/dtos/payment-frequency-dto";
import { paymentFrequencyService } from "../../../payment-frequencies/services/payment-frequency.service";
import { Receivable } from "../../models/Receivable";
import { ReceivableMapper } from "../../mappers/receivable.mapper";
import { receivableService } from "../../services/receivable.service";
import { receivableFileService } from "../../services/receivable-file.service";
import "./ReceivableForm.css";

export function ReceivableForm() {
  const [receivable, setReceivable] = useState(new Receivable());
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [paymentFrequencies, setPaymentFrequencies] = useState<
    PaymentFrequencyDTO[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { receivableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await customerService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setCustomers(response.content);
      } catch {}
    };
    loadCustomers();
    const loadMethods = async () => {
      try {
        const response = await paymentMethodService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setPaymentMethods(response.content);
      } catch {}
    };
    const loadFrequencies = async () => {
      try {
        const response = await paymentFrequencyService.list(
          new Pagination(0, 1000, "ASC", "frequency"),
          "",
        );
        setPaymentFrequencies(response.content);
      } catch {}
    };
    loadMethods();
    loadFrequencies();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!receivableId) return;
      try {
        const data = await receivableService.findById(receivableId);
        setReceivable(ReceivableMapper.toModel(data));
      } catch {}
    };
    load();
  }, [receivableId]);

  const invalid =
    receivable.description.length < 3 ||
    receivable.description.length > 120 ||
    receivable.amount == null ||
    Number(receivable.amount) < 0.01 ||
    !receivable.dueDate ||
    !receivable.customerId;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({
      description: true,
      amount: true,
      dueDate: true,
      customerId: true,
    });
    if (invalid || saving) return;
    setSaving(true);
    try {
      let saved = receivable;
      if (receivable.id != null) {
        await receivableService.update(
          ReceivableMapper.toUpdateDTO(receivable),
        );
      } else {
        const data = await receivableService.insert(
          ReceivableMapper.toInsertDTO(receivable),
        );
        saved = ReceivableMapper.toModel(data);
        setReceivable(saved);
      }
      if (saved.id != null && selectedFile != null) {
        try {
          await receivableFileService.upload(
            saved.id,
            selectedFile.name,
            selectedFile,
          );
        } catch {
          notificationService.add({
            severity: "warn",
            detail: receivableId
              ? "Conta atualizada, mas falhou ao enviar o arquivo."
              : "Conta cadastrada, mas falhou ao enviar o arquivo.",
          });
          navigate("/receivables/");
          return;
        }
      }
      notificationService.add({
        severity: "success",
        detail: receivableId
          ? "Conta atualizada com sucesso!"
          : "Conta cadastrada com sucesso!",
      });
      navigate("/receivables/");
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="receivable-form-screen">
      <div className="receivable-form-container">
        <div className="receivable-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados da Conta a Receber</h1>
            </div>
            <div className="row g-3 receivable-form-inputs">
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="description">
                  Descrição *
                </label>
                <InputText
                  id="description"
                  name="description"
                  placeholder="Descrição"
                  className="form-control"
                  required
                  minLength={3}
                  maxLength={120}
                  value={receivable.description}
                  onChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        description: event.target.value,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, description: true })}
                />
                <Message
                  visible={touched.description && !receivable.description}
                  text="Informe a descrição da conta"
                />
                <Message
                  visible={
                    touched.description &&
                    !!receivable.description &&
                    receivable.description.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${receivable.description.length}`}
                />
              </div>
              {receivable.parentReceivableId && (
                <div className="col-12 col-lg-3">
                  <label className="form-label-custom">Valor original</label>
                  <input
                    className="form-control"
                    readOnly
                    value={Number(
                      receivable.originalAmount ?? 0,
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  />
                </div>
              )}
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="amount">
                  {receivable.parentReceivableId ? "Valor da parcela" : "Valor"}{" "}
                  *
                </label>
                <InputNumber
                  inputId="amount"
                  name="amount"
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  className="receivable-amount-control receivable-amount-input"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  required
                  min={0.01}
                  value={receivable.amount ?? null}
                  onValueChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        amount: event.value ?? null,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, amount: true })}
                />
                <Message
                  visible={touched.amount && receivable.amount == null}
                  text="Informe o valor da conta"
                />
                <Message
                  visible={
                    touched.amount &&
                    receivable.amount != null &&
                    Number(receivable.amount) < 0.01
                  }
                  text="O valor deve ser maior que zero"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="customerId">
                  Cliente *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  className="form-control"
                  value={receivable.customerId ?? ""}
                  onChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        customerId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, customerId: true })}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
                <Message
                  visible={touched.customerId && !receivable.customerId}
                  text="Informe o cliente"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="dueDate">
                  Vencimento *
                </label>
                <input
                  id="dueDate"
                  type="date"
                  name="dueDate"
                  className="form-control"
                  required
                  value={receivable.dueDate ?? ""}
                  onChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        dueDate: event.target.value,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, dueDate: true })}
                />
                <Message
                  visible={touched.dueDate && !receivable.dueDate}
                  text="Informe o vencimento"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="paymentDate">
                  Recebido Em
                </label>
                <input
                  id="paymentDate"
                  type="date"
                  name="paymentDate"
                  className="form-control"
                  value={receivable.paymentDate ?? ""}
                  onChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        paymentDate: event.target.value || null,
                      }),
                    )
                  }
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="paymentMethodId">
                  Forma de recebimento
                </label>
                <select
                  id="paymentMethodId"
                  name="paymentMethodId"
                  className="form-control"
                  value={receivable.paymentMethodId ?? ""}
                  onChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        paymentMethodId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }),
                    )
                  }
                >
                  <option value="">Selecione uma forma de recebimento</option>
                  {paymentMethods.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-lg-3">
                <label
                  className="form-label-custom"
                  htmlFor="paymentFrequencyId"
                >
                  Frequência
                </label>
                <select
                  id="paymentFrequencyId"
                  name="paymentFrequencyId"
                  className="form-control"
                  value={receivable.paymentFrequencyId ?? ""}
                  onChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        paymentFrequencyId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }),
                    )
                  }
                >
                  <option value="">Selecione uma frequência</option>
                  {paymentFrequencies.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.frequency}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="note">
                  Observações
                </label>
                <InputTextarea
                  id="note"
                  name="note"
                  placeholder="Observações"
                  className="form-control"
                  rows={1}
                  value={receivable.note ?? ""}
                  onChange={(event) =>
                    setReceivable(
                      new Receivable({
                        ...receivable,
                        note: event.target.value,
                      }),
                    )
                  }
                />
              </div>
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="file">
                  Arquivo
                </label>
                <input
                  id="file"
                  type="file"
                  name="file"
                  className="form-control receivable-file-input"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    if (file)
                      setReceivable(
                        new Receivable({ ...receivable, fileName: file.name }),
                      );
                  }}
                />
              </div>
            </div>
            <div className="receivable-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary receivable-form-button"
              >
                SALVAR
              </button>
              <Link to="/receivables/">
                <button
                  type="button"
                  className="btn btn-outline-danger receivable-form-button"
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
