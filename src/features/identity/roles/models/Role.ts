import { Permission } from "../../permissions/models/Permission";

export class Role {
  id?: number;
  authority = "";
  permissionsCount = 0;
  permissions: Permission[] = [];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(role?: Partial<Role>) {
    if (role == null) return;
    Object.assign(this, role);
    if (role.createdAt != null) this.createdAt = new Date(role.createdAt);
    if (role.updatedAt != null) this.updatedAt = new Date(role.updatedAt);
  }
}
