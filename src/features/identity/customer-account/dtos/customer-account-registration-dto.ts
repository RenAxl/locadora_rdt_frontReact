export class CustomerAccountRegistrationDTO {
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

  constructor(account?: Partial<CustomerAccountRegistrationDTO>) {
    if (account != null) {
      if (account.name != null) {
        this.name = account.name;
      }

      if (account.cpf != null) {
        this.cpf = account.cpf;
      }

      if (account.email != null) {
        this.email = account.email;
      }

      if (account.phone != null) {
        this.phone = account.phone;
      }

      if (account.street != null) {
        this.street = account.street;
      }

      if (account.number != null) {
        this.number = account.number;
      }

      if (account.complement != null) {
        this.complement = account.complement;
      }

      if (account.neighborhood != null) {
        this.neighborhood = account.neighborhood;
      }

      if (account.city != null) {
        this.city = account.city;
      }

      if (account.state != null) {
        this.state = account.state;
      }

      if (account.zipCode != null) {
        this.zipCode = account.zipCode;
      }
    }
  }
}
