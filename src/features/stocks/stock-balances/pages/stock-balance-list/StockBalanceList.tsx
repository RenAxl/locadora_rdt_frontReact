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
import { StockBalance } from "../../models/StockBalance";
import { StockBalanceMapper } from "../../mappers/stock-balance.mapper";
import { stockBalanceService } from "../../services/stock-balance.service";
import "./StockBalanceList.css";
import { notificationService } from "../../../../../core/error/services/notification.service";

const availableFields: DataTableColumn[] = [
  { field: "itemName", label: "Item" },
  { field: "totalQuantity", label: "Total" },
  { field: "availableQuantity", label: "Disponível" },
  { field: "unavailableQuantity", label: "Indisponível" },
  { field: "maintenanceQuantity", label: "Em manutenção" },
  { field: "damagedQuantity", label: "Danificados" },
  { field: "lostQuantity", label: "Não localizados" },
  { field: "minimumQuantity", label: "Mínimo" },
  { field: "lowStock", label: "Alerta" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
];

export function StockBalanceList() {
  const [records, setRecords] = useState<StockBalance[]>([]);
  const [pagination, setPagination] = useState(
    new Pagination(0, 5, "ASC", "item.name"),
  );
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimumInputs, setMinimumInputs] = useState<Record<number, string>>(
    {},
  );
  const [visibleFields, setVisibleFields] = useState([
    "itemName",
    "totalQuantity",
    "availableQuantity",
    "unavailableQuantity",
    "maintenanceQuantity",
    "damagedQuantity",
    "lostQuantity",
    "minimumQuantity",
    "lowStock",
  ]);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const list = async (next: Pagination, name = filterName) => {
    setLoading(true);
    try {
      const data = await stockBalanceService.list(next, name);
      setRecords(data.content.map((dto) => StockBalanceMapper.toModel(dto)));
      setTotalElements(data.totalElements);
    } catch {
      /* interceptor */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    list(new Pagination(0, 5, "ASC", "item.name"));
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
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  const updateMinimum = async (record: StockBalance, value: string) => {
    if (!record.id || !authService.hasAuthority("STOCK_BALANCES_WRITE")) return;
    const quantity = value === "" ? NaN : Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      notificationService.add({
        severity: "warn",
        detail:
          "O estoque mínimo deve ser um número inteiro maior ou igual a zero.",
      });
      setMinimumInputs({});
      list(pagination);
      return;
    }
    try {
      const dto = StockBalanceMapper.toMinimumUpdateDTO(
        new StockBalance({ ...record, minimumQuantity: quantity }),
      );
      const updated = StockBalanceMapper.toModel(
        await stockBalanceService.updateMinimum(dto),
      );
      setRecords((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      notificationService.add({
        severity: "success",
        detail: "Estoque mínimo atualizado!",
      });
    } catch {
      list(pagination);
    } finally {
      setMinimumInputs({});
    }
  };

  return (
    <div className="stock-balance-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ESTOQUE</span>
          <h1>Saldos de estoque</h1>
          <p>
            Acompanhe as quantidades das unidades ativas e sua disponibilidade.
          </p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-warehouse" />
        </div>
      </header>
      <div className="stock-balance-filter-container">
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
          updatedAt: (record) => formatDate(record.updatedAt),
          minimumQuantity: (record) => (
            <input
              aria-label="Estoque mínimo"
              className="form-control minimum-quantity-input"
              type="number"
              min={0}
              step={1}
              value={
                minimumInputs[record.id!] ?? String(record.minimumQuantity)
              }
              disabled={!authService.hasAuthority("STOCK_BALANCES_WRITE")}
              onChange={(event) =>
                setMinimumInputs({
                  ...minimumInputs,
                  [record.id!]: event.target.value,
                })
              }
              onBlur={(e) => {
                if (e.target.value !== String(record.minimumQuantity))
                  updateMinimum(record, e.target.value);
              }}
            />
          ),
          lowStock: (record) => (
            <span className={record.lowStock ? "low-stock-alert" : ""}>
              {record.lowStock ? "Estoque baixo" : "-"}
            </span>
          ),
        }}
        actionsTemplate={(record) => (
          <div className="actions-wrap">
            {authService.hasAuthority("STOCK_BALANCES_READ") &&
              authService.hasAuthority("ITEM_UNIT_READ") && (
                <Link to={`/stock-balances/${record.itemId}/units`}>
                  <Button
                    className="p-button-rounded p-button-text"
                    icon="pi pi-box"
                    tooltip="Ver unidades físicas"
                  />
                </Link>
              )}
          </div>
        )}
        showColumnsButton
        showExportButton
        exportTitle="Saldos de estoque"
        exportFileName="saldos-de-estoque"
        exportPagination={pagination}
        exportLoadRecords={(next) => stockBalanceService.list(next, filterName)}
        emptyMessage="Nenhum saldo de estoque encontrado."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setCustomizationVisible(true)}
      />
      <FieldCustomization
        visible={customizationVisible}
        fields={availableFields}
        selectedFields={visibleFields}
        contentName="saldos de estoque"
        onHide={() => setCustomizationVisible(false)}
        onApply={setVisibleFields}
      />
    </div>
  );
}
