import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { confirmDialog } from "primereact/confirmdialog";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Pagination } from "../../../../../core/models/Pagination";
import { FieldCustomization } from "../../../../../shared/components/field-customization/FieldCustomization";
import { ExcelExport } from "../../../../../shared/components/excel-export/ExcelExport";
import { CustomizableField } from "../../../../../shared/models/customizable-field";
import { Receivable } from "../../models/Receivable";
import { ReceivableFilters as ReceivableFilterModel } from "../../models/ReceivableFilters";
import { ReceivablePaymentDTO } from "../../dtos/receivable-payment-dto";
import { ReceivableMapper } from "../../mappers/receivable.mapper";
import { receivableService } from "../../services/receivable.service";
import { ReceivableDetailsModal } from "../../components/receivable-details-modal/ReceivableDetailsModal";
import { ReceivableFilesModal } from "../../components/receivable-files-modal/ReceivableFilesModal";
import { ReceivableOverdueModal } from "../../components/receivable-overdue-modal/ReceivableOverdueModal";
import { ReceivablePaymentChoiceModal } from "../../components/receivable-payment-choice-modal/ReceivablePaymentChoiceModal";
import { ReceivablePaymentChargesModal } from "../../components/receivable-payment-charges-modal/ReceivablePaymentChargesModal";
import { ReceivablePaymentModal } from "../../components/receivable-payment-modal/ReceivablePaymentModal";
import { ReceivableFilters } from "../../components/receivable-filters/ReceivableFilters";
import "./ReceivableList.css";

