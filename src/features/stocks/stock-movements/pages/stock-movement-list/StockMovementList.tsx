import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { authService } from "../../../../../core/auth/services/auth.service";
import { Pagination } from "../../../../../core/models/Pagination";
import {
  DataTable,
  LazyLoadEvent,
} from "../../../../../shared/components/data-table/DataTable";
import { DataTableColumn } from "../../../../../shared/components/data-table/models/data-table-column";
import { NameFilter } from "../../../../../shared/components/name-filter/NameFilter";
import { FieldCustomization } from "../../../../../shared/components/field-customization/FieldCustomization";
import { StockMovement } from "../../models/StockMovement";
import { StockMovementMapper } from "../../mappers/stock-movement.mapper";
import { stockMovementService } from "../../services/stock-movement.service";
import "./StockMovementList.css";
import { getItemUnitStatusLabel } from "../../../item-units/constants/item-unit-options";

const availableFields: DataTableColumn[] = [
  { field: "createdAt", label: "Data" },
  { field: "itemName", label: "Item" },
  { field: "assetCode", label: "Código patrimonial" },
  { field: "type", label: "Tipo" },
  { field: "previousStatus", label: "Situação anterior" },
  { field: "newStatus", label: "Nova situação" },
  { field: "quantity", label: "Quantidade" },
  { field: "reason", label: "Motivo" },
  { field: "createdBy", label: "Usuário" },
];

export function StockMovementList() {
  const [records, setRecords] = useState<StockMovement[]>([]);
  const [pagination, setPagination] = useState(
    new Pagination(0, 5, "DESC", "createdAt"),
  );
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState([
    "createdAt",
    "itemName",
    "assetCode",
    "type",
    "previousStatus",
    "newStatus",
    "quantity",
    "reason",
    "createdBy",
  ]);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const list = async (next: Pagination, name = filterName) => {
    setLoading(true);
    try {
      const data = await stockMovementService.list(next, name);
      setRecords(data.content.map((dto) => StockMovementMapper.toModel(dto)));
      setTotalElements(data.totalElements);
    } catch {
      /* interceptor */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    list(new Pagination(0, 5, "DESC", "createdAt"));
  }, []);
  const changePage = (event: LazyLoadEvent) => {
    const rows = event.rows || pagination.linesPerPage;
    const next = new Pagination(
      (event.first || 0) / rows,
      rows,
      event.sortField
        ? event.sortOrder === -1
          ? "DESC"
          : "ASC"
        : pagination.direction,
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
  const formatDate = (date?: Date) =>
    date
      ? new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date)
      : "-";
  const getTypeLabel = (type: string) => {
    if (type === "ENTRY") return "Entrada";
    if (type === "EXIT") return "Saída definitiva";
    if (type === "ADJUSTMENT") return "Ajuste";
    if (type === "STATUS_CHANGE") return "Alteração de situação";
    return type || "-";
  };
  const loadForExport = async (next: Pagination) => {
    const data = await stockMovementService.list(next, filterName);
    return {
      ...data,
      content: data.content.map((dto) => ({
        ...dto,
        type: getTypeLabel(dto.type || ""),
        previousStatus: getItemUnitStatusLabel(dto.previousStatus),
        newStatus: getItemUnitStatusLabel(dto.newStatus),
      })),
    };
  };

  return (
    <div className="stock-movement-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ESTOQUE</span>
          <h1>Movimentações de estoque</h1>
          <p>
            Consulte as entradas, baixas, ajustes e alterações de situação do
            estoque.
          </p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-right-left" />
        </div>
      </header>
      <div className="stock-movement-filter-container">
        <div className="stock-movement-actions-group">
          {authService.hasAuthority("STOCK_MOVEMENTS_WRITE") && (
            <Link to="/stock-movements/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVA MOVIMENTAÇÃO
              </button>
            </Link>
          )}
        </div>
        <NameFilter text="Digite o nome do item" onSearch={search} />
      </div>
      <DataTable
        records={records}
        columns={availableFields.filter((field) =>
          visibleFields.includes(field.field),
        )}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        showSelection={false}
        columnTemplates={{
          createdAt: (record) => formatDate(record.createdAt),
          type: (record) => getTypeLabel(record.type),
          quantity: (record) => record.quantity ?? 0,
          previousStatus: (record) =>
            getItemUnitStatusLabel(record.previousStatus),
          newStatus: (record) => getItemUnitStatusLabel(record.newStatus),
        }}
        showColumnsButton
        showExportButton
        exportTitle="Movimentações de estoque"
        exportFileName="movimentacoes-de-estoque"
        exportPagination={pagination}
        exportLoadRecords={loadForExport}
        emptyMessage="Nenhuma movimentação de estoque encontrada."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setCustomizationVisible(true)}
      />
      <FieldCustomization
        visible={customizationVisible}
        fields={availableFields}
        selectedFields={visibleFields}
        contentName="movimentações de estoque"
        onHide={() => setCustomizationVisible(false)}
        onApply={setVisibleFields}
      />
    </div>
  );
}
