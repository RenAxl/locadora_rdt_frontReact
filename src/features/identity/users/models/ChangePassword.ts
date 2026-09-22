export class ChangePassword {
  currentPassword: string = "";
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(password?: Partial<ChangePassword>) {
    Object.assign(this, password);
  }
}
