export class PermissionDTO {
  id?: number;
  name?: string;
  groupName?: string;

  constructor(permission?: Partial<PermissionDTO>) {
    if (permission != null) Object.assign(this, permission);
  }
}
