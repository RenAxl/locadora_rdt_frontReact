import { FormEvent, useEffect, useState } from "react";
import { Pagination } from "../../../../../core/models/Pagination";
import { SupplierDTO } from "../../../../organization/suppliers/dtos/supplier-dto";
import { supplierService } from "../../../../organization/suppliers/services/supplier.service";
import { EmployeeDTO } from "../../../../organization/employees/dtos/employee-dto";
import { employeeService } from "../../../../organization/employees/services/employee.service";
import { PaymentMethodDTO } from "../../../payment-methods/dtos/payment-method-dto";
import { paymentMethodService } from "../../../payment-methods/services/payment-method.service";
import { PaymentFrequencyDTO } from "../../../payment-frequencies/dtos/payment-frequency-dto";
import { paymentFrequencyService } from "../../../payment-frequencies/services/payment-frequency.service";
import { PayableFilters as PayableFilterModel } from "../../models/PayableFilters";
import {
  PayableQuickPeriodFilter,
  PayableQuickPeriodRange,
} from "../payable-quick-period-filter/PayableQuickPeriodFilter";
import "./PayableFilters.css";

interface Props {
  onFilter: (filters: PayableFilterModel) => void;
  onClear: () => void;
}
const sortOptions = [
  { label: "Vencimento (mais próximo)", orderBy: "dueDate", direction: "ASC" },
  { label: "Vencimento (mais distante)", orderBy: "dueDate", direction: "DESC",},
  { label: "Maior valor", orderBy: "amount", direction: "DESC" },
  { label: "Menor valor", orderBy: "amount", direction: "ASC" },
  { label: "Mais recente", orderBy: "createdDate", direction: "DESC" },
  { label: "Mais antiga", orderBy: "createdDate", direction: "ASC" },
];
export function PayableFilters({ onFilter, onClear }: Props) {
  const [filters, setFilters] = useState(new PayableFilterModel());
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [paymentFrequencies, setPaymentFrequencies] = useState<
    PaymentFrequencyDTO[]
  >([]);
  const [selectedSort, setSelectedSort] = useState(0);

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

  const applyFilters = (values = filters) => {
    const next = { ...values };
    const sort = sortOptions[selectedSort];
    next.search = next.search.trim();
    next.orderBy = sort.orderBy;
    next.direction = sort.direction;
    const supplierName = supplierSearch.trim().toLowerCase();
    next.supplierId = null;
    if (supplierName !== "") {
      for (const record of suppliers) {
        if (record.name != null && record.name.toLowerCase() === supplierName) {
          next.supplierId = record.id ?? null;
          break;
        }
      }
    }
    const employeeName = employeeSearch.trim().toLowerCase();
    next.employeeId = null;
    if (employeeName !== "") {
      for (const record of employees) {
        if (record.name != null && record.name.toLowerCase() === employeeName) {
          next.employeeId = record.id ?? null;
          break;
        }
      }
    }
    setFilters(next);
    onFilter(next);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    applyFilters();
  };
  const clearFilters = () => {
    setFilters(new PayableFilterModel());
    setSupplierSearch("");
    setEmployeeSearch("");
    setSelectedSort(0);
    onClear();
  };
  const onQuickPeriodChange = (period: PayableQuickPeriodRange) => {
    const next = {
      ...filters,
      startDate: period.startDate,
      endDate: period.endDate,
    };
    applyFilters(next);
  };

  return (
    <div className="payable-filters-screen">
      <form className="payable-filters" onSubmit={submit} noValidate>
        <div className="row g-3 payable-form-inputs">
          <div className="col-12">
            <label className="form-label-custom" htmlFor="payable-search">
              Busca
            </label>
            <input
              id="payable-search"
              type="text"
              className="form-control"
              name="search"
              value={filters.search}
              onChange={(event) =>
                setFilters({ ...filters, search: event.target.value })
              }
              placeholder="Pesquisar descrição, fornecedor, funcionário, referência ou número da conta"
            />
          </div>
          <div className="col-12">
            <PayableQuickPeriodFilter
              startDate={filters.startDate}
              endDate={filters.endDate}
              onPeriodChange={onQuickPeriodChange}
            />
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="payable-period-type">
              Tipo de Período
            </label>
            <select
              id="payable-period-type"
              className="form-control"
              name="periodType"
              value={filters.periodType}
              onChange={(event) =>
                setFilters({ ...filters, periodType: event.target.value })
              }
            >
              <option value="DUE_DATE">Vencimento</option>
              <option value="PAYMENT_DATE">Pagamento</option>
              <option value="CREATED_DATE">Cadastro</option>
            </select>
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="payable-start-date">
              Data Inicial
            </label>
            <input
              id="payable-start-date"
              type="date"
              className="form-control"
              name="startDate"
              value={filters.startDate ?? ""}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  startDate: event.target.value || null,
                })
              }
            />
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="payable-end-date">
              Data Final
            </label>
            <input
              id="payable-end-date"
              type="date"
              className="form-control"
              name="endDate"
              value={filters.endDate ?? ""}
              onChange={(event) =>
                setFilters({ ...filters, endDate: event.target.value || null })
              }
            />
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="payable-status">
              Status
            </label>
            <select
              id="payable-status"
              className="form-control"
              name="status"
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value })
              }
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="PAID">Pagas</option>
              <option value="OVERDUE">Vencidas</option>
              <option value="PARTIALLY_PAID">Pagamento Parcial</option>
              <option value="CANCELED">Canceladas</option>
            </select>
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="payable-supplier">
              Fornecedor
            </label>
            <input
              id="payable-supplier"
              type="text"
              className="form-control"
              list="payable-suppliers"
              name="supplierSearch"
              value={supplierSearch}
              onChange={(event) => {
                setSupplierSearch(event.target.value);
                setFilters({ ...filters, supplierId: null });
              }}
            />
            <datalist id="payable-suppliers">
              {suppliers.map((record) => (
                <option key={record.id} value={record.name} />
              ))}
            </datalist>
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="payable-employee">
              Funcionário
            </label>
            <input
              id="payable-employee"
              type="text"
              className="form-control"
              list="payable-employees"
              name="employeeSearch"
              value={employeeSearch}
              onChange={(event) => {
                setEmployeeSearch(event.target.value);
                setFilters({ ...filters, employeeId: null });
              }}
            />
            <datalist id="payable-employees">
              {employees.map((record) => (
                <option key={record.id} value={record.name} />
              ))}
            </datalist>
          </div>
          <div className="col-12 col-lg-3">
            <label
              className="form-label-custom"
              htmlFor="payable-payment-method"
            >
              Forma de Pagamento
            </label>
            <select
              id="payable-payment-method"
              className="form-control"
              name="paymentMethodId"
              value={filters.paymentMethodId ?? ""}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  paymentMethodId: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            >
              <option value="">Todas</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-lg-3">
            <label
              className="form-label-custom"
              htmlFor="payable-payment-frequency"
            >
              Frequência
            </label>
            <select
              id="payable-payment-frequency"
              className="form-control"
              name="paymentFrequencyId"
              value={filters.paymentFrequencyId ?? ""}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  paymentFrequencyId: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            >
              <option value="">Todas</option>
              {paymentFrequencies.map((frequency) => (
                <option key={frequency.id} value={frequency.id}>
                  {frequency.frequency}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-lg-3">
            <label
              className="form-label-custom"
              htmlFor="payable-minimum-amount"
            >
              Valor Inicial
            </label>
            <input
              id="payable-minimum-amount"
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              name="minimumAmount"
              value={filters.minimumAmount ?? ""}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  minimumAmount: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </div>
          <div className="col-12 col-lg-3">
            <label
              className="form-label-custom"
              htmlFor="payable-maximum-amount"
            >
              Valor Final
            </label>
            <input
              id="payable-maximum-amount"
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              name="maximumAmount"
              value={filters.maximumAmount ?? ""}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  maximumAmount: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="payable-sort">
              Ordenação
            </label>
            <select
              id="payable-sort"
              className="form-control"
              name="sort"
              value={selectedSort}
              onChange={(event) => setSelectedSort(Number(event.target.value))}
            >
              {sortOptions.map((option, index) => (
                <option key={index} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="payable-form-buttons mt-4">
          <button type="submit" className="btn btn-primary payable-form-button">
            FILTRAR
          </button>
          <button
            type="button"
            className="btn btn-outline-danger payable-form-button"
            onClick={clearFilters}
          >
            LIMPAR
          </button>
        </div>
      </form>
    </div>
  );
}
