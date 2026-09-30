export class CustomerAccountRegistration {
  name: string = "";
  cpf: string = "";
  email: string = "";
  phone: string = "";
  street: string = "";
  number: string = "";
  complement: string = "";
  neighborhood: string = "";
  city: string = "";
  state: string = "";
  zipCode: string = "";

  constructor(account?: CustomerAccountRegistration) {
    if (account != null) {
      this.name = account.name;
      this.cpf = account.cpf;
      this.email = account.email;
      this.phone = account.phone;
      this.street = account.street;
      this.number = account.number;
      this.complement = account.complement;
      this.neighborhood = account.neighborhood;
      this.city = account.city;
      this.state = account.state;
      this.zipCode = account.zipCode;
    }
  }
}
