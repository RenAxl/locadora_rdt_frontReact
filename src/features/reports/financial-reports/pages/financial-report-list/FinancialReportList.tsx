import { useEffect, useState } from "react";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Pagination } from "../../../../../core/models/Pagination";
import { Customer } from "../../../../organization/customers/models/Customer";
import { CustomerMapper } from "../../../../organization/customers/mappers/customer.mapper";
import { customerService } from "../../../../organization/customers/services/customer.service";
import { Supplier } from "../../../../organization/suppliers/models/Supplier";
import { SupplierMapper } from "../../../../organization/suppliers/mappers/supplier.mapper";
import { supplierService } from "../../../../organization/suppliers/services/supplier.service";
import { Employee } from "../../../../organization/employees/models/Employee";
import { EmployeeMapper } from "../../../../organization/employees/mappers/employee.mapper";
import { employeeService } from "../../../../organization/employees/services/employee.service";
import { PaymentMethod } from "../../../../financial/payment-methods/models/PaymentMethod";
import { PaymentMethodMapper } from "../../../../financial/payment-methods/mappers/payment-method.mapper";
import { paymentMethodService } from "../../../../financial/payment-methods/services/payment-method.service";
import { FinancialReportMapper } from "../../mappers/financial-report.mapper";
import { FinancialReport } from "../../models/FinancialReport";
import { FinancialReportFilter } from "../../models/FinancialReportFilter";
import { FinancialReportOption } from "../../models/FinancialReportOption";
import { financialReportService } from "../../services/financial-report.service";
import "./FinancialReportList.css";

const reportOptions: FinancialReportOption[] = [
  {
    value: "receivables",
    label: "Contas a Receber",
    fileName: "contas-a-receber",
  },
  { value: "payables", label: "Contas a Pagar", fileName: "contas-a-pagar" },
  { value: "financial", label: "Financeiro", fileName: "financeiro" },
  {
    value: "summary-customer",
    label: "Sintético por Cliente",
    fileName: "sintetico-cliente",
  },
  {
    value: "summary-supplier",
    label: "Sintético por Fornecedor",
    fileName: "sintetico-fornecedor",
  },
  {
    value: "summary-employee",
    label: "Sintético por Funcionário",
    fileName: "sintetico-funcionario",
  },
  {
    value: "annual-balance",
    label: "Balanço Anual",
    fileName: "balanco-anual",
  },
];

