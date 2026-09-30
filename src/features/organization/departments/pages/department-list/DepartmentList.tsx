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
import { Department } from "../../models/Department";
import { DepartmentMapper } from "../../mappers/department.mapper";
import { departmentService } from "../../services/department.service";
import { DepartmentDetailsModal } from "../../components/department-details-modal/DepartmentDetailsModal";
import "./DepartmentList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "description", label: "Descrição" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
];
export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState(["name", "description"]);
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [details, setDetails] = useState<Department | null>(null);
  const [selected, setSelected] = useState<Department[]>([]);
  const [deleting, setDeleting] = useState(false);
  const canWrite = authService.hasAuthority("DEPARTMENT_WRITE");
  const canDelete = authService.hasAuthority("DEPARTMENT_DELETE");
  const canRead = authService.hasAuthority("DEPARTMENT_READ");
  const list = async (next: Pagination, name = filterName) => {
    setLoading(true);
    try {
      const data = await departmentService.list(next, name);
      setDepartments(DepartmentMapper.toModelList(data.content));
      setTotalElements(data.totalElements);
      setSelected([]);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    list(new Pagination());
  }, []);
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
  const deletedepartment = (record: Department) => {
    if (!record.id || !canDelete || deleting) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await departmentService.delete(record.id!);
          reload();
          notificationService.add({
            severity: "success",
            detail: "Setor excluído com sucesso!",
          });
        } catch {
          /* O interceptor exibe o erro. */
        }
      },
    });
  };
  const deleteSelected = () => {
    if (!canDelete || deleting || selected.length === 0) return;
    const records = [...selected];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${records.length} departamento(s)?`,
      accept: async () => {
        setDeleting(true);
        try {
          for (const record of records) {
            if (record.id != null) await departmentService.delete(record.id);
          }
          notificationService.add({
            severity: "success",
            detail: "Departamentos excluídos com sucesso!",
          });
        } catch {
          notificationService.add({
            severity: "warn",
            detail:
              "A exclusão foi interrompida. Confira os registros restantes na tabela.",
          });
        } finally {
          setDeleting(false);
          setSelected([]);
          reload();
        }
      },
    });
  };
  const openDetails = async (record: Department) => {
    if (!record.id || !canRead) return;
    setDetails(null);
    setDetailsVisible(true);
    try {
      setDetails(
        DepartmentMapper.toModel(await departmentService.findById(record.id)),
      );
    } catch {
      setDetailsVisible(false);
    }
  };
  const formatDate = (date?: Date) =>
    date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
  return (
    <div className="department-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ORGANIZAÇÃO</span>
          <h1>Departamentos</h1>
          <p>Consulte e gerencie os departamentos cadastrados.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-building-user" />
        </div>
      </header>
      <div className="department-filter-container">
        <div className="department-actions-group">
          {canWrite && (
            <Link to="/departments/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVO SETOR
              </button>
            </Link>
          )}
          {canDelete && selected.length > 0 && (
            <button
              type="button"
              className="btn btn-danger text-white btn-crud-action"
              disabled={deleting}
              onClick={deleteSelected}
            >
              EXCLUIR DEPARTAMENTOS
            </button>
          )}
        </div>
        <NameFilter text="Digite o nome do setor" onSearch={search} />
      </div>
      <DataTable
        records={departments}
        columns={availableFields.filter((field) =>
          visibleFields.includes(field.field),
        )}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading || deleting}
        showSelection={canDelete}
        selectedRecords={selected}
        onSelectedRecordsChange={(records) => {
          if (canDelete && !deleting) setSelected(records);
        }}
        columnTemplates={{
          createdAt: (record) => formatDate(record.createdAt),
          updatedAt: (record) => formatDate(record.updatedAt),
        }}
        actionsTemplate={(record) => (
          <div className="actions-wrap">
            {canWrite && (
              <Link to={`/departments/${record.id}/edit`}>
                <Button
                  className="p-button-rounded p-button-text"
                  icon="pi pi-pencil"
                  tooltip="Atualizar setor"
                />
              </Link>
            )}
            {canDelete && (
              <Button
                className="p-button-rounded p-button-text p-button-danger"
                icon="pi pi-trash"
                tooltip="Excluir setor"
                disabled={deleting}
                onClick={() => deletedepartment(record)}
              />
            )}
            {canRead && (
              <Button
                className="p-button-rounded p-button-text"
                icon="pi pi-eye"
                tooltip="Detalhamento do departamento"
                onClick={() => openDetails(record)}
              />
            )}
          </div>
        )}
        showColumnsButton
        showExportButton
        exportTitle="Setores"
        exportFileName="setores"
        exportPagination={pagination}
        exportLoadRecords={(next) => departmentService.list(next, filterName)}
        emptyMessage="Nenhum setor encontrado."
        onLazyLoad={changePage}
        onColumnsButtonClick={() => setCustomizationVisible(true)}
      />
      <FieldCustomization
        visible={customizationVisible}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="setores"
        onHide={() => setCustomizationVisible(false)}
        onApply={setVisibleFields}
      />
      <DepartmentDetailsModal
        visible={detailsVisible}
        department={details}
        onHide={() => setDetailsVisible(false)}
      />
    </div>
  );
}
