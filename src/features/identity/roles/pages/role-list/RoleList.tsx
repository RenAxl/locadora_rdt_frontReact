import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import { PageResponse } from '../../../../../core/models/page-response';
import { Pagination } from '../../../../../core/models/Pagination';
import { DataTable, LazyLoadEvent } from '../../../../../shared/components/data-table/DataTable';
import { DataTableColumn } from '../../../../../shared/components/data-table/models/data-table-column';
import { NameFilter } from '../../../../../shared/components/name-filter/NameFilter';
import { RolePermissionsModal } from '../../components/role-permissions-modal/RolePermissionsModal';
import { RoleDTO } from '../../dtos/role.dto';
import { RoleMapper } from '../../mappers/role.mapper';
import { Role } from '../../models/Role';
import { roleService } from '../../services/role.service';
import './RoleList.css';

const columns: DataTableColumn[] = [
  { field: 'authority', label: 'Nome' },
  { field: 'permissionsCount', label: 'Qtd. Permissões' },
];

export function RoleList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState(new Pagination(0, 5, 'ASC', 'authority'));
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number>();
  const [selectedRoleAuthority, setSelectedRoleAuthority] = useState<string>();

  const list = async (currentPagination: Pagination, currentFilter = filterName) => {
    setLoading(true);

    try {
      const data = await roleService.list(currentPagination, currentFilter);
      setRoles(RoleMapper.toModelList(data.content));
      setTotalElements(data.totalElements);
    } catch {
      // O interceptor HTTP exibe a mensagem de erro.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    list(new Pagination(0, 5, 'ASC', 'authority'));
  }, []);

  const changePage = (event: LazyLoadEvent) => {
    const rows = event.rows || pagination.linesPerPage || 1;
    const first = event.first || 0;
    const direction = event.sortOrder === -1 ? 'DESC' : 'ASC';
    const orderBy = typeof event.sortField === 'string'
      ? event.sortField
      : pagination.orderBy;
    const next = new Pagination(first / rows, rows, direction, orderBy);

    setPagination(next);
    list(next);
  };

  const searchRole = (name: string) => {
    const next = new Pagination(0, pagination.linesPerPage, pagination.direction, pagination.orderBy);
    setFilterName(name);
    setPagination(next);
    list(next, name);
  };

  const openPermissions = (role: Role) => {
    if (role.id == null) return;
    setSelectedRoleId(role.id);
    setSelectedRoleAuthority(role.authority);
    setPermissionsVisible(true);
  };

  const reloadRoles = () => {
    const next = new Pagination(0, pagination.linesPerPage, pagination.direction, pagination.orderBy);
    setPagination(next);
    list(next);
  };

  const emptyExport = async (): Promise<PageResponse<RoleDTO>> => {
    return { content: [], totalElements: 0 };
  };

  const actionsTemplate = (role: Role) => (
    <div className="actions-wrap">
      <Button
        type="button"
        className="p-button-rounded p-button-text"
        icon="pi pi-key"
        tooltip="Gerenciar permissões"
        tooltipOptions={{ position: 'top' }}
        onClick={() => openPermissions(role)}
      />
    </div>
  );

  return (
    <>
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ADMINISTRAÇÃO</span>
          <h1>Perfis</h1>
          <p>Consulte e gerencie os perfis e suas permissões.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-user-shield" />
        </div>
      </header>

      <div className="role-filter-container">
        <div className="role-actions-group">
          <Link to="/roles/create" className="action-link">
            <button className="btn btn-primary text-white btn-crud-action">
              NOVO PERFIL
            </button>
          </Link>
        </div>

        <NameFilter text="Digite o nome do perfil" onSearch={searchRole} />
      </div>

      <DataTable
        records={roles}
        columns={columns}
        selectedRecords={selectedRoles}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        actionsTemplate={actionsTemplate}
        exportTitle=""
        exportFileName=""
        exportPagination={pagination}
        exportLoadRecords={emptyExport}
        emptyMessage="Nenhum perfil encontrado."
        onLazyLoad={changePage}
        onSelectedRecordsChange={setSelectedRoles}
        onColumnsButtonClick={() => {}}
      />

      <RolePermissionsModal
        visible={permissionsVisible}
        roleId={selectedRoleId}
        roleAuthority={selectedRoleAuthority}
        onHide={() => setPermissionsVisible(false)}
        onSaved={reloadRoles}
      />
    </>
  );
}
