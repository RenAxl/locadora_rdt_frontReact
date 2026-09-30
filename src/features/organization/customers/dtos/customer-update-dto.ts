import { AddressDTO } from "./address-dto";

export class CustomerUpdateDTO {
  id?: number;

  name: string = "";

  cpf: string = "";

  email: string = "";

  active: boolean = true;

  phone: string = "";

  address: AddressDTO = new AddressDTO();

  constructor(customer?: Partial<CustomerUpdateDTO>) {
    if (customer != null) {
      this.id = customer.id;

      if (customer.name != null) {
        this.name = customer.name;
      }

      if (customer.cpf != null) {
        this.cpf = customer.cpf;
      }

      if (customer.email != null) {
        this.email = customer.email;
      }

      if (customer.active != null) {
        this.active = customer.active;
      }

      if (customer.phone != null) {
        this.phone = customer.phone;
      }

      if (customer.address != null) {
        this.address = customer.address;
      }
    }
  }
}
