export class CustomerAccountResend {
  email: string = "";

  constructor(account?: CustomerAccountResend) {
    if (account != null) {
      this.email = account.email;
    }
  }
}
