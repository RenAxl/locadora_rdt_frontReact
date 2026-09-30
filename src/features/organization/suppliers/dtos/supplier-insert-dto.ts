import { AddressDTO } from "./address-dto";

export class SupplierInsertDTO {
  name: string = "";

  tradeName: string = "";

  companyName: string = "";

  cnpj: string = "";

  email: string = "";

  phoneNumber: string = "";

  address?: AddressDTO;

  constructor(supplier?: Partial<SupplierInsertDTO>) {
    if (supplier != null) {
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

      this.address = supplier.address;
    }
  }
}
