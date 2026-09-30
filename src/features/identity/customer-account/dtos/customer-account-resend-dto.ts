export class CustomerAccountResendDTO {
  email: string = "";

  constructor(account?: Partial<CustomerAccountResendDTO>) {
    if (account != null) {
      if (account.email != null) {
        this.email = account.email;
      }
    }
  }
}