const defaultVisibleFields: string[] = [
  "description",
  "customerName",
  "originalAmount",
  "paymentMethodName",
  "paymentFrequency",
  "status",
  "currentAmountWithLateCharges",
  "subtotal",
  "dueDate",
  "paymentDate",
  "remainingBalance",
  "fee",
  "lateInterest",
  "lateFee",
  "discount",
  "createdByName",
  "createdAt",
  "updatedByName",
  "updatedAt",
  "paidByName",
  "note",
];
const availableFields: CustomizableField[] = [
  { field: "description", label: "Descrição" },
  { field: "customerName", label: "Cliente" },
  { field: "paymentMethodName", label: "Forma de recebimento" },
  { field: "paymentFrequency", label: "Frequência" },
  { field: "status", label: "Situação" },
  { field: "originalAmount", label: "Valor original" },
  { field: "currentAmountWithLateCharges", label: "Valor atual" },
  { field: "subtotal", label: "Valor recebido" },
  { field: "dueDate", label: "Vencimento" },
  { field: "paymentDate", label: "Recebimento" },
  { field: "remainingBalance", label: "Saldo" },
  { field: "fee", label: "Taxa" },
  { field: "lateInterest", label: "Juros" },
  { field: "lateFee", label: "Multa" },
  { field: "discount", label: "Desconto" },
  { field: "createdByName", label: "Criado por" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedByName", label: "Atualizado por" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "paidByName", label: "Recebido por" },
  { field: "note", label: "Observação" },
];

export function ReceivableList() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [pagination, setPagination] = useState(
    new Pagination(0, 10, "ASC", "dueDate"),
  );
  const [filters, setFilters] = useState(new ReceivableFilterModel());
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] =
    useState<string[]>(loadVisibleFields);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<Receivable | null>(null);
  const [filesVisible, setFilesVisible] = useState(false);
  const [filesAccount, setFilesAccount] = useState<Receivable | null>(null);
  const [overdueVisible, setOverdueVisible] = useState(false);
  const [overdue, setOverdue] = useState<Receivable | null>(null);
  const [paymentChoiceVisible, setPaymentChoiceVisible] = useState(false);
  const [paymentChargesVisible, setPaymentChargesVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState<Receivable | null>(null);
  const [paymentCharges, setPaymentCharges] = useState({
    lateFee: 0,
    lateInterest: 0,
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const canRead = authService.hasAuthority("RECEIVABLE_READ");
  const canWrite = authService.hasAuthority("RECEIVABLE_WRITE");
  const canDelete = authService.hasAuthority("RECEIVABLE_DELETE");

  function getReceivableOpenAmount(receivable: Receivable): number {
    if (receivable.paid) {
      return 0;
    }

    const amount = Number(receivable.amount ?? 0);
    let paidAmount = 0;

    if (receivable.paid || receivable.paymentDate) {
      paidAmount = Number(receivable.subtotal ?? 0);
    }

    if (amount > 0 && paidAmount >= amount) {
      return 0;
    }

    if (amount > 0 && paidAmount > 0 && paidAmount < amount) {
      return Math.round((amount - paidAmount) * 100) / 100;
    }

    const remaining = receivable.remainingBalance;

    if (remaining != null && remaining > 0 && remaining < amount) {
      return Number(remaining);
    }

    return amount;
  }

  function isPartiallyPaid(receivable: Receivable): boolean {
    if (receivable.paid || receivable.canceled) {
      return false;
    }

    const amount = Number(receivable.amount ?? 0);
    const remaining = receivable.remainingBalance;
    let paidAmount = 0;

    if (receivable.paid || receivable.paymentDate) {
      paidAmount = Number(receivable.subtotal ?? 0);
    }

    if (amount <= 0) {
      return false;
    }

    if (paidAmount > 0 && paidAmount < amount) {
      return true;
    }

    if (remaining != null && remaining > 0 && remaining < amount) {
      return true;
    }

    return false;
  }

  function getPaidAmount(receivable: Receivable): number {
    const amount = Number(receivable.amount ?? 0);

    if (receivable.paid) {
      return Number(
        receivable.currentAmountWithLateCharges ??
          receivable.subtotal ??
          amount,
      );
    }

    if (
      (receivable.paid || receivable.paymentDate) &&
      receivable.subtotal != null &&
      receivable.subtotal > 0
    ) {
      if (amount > 0) {
        return Math.min(Number(receivable.subtotal), amount);
      }

      return Number(receivable.subtotal);
    }

    if (isPartiallyPaid(receivable)) {
      return amount - getReceivableOpenAmount(receivable);
    }

    return 0;
  }

  function getCurrentAmount(receivable: Receivable): number {
    if (receivable.paid) {
      return getPaidAmount(receivable);
    }

    return Number(
      receivable.currentAmountWithLateCharges ??
        getReceivableOpenAmount(receivable),
    );
  }

  function getStatusLabel(receivable: Receivable): string {
    if (receivable.canceled) {
      return "Cancelada";
    }

    if (isPartiallyPaid(receivable)) {
      return "Pago Parcialmente";
    }

    if (receivable.paid) {
      return "Pago";
    }

    return "Pendente";
  }

  function isOverdueOpenReceivable(receivable: Receivable): boolean {
    if (receivable.paid || receivable.canceled || !receivable.dueDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(receivable.dueDate + "T00:00:00");
    dueDate.setHours(0, 0, 0, 0);

    return (
      dueDate.getTime() < today.getTime() &&
      getReceivableOpenAmount(receivable) > 0
    );
  }

  function loadVisibleFields(): string[] {
    let savedFields = localStorage.getItem("receivable-visible-fields");
    let legacyFields = false;

    if (savedFields == null) {
      savedFields = localStorage.getItem("receivable-card-visible-fields");
      legacyFields = true;
    }

    if (savedFields == null) {
      return defaultVisibleFields;
    }

    try {
      const fields = JSON.parse(savedFields);

      if (!Array.isArray(fields)) {
        return defaultVisibleFields;
      }

      const visibleFields: string[] = [];

      if (legacyFields) {
        visibleFields.push(
          "description",
          "customerName",
          "paymentMethodName",
          "paymentFrequency",
          "status",
        );
      }

      for (let field of fields) {
        if (field === "amount") {
          field = "originalAmount";
        }

        if (field === "currentAmount") {
          field = "currentAmountWithLateCharges";
        }

        if (field === "paidAmount") {
          field = "subtotal";
        }

        if (field === "balance") {
          field = "remainingBalance";
        }

        if (field === "createdBy") {
          field = "createdByName";
        }

        if (field === "updatedBy") {
          field = "updatedByName";
        }

        if (field === "paidBy") {
          field = "paidByName";
        }

        for (const column of availableFields) {
          if (column.field === field && !visibleFields.includes(field)) {
            visibleFields.push(field);
          }
        }
      }

      if (visibleFields.length > 0) {
        return visibleFields;
      }
    } catch {
      return defaultVisibleFields;
    }
    return defaultVisibleFields;
  }

  const list = async (next: Pagination, values = filters) => {
    setLoading(true);
    try {
      const data = await receivableService.list(next, values);
      const records = ReceivableMapper.toModelList(data.content);
      for (const record of records) record.status = getStatusLabel(record);
      setReceivables(records);
      setTotalElements(data.totalElements);
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    list(new Pagination(0, 10, "ASC", "dueDate"));
  }, []);

  const changePage = (event: PaginatorPageChangeEvent) => {
    const next = new Pagination(
      event.page,
      event.rows,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next);
  };
  const applyFilters = (values: ReceivableFilterModel) => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      values.direction || pagination.direction,
      values.orderBy || pagination.orderBy,
    );
    setFilters(values);
    setPagination(next);
    list(next, values);
  };
  const clearFilters = () => {
    const values = new ReceivableFilterModel();
    const next = new Pagination(0, pagination.linesPerPage, "ASC", "dueDate");
    setFilters(values);
    setPagination(next);
    list(next, values);
  };
  const deleteAccount = (record: Receivable) => {
    if (!record.id || !canDelete) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await receivableService.delete(record.id!);
          const next = new Pagination(
            pagination.page,
            pagination.linesPerPage,
            pagination.direction,
            pagination.orderBy,
          );
          setPagination(next);
          list(next);
          notificationService.add({
            severity: "success",
            detail: "Conta excluída com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        }
      },
    });
  };
  const openDetails = async (record: Receivable) => {
    if (!record.id || !canRead) return;
    setDetails(null);
    setDetailsVisible(true);
    try {
      setDetails(
        ReceivableMapper.toModel(await receivableService.findById(record.id)),
      );
    } catch {
      setDetailsVisible(false);
    }
  };
  const pay = (record: Receivable) => {
    if (!record.id || !canWrite || record.paid || record.canceled) return;
    if (getReceivableOpenAmount(record) <= 0) {
      notificationService.add({
        severity: "warn",
        detail: "Esta conta não possui saldo para baixa.",
      });
      return;
    }
    setPaymentAccount(record);
    setPaymentCharges({
      lateFee: Number(record.calculatedLateFee ?? 0),
      lateInterest: Number(record.calculatedLateInterest ?? 0),
    });
    if (isOverdueOpenReceivable(record)) setPaymentChoiceVisible(true);
    else setPaymentVisible(true);
  };
  const useDefaultPaymentCharges = () => {
    if (!paymentAccount) return;
    setPaymentCharges({
      lateFee: Number(paymentAccount.calculatedLateFee ?? 0),
      lateInterest: Number(paymentAccount.calculatedLateInterest ?? 0),
    });
    setPaymentChoiceVisible(false);
    setPaymentVisible(true);
  };
  const editPaymentCharges = () => {
    if (!paymentAccount || !isOverdueOpenReceivable(paymentAccount)) return;
    setPaymentChoiceVisible(false);
    setPaymentChargesVisible(true);
  };
  const finishPaymentChargesEdit = (lateFee: number, lateInterest: number) => {
    if (!paymentAccount || !isOverdueOpenReceivable(paymentAccount)) return;
    setPaymentCharges({ lateFee, lateInterest });
    setPaymentChargesVisible(false);
    setPaymentVisible(true);
  };
  const submitPayment = async (dto: ReceivablePaymentDTO) => {
    if (!paymentAccount?.id || !canWrite || savingPayment) return;
    setSavingPayment(true);
    try {
      await receivableService.pay(paymentAccount.id, dto);
      setPaymentVisible(false);
      setPaymentAccount(null);
      list(pagination);
      notificationService.add({
        severity: "success",
        detail: "Baixa registrada!",
      });
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setSavingPayment(false);
    }
  };
  const generateReceipt = async (record: Receivable) => {
    if (!record.id || !canRead) return;
    try {
      const pdf = await receivableService.receipt(record.id);
      const blob = new Blob([pdf], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      /* O interceptor exibe o erro. */
    }
  };
  const generateFiscalCoupon = async (record: Receivable) => {
    if (!record.id || !canRead) return;
    try {
      const pdf = await receivableService.fiscalCoupon(record.id);
      const blob = new Blob([pdf], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      /* O interceptor exibe o erro. */
    }
  };

  const applyVisibleFields = (fields: string[]) => {
    setVisibleFields([...fields]);
    localStorage.setItem("receivable-visible-fields", JSON.stringify(fields));
  };
  const loadRecordsForExport = async (next: Pagination) => {
    const data = await receivableService.list(next, filters);
    const records = ReceivableMapper.toModelList(data.content);
    for (const record of records) {
      record.status = getStatusLabel(record);
      record.subtotal = getPaidAmount(record);
      record.remainingBalance = getReceivableOpenAmount(record);
      record.currentAmountWithLateCharges = getCurrentAmount(record);
    }
    return { content: records, totalElements: data.totalElements };
  };
  const currency = (value?: number | null) => {
    if (value == null) return "";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  const formatDate = (value?: Date | string | null) => {
    if (!value) return "-";
    let date = new Date(value);
    if (typeof value === "string" && value.length === 10)
      date = new Date(value + "T00:00:00");
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  return (
    <div className="receivable-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">FINANCEIRO</span>
          <h1>Contas a receber</h1>
          <p>Consulte e gerencie as contas a receber.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-file-invoice-dollar" />
        </div>
      </header>
      <div className="receivable-filter-container">
        <div className="receivable-actions-group">
          {canWrite && (
            <Link to="/receivables/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVA CONTA
              </button>
            </Link>
          )}
        </div>
      </div>
      <ReceivableFilters onFilter={applyFilters} onClear={clearFilters} />
      <section
        className="receivable-list"
        aria-label="Contas a receber"
        aria-busy={loading}
      >
        <div className="receivable-list-toolbar">
          <span>{totalElements} conta(s) encontrada(s)</span>
          <div className="receivable-list-tools">
            <Button
              type="button"
              className="p-button-rounded p-button-text"
              icon="pi pi-cog"
              aria-label="Personalizar campos dos cards"
              tooltip="Personalizar campos"
              onClick={() => setCustomizationVisible(true)}
            />
            <ExcelExport
              title="Contas a receber"
              fileName="contas-a-receber"
              fields={availableFields.filter((field) =>
                visibleFields.includes(field.field),
              )}
              pagination={pagination}
              totalRecords={totalElements}
              loadRecords={loadRecordsForExport}
            />
          </div>
        </div>
        {loading && (
          <p className="receivable-list-message" role="status">
            Carregando contas...
          </p>
        )}
        {!loading && receivables.length === 0 && (
          <p className="receivable-list-message">Nenhuma conta encontrada.</p>
        )}
        {!loading && receivables.length > 0 && (
          <div className="receivable-cards">
            {receivables.map((receivable) => (
              <article
                key={receivable.id}
                className={`receivable-card${receivable.paid && !receivable.canceled ? " receivable-card-paid" : ""}${isPartiallyPaid(receivable) ? " receivable-card-partial" : ""}${receivable.canceled ? " receivable-card-canceled" : ""}`}
              >
                <div className="receivable-main">
                  <header className="receivable-card-header">
                    <div className="receivable-title">
                      <span className="receivable-id">#{receivable.id}</span>
                      {visibleFields.includes("description") && (
                        <h2>
                          {receivable.description ||
                            receivable.customerName ||
                            "-"}
                        </h2>
                      )}
                    </div>
                    {visibleFields.includes("status") && (
                      <span
                        className={`receivable-status${receivable.paid && !receivable.canceled ? " receivable-status-paid" : ""}${isPartiallyPaid(receivable) ? " receivable-status-partial" : ""}${receivable.canceled ? " receivable-status-canceled" : ""}`}
                      >
                        {receivable.status}
                      </span>
                    )}
                  </header>
                  <div className="receivable-meta">
                    {visibleFields.includes("customerName") && (
                      <span>
                        <i className="fa-solid fa-user" aria-hidden="true" />
                        {receivable.customerName || "Sem cliente"}
                      </span>
                    )}
                    {visibleFields.includes("paymentMethodName") && (
                      <span>
                        <i
                          className="fa-solid fa-credit-card"
                          aria-hidden="true"
                        />
                        {receivable.paymentMethodName || "Sem forma"}
                      </span>
                    )}
                    {visibleFields.includes("paymentFrequency") && (
                      <span>
                        <i className="fa-solid fa-repeat" aria-hidden="true" />
                        {receivable.paymentFrequency || "Sem frequência"}
                      </span>
                    )}
                    {receivable.residual && (
                      <span>Resíduo de #{receivable.parentReceivableId}</span>
                    )}
                  </div>
                </div>
                <dl className="receivable-card-fields">
                  {visibleFields.includes("originalAmount") && (
                    <div className="amount">
                      <dt>Valor original</dt>
                      <dd>{currency(receivable.originalAmount)}</dd>
                    </div>
                  )}
                  {receivable.parentReceivableId &&
                    visibleFields.includes("originalAmount") && (
                      <div>
                        <dt>Valor da parcela</dt>
                        <dd>{currency(receivable.amount)}</dd>
                      </div>
                    )}
                  {visibleFields.includes("currentAmountWithLateCharges") && (
                    <div className="current-amount">
                      <dt>Valor atual</dt>
                      <dd>{currency(getCurrentAmount(receivable))}</dd>
                    </div>
                  )}
                  {visibleFields.includes("subtotal") && (
                    <div className="paid-amount">
                      <dt>Valor recebido</dt>
                      <dd>{currency(getPaidAmount(receivable))}</dd>
                    </div>
                  )}
                  {visibleFields.includes("remainingBalance") && (
                    <div>
                      <dt>Saldo</dt>
                      <dd>{currency(getReceivableOpenAmount(receivable))}</dd>
                    </div>
                  )}
                  {visibleFields.includes("dueDate") && (
                    <div>
                      <dt>Vencimento</dt>
                      <dd>
                        {isOverdueOpenReceivable(receivable) ? (
                          <button
                            type="button"
                            className="due-date-button"
                            title="Ver juros e multa"
                            onClick={() => {
                              setOverdue(receivable);
                              setOverdueVisible(true);
                            }}
                          >
                            {formatDate(receivable.dueDate)}
                          </button>
                        ) : (
                          formatDate(receivable.dueDate)
                        )}
                      </dd>
                    </div>
                  )}
                  {visibleFields.includes("paymentDate") && (
                    <div>
                      <dt>Recebimento</dt>
                      <dd>{formatDate(receivable.paymentDate)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("fee") && (
                    <div>
                      <dt>Taxa</dt>
                      <dd>{currency(receivable.fee)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("lateInterest") && (
                    <div>
                      <dt>Juros</dt>
                      <dd>{currency(receivable.lateInterest)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("lateFee") && (
                    <div>
                      <dt>Multa</dt>
                      <dd>{currency(receivable.lateFee)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("discount") && (
                    <div>
                      <dt>Desconto</dt>
                      <dd>{currency(receivable.discount)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("createdByName") && (
                    <div>
                      <dt>Criado por</dt>
                      <dd>{receivable.createdByName || "-"}</dd>
                    </div>
                  )}
                  {visibleFields.includes("createdAt") && (
                    <div>
                      <dt>Data cadastro</dt>
                      <dd>{formatDate(receivable.createdAt)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("updatedByName") && (
                    <div>
                      <dt>Atualizado por</dt>
                      <dd>{receivable.updatedByName || "-"}</dd>
                    </div>
                  )}
                  {visibleFields.includes("updatedAt") && (
                    <div>
                      <dt>Data atualização</dt>
                      <dd>{formatDate(receivable.updatedAt)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("paidByName") && (
                    <div>
                      <dt>Recebido por</dt>
                      <dd>{receivable.paidByName || "-"}</dd>
                    </div>
                  )}
                  {visibleFields.includes("note") && (
                    <div className="note">
                      <dt>Observação</dt>
                      <dd>{receivable.note || "-"}</dd>
                    </div>
                  )}
                </dl>
                <footer className="receivable-card-footer">
                  <div className="actions-wrap">
                    {canWrite && !receivable.paid && !receivable.canceled && (
                      <Link to={`/receivables/${receivable.id}/edit`}>
                        <Button
                          className="p-button-rounded p-button-text"
                          icon="pi pi-pencil"
                          aria-label="Atualizar conta"
                          tooltip="Atualizar conta"
                        />
                      </Link>
                    )}
                    {canWrite && !receivable.paid && !receivable.canceled && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text p-button-success"
                        icon="pi pi-check-circle"
                        aria-label="Baixar conta total ou parcial"
                        tooltip="Baixar conta total ou parcial"
                        onClick={() => pay(receivable)}
                      />
                    )}
                    {canRead && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text"
                        icon="pi pi-eye"
                        aria-label="Detalhamento da conta"
                        tooltip="Detalhamento da Conta"
                        onClick={() => openDetails(receivable)}
                      />
                    )}
                    {canRead && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text"
                        icon="pi pi-folder-open"
                        aria-label="Arquivos da conta"
                        tooltip="Arquivos da Conta"
                        onClick={() => {
                          setFilesAccount(receivable);
                          setFilesVisible(true);
                        }}
                      />
                    )}
                    {canRead && receivable.paid && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text"
                        icon="pi pi-file"
                        aria-label="Recibo"
                        tooltip="Recibo"
                        onClick={() => generateReceipt(receivable)}
                      />
                    )}
                    {canRead && receivable.paid && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text"
                        icon="pi pi-print"
                        aria-label="Cupom fiscal"
                        tooltip="Cupom fiscal"
                        onClick={() => generateFiscalCoupon(receivable)}
                      />
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-trash"
                        aria-label="Excluir conta"
                        tooltip="Excluir conta"
                        onClick={() => deleteAccount(receivable)}
                      />
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}
        <Paginator
          first={pagination.page * pagination.linesPerPage}
          rows={pagination.linesPerPage}
          totalRecords={totalElements}
          rowsPerPageOptions={[5, 10, 20]}
          onPageChange={changePage}
        />
      </section>
      <FieldCustomization
        visible={customizationVisible}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="contas a receber"
        onHide={() => setCustomizationVisible(false)}
        onApply={applyVisibleFields}
      />
      <ReceivableDetailsModal
        visible={detailsVisible}
        receivable={details}
        onHide={() => setDetailsVisible(false)}
      />
      <ReceivableFilesModal
        visible={filesVisible}
        receivableId={filesAccount?.id}
        receivableDescription={filesAccount?.description}
        onHide={() => setFilesVisible(false)}
      />
      <ReceivableOverdueModal
        visible={overdueVisible}
        receivable={overdue}
        onHide={() => setOverdueVisible(false)}
      />
      <ReceivablePaymentChoiceModal
        visible={paymentChoiceVisible}
        onHide={() => setPaymentChoiceVisible(false)}
        onEditCharges={editPaymentCharges}
        onUseDefaultCharges={useDefaultPaymentCharges}
      />
      <ReceivablePaymentChargesModal
        visible={
          paymentChargesVisible &&
          paymentAccount != null &&
          isOverdueOpenReceivable(paymentAccount)
        }
        lateFee={paymentCharges.lateFee}
        lateInterest={paymentCharges.lateInterest}
        onHide={() => setPaymentChargesVisible(false)}
        onConfirm={finishPaymentChargesEdit}
      />
      <ReceivablePaymentModal
        visible={paymentVisible}
        receivable={paymentAccount}
        lateFee={paymentCharges.lateFee}
        lateInterest={paymentCharges.lateInterest}
        saving={savingPayment}
        onHide={() => setPaymentVisible(false)}
        onPay={submitPayment}
      />
    </div>
  );
}
