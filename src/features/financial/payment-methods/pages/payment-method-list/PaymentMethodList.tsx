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
import { PaymentMethod } from "../../models/PaymentMethod";
import { PaymentMethodMapper } from "../../mappers/payment-method.mapper";
import { paymentMethodService } from "../../services/payment-method.service";
import { PaymentMethodDetailsModal } from "../../components/payment-method-details-modal/PaymentMethodDetailsModal";
import "./PaymentMethodList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "fee", label: "Taxa" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
];
export function PaymentMethodList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<
    number[]
  >([]);
  const [pagination, setPagination] = useState(
    new Pagination(0, 5, "ASC", "name"),
  );
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState(["name", "fee"]);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<PaymentMethod | null>(null);

  const canWrite = authService.hasAuthority("METHODS_WRITE");
  const canDelete = authService.hasAuthority("METHODS_DELETE");
  const canRead = authService.hasAuthority("METHODS_READ");
  const list = async (
    next: Pagination,
    name = filterName,
    selectedIds = selectedPaymentMethodIds,
  ) => {
    setLoading(true);
    try {
      const data = await paymentMethodService.list(next, name);
      const loadedPaymentMethods = PaymentMethodMapper.toModelList(
        data.content,
      );
      setPaymentMethods(loadedPaymentMethods);
      setSelectedPaymentMethods(
        loadedPaymentMethods.filter(
          (paymentMethod) =>
            paymentMethod.id != null && selectedIds.includes(paymentMethod.id),
        ),
      );
      setTotalElements(data.totalElements);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    list(new Pagination(0, 5, "ASC", "name"));
  }, []);
  const reload = (selectedIds = selectedPaymentMethodIds) => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next, filterName, selectedIds);
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
    setFilterName(name);
    setPagination(next);
    list(next, name);
  };
  const deletePaymentMethod = (record: PaymentMethod) => {
    if (!record.id || !canDelete) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await paymentMethodService.delete(record.id!);
          reload();
          notificationService.add({
            severity: "success",
            detail: "Forma de pagamento excluída com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        }
      },
    });
  };

  const onSelectionChange = (currentRecords: PaymentMethod[]) => {
    currentRecords = currentRecords.filter(() => canDelete);
    setSelectedPaymentMethods(currentRecords);
    const idsOutsidePage = selectedPaymentMethodIds.filter(
      (id) => !paymentMethods.some((record) => record.id === id),
    );
    const currentIds = currentRecords.flatMap((record) =>
      record.id == null ? [] : [record.id],
    );
    setSelectedPaymentMethodIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedPaymentMethods = () => {
    if (!canDelete || selectedPaymentMethodIds.length === 0) return;
    const ids = [...selectedPaymentMethodIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} forma(s) de pagamento?`,
      accept: async () => {
        try {
          await paymentMethodService.deleteAll(ids);
          setSelectedPaymentMethodIds([]);
          setSelectedPaymentMethods([]);
          reload([]);
          notificationService.add({
            severity: "success",
            detail: "Formas de Pagamento excluídas com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        }
      },
    });
  };

  const openDetails = async (record: PaymentMethod) => {
    if (!record.id || !canRead) return;
    setDetails(null);
    setDetailsVisible(true);
    try {
      setDetails(
        PaymentMethodMapper.toModel(
          await paymentMethodService.findById(record.id),
        ),
      );
    } catch {
      setDetailsVisible(false);
    }
  };
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <div className="payment-method-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">FINANCEIRO</span>
          <h1>Formas de Pagamento</h1>
          <p>Consulte e gerencie as formas de pagamento cadastradas.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-credit-card" />
        </div>
      </header>
      <div className="payment-method-filter-container">
        <div className="payment-method-actions-group">
          {canWrite && (
            <Link to="/payment-methods/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVA FORMA DE PAGAMENTO
              </button>
            </Link>
          )}
          {canDelete && selectedPaymentMethodIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedPaymentMethods}
            >
              EXCLUIR FORMAS DE PAGAMENTO
            </button>
          )}
        </div>
        <NameFilter
          text="Digite o nome da forma de pagamento"
          onSearch={search}
        />
      </div>
      <DataTable
        records={paymentMethods}
        columns={availableFields.filter((field) =>
          visibleFields.includes(field.field),
        )}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        showSelection={canDelete}
        rowSelectable={() => canDelete}
        selectedRecords={selectedPaymentMethods}
        onSelectedRecordsChange={onSelectionChange}
        columnTemplates={{
          fee: (record) =>
            record.fee == null
              ? "-"
              : record.fee.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) + "%",
          createdAt: (record) => formatDate(record.createdAt),
          updatedAt: (record) => formatDate(record.updatedAt),
        }}
        actionsTemplate={(record) => (
          <div className="actions-wrap">
            {canWrite && (
              <Link to={`/payment-methods/${record.id}/edit`}>
                <Button
                  className="p-button-rounded p-button-text"
                  icon="pi pi-pencil"
                  tooltip="Editar forma de pagamento"
                />
              </Link>
            )}
            {canDelete && (
              <Button
                className="p-button-rounded p-button-text p-button-danger"
                icon="pi pi-trash"
                tooltip="Excluir forma de pagamento"
                onClick={() => deletePaymentMethod(record)}
              />
            )}
            {canRead && (
              <Button
                className="p-button-rounded p-button-text"
                icon="pi pi-eye"
                tooltip="Detalhamento da forma de pagamento"
                onClick={() => openDetails(record)}
              />
            )}
          </div>
        )}
        showColumnsButton
        showExportButton
        exportTitle="Formas de Pagamento"
        exportFileName="formas-de-pagamento"
        exportPagination={pagination}
        exportLoadRecords={(next) =>
          paymentMethodService.list(next, filterName)
        }
        emptyMessage="Nenhuma forma de pagamento encontrada."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setCustomizationVisible(true)}
      />
      <FieldCustomization
        visible={customizationVisible}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="formas de pagamento"
        onHide={() => setCustomizationVisible(false)}
        onApply={setVisibleFields}
      />
      <PaymentMethodDetailsModal
        visible={detailsVisible}
        paymentMethod={details}
        onHide={() => setDetailsVisible(false)}
      />
    </div>
  );
}
