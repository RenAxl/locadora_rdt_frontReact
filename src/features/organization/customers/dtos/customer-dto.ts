import { AddressDTO } from "./address-dto";

export class CustomerDTO {
  id?: number;

  name?: string;
  cpf?: string;
  email?: string;

  active?: boolean;

  phone?: string;
  photoContentType?: string;
  address?: AddressDTO;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(customer?: Partial<CustomerDTO>) {
    if (customer != null) {
      this.id = customer.id;
      this.name = customer.name;
      this.cpf = customer.cpf;
      this.email = customer.email;
      this.active = customer.active;
      this.phone = customer.phone;
      this.photoContentType = customer.photoContentType;
      this.address = customer.address;
      this.createdBy = customer.createdBy;
      this.updatedBy = customer.updatedBy;
      if (customer.createdAt != null)
        this.createdAt = new Date(customer.createdAt);
      if (customer.updatedAt != null)
        this.updatedAt = new Date(customer.updatedAt);
    }
  }
}
