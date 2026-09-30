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
import { SupplierDetailsModal } from "../../components/supplier-details-modal/SupplierDetailsModal";
import { SupplierDTO } from "../../dtos/supplier-dto";
import { SupplierMapper } from "../../mappers/supplier.mapper";
import { Supplier } from "../../models/Supplier";
import { supplierService } from "../../services/supplier.service";
import { SupplierFilesModal } from "../../components/supplier-files-modal/SupplierFilesModal";
import "./SupplierList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "tradeName", label: "Nome fantasia" },
  { field: "companyName", label: "Razão social" },
  { field: "cnpj", label: "CNPJ" },
  { field: "email", label: "E-mail" },
  { field: "phoneNumber", label: "Telefone" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
  { field: "address.street", label: "Rua" },
  { field: "address.number", label: "Número" },
  { field: "address.complement", label: "Complemento" },
  { field: "address.neighborhood", label: "Bairro" },
  { field: "address.city", label: "Cidade" },
  { field: "address.state", label: "UF" },
  { field: "address.zipCode", label: "CEP" },
  { field: "image", label: "Imagem" },
];

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldCustomizationVisible, setFieldCustomizationVisible] =
    useState(false);
  const [visibleFields, setVisibleFields] = useState([
    "name",
    "tradeName",
    "cnpj",
    "phoneNumber",
    "image",
  ]);
  const [filesSupplier, setFilesSupplier] = useState<Supplier | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [supplierDetails, setSupplierDetails] = useState<Supplier | null>(null);
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const photoUrls = useRef(new PhotoUrlRegistry());
  const photoRequest = useRef(0);

  const visibleTableColumns = useMemo(
    () =>
      availableFields.filter((column) => visibleFields.includes(column.field)),
    [visibleFields],
  );

  const loadPhotos = async (loadedSuppliers: Supplier[]) => {
    const request = ++photoRequest.current;
    photoUrls.current.clear();
    setImageMap({});
    for (const supplier of loadedSuppliers) {
      if (!supplier.id) continue;
      try {
        const blob = await supplierService.getSupplierImage(supplier.id);
        if (request !== photoRequest.current) return;
        const photoUrl = photoUrls.current.create(blob);
        if (photoUrl)
          setImageMap((current) => ({ ...current, [supplier.id!]: photoUrl }));
      } catch {}
    }
  };

  const list = async (
    currentPagination: Pagination,
    currentFilter = filterName,
    selectedIds = selectedSupplierIds,
  ) => {
    setLoading(true);
    try {
      const data = await supplierService.list(currentPagination, currentFilter);
      const loadedSuppliers = SupplierMapper.toModelList(data.content);
      setSuppliers(loadedSuppliers);
      setSelectedSuppliers(
        loadedSuppliers.filter(
          (supplier) => supplier.id != null && selectedIds.includes(supplier.id),
        ),
      );
      setTotalElements(data.totalElements);
      loadPhotos(loadedSuppliers);
    } catch {
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

  const searchSupplier = (name: string) => {
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

  const reloadFromFirstPage = (selectedIds = selectedSupplierIds) => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next, filterName, selectedIds);
  };

  const canDeleteSuppliers = authService.hasAnyAuthority(["SUPPLIER_DELETE"]);
  const canDelete = (_supplier: Supplier) => canDeleteSuppliers;

  const deleteSupplier = (supplier: Supplier) => {
    if (!supplier.id || !canDelete(supplier)) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await supplierService.delete(supplier.id!);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Fornecedor excluído com sucesso!",
          });
        } catch {}
      },
    });
  };

  const onSelectionChange = (currentRecords: Supplier[]) => {
    currentRecords = currentRecords.filter(canDelete);
    setSelectedSuppliers(currentRecords);
    const idsOutsidePage = selectedSupplierIds.filter(
      (id) => !suppliers.some((record) => record.id === id),
    );
    const currentIds = currentRecords.flatMap((record) =>
      record.id == null ? [] : [record.id],
    );
    setSelectedSupplierIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedSuppliers = () => {
    if (!canDeleteSuppliers || selectedSupplierIds.length === 0) return;
    const ids = [...selectedSupplierIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} fornecedor(es)?`,
      accept: async () => {
        const deletedIds: number[] = [];
        try {
          for (const id of ids) {
            await supplierService.delete(id);
            deletedIds.push(id);
          }
          notificationService.add({
            severity: "success",
            detail: "Fornecedores excluídos com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        } finally {
          setSelectedSupplierIds((current) =>
            current.filter((id) => !deletedIds.includes(id)),
          );
          setSelectedSuppliers((current) =>
            current.filter((record) => record.id == null || !deletedIds.includes(record.id)),
          );
          reloadFromFirstPage(selectedSupplierIds.filter((id) => !deletedIds.includes(id)));
        }
      },
    });
  };

  const openDetails = async (supplier: Supplier) => {
    if (supplier.id == null) return;
    setDetailsVisible(true);
    setSupplierDetails(null);
    try {
      const details: SupplierDTO = await supplierService.findById(supplier.id);
      setSupplierDetails(SupplierMapper.toModel(details));
    } catch {}
  };

  const loadSuppliersForExport = (
    exportPagination: Pagination,
  ): Promise<PageResponse<SupplierDTO>> => {
    return supplierService.list(exportPagination, filterName);
  };

  const actionsTemplate = (supplier: Supplier) => (
    <div className="actions-wrap">
      {authService.hasAuthority("SUPPLIER_WRITE") && (
        <Link to={`/suppliers/${supplier.id}/edit`}>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-pencil"
            tooltip="Editar fornecedor"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
      )}
      {canDeleteSuppliers && (
        <Button
          className="p-button-rounded p-button-text p-button-danger"
          icon="pi pi-trash"
          tooltip="Excluir fornecedor"
          tooltipOptions={{ position: "top" }}
          disabled={!canDelete(supplier)}
          onClick={() => deleteSupplier(supplier)}
        />
      )}

      {authService.hasAuthority("SUPPLIER_READ") && (
        <>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-eye"
            tooltip="Detalhamento do fornecedor"
            tooltipOptions={{ position: "top" }}
            onClick={() => openDetails(supplier)}
          />
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-folder-open"
            tooltip="Arquivos do Fornecedor"
            onClick={() => setFilesSupplier(supplier)}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="supplier-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ORGANIZAÇÃO</span>
          <h1>Fornecedores</h1>
          <p>Consulte e gerencie os fornecedores cadastrados.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-truck-field" />
        </div>
      </header>
      <div className="supplier-filter-container">
        <div className="supplier-actions-group">
          {authService.hasAuthority("SUPPLIER_WRITE") && (
            <Link to="/suppliers/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVO FORNECEDOR
              </button>
            </Link>
          )}
          {canDeleteSuppliers && selectedSupplierIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedSuppliers}
            >
              EXCLUIR FORNECEDORES
            </button>
          )}
        </div>
        <NameFilter
          text="Digite o nome do fornecedor"
          onSearch={searchSupplier}
        />
      </div>

      <DataTable
        records={suppliers}
        showSelection={canDeleteSuppliers}
        rowSelectable={canDelete}
        selectedRecords={selectedSuppliers}
        onSelectedRecordsChange={onSelectionChange}
        columns={visibleTableColumns}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        columnTemplates={{
          createdAt: (supplier) =>
            supplier.createdAt
              ? new Intl.DateTimeFormat("pt-BR").format(supplier.createdAt)
              : "-",
          updatedAt: (supplier) =>
            supplier.updatedAt
              ? new Intl.DateTimeFormat("pt-BR").format(supplier.updatedAt)
              : "-",
          image: (supplier) =>
            imageMap[supplier.id!] ? (
              <img
                className="supplier-photo"
                src={imageMap[supplier.id!]}
                alt="Imagem do fornecedor"
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
        exportTitle="Fornecedores"
        exportFileName="fornecedores"
        exportPagination={pagination}
        exportLoadRecords={loadSuppliersForExport}
        emptyMessage="Nenhum fornecedor encontrado."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setFieldCustomizationVisible(true)}
      />

      <SupplierDetailsModal
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        title="Detalhamento do Fornecedor"
        supplier={supplierDetails}
      />
      <SupplierFilesModal
        visible={!!filesSupplier}
        supplierId={filesSupplier?.id}
        supplierName={filesSupplier?.name}
        onHide={() => setFilesSupplier(null)}
      />
      <FieldCustomization
        visible={fieldCustomizationVisible}
        onHide={() => setFieldCustomizationVisible(false)}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="fornecedores"
        onApply={setVisibleFields}
      />
    </div>
  );
}
