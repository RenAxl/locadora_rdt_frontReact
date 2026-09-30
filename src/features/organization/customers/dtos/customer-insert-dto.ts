import { AddressDTO } from "./address-dto";

export class CustomerInsertDTO {
  name: string = "";

  cpf: string = "";

  email: string = "";

  phone: string = "";

  address?: AddressDTO;

  active: boolean = true;

  constructor(customer?: Partial<CustomerInsertDTO>) {
    if (customer != null) {
      if (customer.name != null) {
        this.name = customer.name;
      }

      if (customer.cpf != null) {
        this.cpf = customer.cpf;
      }

      if (customer.email != null) {
        this.email = customer.email;
      }

      if (customer.phone != null) {
        this.phone = customer.phone;
      }

      this.address = customer.address;

      if (customer.active != null) {
        this.active = customer.active;
      }
    }
  }
}
