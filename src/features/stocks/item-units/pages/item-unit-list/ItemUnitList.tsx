import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
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
import { ItemUnit } from "../../models/ItemUnit";
import { ItemUnitMapper } from "../../mappers/item-unit.mapper";
import { itemUnitService } from "../../services/item-unit.service";
import { ItemUnitStatusUpdateDTO } from "../../dtos/item-unit-status-update-dto";
import {
  ITEM_UNIT_STATUSES,
  getItemUnitAvailabilityLabel,
  getItemUnitConditionLabel,
} from "../../constants/item-unit-options";
import { ItemUnitDetailsModal } from "../../components/item-unit-details-modal/ItemUnitDetailsModal";
import "./ItemUnitList.css";

const availableFields: DataTableColumn[] = [
  { field: "item.name", label: "Item" },
  { field: "assetCode", label: "Código patrimonial" },
  { field: "status", label: "Situação" },
  { field: "conditionStatus", label: "Conservação" },
  { field: "purchaseDate", label: "Data de compra" },
  { field: "notes", label: "Observações" },
  { field: "active", label: "Ativa" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
];

export function ItemUnitList() {
  const [units, setUnits] = useState<ItemUnit[]>([]);
  const [pagination, setPagination] = useState(
    new Pagination(0, 5, "ASC", "assetCode"),
  );
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState([
    "item.name",
    "assetCode",
    "status",
    "conditionStatus",
  ]);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<ItemUnit | null>(null);
  const [statusUnit, setStatusUnit] = useState<ItemUnit | null>(null);
  const [statusUpdate, setStatusUpdate] = useState(
    new ItemUnitStatusUpdateDTO(),
  );
  const [savingStatus, setSavingStatus] = useState(false);
  const [searchParams] = useSearchParams();
  const params = useParams();
  const itemIdValue = params.itemId ?? searchParams.get("itemId");
  const itemId = itemIdValue == null ? undefined : Number(itemIdValue);
  const query = itemId == null ? "" : `?itemId=${itemId}`;
  const canRead = authService.hasAuthority("ITEM_UNIT_READ");
  const canWrite = authService.hasAuthority("ITEM_UNIT_WRITE");
  const canDelete = authService.hasAuthority("ITEM_UNIT_DELETE");

  const list = async (
    next: Pagination,
    name = filterName,
    active = filterActive,
  ) => {
    setLoading(true);
    try {
      const data = await itemUnitService.list(next, name, itemId, active);
      const loaded = ItemUnitMapper.toModelList(data.content);
      setUnits(loaded);
      setTotalElements(data.totalElements);
      setSelectedIds((ids) =>
        ids.filter(
          (id) => !loaded.some((unit) => unit.id === id && !unit.active),
        ),
      );
    } catch {
      // O interceptor exibe o erro.
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setSelectedIds([]);
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next);
  }, [itemIdValue]);

  const reload = () => {
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    list(next);
  };
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
  const changeActiveFilter = async (value: string) => {
    const active = value === "all" ? undefined : value === "true";
    setFilterActive(active);
    setSelectedIds([]);
    const next = new Pagination(
      0,
      pagination.linesPerPage,
      pagination.direction,
      pagination.orderBy,
    );
    setPagination(next);
    setLoading(true);
    try {
      const data = await itemUnitService.list(next, filterName, itemId, active);
      setUnits(ItemUnitMapper.toModelList(data.content));
      setTotalElements(data.totalElements);
    } catch {
      // O interceptor exibe o erro.
    } finally {
      setLoading(false);
    }
  };
  const retire = (unit?: ItemUnit) => {
    if (!canDelete || (unit && (!unit.id || !unit.active))) return;
    const ids = unit?.id != null ? [unit.id] : [...selectedIds];
    if (ids.length === 0) return;
    confirmDialog({
      message: unit
        ? "Dar baixa definitiva nesta unidade? Ela ficará inativa e seu histórico será preservado."
        : `Dar baixa definitiva em ${ids.length} unidade(s)? Elas ficarão inativas e seus históricos serão preservados.`,
      accept: async () => {
        try {
          if (unit) await itemUnitService.delete(ids[0]);
          else await itemUnitService.deleteAll(ids);
          setSelectedIds([]);
          reload();
          notificationService.add({
            severity: "success",
            detail: unit
              ? "Baixa da unidade física registrada!"
              : "Baixa das unidades físicas registrada!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };
  const reactivate = async (unit: ItemUnit) => {
    if (
      !canWrite ||
      !unit.id ||
      unit.active ||
      unit.item?.active === false ||
      unit.item?.category?.active === false
    )
      return;
    try {
      await itemUnitService.changeActive(unit.id, true);
      reload();
      notificationService.add({
        severity: "success",
        detail: "Reentrada da unidade física registrada!",
      });
    } catch {
      /* interceptor */
    }
  };
  const openDetails = async (unit: ItemUnit) => {
    if (!canRead || unit.id == null) return;
    setDetails(null);
    setDetailsVisible(true);
    try {
      setDetails(
        ItemUnitMapper.toModel(await itemUnitService.findById(unit.id)),
      );
    } catch {
      setDetailsVisible(false);
    }
  };
  const updateStatus = async () => {
    if (
      !canWrite ||
      !statusUnit?.id ||
      !statusUnit.active ||
      savingStatus ||
      statusUpdate.status === statusUnit.status
    )
      return;
    if (
      !ITEM_UNIT_STATUSES.some((option) => option.value === statusUpdate.status)
    ) {
      notificationService.add({
        severity: "warn",
        detail: "Selecione uma situação válida.",
      });
      return;
    }
    if ((statusUpdate.reason || "").length > 255) {
      notificationService.add({
        severity: "warn",
        detail: "O motivo deve ter até 255 caracteres.",
      });
      return;
    }
    setSavingStatus(true);
    try {
      await itemUnitService.updateStatus(statusUnit.id, statusUpdate);
      setStatusUnit(null);
      list(pagination);
      notificationService.add({
        severity: "success",
        detail: "Situação da unidade atualizada!",
      });
    } catch {
      /* interceptor */
    } finally {
      setSavingStatus(false);
    }
  };
  const formatDate = (date?: Date | string | null) =>
    date
      ? new Intl.DateTimeFormat("pt-BR").format(
          typeof date === "string" ? new Date(date + "T00:00:00") : date,
        )
      : "-";
  const loadForExport = async (next: Pagination) => {
    const data = await itemUnitService.list(
      next,
      filterName,
      itemId,
      filterActive,
    );
    return {
      ...data,
      content: data.content.map((dto) => ({
        ...dto,
        status: getItemUnitAvailabilityLabel(ItemUnitMapper.toModel(dto)),
        conditionStatus: getItemUnitConditionLabel(dto.conditionStatus || ""),
      })),
    };
  };

  return (
    <div className="item-unit-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ESTOQUE</span>
          <h1>Unidades físicas</h1>
          <p>Consulte e gerencie as unidades físicas cadastradas.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-box-open" />
        </div>
      </header>
      <div className="item-unit-filter-container">
        <div className="item-unit-actions-group">
          {canWrite && (
            <Link to={`/item-units/create${query}`} className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVA UNIDADE
              </button>
            </Link>
          )}
          {canDelete && selectedIds.length > 0 && (
            <button
              type="button"
              className="btn btn-danger text-white btn-crud-action"
              onClick={() => retire()}
            >
              DAR BAIXA NAS UNIDADES
            </button>
          )}
        </div>
        <NameFilter
          text="Digite o item ou código patrimonial"
          onSearch={search}
        />
        <div className="item-unit-active-filter">
          <label htmlFor="unitActiveFilter" className="form-label">
            Unidades
          </label>
          <select
            id="unitActiveFilter"
            className="form-select"
            value={filterActive == null ? "all" : String(filterActive)}
            onChange={(e) => changeActiveFilter(e.target.value)}
          >
            <option value="true">Ativas</option>
            <option value="false">Com baixa</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>
      <DataTable
        records={units}
        columns={availableFields.filter((field) =>
          visibleFields.includes(field.field),
        )}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        showSelection={canDelete}
        rowSelectable={(unit) => unit.active}
        selectedRecords={units.filter(
          (unit) => unit.id != null && selectedIds.includes(unit.id),
        )}
        onSelectedRecordsChange={(selected) => {
          if (!canDelete) return;
          const otherIds = selectedIds.filter(
            (id) => !units.some((unit) => unit.id === id),
          );
          setSelectedIds([
            ...otherIds,
            ...selected
              .filter((unit) => unit.active && unit.id != null)
              .map((unit) => unit.id!),
          ]);
        }}
        columnTemplates={{
          status: getItemUnitAvailabilityLabel,
          conditionStatus: (unit) =>
            getItemUnitConditionLabel(unit.conditionStatus),
          active: (unit) => (unit.active ? "Sim" : "Não"),
          purchaseDate: (unit) => formatDate(unit.purchaseDate),
          createdAt: (unit) => formatDate(unit.createdAt),
          updatedAt: (unit) => formatDate(unit.updatedAt),
        }}
        actionsTemplate={(unit) => (
          <div className="actions-wrap">
            {canWrite && (
              <Link to={`/item-units/${unit.id}/edit${query}`}>
                <Button
                  className="p-button-rounded p-button-text"
                  icon="pi pi-pencil"
                  tooltip="Editar unidade física"
                />
              </Link>
            )}
            {canDelete && unit.active && (
              <Button
                className="p-button-rounded p-button-text p-button-danger"
                icon="pi pi-minus-circle"
                tooltip="Dar baixa definitiva na unidade"
                onClick={() => retire(unit)}
              />
            )}
            {canWrite && !unit.active && (
              <Button
                className="p-button-rounded p-button-text p-button-warning"
                icon="pi pi-check"
                tooltip="Registrar reentrada da unidade"
                disabled={
                  unit.item?.active === false ||
                  unit.item?.category?.active === false
                }
                onClick={() => reactivate(unit)}
              />
            )}
            {canRead && (
              <Button
                className="p-button-rounded p-button-text"
                icon="pi pi-eye"
                tooltip="Detalhamento da unidade"
                onClick={() => openDetails(unit)}
              />
            )}
            {canWrite && unit.active && (
              <Button
                className="p-button-rounded p-button-text"
                icon="pi pi-sync"
                tooltip="Alterar situação da unidade"
                onClick={() => {
                  setStatusUnit(unit);
                  setStatusUpdate(
                    new ItemUnitStatusUpdateDTO({
                      status: unit.status,
                      reason: "",
                    }),
                  );
                }}
              />
            )}
          </div>
        )}
        showColumnsButton
        showExportButton
        exportTitle="Unidades físicas"
        exportFileName="unidades-fisicas"
        exportPagination={pagination}
        exportLoadRecords={loadForExport}
        emptyMessage="Nenhuma unidade física encontrada."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setCustomizationVisible(true)}
      />
      <Dialog
        header="Alterar situação da unidade"
        visible={!!statusUnit}
        modal
        closable={!savingStatus}
        closeOnEscape={!savingStatus}
        style={{ width: "480px", maxWidth: "95vw" }}
        onHide={() => {
          if (!savingStatus) setStatusUnit(null);
        }}
      >
        {statusUnit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateStatus();
            }}
          >
            <p>
              {statusUnit.assetCode} — {statusUnit.item?.name}
            </p>
            <div className="mb-3">
              <label htmlFor="unitStatus" className="form-label">
                Situação *
              </label>
              <select
                id="unitStatus"
                name="status"
                className="form-control form-select"
                required
                disabled={savingStatus}
                value={statusUpdate.status}
                onChange={(e) =>
                  setStatusUpdate(
                    new ItemUnitStatusUpdateDTO({
                      ...statusUpdate,
                      status: e.target.value,
                    }),
                  )
                }
              >
                {ITEM_UNIT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {(statusUnit.item?.active === false ||
                statusUnit.item?.category?.active === false) && (
                <small>
                  A unidade só ficará disponível para uso quando o item e a
                  categoria estiverem ativos.
                </small>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="statusReason" className="form-label">
                Motivo
              </label>
              <textarea
                id="statusReason"
                name="reason"
                className="form-control"
                rows={3}
                maxLength={255}
                disabled={savingStatus}
                value={statusUpdate.reason || ""}
                onChange={(e) =>
                  setStatusUpdate(
                    new ItemUnitStatusUpdateDTO({
                      ...statusUpdate,
                      reason: e.target.value,
                    }),
                  )
                }
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                savingStatus || statusUpdate.status === statusUnit.status
              }
            >
              SALVAR
            </button>
            <button
              type="button"
              className="btn btn-outline-danger ms-2"
              disabled={savingStatus}
              onClick={() => setStatusUnit(null)}
            >
              CANCELAR
            </button>
          </form>
        )}
      </Dialog>
      <ItemUnitDetailsModal
        visible={detailsVisible}
        unit={details}
        onHide={() => setDetailsVisible(false)}
      />
      <FieldCustomization
        visible={customizationVisible}
        fields={availableFields}
        selectedFields={visibleFields}
        contentName="unidades físicas"
        onHide={() => setCustomizationVisible(false)}
        onApply={setVisibleFields}
      />
    </div>
  );
}
