import { AddressDTO } from "./address-dto";

export class SupplierDTO {
  id?: number;

  name?: string;
  tradeName?: string;
  companyName?: string;
  cnpj?: string;
  email?: string;

  phoneNumber?: string;
  address?: AddressDTO;

  imageContentType?: string;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(supplier?: Partial<SupplierDTO>) {
    if (supplier != null) {
      this.id = supplier.id;
      this.name = supplier.name;
      this.tradeName = supplier.tradeName;
      this.companyName = supplier.companyName;
      this.cnpj = supplier.cnpj;
      this.email = supplier.email;
      this.phoneNumber = supplier.phoneNumber;
      this.address = supplier.address;

      this.imageContentType = supplier.imageContentType;
      this.createdBy = supplier.createdBy;
      this.updatedBy = supplier.updatedBy;

      if (supplier.createdAt != null) {
        this.createdAt = new Date(supplier.createdAt);
      }

      if (supplier.updatedAt != null) {
        this.updatedAt = new Date(supplier.updatedAt);
      }
    }
  }
}
