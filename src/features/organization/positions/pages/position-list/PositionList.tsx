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
import { Position } from "../../models/Position";
import { PositionMapper } from "../../mappers/position.mapper";
import { positionService } from "../../services/position.service";
import { PositionDetailsModal } from "../../components/position-details-modal/PositionDetailsModal";
import "./PositionList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
];
export function PositionList() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState(["name"]);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<Position | null>(null);

  const canWrite = authService.hasAuthority("POSITION_WRITE");
  const canDelete = authService.hasAuthority("POSITION_DELETE");
  const canRead = authService.hasAuthority("POSITION_READ");
  const list = async (next: Pagination, name = filterName, selectedIds = selectedPositionIds) => {
    setLoading(true);
    try {
      const data = await positionService.list(next, name);
      const loadedPositions = PositionMapper.toModelList(data.content);
      setPositions(loadedPositions);
      setSelectedPositions(
        loadedPositions.filter(
          (position) => position.id != null && selectedIds.includes(position.id),
        ),
      );
      setTotalElements(data.totalElements);
    } catch {
      /* O interceptor exibe o erro. */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    list(new Pagination());
  }, []);
  const reload = (selectedIds = selectedPositionIds) => {
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
  const deleteposition = (record: Position) => {
    if (!record.id || !canDelete) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await positionService.delete(record.id!);
          reload();
          notificationService.add({
            severity: "success",
            detail: "Cargo excluído com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        }
      },
    });
  };

  const onSelectionChange = (currentRecords: Position[]) => {
    currentRecords = currentRecords.filter(() => canDelete);
    setSelectedPositions(currentRecords);
    const idsOutsidePage = selectedPositionIds.filter(
      (id) => !positions.some((record) => record.id === id),
    );
    const currentIds = currentRecords.flatMap((record) =>
      record.id == null ? [] : [record.id],
    );
    setSelectedPositionIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedPositions = () => {
    if (!canDelete || selectedPositionIds.length === 0) return;
    const ids = [...selectedPositionIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} cargo(s)?`,
      accept: async () => {
        const deletedIds: number[] = [];
        try {
          for (const id of ids) {
            await positionService.delete(id);
            deletedIds.push(id);
          }
          notificationService.add({
            severity: "success",
            detail: "Cargos excluídos com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        } finally {
          setSelectedPositionIds((current) =>
            current.filter((id) => !deletedIds.includes(id)),
          );
          setSelectedPositions((current) =>
            current.filter((record) => record.id == null || !deletedIds.includes(record.id)),
          );
          reload(selectedPositionIds.filter((id) => !deletedIds.includes(id)));
        }
      },
    });
  };

  const openDetails = async (record: Position) => {
    if (!record.id || !canRead) return;
    setDetails(null);
    setDetailsVisible(true);
    try {
      setDetails(
        PositionMapper.toModel(await positionService.findById(record.id)),
      );
    } catch {
      setDetailsVisible(false);
    }
  };
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <div className="position-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ORGANIZAÇÃO</span>
          <h1>Cargos</h1>
          <p>Consulte e gerencie os cargos cadastrados.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-briefcase" />
        </div>
      </header>
      <div className="position-filter-container">
        <div className="position-actions-group">
          {canWrite && (
            <Link to="/positions/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVO CARGO
              </button>
            </Link>
          )}
          {canDelete && selectedPositionIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedPositions}
            >
              EXCLUIR CARGOS
            </button>
          )}
        </div>
        <NameFilter text="Digite o nome do cargo" onSearch={search} />
      </div>
      <DataTable
        records={positions}
        columns={availableFields.filter((field) =>
          visibleFields.includes(field.field),
        )}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        showSelection={canDelete}
        rowSelectable={() => canDelete}
        selectedRecords={selectedPositions}
        onSelectedRecordsChange={onSelectionChange}
        columnTemplates={{
          createdAt: (record) => formatDate(record.createdAt),
          updatedAt: (record) => formatDate(record.updatedAt),
        }}
        actionsTemplate={(record) => (
          <div className="actions-wrap">
            {canWrite && (
              <Link to={`/positions/${record.id}/edit`}>
                <Button
                  className="p-button-rounded p-button-text"
                  icon="pi pi-pencil"
                  tooltip="Editar cargo"
                />
              </Link>
            )}
            {canDelete && (
              <Button
                className="p-button-rounded p-button-text p-button-danger"
                icon="pi pi-trash"
                tooltip="Excluir cargo"
                onClick={() => deleteposition(record)}
              />
            )}
            {canRead && (
              <Button
                className="p-button-rounded p-button-text"
                icon="pi pi-eye"
                tooltip="Detalhamento do cargo"
                onClick={() => openDetails(record)}
              />
            )}
          </div>
        )}
        showColumnsButton
        showExportButton
        exportTitle="Cargos"
        exportFileName="cargos"
        exportPagination={pagination}
        exportLoadRecords={(next) => positionService.list(next, filterName)}
        emptyMessage="Nenhum cargo encontrado."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setCustomizationVisible(true)}
      />
      <FieldCustomization
        visible={customizationVisible}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="cargos"
        onHide={() => setCustomizationVisible(false)}
        onApply={setVisibleFields}
      />
      <PositionDetailsModal
        visible={detailsVisible}
        position={details}
        onHide={() => setDetailsVisible(false)}
      />
    </div>
  );
}
