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
import { Payable } from "../../models/Payable";
import { PayableFilters as PayableFilterModel } from "../../models/PayableFilters";
import { PayablePaymentDTO } from "../../dtos/payable-payment-dto";
import { PayableMapper } from "../../mappers/payable.mapper";
import { payableService } from "../../services/payable.service";
import { PayableDetailsModal } from "../../components/payable-details-modal/PayableDetailsModal";
import { PayableFilesModal } from "../../components/payable-files-modal/PayableFilesModal";
import { PayableOverdueModal } from "../../components/payable-overdue-modal/PayableOverdueModal";
import { PayablePaymentChoiceModal } from "../../components/payable-payment-choice-modal/PayablePaymentChoiceModal";
import { PayablePaymentChargesModal } from "../../components/payable-payment-charges-modal/PayablePaymentChargesModal";
import { PayablePaymentModal } from "../../components/payable-payment-modal/PayablePaymentModal";
import { PayableFilters } from "../../components/payable-filters/PayableFilters";
import "./PayableList.css";

const defaultVisibleFields: string[] = [
  "description",
  "supplierName",
  "originalAmount",
  "remainingBalance",
  "dueDate",
  "status",
];
const availableFields: CustomizableField[] = [
  { field: "description", label: "Descrição" },
  { field: "supplierName", label: "Fornecedor" },
  { field: "employeeName", label: "Funcionário" },
  { field: "paymentMethodName", label: "Forma de pagamento" },
  { field: "paymentFrequency", label: "Frequência" },
  { field: "status", label: "Situação" },
  { field: "originalAmount", label: "Valor original" },
  { field: "currentAmountWithLateCharges", label: "Valor atual" },
  { field: "subtotal", label: "Valor pago" },
  { field: "dueDate", label: "Vencimento" },
  { field: "paymentDate", label: "Pagamento" },
  { field: "remainingBalance", label: "Saldo" },
  { field: "fee", label: "Taxa" },
  { field: "lateInterest", label: "Juros" },
  { field: "lateFee", label: "Multa" },
  { field: "discount", label: "Desconto" },
  { field: "createdByName", label: "Criado por" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedByName", label: "Atualizado por" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "paidByName", label: "Pago por" },
  { field: "note", label: "Observação" },
];

export function PayableList() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [pagination, setPagination] = useState(
    new Pagination(0, 10, "ASC", "dueDate"),
  );
  const [filters, setFilters] = useState(new PayableFilterModel());
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] =
    useState<string[]>(loadVisibleFields);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<Payable | null>(null);
  const [filesVisible, setFilesVisible] = useState(false);
  const [filesAccount, setFilesAccount] = useState<Payable | null>(null);
  const [overdueVisible, setOverdueVisible] = useState(false);
  const [overdue, setOverdue] = useState<Payable | null>(null);
  const [paymentChoiceVisible, setPaymentChoiceVisible] = useState(false);
  const [paymentChargesVisible, setPaymentChargesVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState<Payable | null>(null);
  const [paymentCharges, setPaymentCharges] = useState({
    lateFee: 0,
    lateInterest: 0,
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const canRead = authService.hasAuthority("PAYABLE_READ");
  const canWrite = authService.hasAuthority("PAYABLE_WRITE");
  const canDelete = authService.hasAuthority("PAYABLE_DELETE");

  function getPayableOpenAmount(payable: Payable): number {
    if (payable.paid) {
      return 0;
    }

    const amount = Number(payable.amount ?? 0);
    let paidAmount = 0;

    if (payable.paid || payable.paymentDate) {
      paidAmount = Number(payable.subtotal ?? 0);
    }

    if (amount > 0 && paidAmount >= amount) {
      return 0;
    }

    if (amount > 0 && paidAmount > 0 && paidAmount < amount) {
      return Math.round((amount - paidAmount) * 100) / 100;
    }

    const remaining = payable.remainingBalance;

    if (remaining != null && remaining > 0 && remaining < amount) {
      return Number(remaining);
    }

    return amount;
  }

  function isPartiallyPaid(payable: Payable): boolean {
    if (payable.paid || payable.canceled) {
      return false;
    }

    const amount = Number(payable.amount ?? 0);
    const remaining = payable.remainingBalance;
    let paidAmount = 0;

    if (payable.paid || payable.paymentDate) {
      paidAmount = Number(payable.subtotal ?? 0);
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

  function getPaidAmount(payable: Payable): number {
    const amount = Number(payable.amount ?? 0);

    if (payable.paid) {
      return Number(
        payable.currentAmountWithLateCharges ?? payable.subtotal ?? amount,
      );
    }

    if (
      (payable.paid || payable.paymentDate) &&
      payable.subtotal != null &&
      payable.subtotal > 0
    ) {
      if (amount > 0) {
        return Math.min(Number(payable.subtotal), amount);
      }

      return Number(payable.subtotal);
    }

    if (isPartiallyPaid(payable)) {
      return amount - getPayableOpenAmount(payable);
    }

    return 0;
  }

  function getCurrentAmount(payable: Payable): number {
    if (payable.paid) {
      return getPaidAmount(payable);
    }

    return Number(
      payable.currentAmountWithLateCharges ?? getPayableOpenAmount(payable),
    );
  }

  function getStatusLabel(payable: Payable): string {
    if (payable.canceled) {
      return "Cancelada";
    }

    if (isPartiallyPaid(payable)) {
      return "Pago Parcialmente";
    }

    if (payable.paid) {
      return "Pago";
    }

    return "Pendente";
  }

  function isOverdueOpenPayable(payable: Payable): boolean {
    if (payable.paid || payable.canceled || !payable.dueDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(payable.dueDate + "T00:00:00");
    dueDate.setHours(0, 0, 0, 0);

    return (
      dueDate.getTime() < today.getTime() && getPayableOpenAmount(payable) > 0
    );
  }

  function loadVisibleFields(): string[] {
    let savedFields = localStorage.getItem("payable-visible-fields");
    let legacyFields = false;

    if (savedFields == null) {
      savedFields = localStorage.getItem("payable-card-visible-fields");
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
          "supplierName",
          "employeeName",
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
      const data = await payableService.list(next, values);
      const records = PayableMapper.toModelList(data.content);
      for (const record of records) record.status = getStatusLabel(record);
      setPayables(records);
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
  const applyFilters = (values: PayableFilterModel) => {
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
    const values = new PayableFilterModel();
    const next = new Pagination(0, pagination.linesPerPage, "ASC", "dueDate");
    setFilters(values);
    setPagination(next);
    list(next, values);
  };
  const deleteAccount = (record: Payable) => {
    if (!record.id || !canDelete) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await payableService.delete(record.id!);
          const next = new Pagination(
            0,
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
  const openDetails = async (record: Payable) => {
    if (!record.id || !canRead) return;
    setDetails(null);
    setDetailsVisible(true);
    try {
      setDetails(
        PayableMapper.toModel(await payableService.findById(record.id)),
      );
    } catch {
      setDetailsVisible(false);
    }
  };
  const pay = (record: Payable) => {
    if (!record.id || !canWrite || record.paid || record.canceled) return;
    if (getPayableOpenAmount(record) <= 0) {
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
    if (isOverdueOpenPayable(record)) setPaymentChoiceVisible(true);
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
    if (!paymentAccount || !isOverdueOpenPayable(paymentAccount)) return;
    setPaymentChoiceVisible(false);
    setPaymentChargesVisible(true);
  };
  const finishPaymentChargesEdit = (lateFee: number, lateInterest: number) => {
    if (!paymentAccount || !isOverdueOpenPayable(paymentAccount)) return;
    setPaymentCharges({ lateFee, lateInterest });
    setPaymentChargesVisible(false);
    setPaymentVisible(true);
  };
  const submitPayment = async (dto: PayablePaymentDTO) => {
    if (!paymentAccount?.id || !canWrite || savingPayment) return;
    setSavingPayment(true);
    try {
      await payableService.pay(paymentAccount.id, dto);
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

  const applyVisibleFields = (fields: string[]) => {
    setVisibleFields([...fields]);
    localStorage.setItem("payable-visible-fields", JSON.stringify(fields));
  };
  const loadRecordsForExport = async (next: Pagination) => {
    const data = await payableService.list(next, filters);
    const records = PayableMapper.toModelList(data.content);
    for (const record of records) {
      record.status = getStatusLabel(record);
      record.subtotal = getPaidAmount(record);
      record.remainingBalance = getPayableOpenAmount(record);
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
    <div className="payable-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">FINANCEIRO</span>
          <h1>Contas a pagar</h1>
          <p>Consulte e gerencie as contas a pagar.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-file-invoice" />
        </div>
      </header>
      <div className="payable-filter-container">
        <div className="payable-actions-group">
          {canWrite && (
            <Link to="/payables/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVA CONTA
              </button>
            </Link>
          )}
        </div>
      </div>
      <PayableFilters onFilter={applyFilters} onClear={clearFilters} />
      <section
        className="payable-list"
        aria-label="Contas a pagar"
        aria-busy={loading}
      >
        <div className="payable-list-toolbar">
          <span>{totalElements} conta(s) encontrada(s)</span>
          <div className="payable-list-tools">
            <Button
              type="button"
              className="p-button-rounded p-button-text"
              icon="pi pi-cog"
              aria-label="Personalizar campos dos cards"
              tooltip="Personalizar campos"
              onClick={() => setCustomizationVisible(true)}
            />
            <ExcelExport
              title="Contas a pagar"
              fileName="contas-a-pagar"
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
          <p className="payable-list-message" role="status">
            Carregando contas...
          </p>
        )}
        {!loading && payables.length === 0 && (
          <p className="payable-list-message">Nenhuma conta encontrada.</p>
        )}
        {!loading && payables.length > 0 && (
          <div className="payable-cards">
            {payables.map((payable) => (
              <article
                key={payable.id}
                className={`payable-card${payable.paid && !payable.canceled ? " payable-card-paid" : ""}${isPartiallyPaid(payable) ? " payable-card-partial" : ""}${payable.canceled ? " payable-card-canceled" : ""}`}
              >
                <div className="payable-main">
                  <header className="payable-card-header">
                    <div className="payable-title">
                      <span className="payable-id">#{payable.id}</span>
                      {visibleFields.includes("description") && (
                        <h2>{payable.description || "Sem descrição"}</h2>
                      )}
                    </div>
                    {visibleFields.includes("status") && (
                      <span
                        className={`payable-status${payable.paid && !payable.canceled ? " payable-status-paid" : ""}${isPartiallyPaid(payable) ? " payable-status-partial" : ""}${payable.canceled ? " payable-status-canceled" : ""}`}
                      >
                        {payable.status}
                      </span>
                    )}
                  </header>
                  <div className="payable-meta">
                    {visibleFields.includes("supplierName") && (
                      <span>
                        <i className="fa-solid fa-user" aria-hidden="true" />
                        {payable.supplierName || "Sem fornecedor"}
                      </span>
                    )}
                    {visibleFields.includes("employeeName") && (
                      <span>
                        <i className="fa-solid fa-user" aria-hidden="true" />
                        {payable.employeeName || "Sem funcionário"}
                      </span>
                    )}
                    {visibleFields.includes("paymentMethodName") && (
                      <span>
                        <i
                          className="fa-solid fa-credit-card"
                          aria-hidden="true"
                        />
                        {payable.paymentMethodName || "Sem forma"}
                      </span>
                    )}
                    {visibleFields.includes("paymentFrequency") && (
                      <span>
                        <i className="fa-solid fa-repeat" aria-hidden="true" />
                        {payable.paymentFrequency || "Sem frequência"}
                      </span>
                    )}
                  </div>
                </div>
                <dl className="payable-card-fields">
                  {visibleFields.includes("originalAmount") && (
                    <div className="amount">
                      <dt>Valor original</dt>
                      <dd>{currency(payable.originalAmount)}</dd>
                    </div>
                  )}
                  {payable.parentPayableId &&
                    visibleFields.includes("originalAmount") && (
                      <div>
                        <dt>Valor da parcela</dt>
                        <dd>{currency(payable.amount)}</dd>
                      </div>
                    )}
                  {visibleFields.includes("currentAmountWithLateCharges") && (
                    <div className="current-amount">
                      <dt>Valor atual</dt>
                      <dd>{currency(getCurrentAmount(payable))}</dd>
                    </div>
                  )}
                  {visibleFields.includes("subtotal") && (
                    <div className="paid-amount">
                      <dt>Valor pago</dt>
                      <dd>{currency(getPaidAmount(payable))}</dd>
                    </div>
                  )}
                  {visibleFields.includes("remainingBalance") && (
                    <div>
                      <dt>Saldo</dt>
                      <dd>{currency(getPayableOpenAmount(payable))}</dd>
                    </div>
                  )}
                  {visibleFields.includes("dueDate") && (
                    <div>
                      <dt>Vencimento</dt>
                      <dd>
                        {isOverdueOpenPayable(payable) ? (
                          <button
                            type="button"
                            className="due-date-button"
                            title="Ver juros e multa"
                            onClick={() => {
                              setOverdue(payable);
                              setOverdueVisible(true);
                            }}
                          >
                            {formatDate(payable.dueDate)}
                          </button>
                        ) : (
                          formatDate(payable.dueDate)
                        )}
                      </dd>
                    </div>
                  )}
                  {visibleFields.includes("paymentDate") && (
                    <div>
                      <dt>Pagamento</dt>
                      <dd>{formatDate(payable.paymentDate)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("fee") && (
                    <div>
                      <dt>Taxa</dt>
                      <dd>{currency(payable.fee)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("lateInterest") && (
                    <div>
                      <dt>Juros</dt>
                      <dd>{currency(payable.lateInterest)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("lateFee") && (
                    <div>
                      <dt>Multa</dt>
                      <dd>{currency(payable.lateFee)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("discount") && (
                    <div>
                      <dt>Desconto</dt>
                      <dd>{currency(payable.discount)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("createdByName") && (
                    <div>
                      <dt>Criado por</dt>
                      <dd>{payable.createdByName || "-"}</dd>
                    </div>
                  )}
                  {visibleFields.includes("createdAt") && (
                    <div>
                      <dt>Data cadastro</dt>
                      <dd>{formatDate(payable.createdAt)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("updatedByName") && (
                    <div>
                      <dt>Atualizado por</dt>
                      <dd>{payable.updatedByName || "-"}</dd>
                    </div>
                  )}
                  {visibleFields.includes("updatedAt") && (
                    <div>
                      <dt>Data atualização</dt>
                      <dd>{formatDate(payable.updatedAt)}</dd>
                    </div>
                  )}
                  {visibleFields.includes("paidByName") && (
                    <div>
                      <dt>Pago por</dt>
                      <dd>{payable.paidByName || "-"}</dd>
                    </div>
                  )}
                  {visibleFields.includes("note") && (
                    <div className="note">
                      <dt>Observação</dt>
                      <dd>{payable.note || "-"}</dd>
                    </div>
                  )}
                </dl>
                <footer className="payable-card-footer">
                  <div className="actions-wrap">
                    {canWrite && !payable.paid && !payable.canceled && (
                      <Link to={`/payables/${payable.id}/edit`}>
                        <Button
                          className="p-button-rounded p-button-text"
                          icon="pi pi-pencil"
                          aria-label="Atualizar conta"
                          tooltip="Atualizar conta"
                        />
                      </Link>
                    )}
                    {canWrite && !payable.paid && !payable.canceled && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text p-button-success"
                        icon="pi pi-check-circle"
                        aria-label="Baixar conta total ou parcial"
                        tooltip="Baixar conta total ou parcial"
                        onClick={() => pay(payable)}
                      />
                    )}
                    {canRead && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text"
                        icon="pi pi-eye"
                        aria-label="Detalhamento da conta"
                        tooltip="Detalhamento da Conta"
                        onClick={() => openDetails(payable)}
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
                          setFilesAccount(payable);
                          setFilesVisible(true);
                        }}
                      />
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        className="p-button-rounded p-button-text p-button-danger"
                        icon="pi pi-trash"
                        aria-label="Excluir conta"
                        tooltip="Excluir conta"
                        onClick={() => deleteAccount(payable)}
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
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={changePage}
        />
      </section>
      <FieldCustomization
        visible={customizationVisible}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="contas a pagar"
        onHide={() => setCustomizationVisible(false)}
        onApply={applyVisibleFields}
      />
      <PayableDetailsModal
        visible={detailsVisible}
        payable={details}
        onHide={() => setDetailsVisible(false)}
      />
      <PayableFilesModal
        visible={filesVisible}
        payableId={filesAccount?.id}
        payableDescription={filesAccount?.description}
        onHide={() => setFilesVisible(false)}
      />
      <PayableOverdueModal
        visible={overdueVisible}
        payable={overdue}
        onHide={() => setOverdueVisible(false)}
      />
      <PayablePaymentChoiceModal
        visible={paymentChoiceVisible}
        onHide={() => setPaymentChoiceVisible(false)}
        onEditCharges={editPaymentCharges}
        onUseDefaultCharges={useDefaultPaymentCharges}
      />
      <PayablePaymentChargesModal
        visible={
          paymentChargesVisible &&
          paymentAccount != null &&
          isOverdueOpenPayable(paymentAccount)
        }
        lateFee={paymentCharges.lateFee}
        lateInterest={paymentCharges.lateInterest}
        onHide={() => setPaymentChargesVisible(false)}
        onConfirm={finishPaymentChargesEdit}
      />
      <PayablePaymentModal
        visible={paymentVisible}
        payable={paymentAccount}
        lateFee={paymentCharges.lateFee}
        lateInterest={paymentCharges.lateInterest}
        saving={savingPayment}
        onHide={() => setPaymentVisible(false)}
        onPay={submitPayment}
      />
    </div>
  );
}
