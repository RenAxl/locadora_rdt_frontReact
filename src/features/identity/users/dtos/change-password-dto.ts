export class ChangePasswordDTO {
  currentPassword: string = '';
  newPassword: string = '';

  constructor(password?: Partial<ChangePasswordDTO>) {
    Object.assign(this, password);
  }
}
