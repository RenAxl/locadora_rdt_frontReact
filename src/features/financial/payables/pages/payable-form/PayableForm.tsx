import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Pagination } from "../../../../../core/models/Pagination";
import { Message } from "../../../../../shared/components/message/Message";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { SupplierDTO } from "../../../../organization/suppliers/dtos/supplier-dto";
import { supplierService } from "../../../../organization/suppliers/services/supplier.service";
import { EmployeeDTO } from "../../../../organization/employees/dtos/employee-dto";
import { employeeService } from "../../../../organization/employees/services/employee.service";
import { PaymentMethodDTO } from "../../../payment-methods/dtos/payment-method-dto";
import { paymentMethodService } from "../../../payment-methods/services/payment-method.service";
import { PaymentFrequencyDTO } from "../../../payment-frequencies/dtos/payment-frequency-dto";
import { paymentFrequencyService } from "../../../payment-frequencies/services/payment-frequency.service";
import { Payable } from "../../models/Payable";
import { PayableMapper } from "../../mappers/payable.mapper";
import { payableService } from "../../services/payable.service";
import { payableFileService } from "../../services/payable-file.service";
import "./PayableForm.css";

export function PayableForm() {
  const [payable, setPayable] = useState(new Payable());
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [paymentFrequencies, setPaymentFrequencies] = useState<
    PaymentFrequencyDTO[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { payableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await supplierService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setSuppliers(response.content);
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    loadSuppliers();
    const loadEmployees = async () => {
      try {
        const response = await employeeService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setEmployees(response.content);
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    loadEmployees();
    const loadMethods = async () => {
      try {
        const response = await paymentMethodService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setPaymentMethods(response.content);
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    const loadFrequencies = async () => {
      try {
        const response = await paymentFrequencyService.list(
          new Pagination(0, 1000, "ASC", "frequency"),
          "",
        );
        setPaymentFrequencies(response.content);
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    loadMethods();
    loadFrequencies();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!payableId) return;
      try {
        const data = await payableService.findById(payableId);
        setPayable(PayableMapper.toModel(data));
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    load();
  }, [payableId]);

  const invalid =
    payable.description.length < 3 ||
    payable.description.length > 120 ||
    payable.amount == null ||
    Number(payable.amount) < 0.01 ||
    !payable.dueDate;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ description: true, amount: true, dueDate: true });
    if (invalid || saving) return;
    setSaving(true);
    try {
      let saved = payable;
      if (payable.id != null) {
        await payableService.update(PayableMapper.toUpdateDTO(payable));
      } else {
        const data = await payableService.insert(
          PayableMapper.toInsertDTO(payable),
        );
        saved = PayableMapper.toModel(data);
        setPayable(saved);
      }
      if (saved.id != null && selectedFile != null) {
        try {
          await payableFileService.upload(
            saved.id,
            selectedFile.name,
            selectedFile,
          );
        } catch {
          notificationService.add({
            severity: "warn",
            detail: payableId
              ? "Conta atualizada, mas falhou ao enviar o arquivo."
              : "Conta cadastrada, mas falhou ao enviar o arquivo.",
          });
          navigate("/payables/");
          return;
        }
      }
      notificationService.add({
        severity: "success",
        detail: payableId
          ? "Conta atualizada com sucesso!"
          : "Conta cadastrada com sucesso!",
      });
      navigate("/payables/");
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payable-form-screen">
      <div className="payable-form-container">
        <div className="payable-card">
          <form onSubmit={save} noValidate>
            <div className="col-12 mb-3">
              <h1>Dados da Conta a Pagar</h1>
            </div>
            <div className="row g-3 payable-form-inputs">
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
                  value={payable.description}
                  onChange={(event) =>
                    setPayable(
                      new Payable({
                        ...payable,
                        description: event.target.value,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, description: true })}
                />
                <Message
                  visible={touched.description && !payable.description}
                  text="Informe a descrição da conta"
                />
                <Message
                  visible={
                    touched.description &&
                    !!payable.description &&
                    payable.description.length < 3
                  }
                  text={`Mínimo de 3 caracteres. Você digitou apenas ${payable.description.length}`}
                />
              </div>
              {payable.parentPayableId && (
                <div className="col-12 col-lg-3">
                  <label className="form-label-custom">Valor original</label>
                  <input
                    className="form-control"
                    readOnly
                    value={Number(payable.originalAmount ?? 0).toLocaleString(
                      "pt-BR",
                      { style: "currency", currency: "BRL" },
                    )}
                  />
                </div>
              )}
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="amount">
                  {payable.parentPayableId ? "Valor da parcela" : "Valor"} *
                </label>
                <InputNumber
                  inputId="amount"
                  name="amount"
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  className="payable-amount-control payable-amount-input"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  required
                  min={0.01}
                  value={payable.amount ?? null}
                  onValueChange={(event) =>
                    setPayable(
                      new Payable({ ...payable, amount: event.value ?? null }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, amount: true })}
                />
                <Message
                  visible={touched.amount && payable.amount == null}
                  text="Informe o valor da conta"
                />
                <Message
                  visible={
                    touched.amount &&
                    payable.amount != null &&
                    Number(payable.amount) < 0.01
                  }
                  text="O valor deve ser maior que zero"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="supplierId">
                  Fornecedor
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  className="form-control"
                  value={payable.supplierId ?? ""}
                  onChange={(event) =>
                    setPayable(
                      new Payable({
                        ...payable,
                        supplierId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, supplierId: true })}
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="employeeId">
                  Funcionário
                </label>
                <select
                  id="employeeId"
                  name="employeeId"
                  className="form-control"
                  value={payable.employeeId ?? ""}
                  onChange={(event) =>
                    setPayable(
                      new Payable({
                        ...payable,
                        employeeId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, employeeId: true })}
                >
                  <option value="">Selecione um funcionário</option>
                  {employees.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
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
                  value={payable.dueDate ?? ""}
                  onChange={(event) =>
                    setPayable(
                      new Payable({ ...payable, dueDate: event.target.value }),
                    )
                  }
                  onBlur={() => setTouched({ ...touched, dueDate: true })}
                />
                <Message
                  visible={touched.dueDate && !payable.dueDate}
                  text="Informe o vencimento"
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="paymentDate">
                  Pago Em
                </label>
                <input
                  id="paymentDate"
                  type="date"
                  name="paymentDate"
                  className="form-control"
                  value={payable.paymentDate ?? ""}
                  onChange={(event) =>
                    setPayable(
                      new Payable({
                        ...payable,
                        paymentDate: event.target.value || null,
                      }),
                    )
                  }
                />
              </div>
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="paymentMethodId">
                  Forma Pgto
                </label>
                <select
                  id="paymentMethodId"
                  name="paymentMethodId"
                  className="form-control"
                  value={payable.paymentMethodId ?? ""}
                  onChange={(event) =>
                    setPayable(
                      new Payable({
                        ...payable,
                        paymentMethodId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }),
                    )
                  }
                >
                  <option value="">Selecione uma forma de pagamento</option>
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
                  value={payable.paymentFrequencyId ?? ""}
                  onChange={(event) =>
                    setPayable(
                      new Payable({
                        ...payable,
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
                  value={payable.note ?? ""}
                  onChange={(event) =>
                    setPayable(
                      new Payable({ ...payable, note: event.target.value }),
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
                  className="form-control payable-file-input"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    if (file)
                      setPayable(
                        new Payable({ ...payable, fileName: file.name }),
                      );
                  }}
                />
              </div>
            </div>
            <div className="payable-form-buttons mt-4">
              <button
                type="submit"
                disabled={invalid || saving}
                className="btn btn-primary payable-form-button"
              >
                SALVAR
              </button>
              <Link to="/payables/">
                <button
                  type="button"
                  className="btn btn-outline-danger payable-form-button"
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
