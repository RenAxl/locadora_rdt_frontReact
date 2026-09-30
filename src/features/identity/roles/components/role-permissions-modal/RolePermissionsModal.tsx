import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { notificationService } from "../../../../../core/error/services/notification.service";
import { PermissionMapper } from "../../../permissions/mappers/permission.mapper";
import { Permission } from "../../../permissions/models/Permission";
import { permissionService } from "../../../permissions/services/permission.service";
import { RoleMapper } from "../../mappers/role.mapper";
import { roleService } from "../../services/role.service";
import "./RolePermissionsModal.css";

interface RolePermissionsModalProps {
  visible: boolean;
  roleId?: number;
  roleAuthority?: string;
  onHide: () => void;
  onSaved: () => void;
}

export function RolePermissionsModal(props: RolePermissionsModalProps) {
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    [],
  );
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!props.visible || props.roleId == null) return;

    const load = async () => {
      setGroups([]);
      setSelectedGroup("");
      setPermissions([]);
      setFilteredPermissions([]);
      setSelectedPermissionIds([]);
      setFilterName("");
      setSaving(false);
      setLoading(true);

      try {
        const roleData = await roleService.findById(props.roleId!);
        const role = RoleMapper.toDetailsModel(roleData);
        const permissionIds: number[] = [];

        role.permissions.forEach((permission) => {
          if (permission.id != null) permissionIds.push(permission.id);
        });

        setSelectedPermissionIds(permissionIds);

        const loadedGroups = await permissionService.listGroups();
        setGroups(loadedGroups);

        if (loadedGroups.length > 0) {
          const firstGroup = loadedGroups[0];
          setSelectedGroup(firstGroup);
          const permissionData = await permissionService.list(firstGroup);
          const loadedPermissions =
            PermissionMapper.toModelList(permissionData);
          setPermissions(loadedPermissions);
          setFilteredPermissions(loadedPermissions);
        }
      } catch {
        
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [props.visible, props.roleId]);

  const loadPermissions = async (groupName: string) => {
    setSelectedGroup(groupName);
    setLoading(true);

    try {
      const data = await permissionService.list(groupName);
      const loadedPermissions = PermissionMapper.toModelList(data);
      setPermissions(loadedPermissions);
      const search = filterName.trim().toLowerCase();
      const filtered: Permission[] = [];
      loadedPermissions.forEach((permission) => {
        if (!search || permission.name.toLowerCase().includes(search))
          filtered.push(permission);
      });
      setFilteredPermissions(filtered);
    } catch {
      
    } finally {
      setLoading(false);
    }
  };

  const filterPermissions = (name: string) => {
    setFilterName(name);
    const search = name.trim().toLowerCase();

    if (!search) {
      setFilteredPermissions([...permissions]);
      return;
    }

    const filtered: Permission[] = [];
    permissions.forEach((permission) => {
      if (permission.name.toLowerCase().includes(search))
        filtered.push(permission);
    });
    setFilteredPermissions(filtered);
  };

  const isSelected = (permissionId?: number) => {
    if (permissionId == null) return false;
    return selectedPermissionIds.includes(permissionId);
  };

  const changePermission = (
    permissionId: number | undefined,
    selected: boolean,
  ) => {
    if (permissionId == null) return;

    const updatedIds = [...selectedPermissionIds];
    const index = updatedIds.indexOf(permissionId);

    if (selected && index === -1) updatedIds.push(permissionId);
    if (!selected && index !== -1) updatedIds.splice(index, 1);

    setSelectedPermissionIds(updatedIds);
  };

  const areAllPermissionsSelected = () => {
    if (filteredPermissions.length === 0) return false;

    for (const permission of filteredPermissions) {
      if (!isSelected(permission.id)) return false;
    }

    return true;
  };

  const changeAllPermissions = (selected: boolean) => {
    let updatedIds = [...selectedPermissionIds];

    filteredPermissions.forEach((permission) => {
      if (permission.id == null) return;
      const index = updatedIds.indexOf(permission.id);
      if (selected && index === -1) updatedIds.push(permission.id);
      if (!selected && index !== -1) updatedIds.splice(index, 1);
    });

    setSelectedPermissionIds(updatedIds);
  };

  const getSelectedPermissionsCount = () => {
    let count = 0;
    filteredPermissions.forEach((permission) => {
      if (isSelected(permission.id)) count++;
    });
    return count;
  };

  const save = async () => {
    if (props.roleId == null || selectedPermissionIds.length === 0) return;
    setSaving(true);

    try {
      const roleToUpdate = RoleMapper.toPermissionsUpdateDTO(
        selectedPermissionIds,
      );
      await roleService.updatePermissions(props.roleId, roleToUpdate);
      props.onSaved();
      props.onHide();
      notificationService.add({
        severity: "success",
        detail: "Permissões atualizadas com sucesso!",
      });
    } catch {
      
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="permission-buttons">
      <Button
        type="button"
        className="p-button-outlined p-button-secondary"
        label="Cancelar"
        onClick={props.onHide}
        disabled={loading || saving}
      />
      <Button
        type="button"
        className="p-button-primary"
        label="Salvar"
        icon="pi pi-save"
        onClick={save}
        disabled={
          loading ||
          saving ||
          !props.roleId ||
          selectedPermissionIds.length === 0
        }
      />
    </div>
  );

  return (
    <Dialog
      header="Gerenciar Permissões"
      visible={props.visible}
      modal
      className="role-permissions-dialog"
      style={{ width: "860px", maxWidth: "95vw" }}
      footer={footer}
      onHide={props.onHide}
    >
      <div className="role-name">
        <span>Perfil</span>
        <strong>{props.roleAuthority || `ID ${props.roleId}`}</strong>
      </div>

      <div className="permission-filters">
        <div>
          <label className="form-label-custom">Grupo</label>
          <Dropdown
            options={groups}
            value={selectedGroup}
            onChange={(event) => loadPermissions(event.value)}
            disabled={loading || groups.length === 0}
            placeholder="Selecione um grupo"
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label className="form-label-custom">Filtrar</label>
          <span className="p-input-icon-left w-100">
            <i className="pi pi-search" />
            <InputText
              className="w-100"
              placeholder="Ex: USER_READ"
              value={filterName}
              onChange={(event) => filterPermissions(event.target.value)}
              disabled={loading}
            />
          </span>
        </div>
      </div>

      {!loading && (
        <div className="permission-selection">
          <label className="permission-checkbox">
            <Checkbox
              checked={areAllPermissionsSelected()}
              onChange={(event) => changeAllPermissions(!!event.checked)}
            />
            <span>Selecionar ou desmarcar todas</span>
          </label>

          <span>
            Marcadas neste grupo: {getSelectedPermissionsCount()} /{" "}
            {filteredPermissions.length}
          </span>
        </div>
      )}

      {loading ? (
        <div className="permissions-loading">
          <ProgressSpinner />
          <span>Carregando...</span>
        </div>
      ) : (
        <div className="permission-grid">
          {filteredPermissions.map((permission) => (
            <label className="permission-item" key={permission.id}>
              <Checkbox
                checked={isSelected(permission.id)}
                onChange={(event) =>
                  changePermission(permission.id, !!event.checked)
                }
              />
              <span>{permission.name}</span>
            </label>
          ))}

          {filteredPermissions.length === 0 && (
            <div className="permissions-empty">
              Nenhuma permissão encontrada.
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
