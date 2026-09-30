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
import { EmployeeDetailsModal } from "../../components/employee-details-modal/EmployeeDetailsModal";
import { EmployeeDTO } from "../../dtos/employee-dto";
import { EmployeeMapper } from "../../mappers/employee.mapper";
import { Employee } from "../../models/Employee";
import { employeeService } from "../../services/employee.service";
import { EmployeeFilesModal } from "../../components/employee-files-modal/EmployeeFilesModal";
import "./EmployeeList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "employeeCode", label: "Matrícula" },
  { field: "email", label: "E-mail" },
  { field: "phone", label: "Telefone" },
  { field: "position.name", label: "Cargo" },
  { field: "department.name", label: "Departamento" },
  { field: "hireDate", label: "Admissão" },
  { field: "terminationDate", label: "Desligamento" },
  { field: "employmentType", label: "Contratação" },
  { field: "salary", label: "Salário" },
  { field: "address", label: "Endereço" },
  { field: "active", label: "Status" },
  { field: "createdAt", label: "Data cadastro" },
  { field: "updatedAt", label: "Data atualização" },
  { field: "createdBy", label: "Criado por" },
  { field: "updatedBy", label: "Atualizado por" },
  { field: "photo", label: "Foto" },
];

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldCustomizationVisible, setFieldCustomizationVisible] =
    useState(false);
  const [visibleFields, setVisibleFields] = useState([
    "name",
    "employeeCode",
    "email",
    "photo",
  ]);
  const [filesEmployee, setFilesEmployee] = useState<Employee | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null);
  const [photoMap, setPhotoMap] = useState<Record<number, string>>({});
  const photoUrls = useRef(new PhotoUrlRegistry());
  const photoRequest = useRef(0);

  const visibleTableColumns = useMemo(
    () =>
      availableFields.filter((column) => visibleFields.includes(column.field)),
    [visibleFields],
  );

  const loadPhotos = async (loadedEmployees: Employee[]) => {
    const request = ++photoRequest.current;
    photoUrls.current.clear();
    setPhotoMap({});
    for (const employee of loadedEmployees) {
      if (!employee.id) continue;
      try {
        const blob = await employeeService.getEmployeePhoto(employee.id);
        if (request !== photoRequest.current) return;
        const photoUrl = photoUrls.current.create(blob);
        if (photoUrl)
          setPhotoMap((current) => ({ ...current, [employee.id!]: photoUrl }));
      } catch {
        // Funcionário sem foto é um caso esperado no Angular original.
      }
    }
  };

  const list = async (
    currentPagination: Pagination,
    currentFilter = filterName,
  ) => {
    setLoading(true);
    try {
      const data = await employeeService.list(currentPagination, currentFilter);
      const loadedEmployees = EmployeeMapper.toModelList(data.content);
      setEmployees(loadedEmployees);
      setTotalElements(data.totalElements);
      setSelectedEmployees(
        loadedEmployees.filter(
          (employee) =>
            employee.id != null && selectedEmployeeIds.includes(employee.id),
        ),
      );
      loadPhotos(loadedEmployees);
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

  const searchEmployee = (name: string) => {
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

  const canDeleteEmployees = authService.hasAnyAuthority(["EMPLOYEE_DELETE"]);
  const canDelete = (_employee: Employee) => canDeleteEmployees;

  const deleteEmployee = (employee: Employee) => {
    if (!employee.id || !canDelete(employee)) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await employeeService.delete(employee.id!);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Funcionário excluído com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const onSelectionChange = (currentEmployees: Employee[]) => {
    currentEmployees = currentEmployees.filter(canDelete);
    setSelectedEmployees(currentEmployees);
    const idsOutsidePage = selectedEmployeeIds.filter(
      (id) => !employees.some((employee) => employee.id === id),
    );
    const currentIds = currentEmployees.flatMap((employee) =>
      employee.id == null ? [] : [employee.id],
    );
    setSelectedEmployeeIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedEmployees = () => {
    if (!canDeleteEmployees || selectedEmployeeIds.length === 0) return;
    const ids = [...selectedEmployeeIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} funcionário(s)?`,
      accept: async () => {
        try {
          await employeeService.deleteAll(ids);
          setSelectedEmployeeIds([]);
          setSelectedEmployees([]);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Funcionários excluídos com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const openDetails = async (employee: Employee) => {
    if (employee.id == null) return;
    setDetailsVisible(true);
    setEmployeeDetails(null);
    try {
      const details: EmployeeDTO = await employeeService.findById(employee.id);
      setEmployeeDetails(EmployeeMapper.toModel(details));
    } catch {
      /* interceptor */
    }
  };

  const toggleActive = async (employee: Employee) => {
    if (!employee.id) return;
    const newStatus = !employee.active;
    try {
      await employeeService.changeActive(employee.id, newStatus);
      setEmployees((current) =>
        current.map((item) =>
          item.id === employee.id
            ? new Employee({ ...item, active: newStatus })
            : item,
        ),
      );
      notificationService.add({
        severity: "success",
        detail: `Funcionário ${newStatus ? "ativado" : "desativado"} com sucesso!`,
      });
    } catch {
      /* interceptor */
    }
  };

  const loadEmployeesForExport = (
    exportPagination: Pagination,
  ): Promise<PageResponse<EmployeeDTO>> => {
    return employeeService.list(exportPagination, filterName);
  };

  const actionsTemplate = (employee: Employee) => (
    <div className="actions-wrap">
      {authService.hasAuthority("EMPLOYEE_WRITE") && (
        <Link to={`/employees/${employee.id}/edit`}>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-pencil"
            tooltip="Editar funcionário"
            tooltipOptions={{ position: "top" }}
          />
        </Link>
      )}
      {canDeleteEmployees && (
        <Button
          className="p-button-rounded p-button-text p-button-danger"
          icon="pi pi-trash"
          tooltip="Excluir funcionário"
          tooltipOptions={{ position: "top" }}
          disabled={!canDelete(employee)}
          onClick={() => deleteEmployee(employee)}
        />
      )}
      {authService.hasAuthority("EMPLOYEE_WRITE") && (
        <Button
          className="p-button-rounded p-button-text p-button-warning"
          icon={employee.active ? "pi pi-ban" : "pi pi-check"}
          tooltip="Ativar / Desativar Funcionário"
          tooltipOptions={{ position: "top" }}
          onClick={() => toggleActive(employee)}
        />
      )}
      {authService.hasAuthority("EMPLOYEE_READ") && (
        <>
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-eye"
            tooltip="Detalhamento do funcionário"
            tooltipOptions={{ position: "top" }}
            onClick={() => openDetails(employee)}
          />
          <Button
            className="p-button-rounded p-button-text"
            icon="pi pi-folder-open"
            tooltip="Arquivos do Funcionário"
            onClick={() => setFilesEmployee(employee)}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="employee-list-screen">
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ORGANIZAÇÃO</span>
          <h1>Funcionários</h1>
          <p>Consulte e gerencie os funcionários cadastrados.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-user-group" />
        </div>
      </header>
      <div className="employee-filter-container">
        <div className="employee-actions-group">
          {authService.hasAuthority("EMPLOYEE_WRITE") && (
            <Link to="/employees/create" className="action-link">
              <button className="btn btn-primary text-white btn-crud-action">
                NOVO FUNCIONÁRIO
              </button>
            </Link>
          )}
          {canDeleteEmployees && selectedEmployeeIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedEmployees}
            >
              EXCLUIR FUNCIONÁRIOS
            </button>
          )}
        </div>
        <NameFilter
          text="Digite o nome do funcionário"
          onSearch={searchEmployee}
        />
      </div>

      <DataTable
        records={employees}
        showSelection={canDeleteEmployees}
        rowSelectable={canDelete}
        columns={visibleTableColumns}
        selectedRecords={selectedEmployees}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        columnTemplates={{
          hireDate: (employee) =>
            employee.hireDate
              ? new Intl.DateTimeFormat("pt-BR").format(
                  new Date(employee.hireDate + "T00:00:00"),
                )
              : "-",
          terminationDate: (employee) =>
            employee.terminationDate
              ? new Intl.DateTimeFormat("pt-BR").format(
                  new Date(employee.terminationDate + "T00:00:00"),
                )
              : "-",
          salary: (employee) =>
            employee.salary != null
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(employee.salary)
              : "-",
          createdAt: (employee) =>
            employee.createdAt
              ? new Intl.DateTimeFormat("pt-BR").format(employee.createdAt)
              : "-",
          updatedAt: (employee) =>
            employee.updatedAt
              ? new Intl.DateTimeFormat("pt-BR").format(employee.updatedAt)
              : "-",
          active: (employee) => (employee.active ? "Ativo" : "Inativo"),
          photo: (employee) =>
            photoMap[employee.id!] ? (
              <img
                className="employee-photo"
                src={photoMap[employee.id!]}
                alt="Foto do funcionário"
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
        exportTitle="Funcionários"
        exportFileName="funcionários"
        exportPagination={pagination}
        exportLoadRecords={loadEmployeesForExport}
        emptyMessage="Nenhum funcionário encontrado."
        onLazyLoad={changePage}
        onSelectedRecordsChange={onSelectionChange}
        onColumnsButtonClick={() => setFieldCustomizationVisible(true)}
      />

      <EmployeeDetailsModal
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        title="Detalhamento do Funcionário"
        employee={employeeDetails}
      />
      <EmployeeFilesModal
        visible={!!filesEmployee}
        employeeId={filesEmployee?.id}
        employeeName={filesEmployee?.name}
        onHide={() => setFilesEmployee(null)}
      />
      <FieldCustomization
        visible={fieldCustomizationVisible}
        onHide={() => setFieldCustomizationVisible(false)}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="funcionários"
        onApply={setVisibleFields}
      />
    </div>
  );
}
