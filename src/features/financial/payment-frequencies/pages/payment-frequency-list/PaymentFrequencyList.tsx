import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { authService } from "../../../../../core/auth/services/auth.service";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { Pagination } from "../../../../../core/models/Pagination";
import {
  DataTable,
  LazyLoadEvent,
} from "../../../../../shared/components/data-table/DataTable";
import { DataTableColumn } from "../../../../../shared/components/data-table/models/data-table-column";
import { NameFilter } from "../../../../../shared/components/name-filter/NameFilter";
import { FieldCustomization } from "../../../../../shared/components/field-customization/FieldCustomization";
import { PaymentFrequency } from "../../models/PaymentFrequency";
import { PaymentFrequencyMapper } from "../../mappers/payment-frequency.mapper";
import { paymentFrequencyService } from "../../services/payment-frequency.service";
import { PaymentFrequencyDetailsModal } from "../../components/payment-frequency-details-modal/PaymentFrequencyDetailsModal";
import "./PaymentFrequencyList.css";

const availableFields: DataTableColumn[] = [
  { field: "frequency", label: "Frequência" },
  { field: "days", label: "Dias" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
];
export function PaymentFrequencyList() {
  const [paymentFrequencies, setPaymentFrequencies] = useState<
    PaymentFrequency[]
  >([]);
  const [selectedPaymentFrequencies, setSelectedPaymentFrequencies] = useState<
    PaymentFrequency[]
  >([]);
  const [selectedPaymentFrequencyIds, setSelectedPaymentFrequencyIds] =
    useState<number[]>([]);
  const [pagination, setPagination] = useState(
    new Pagination(0, 5, "ASC", "frequency"),
  );
  const [totalElements, setTotalElements] = useState(0);
  const [filterFrequency, setFilterFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState(["frequency", "days"]);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<PaymentFrequency | null>(null);

  const canWrite = authService.hasAuthority("FREQUENCY_WRITE");
  const canDelete = authService.hasAuthority("FREQUENCY_DELETE");
  const canRead = authService.hasAuthority("FREQUENCY_READ");
  const list = async (
    next: Pagination,
    name = filterFrequency,
    selectedIds = selectedPaymentFrequencyIds,
  ) => {
    setLoading(true);
    try {
      const data = await paymentFrequencyService.list(next, name);
      const loadedPaymentFrequencies = PaymentFrequencyMapper.toModelList(
        data.content,
      );
      setPaymentFrequencies(loadedPaymentFrequencies);
      setSelectedPaymentFrequencies(
        loadedPaymentFrequencies.filter(
          (paymentFrequency) =>
            paymentFrequency.id != null &&
            selectedIds.includes(paymentFrequency.id),
        ),
      );
      setTotalElements(data.totalElements);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    list(new Pagination(0, 5, "ASC", "frequency"));
  }, []);
  const reload = (selectedIds = selectedPaymentFrequencyIds) => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next, filterFrequency, selectedIds);
  };
  const changePage = (event: LazyLoadEvent) => {
    const rows = event.rows || pagination.linesPerPage;
    const next = new Pagination(
      (event.first || 0) / rows,
      rows,
      event.sortOrder === -1 ? "DESC" : "ASC",
      event.sortField || pagination.orderBy,
    );
    setPagination(next);
    list(next);
  };
  const search = (name: string) => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setFilterFrequency(name);
    setPagination(next);
    list(next, name);
  };
  const deletePaymentFrequency = (record: PaymentFrequency) => {
    if (!record.id || !canDelete) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await paymentFrequencyService.delete(record.id!);
          reload();
          notificationService.add({
            severity: "success",
            detail: "Frequência de pagamento excluída com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        }
      },
    });
  };

  const onSelectionChange = (currentRecords: PaymentFrequency[]) => {
    currentRecords = currentRecords.filter(() => canDelete);
    setSelectedPaymentFrequencies(currentRecords);
    const idsOutsidePage = selectedPaymentFrequencyIds.filter(
      (id) => !paymentFrequencies.some((record) => record.id === id),
    );
    const currentIds = currentRecords.flatMap((record) =>
      record.id == null ? [] : [record.id],
    );
    setSelectedPaymentFrequencyIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedPaymentFrequencies = () => {
    if (!canDelete || selectedPaymentFrequencyIds.length === 0) return;
    const ids = [...selectedPaymentFrequencyIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} frequência(s) de pagamento?`,
      accept: async () => {
        try {
          await paymentFrequencyService.deleteAll(ids);
          setSelectedPaymentFrequencyIds([]);
          setSelectedPaymentFrequencies([]);
          reload([]);
          notificationService.add({
            severity: "success",
            detail: "Frequências de pagamento excluídas com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        }
      },
    });
  };

  const openDetails = async (record: PaymentFrequency) => {
    if (!record.id || !canRead) return;
    setDetails(null);
    setDetailsVisible(true);
    try {
      setDetails(
        PaymentFrequencyMapper.toModel(
          await paymentFrequencyService.findById(record.id),
        ),
      );
    } catch {
      setDetailsVisible(false);
    }
  };
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <div className="payment-frequency-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">FINANCEIRO</span>
          <h1>Frequências de pagamento</h1>
          <p>Consulte e gerencie as frequências de pagamento cadastradas.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-calendar-days" />
        </div>
      </header>
      <div className="payment-frequency-filter-container">
        <div className="payment-frequency-actions-group">
          {canWrite && (
            <Link to="/payment-frequencies/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVA FREQUÊNCIA
              </button>
            </Link>
          )}
          {canDelete && selectedPaymentFrequencyIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedPaymentFrequencies}
            >
              EXCLUIR FREQUÊNCIAS
            </button>
          )}
        </div>
        <NameFilter text="Digite a frequência de pagamento" onSearch={search} />
      </div>
      <DataTable
        records={paymentFrequencies}
        columns={availableFields.filter((field) =>
          visibleFields.includes(field.field),
        )}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        showSelection={canDelete}
        rowSelectable={() => canDelete}
        selectedRecords={selectedPaymentFrequencies}
        onSelectedRecordsChange={onSelectionChange}
        columnTemplates={{
          createdAt: (record) => formatDate(record.createdAt),
          updatedAt: (record) => formatDate(record.updatedAt),
        }}
        actionsTemplate={(record) => (
          <div className="actions-wrap">
            {canWrite && (
              <Link to={`/payment-frequencies/${record.id}/edit`}>
                <Button
                  className="p-button-rounded p-button-text"
                  icon="pi pi-pencil"
                  tooltip="Editar frequência de pagamento"
                />
              </Link>
            )}
            {canDelete && (
              <Button
                className="p-button-rounded p-button-text p-button-danger"
                icon="pi pi-trash"
                tooltip="Excluir frequência de pagamento"
                onClick={() => deletePaymentFrequency(record)}
              />
            )}
            {canRead && (
              <Button
                className="p-button-rounded p-button-text"
                icon="pi pi-eye"
                tooltip="Detalhamento da frequência de pagamento"
                onClick={() => openDetails(record)}
              />
            )}
          </div>
        )}
        showColumnsButton
        showExportButton
        exportTitle="Frequências de pagamento"
        exportFileName="frequencias-de-pagamento"
        exportPagination={pagination}
        exportLoadRecords={(next) =>
          paymentFrequencyService.list(next, filterFrequency)
        }
        emptyMessage="Nenhuma frequência de pagamento encontrada."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setCustomizationVisible(true)}
      />
      <FieldCustomization
        visible={customizationVisible}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="frequências de pagamento"
        onHide={() => setCustomizationVisible(false)}
        onApply={setVisibleFields}
      />
      <PaymentFrequencyDetailsModal
        visible={detailsVisible}
        paymentFrequency={details}
        onHide={() => setDetailsVisible(false)}
      />
    </div>
  );
}