export function FinancialReportList() {
  const [filters, setFilters] = useState(new FinancialReportFilter());
  const [selectedReportType, setSelectedReportType] = useState("receivables");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [comparison, setComparison] = useState(new FinancialReport());
  const canRead = authService.hasAuthority("FINANCIAL_REPORTS_READ");
  const showPeriodFilters = selectedReportType !== "annual-balance";
  const showAnnualFilter = selectedReportType === "annual-balance";
  const showStatusFilter = ["receivables", "payables", "financial"].includes(
    selectedReportType,
  );
  const showCustomerFilter = [
    "receivables",
    "financial",
    "summary-customer",
  ].includes(selectedReportType);
  const showSupplierFilter = [
    "payables",
    "financial",
    "summary-supplier",
  ].includes(selectedReportType);
  const showEmployeeFilter = [
    "payables",
    "financial",
    "summary-employee",
  ].includes(selectedReportType);

  const validateFilters = (
    values: FinancialReportFilter,
    reportType = selectedReportType,
  ) => {
    if (values.startDate && values.endDate && values.startDate > values.endDate)
      return "Data inicial não pode ser maior que a data final.";
    if (
      values.minimumAmount != null &&
      values.maximumAmount != null &&
      Number(values.minimumAmount) > Number(values.maximumAmount)
    )
      return "Valor inicial não pode ser maior que o valor final.";
    if (
      reportType === "annual-balance" &&
      (!values.year || Number(values.year) < 1900)
    )
      return "Informe um ano válido.";
    return null;
  };
  const loadComparison = async (
    values = filters,
    reportType = selectedReportType,
  ) => {
    const message = validateFilters(values, reportType);
    if (message != null) {
      notificationService.add({ severity: "warn", detail: message });
      return;
    }
    setChartLoading(true);
    try {
      const data = await financialReportService.comparison(
        FinancialReportMapper.toFilterDTO(values),
      );
      setComparison(FinancialReportMapper.toModel(data));
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setChartLoading(false);
    }
  };
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await customerService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setCustomers(CustomerMapper.toModelList(response.content));
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    loadCustomers();
    const loadSuppliers = async () => {
      try {
        const response = await supplierService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setSuppliers(SupplierMapper.toModelList(response.content));
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
        setEmployees(EmployeeMapper.toModelList(response.content));
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    loadEmployees();
    const loadPaymentMethods = async () => {
      try {
        const response = await paymentMethodService.list(
          new Pagination(0, 1000, "ASC", "name"),
          "",
        );
        setPaymentMethods(PaymentMethodMapper.toModelList(response.content));
      } catch {
        /* O interceptor exibe o erro. */
      }
    };
    loadPaymentMethods();
    loadComparison();
  }, []);

  const openPdf = (blob: Blob) => {
    const pdf = new Blob([blob], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(pdf);
    window.open(objectUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  };
  const download = (blob: Blob, fileName: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };
  const generate = async (format: "pdf" | "xlsx") => {
    if (!canRead || loading) return;
    const message = validateFilters(filters);
    if (message != null) {
      notificationService.add({ severity: "warn", detail: message });
      return;
    }
    let fileName = selectedReportType;
    for (const option of reportOptions) {
      if (option.value === selectedReportType) {
        fileName = option.fileName;
        break;
      }
    }
    setLoading(true);
    try {
      const dto = FinancialReportMapper.toFilterDTO(filters);
      const blob = await financialReportService.generate(
        selectedReportType,
        format,
        dto,
      );
      if (format === "pdf") openPdf(blob);
      else download(blob, `${fileName}.${format}`);
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setLoading(false);
    }
  };
  const clearFilters = () => {
    const values = new FinancialReportFilter();
    setSelectedReportType("receivables");
    setFilters(values);
    loadComparison(values, "receivables");
  };
  const chartYear = comparison.year || filters.year || new Date().getFullYear();
  let chartMaxValue = 0;
  for (const month of comparison.months) {
    if (month.receivableTotal > chartMaxValue)
      chartMaxValue = month.receivableTotal;
    if (month.payableTotal > chartMaxValue) chartMaxValue = month.payableTotal;
  }
  if (chartMaxValue <= 0) chartMaxValue = 100;
  else chartMaxValue = Math.ceil(chartMaxValue / 100) * 100;
  const chartColumnHeight = (value: number) => {
    if (chartMaxValue <= 0 || value <= 0) return "0%";
    let height = (value / chartMaxValue) * 100;
    if (height < 2) height = 2;
    return `${height}%`;
  };
  let balanceClass = "neutral";
  if (comparison.balance > 0) balanceClass = "positive";
  if (comparison.balance < 0) balanceClass = "negative";
  const currency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const chartTickValue = (multiplier: number) =>
    (chartMaxValue * multiplier).toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    });

  return (
    <div className="financial-report-list-screen">
      <div className="financial-report-list-container">
        <header className="module-page-header">
          <div>
            <span className="module-page-eyebrow">RELATÓRIOS</span>
            <h1>Relatórios financeiros</h1>
            <p>Gere e consulte os relatórios financeiros da locadora.</p>
          </div>
          <div className="module-page-header-icon">
            <i className="fa-solid fa-chart-line" />
          </div>
        </header>
        <form
          className="financial-report-card"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="row g-3 financial-report-form-inputs">
            <div className="col-12 col-lg-6">
              <label className="form-label-custom" htmlFor="report-type">
                Relatório
              </label>
              <select
                id="report-type"
                className="form-control"
                name="reportType"
                value={selectedReportType}
                onChange={(event) => setSelectedReportType(event.target.value)}
              >
                {reportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {showAnnualFilter && (
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="report-year">
                  Ano
                </label>
                <input
                  id="report-year"
                  type="number"
                  className="form-control"
                  name="year"
                  value={filters.year ?? ""}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      year: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                />
              </div>
            )}
            {showPeriodFilters && (
              <div className="col-12 col-lg-3">
                <label
                  className="form-label-custom"
                  htmlFor="report-period-type"
                >
                  Tipo de Período
                </label>
                <select
                  id="report-period-type"
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
            )}
            {showPeriodFilters && (
              <div className="col-12 col-lg-3">
                <label
                  className="form-label-custom"
                  htmlFor="report-start-date"
                >
                  Data Inicial
                </label>
                <input
                  id="report-start-date"
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
            )}
            {showPeriodFilters && (
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="report-end-date">
                  Data Final
                </label>
                <input
                  id="report-end-date"
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={filters.endDate ?? ""}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      endDate: event.target.value || null,
                    })
                  }
                />
              </div>
            )}
            {showStatusFilter && (
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="report-status">
                  Situação
                </label>
                <select
                  id="report-status"
                  className="form-control"
                  name="status"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters({ ...filters, status: event.target.value })
                  }
                >
                  <option value="ALL">Todas</option>
                  <option value="PENDING">Em Aberto</option>
                  <option value="PAID">Pago</option>
                  <option value="OVERDUE">Vencido</option>
                  <option value="PARTIALLY_PAID">Pago Parcialmente</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </div>
            )}
            {showPeriodFilters && (
              <div className="col-12 col-lg-6">
                <label className="form-label-custom" htmlFor="report-search">
                  Busca
                </label>
                <input
                  id="report-search"
                  type="text"
                  className="form-control"
                  name="search"
                  value={filters.search}
                  onChange={(event) =>
                    setFilters({ ...filters, search: event.target.value })
                  }
                  placeholder="Descrição, referência ou nome"
                />
              </div>
            )}
            {showCustomerFilter && (
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="report-customer">
                  Cliente
                </label>
                <select
                  id="report-customer"
                  className="form-control"
                  name="customerId"
                  value={filters.customerId ?? ""}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      customerId: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">Todos</option>
                  {customers.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showSupplierFilter && (
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="report-supplier">
                  Fornecedor
                </label>
                <select
                  id="report-supplier"
                  className="form-control"
                  name="supplierId"
                  value={filters.supplierId ?? ""}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      supplierId: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">Todos</option>
                  {suppliers.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showEmployeeFilter && (
              <div className="col-12 col-lg-3">
                <label className="form-label-custom" htmlFor="report-employee">
                  Funcionário
                </label>
                <select
                  id="report-employee"
                  className="form-control"
                  name="employeeId"
                  value={filters.employeeId ?? ""}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      employeeId: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">Todos</option>
                  {employees.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showPeriodFilters && (
              <div className="col-12 col-lg-3">
                <label
                  className="form-label-custom"
                  htmlFor="report-payment-method"
                >
                  Forma de Pagamento
                </label>
                <select
                  id="report-payment-method"
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
                  {paymentMethods.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showPeriodFilters && (
              <div className="col-12 col-lg-3">
                <label
                  className="form-label-custom"
                  htmlFor="report-minimum-amount"
                >
                  Valor Inicial
                </label>
                <input
                  id="report-minimum-amount"
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
            )}
            {showPeriodFilters && (
              <div className="col-12 col-lg-3">
                <label
                  className="form-label-custom"
                  htmlFor="report-maximum-amount"
                >
                  Valor Final
                </label>
                <input
                  id="report-maximum-amount"
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
            )}
          </div>
          {canRead && (
            <div className="financial-report-form-buttons mt-4">
              <button
                type="button"
                className="btn btn-primary financial-report-form-button"
                disabled={loading}
                onClick={() => generate("pdf")}
              >
                <i className="pi pi-file-pdf me-2" />
                GERAR PDF
              </button>
              <button
                type="button"
                className="btn btn-success financial-report-form-button"
                disabled={loading}
                onClick={() => generate("xlsx")}
              >
                <i className="pi pi-file-excel me-2" />
                GERAR EXCEL
              </button>
              <button
                type="button"
                className="btn btn-outline-danger financial-report-form-button"
                disabled={loading}
                onClick={clearFilters}
              >
                LIMPAR
              </button>
              <button
                type="button"
                className="btn btn-outline-primary financial-report-form-button"
                disabled={chartLoading}
                onClick={() => loadComparison()}
              >
                <i className="pi pi-chart-bar me-2" />
                ATUALIZAR GRÁFICO
              </button>
            </div>
          )}
        </form>
        <section className="financial-report-card">
          <div className="comparison-header">
            <div>
              <h2>Recebimentos / Despesas {chartYear}</h2>
            </div>
            {chartLoading && (
              <span className="loading-label">Carregando...</span>
            )}
          </div>
          <div className="comparison-summary">
            <div className="summary-item">
              <span>Contas à Receber</span>
              <strong>{currency(comparison.receivableTotal)}</strong>
              <small>{comparison.receivableCount} conta(s)</small>
            </div>
            <div className="summary-item">
              <span>Contas a Pagar</span>
              <strong>{currency(comparison.payableTotal)}</strong>
              <small>{comparison.payableCount} conta(s)</small>
            </div>
            <div className={`summary-item balance ${balanceClass}`}>
              <span>Saldo</span>
              <strong>{currency(comparison.balance)}</strong>
              <small>Receber - Pagar</small>
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-marker receivable" /> Contas à Receber
            </span>
            <span>
              <i className="legend-marker payable" /> Contas a Pagar
            </span>
          </div>
          <div
            className="monthly-chart"
            aria-label="Gráfico mensal de Recebimentos e Despesas"
          >
            <div className="chart-y-axis">
              <span>{chartTickValue(1)}</span>
              <span>{chartTickValue(0.75)}</span>
              <span>{chartTickValue(0.5)}</span>
              <span>{chartTickValue(0.25)}</span>
              <span>0</span>
            </div>
            <div className="chart-plot">
              <div className="grid-line line-100" />
              <div className="grid-line line-75" />
              <div className="grid-line line-50" />
              <div className="grid-line line-25" />
              <div className="grid-line line-0" />
              {comparison.months.map((month) => (
                <div key={month.month} className="month-group">
                  <div className="month-bars">
                    <div
                      className="month-column receivable"
                      style={{
                        height: chartColumnHeight(month.receivableTotal),
                      }}
                      title={
                        "Contas à Receber: " + currency(month.receivableTotal)
                      }
                    />
                    <div
                      className="month-column payable"
                      style={{ height: chartColumnHeight(month.payableTotal) }}
                      title={"Contas a Pagar: " + currency(month.payableTotal)}
                    />
                  </div>
                  <div className="month-label">{month.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
