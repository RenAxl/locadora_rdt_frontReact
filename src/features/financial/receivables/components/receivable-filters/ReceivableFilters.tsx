import { FormEvent, useEffect, useState } from "react";
import { Pagination } from "../../../../../core/models/Pagination";
import { CustomerDTO } from "../../../../organization/customers/dtos/customer-dto";
import { customerService } from "../../../../organization/customers/services/customer.service";
import { PaymentMethodDTO } from "../../../payment-methods/dtos/payment-method-dto";
import { paymentMethodService } from "../../../payment-methods/services/payment-method.service";
import { PaymentFrequencyDTO } from "../../../payment-frequencies/dtos/payment-frequency-dto";
import { paymentFrequencyService } from "../../../payment-frequencies/services/payment-frequency.service";
import { ReceivableFilters as ReceivableFilterModel } from "../../models/ReceivableFilters";
import {
  ReceivableQuickPeriodFilter,
  ReceivableQuickPeriodRange,
} from "../receivable-quick-period-filter/ReceivableQuickPeriodFilter";
import "./ReceivableFilters.css";

interface Props {
  onFilter: (filters: ReceivableFilterModel) => void;
  onClear: () => void;
}
const sortOptions = [
  { label: "Vencimento (mais próximo)", orderBy: "dueDate", direction: "ASC" },
  {
    label: "Vencimento (mais distante)",
    orderBy: "dueDate",
    direction: "DESC",
  },
  { label: "Maior valor", orderBy: "amount", direction: "DESC" },
  { label: "Menor valor", orderBy: "amount", direction: "ASC" },
  { label: "Mais recente", orderBy: "createdDate", direction: "DESC" },
  { label: "Mais antiga", orderBy: "createdDate", direction: "ASC" },
];
export function ReceivableFilters({ onFilter, onClear }: Props) {
  const [filters, setFilters] = useState(new ReceivableFilterModel());
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [paymentFrequencies, setPaymentFrequencies] = useState<
    PaymentFrequencyDTO[]
  >([]);
  const [selectedSort, setSelectedSort] = useState(0);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await customerService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setCustomers(response.content);
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    loadCustomers();
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
    const customerName = customerSearch.trim().toLowerCase();
    next.customerId = null;
    if (customerName !== "") {
      for (const record of customers) {
        if (record.name != null && record.name.toLowerCase() === customerName) {
          next.customerId = record.id ?? null;
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
    setFilters(new ReceivableFilterModel());
    setCustomerSearch("");
    setSelectedSort(0);
    onClear();
  };
  const onQuickPeriodChange = (period: ReceivableQuickPeriodRange) => {
    const next = {
      ...filters,
      startDate: period.startDate,
      endDate: period.endDate,
    };
    applyFilters(next);
  };

  return (
    <div className="receivable-filters-screen">
      <form className="receivable-filters" onSubmit={submit} noValidate>
        <div className="row g-3 receivable-form-inputs">
          <div className="col-12">
            <label className="form-label-custom" htmlFor="receivable-search">
              Busca
            </label>
            <input
              id="receivable-search"
              type="text"
              className="form-control"
              name="search"
              value={filters.search}
              onChange={(event) =>
                setFilters({ ...filters, search: event.target.value })
              }
              placeholder="Pesquisar descrição, cliente, referência ou número da conta"
            />
          </div>
          <div className="col-12">
            <ReceivableQuickPeriodFilter
              startDate={filters.startDate}
              endDate={filters.endDate}
              onPeriodChange={onQuickPeriodChange}
            />
          </div>
          <div className="col-12 col-lg-3">
            <label
              className="form-label-custom"
              htmlFor="receivable-period-type"
            >
              Tipo de Período
            </label>
            <select
              id="receivable-period-type"
              className="form-control"
              name="periodType"
              value={filters.periodType}
              onChange={(event) =>
                setFilters({ ...filters, periodType: event.target.value })
              }
            >
              <option value="DUE_DATE">Vencimento</option>
              <option value="PAYMENT_DATE">Recebimento</option>
              <option value="CREATED_DATE">Cadastro</option>
            </select>
          </div>
          <div className="col-12 col-lg-3">
            <label
              className="form-label-custom"
              htmlFor="receivable-start-date"
            >
              Data Inicial
            </label>
            <input
              id="receivable-start-date"
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
            <label className="form-label-custom" htmlFor="receivable-end-date">
              Data Final
            </label>
            <input
              id="receivable-end-date"
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
            <label className="form-label-custom" htmlFor="receivable-status">
              Status
            </label>
            <select
              id="receivable-status"
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
              <option value="PARTIALLY_PAID">Recebimento Parcial</option>
              <option value="CANCELED">Canceladas</option>
            </select>
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label-custom" htmlFor="receivable-customer">
              Cliente
            </label>
            <input
              id="receivable-customer"
              type="text"
              className="form-control"
              list="receivable-customers"
              name="customerSearch"
              value={customerSearch}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                setFilters({ ...filters, customerId: null });
              }}
            />
            <datalist id="receivable-customers">
              {customers.map((record) => (
                <option key={record.id} value={record.name} />
              ))}
            </datalist>
          </div>
          <div className="col-12 col-lg-3">
            <label
              className="form-label-custom"
              htmlFor="receivable-payment-method"
            >
              Forma de Recebimento
            </label>
            <select
              id="receivable-payment-method"
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
              htmlFor="receivable-payment-frequency"
            >
              Frequência
            </label>
            <select
              id="receivable-payment-frequency"
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
              htmlFor="receivable-minimum-amount"
            >
              Valor Inicial
            </label>
            <input
              id="receivable-minimum-amount"
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
              htmlFor="receivable-maximum-amount"
            >
              Valor Final
            </label>
            <input
              id="receivable-maximum-amount"
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
            <label className="form-label-custom" htmlFor="receivable-sort">
              Ordenação
            </label>
            <select
              id="receivable-sort"
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
        <div className="receivable-form-buttons mt-4">
          <button
            type="submit"
            className="btn btn-primary receivable-form-button"
          >
            FILTRAR
          </button>
          <button
            type="button"
            className="btn btn-outline-danger receivable-form-button"
            onClick={clearFilters}
          >
            LIMPAR
          </button>
        </div>
      </form>
    </div>
  );
}
