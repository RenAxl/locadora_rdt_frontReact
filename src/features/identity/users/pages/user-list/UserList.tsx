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
import { UserDetailsModal } from "../../components/user-details-modal/UserDetailsModal";
import { UserDetailsDTO } from "../../dtos/user-details-dto";
import { UserDTO } from "../../dtos/user-dto";
import { UserMapper } from "../../mappers/user.mapper";
import { User } from "../../models/User";
import { userService } from "../../services/user.service";
import "./UserList.css";

const availableFields: DataTableColumn[] = [
  { field: "name", label: "Nome" },
  { field: "email", label: "E-mail" },
  { field: "telephone", label: "Telefone" },
  { field: "active", label: "Ativo" },
  { field: "address.street", label: "Rua" },
  { field: "address.number", label: "Número" },
  { field: "address.complement", label: "Complemento" },
  { field: "address.neighborhood", label: "Bairro" },
  { field: "address.city", label: "Cidade" },
  { field: "address.state", label: "UF" },
  { field: "address.zipCode", label: "CEP" },
  { field: "photo", label: "Foto" },
];

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState(new Pagination());
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldCustomizationVisible, setFieldCustomizationVisible] =
    useState(false);
  const [visibleFields, setVisibleFields] = useState([
    "name",
    "email",
    "telephone",
    "photo",
  ]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [photoMap, setPhotoMap] = useState<Record<number, string>>({});
  const photoUrls = useRef(new PhotoUrlRegistry());

  const visibleTableColumns = useMemo(
    () =>
      availableFields.filter((column) => visibleFields.includes(column.field)),
    [visibleFields],
  );

  const loadPhotos = async (loadedUsers: User[]) => {
    photoUrls.current.clear();
    setPhotoMap({});
    for (const user of loadedUsers) {
      if (!user.id) continue;
      try {
        const blob = await userService.getUserPhoto(user.id);
        const photoUrl = photoUrls.current.create(blob);
        if (photoUrl)
          setPhotoMap((current) => ({ ...current, [user.id!]: photoUrl }));
      } catch {
        // Usuário sem foto é um caso esperado no Angular original.
      }
    }
  };

  const list = async (
    currentPagination: Pagination,
    currentFilter = filterName,
  ) => {
    setLoading(true);
    try {
      const data = await userService.list(currentPagination, currentFilter);
      const loadedUsers = UserMapper.toModelList(data.content);
      setUsers(loadedUsers);
      setTotalElements(data.totalElements);
      setSelectedUsers(
        loadedUsers.filter(
          (user) => user.id != null && selectedUserIds.includes(user.id),
        ),
      );
      loadPhotos(loadedUsers);
    } catch {
      // O interceptor mostra o erro.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    list(new Pagination());
    return () => photoUrls.current.clear();
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

  const searchUser = (name: string) => {
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

  const deleteUser = (user: User) => {
    if (!user.id) return;
    confirmDialog({
      message: "Tem certeza que deseja excluir?",
      accept: async () => {
        try {
          await userService.delete(user.id!);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Usuário excluído com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const onSelectionChange = (currentUsers: User[]) => {
    setSelectedUsers(currentUsers);
    const idsOutsidePage = selectedUserIds.filter(
      (id) => !users.some((user) => user.id === id),
    );
    const currentIds = currentUsers.flatMap((user) =>
      user.id == null ? [] : [user.id],
    );
    setSelectedUserIds([...idsOutsidePage, ...currentIds]);
  };

  const deleteSelectedUsers = () => {
    if (selectedUserIds.length === 0) return;
    const ids = [...selectedUserIds];
    confirmDialog({
      message: `Tem certeza que deseja excluir ${ids.length} usuário(s)?`,
      accept: async () => {
        try {
          await userService.deleteAll(ids);
          setSelectedUserIds([]);
          setSelectedUsers([]);
          reloadFromFirstPage();
          notificationService.add({
            severity: "success",
            detail: "Usuários excluídos com sucesso!",
          });
        } catch {
          /* interceptor */
        }
      },
    });
  };

  const openDetails = async (user: User) => {
    if (user.id == null) return;
    setDetailsVisible(true);
    setUserDetails(null);
    try {
      const details: UserDetailsDTO = await userService.findById(user.id);
      setUserDetails(UserMapper.toDetailsModel(details));
    } catch {
      /* interceptor */
    }
  };

  const toggleActive = async (user: User) => {
    if (!user.id) return;
    const newStatus = !user.active;
    try {
      await userService.changeActive(user.id, newStatus);
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? new User({ ...item, active: newStatus }) : item,
        ),
      );
      notificationService.add({
        severity: "success",
        detail: `Usuário ${newStatus ? "ativado" : "desativado"} com sucesso!`,
      });
    } catch {
      /* interceptor */
    }
  };

  const loadUsersForExport = (
    exportPagination: Pagination,
  ): Promise<PageResponse<UserDTO>> => {
    return userService.list(exportPagination, filterName);
  };

  const actionsTemplate = (user: User) => (
    <div className="actions-wrap">
      <Link to={`/users/${user.id}/edit`}>
        <Button
          className="p-button-rounded p-button-text"
          icon="pi pi-pencil"
          tooltip="Editar usuário"
          tooltipOptions={{ position: "top" }}
        />
      </Link>
      <Button
        className="p-button-rounded p-button-text p-button-danger"
        icon="pi pi-trash"
        tooltip="Excluir usuário"
        tooltipOptions={{ position: "top" }}
        onClick={() => deleteUser(user)}
      />
      <Button
        className="p-button-rounded p-button-text p-button-warning"
        icon={user.active ? "pi pi-ban" : "pi pi-check"}
        tooltip="Ativar / Desativar Usuário"
        tooltipOptions={{ position: "top" }}
        onClick={() => toggleActive(user)}
      />
      <Button
        className="p-button-rounded p-button-text"
        icon="pi pi-eye"
        tooltip="Detalhamento do usuário"
        tooltipOptions={{ position: "top" }}
        onClick={() => openDetails(user)}
      />
    </div>
  );

  return (
    <>
      <header className="module-page-header">
        <div>
          <span className="module-page-eyebrow">ADMINISTRAÇÃO</span>
          <h1>Usuários</h1>
          <p>Consulte e gerencie os usuários do sistema.</p>
        </div>
        <div className="module-page-header-icon">
          <i className="fa-solid fa-user" />
        </div>
      </header>
      <div className="user-filter-container">
        <div className="user-actions-group">
          <Link to="/users/create" className="action-link">
            <button className="btn btn-primary text-white btn-crud-action">
              NOVO USUÁRIO
            </button>
          </Link>
          {selectedUserIds.length > 0 && (
            <button
              className="btn btn-danger text-white btn-crud-action"
              type="button"
              onClick={deleteSelectedUsers}
            >
              EXCLUIR USUÁRIOS
            </button>
          )}
        </div>
        <NameFilter text="Digite o nome do usuário" onSearch={searchUser} />
      </div>

      <DataTable
        records={users}
        columns={visibleTableColumns}
        selectedRecords={selectedUsers}
        totalRecords={totalElements}
        rows={pagination.linesPerPage}
        loading={loading}
        columnTemplates={{
          active: (user) => (user.active ? "Sim" : "Não"),
          photo: (user) =>
            photoMap[user.id!] ? (
              <img
                className="user-photo"
                src={photoMap[user.id!]}
                alt="Foto do usuário"
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
        exportTitle="Usuários"
        exportFileName="usuarios"
        exportPagination={pagination}
        exportLoadRecords={loadUsersForExport}
        emptyMessage="Nenhum usuário encontrado."
        onLazyLoad={changePage}
        onSelectedRecordsChange={onSelectionChange}
        onColumnsButtonClick={() => setFieldCustomizationVisible(true)}
      />

      <UserDetailsModal
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        title="Detalhamento do Usuário"
        user={userDetails}
      />
      <FieldCustomization
        visible={fieldCustomizationVisible}
        onHide={() => setFieldCustomizationVisible(false)}
        selectedFields={visibleFields}
        fields={availableFields}
        contentName="usuários"
        onApply={setVisibleFields}
      />
    </>
  );
}
