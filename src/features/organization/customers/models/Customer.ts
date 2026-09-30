import { Address } from "./Address";

export class Customer {
  id?: number;
  name: string = "";
  cpf: string = "";
  email: string = "";
  active: boolean = true;
  phone: string = "";
  address: Address = new Address();
  photo?: any;
  photoContentType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(customer?: Customer) {
    if (customer != null) {
      this.id = customer.id;
      this.name = customer.name;
      this.cpf = customer.cpf;
      this.email = customer.email;
      this.active = customer.active;
      this.phone = customer.phone;
      this.photo = customer.photo;
      this.photoContentType = customer.photoContentType;
      this.createdBy = customer.createdBy;
      this.updatedBy = customer.updatedBy;

      if (customer.address != null) {
        this.address = new Address(customer.address);
      }

      if (customer.createdAt != null) {
        this.createdAt = new Date(customer.createdAt);
      }

      if (customer.updatedAt != null) {
        this.updatedAt = new Date(customer.updatedAt);
      }
    }
  }
}
