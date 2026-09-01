export class RolePermissionsUpdateDTO {
  permissionIds: number[] = [];

  constructor(role?: Partial<RolePermissionsUpdateDTO>) {
    if (role != null) Object.assign(this, role);
  }
}
