import { SupplierDTO } from "../dtos/supplier-dto";
import { SupplierInsertDTO } from "../dtos/supplier-insert-dto";
import { SupplierUpdateDTO } from "../dtos/supplier-update-dto";
import { Address } from "../models/Address";
import { Supplier } from "../models/Supplier";

export class SupplierMapper {
  static toModel(dto: SupplierDTO): Supplier {
    let email = dto.email || "";
    const markdownEmail = email.match(/^\[([^\]]+)\]\(mailto:[^)]+\)$/);

    if (markdownEmail != null) {
      email = markdownEmail[1];
    }

    return new Supplier({
      id: dto.id,

      name: dto.name || "",

      tradeName: dto.tradeName || "",

      companyName: dto.companyName || "",

      cnpj: dto.cnpj || "",

      email: email,

      phoneNumber: dto.phoneNumber || "",

      address: new Address({
        street: dto.address?.street || "",
        number: dto.address?.number || "",
        complement: dto.address?.complement,
        neighborhood: dto.address?.neighborhood || "",
        city: dto.address?.city || "",
        state: dto.address?.state || "",
        zipCode: dto.address?.zipCode || "",
      }),

      imageContentType: dto.imageContentType,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(supplier: Supplier): SupplierInsertDTO {
    return new SupplierInsertDTO({
      name: supplier.name,

      tradeName: supplier.tradeName,

      companyName: supplier.companyName,

      cnpj: supplier.cnpj,

      email: supplier.email,

      phoneNumber: supplier.phoneNumber,

      address: supplier.address,
    });
  }

  static toUpdateDTO(supplier: Supplier): SupplierUpdateDTO {
    return new SupplierUpdateDTO({
      id: supplier.id,

      name: supplier.name,

      tradeName: supplier.tradeName,

      companyName: supplier.companyName,

      cnpj: supplier.cnpj,

      email: supplier.email,

      phoneNumber: supplier.phoneNumber,

      address: supplier.address,
    });
  }

  static toModelList(dtos: SupplierDTO[]): Supplier[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
