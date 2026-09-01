export class RoleInsertDTO {
  authority = '';

  constructor(role?: Partial<RoleInsertDTO>) {
    if (role != null) Object.assign(this, role);
  }
}
