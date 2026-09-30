export class CustomerAccountPassword {
  password: string = "";
  passwordConfirmation: string = "";

  constructor(account?: CustomerAccountPassword) {
    if (account != null) {
      this.password = account.password;
      this.passwordConfirmation = account.passwordConfirmation;
    }
  }
}
