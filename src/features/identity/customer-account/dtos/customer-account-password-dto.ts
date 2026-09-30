export class CustomerAccountPasswordDTO {
  password: string = "";
  passwordConfirmation: string = "";

  constructor(account?: Partial<CustomerAccountPasswordDTO>) {
    if (account != null) {
      if (account.password != null) {
        this.password = account.password;
      }

      if (account.passwordConfirmation != null) {
        this.passwordConfirmation = account.passwordConfirmation;
      }
    }
  }
}
