import { PermissionDTO } from "../../permissions/dtos/permission-dto";

export class RoleDTO {
  id?: number;
  authority?: string;
  permissionsCount?: number;
  permissions: PermissionDTO[] = [];

  constructor(role?: Partial<RoleDTO>) {
    if (role != null) Object.assign(this, role);
  }
}
