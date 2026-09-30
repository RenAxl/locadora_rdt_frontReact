import { authService } from "../../../../../core/auth/services/auth.service";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { Link } from "react-router-dom";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { PageResponse } from "../../../../../core/models/page-response";
import { Pagination } from "../../../../../core/models/Pagination";
import { PhotoUrlRegistry } from "../../../../../core/utils/photo-preview.util";
import {
  DataTable,
  LazyLoadEvent,
} from "../../../../../shared/components/data-table/DataTable";
import { DataTableColumn } from "../../../../../shared/components/data-table/models/data-table-column";
import { FieldCustomization } from "../../../../../shared/components/field-customization/FieldCustomization";
import { NameFilter } from "../../../../../shared/components/name-filter/NameFilter";
import { CustomerDetailsModal } from "../../components/customer-details-modal/CustomerDetailsModal";
import { CustomerDTO } from "../../dtos/customer-dto";
import { CustomerMapper } from "../../mappers/customer.mapper";
import { Customer } from "../../models/Customer";
import { customerService } from "../../services/customer.service";
import { CustomerFilesModal } from "../../components/customer-files-modal/CustomerFilesModal";
import "./CustomerList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "email", label: "E-mail" },
  { field: "phone", label: "Telefone" },
  { field: "active", label: "Ativo" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "address.street", label: "Rua" },
  { field: "address.number", label: "Número" },
  { field: "address.complement", label: "Complemento" },
  { field: "address.neighborhood", label: "Bairro" },
  { field: "address.city", label: "Cidade" },
  { field: "address.state", label: "UF" },
  { field: "address.zipCode", label: "CEP" },
  { field: "photo", label: "Foto" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
];

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldCustomizationVisible, setFieldCustomizationVisible] =
    useState(false);
  const [visibleFields, setVisibleFields] = useState([
    "name",
    "email",
    "phone",
    "photo",
  ]);
  const [filesCustomer, setFilesCustomer] = useState<Customer | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [photoMap, setPhotoMap] = useState<Record<number, string>>({});
  const photoUrls = useRef(new PhotoUrlRegistry());
  const photoRequest = useRef(0);

  const visibleTableColumns = useMemo(
    () =>
      availableFields.filter((column) => visibleFields.includes(column.field)),
    [visibleFields],
  );

  const loadPhotos = async (loadedCustomers: Customer[]) => {
    const request = ++photoRequest.current;
    photoUrls.current.clear();
    setPhotoMap({});
    for (const customer of loadedCustomers) {
      if (!customer.id) continue;
      try {
        const blob = await customerService.getCustomerPhoto(customer.id);
        if (request !== photoRequest.current) return;
        const photoUrl = photoUrls.current.create(blob);
        if (photoUrl)
          setPhotoMap((current) => ({ ...current, [customer.id!]: photoUrl }));
      } catch {
        // Cliente sem foto é um caso esperado no Angular original.
      }
    }
  };

  const list = async (
    currentPagination: Pagination,
    currentFilter = filterName,
  ) => {
    setLoading(true);
    try {
      const data = await customerService.list(currentPagination, currentFilter);
      const loadedCustomers = CustomerMapper.toModelList(data.content);
      setCustomers(loadedCustomers);
      setTotalElements(data.totalElements);
      setSelectedCustomers(
        loadedCustomers.filter(
          (customer) =>
            customer.id != null && selectedCustomerIds.includes(customer.id),
        ),
      );
      loadPhotos(loadedCustomers);
    } catch {
      // O interceptor mostra o erro.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    list(new Pagination());
    return () => {
      photoRequest.current++;
      photoUrls.current.clear();
    };
  }, []);

  const changePage = (event: LazyLoadEvent) => {
    const rows = event.rows || pagination.linesPerPage || 1;
    const first = event.first || 0;
    const next = new Pagination(
      first / rows,
      rows,
      event.sortOrder === -1 ? "DESC" : pagination.direction,
      typeof event.sortField === "string"
        ? event.sortField
        : pagination.orderBy,
    );
    if (event.sortOrder === 1) next.direction = "ASC";
    setPagination(next);
    list(next);
  };

  const searchCustomer = (name: string) => {
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

  const reloadFromFirstPage = () => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next);
  };

  const canDeleteCustomers = authService.hasAnyAuthority(["CUSTOMER_DELETE"]);
  const canDelete = (_customer: Customer) => canDeleteCustomers;

  const deleteCustomer = (customer: Customer) => {
    if (!customer.id || !canDelete(customer)) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await customerService.delete(customer.id!);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Cliente excluído com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const onSelectionChange = (currentCustomers: Customer[]) => {
    currentCustomers = currentCustomers.filter(canDelete);
    setSelectedCustomers(currentCustomers);
    const idsOutsidePage = selectedCustomerIds.filter(
      (id) => !customers.some((customer) => customer.id === id),
    );
    const currentIds = currentCustomers.flatMap((customer) =>
      customer.id == null ? [] : [customer.id],
    );
    setSelectedCustomerIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedCustomers = () => {
    if (!canDeleteCustomers || selectedCustomerIds.length === 0) return;
    const ids = [...selectedCustomerIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} cliente(s)?`,
      accept: async () => {
        try {
          await customerService.deleteAll(ids);
          setSelectedCustomerIds([]);
          setSelectedCustomers([]);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Clientes excluídos com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const openDetails = async (customer: Customer) => {
    if (customer.id == null) return;
    setDetailsVisible(true);
    setCustomerDetails(null);
    try {
      const details: CustomerDTO = await customerService.findById(
        customer.id,
      );
      setCustomerDetails(CustomerMapper.toModel(details));
    } catch {
      /* interceptor */
    }
  };

  const toggleActive = async (customer: Customer) => {
    if (!customer.id) return;
    const newStatus = !customer.active;
    try {
      await customerService.changeActive(customer.id, newStatus);
      setCustomers((current) =>
        current.map((item) =>
          item.id === customer.id
            ? new Customer({ ...item, active: newStatus })
            : item,
        ),
      );
      notificationService.add({
        severity: "success",
        detail: `Cliente ${newStatus ? "ativado" : "desativado"} com sucesso!`,
      });
    } catch {
      /* interceptor */
    }
  };

  const loadCustomersForExport = (
    exportPagination: Pagination,
  ): Promise<PageResponse<CustomerDTO>> => {
    return customerService.list(exportPagination, filterName);
  };

  const actionsTemplate = (customer: Customer) => (
    <div className="actions-wrap">
      {authService.hasAuthority("CUSTOMER_WRITE") && (
        <Link to={`/customers/${customer.id}/edit`}>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-pencil"
            tooltip="Editar cliente"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
      )}
      {canDeleteCustomers && (
        <Button
          className="p-button-rounded p-button-text p-button-danger"
          icon="pi pi-trash"
          tooltip="Excluir cliente"
          tooltipOptions={{ position: "top" }}
          disabled={!canDelete(customer)}
          onClick={() => deleteCustomer(customer)}
        />
      )}
      {authService.hasAuthority("CUSTOMER_WRITE") && (
        <Button
          className="p-button-rounded p-button-text p-button-warning"
          icon={customer.active ? "pi pi-ban" : "pi pi-check"}
          tooltip="Ativar / Desativar Cliente"
          tooltipOptions={{ position: "top" }}
          onClick={() => toggleActive(customer)}
        />
      )}
      {authService.hasAuthority("CUSTOMER_READ") && (
        <>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-eye"
            tooltip="Detalhamento do cliente"
            tooltipOptions={{ position: "top" }}
            onClick={() => openDetails(customer)}
          />
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-folder-open"
            tooltip="Arquivos do Cliente"
            onClick={() => setFilesCustomer(customer)}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="customer-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ORGANIZAÇÃO</span>
          <h1>Clientes</h1>
          <p>Consulte e gerencie os clientes cadastrados.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-id-card" />
        </div>
      </header>
      <div className="customer-filter-container">
        <div className="customer-actions-group">
          {authService.hasAuthority("CUSTOMER_WRITE") && (
            <Link to="/customers/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVO CLIENTE
              </button>
            </Link>
          )}
          {canDeleteCustomers && selectedCustomerIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedCustomers}
            >
              EXCLUIR CLIENTES
            </button>
          )}
        </div>
        <NameFilter text="Digite o nome do cliente" onSearch={searchCustomer} />
      </div>

      <DataTable
        records={customers}
        showSelection={canDeleteCustomers}
        rowSelectable={canDelete}
        columns={visibleTableColumns}
        selectedRecords={selectedCustomers}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        columnTemplates={{
          createdAt: (customer) =>
            customer.createdAt
              ? new Intl.DateTimeFormat("pt-BR").format(customer.createdAt)
              : "-",
          updatedAt: (customer) =>
            customer.updatedAt
              ? new Intl.DateTimeFormat("pt-BR").format(customer.updatedAt)
              : "-",
          active: (customer) => (customer.active ? "Sim" : "Não"),
          photo: (customer) =>
            photoMap[customer.id!] ? (
              <img
                className="customer-photo"
                src={photoMap[customer.id!]}
                alt="Foto do cliente"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <span className="profile-photo-icon">👤</span>
              </div>
            ),
        }}
        actionsTemplate={actionsTemplate}
        showColumnsButton
        showExportButton
        exportTitle="Clientes"
        exportFileName="clientes"
        exportPagination={pagination}
        exportLoadRecords={loadCustomersForExport}
        emptyMessage="Nenhum cliente encontrado."
        onLazyLoad={changePage}
        onSelectedRecordsChange={onSelectionChange}
        onColumnsButtonClick={() => setFieldCustomizationVisible(true)}
      />

      <CustomerDetailsModal
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        title="Detalhamento do Cliente"
        customer={customerDetails}
      />
      <CustomerFilesModal
        visible={!!filesCustomer}
        customerId={filesCustomer?.id}
        customerName={filesCustomer?.name}
        onHide={() => setFilesCustomer(null)}
      />
      <FieldCustomization
        visible={fieldCustomizationVisible}
        onHide={() => setFieldCustomizationVisible(false)}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="clientes"
        onApply={setVisibleFields}
      />
    </div>
  );
}
