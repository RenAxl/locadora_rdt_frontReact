export class Permission {
  id?: number;
  name = '';
  groupName = '';

  constructor(permission?: Partial<Permission>) {
    if (permission != null) Object.assign(this, permission);
  }
}
