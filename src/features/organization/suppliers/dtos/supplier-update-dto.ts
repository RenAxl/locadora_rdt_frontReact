import { AddressDTO } from "./address-dto";

export class SupplierUpdateDTO {
  id?: number;

  name: string = "";

  tradeName: string = "";

  companyName: string = "";

  cnpj: string = "";

  email: string = "";

  phoneNumber: string = "";

  address: AddressDTO = new AddressDTO();

  constructor(supplier?: Partial<SupplierUpdateDTO>) {
    if (supplier != null) {
      this.id = supplier.id;

      if (supplier.name != null) {
        this.name = supplier.name;
      }

      if (supplier.tradeName != null) {
        this.tradeName = supplier.tradeName;
      }

      if (supplier.companyName != null) {
        this.companyName = supplier.companyName;
      }

      if (supplier.cnpj != null) {
        this.cnpj = supplier.cnpj;
      }

      if (supplier.email != null) {
        this.email = supplier.email;
      }

      if (supplier.phoneNumber != null) {
        this.phoneNumber = supplier.phoneNumber;
      }

      if (supplier.address != null) {
        this.address = supplier.address;
      }
    }
  }
}
