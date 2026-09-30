import { CustomerDTO } from "../dtos/customer-dto";
import { CustomerInsertDTO } from "../dtos/customer-insert-dto";
import { CustomerUpdateDTO } from "../dtos/customer-update-dto";
import { Address } from "../models/Address";
import { Customer } from "../models/Customer";

export class CustomerMapper {
  static toModel(dto: CustomerDTO): Customer {
    return new Customer({
      id: dto.id,

      name: dto.name || "",

      cpf: dto.cpf || "",

      email: dto.email || "",

      active: dto.active ?? true,

      phone: dto.phone || "",

      address: new Address({
        street: dto.address?.street || "",
        number: dto.address?.number || "",
        complement: dto.address?.complement,
        neighborhood: dto.address?.neighborhood || "",
        city: dto.address?.city || "",
        state: dto.address?.state || "",
        zipCode: dto.address?.zipCode || "",
      }),

      photoContentType: dto.photoContentType,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy,
      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(customer: Customer): CustomerInsertDTO {
    return new CustomerInsertDTO({
      name: customer.name,

      cpf: customer.cpf,

      email: customer.email,

      phone: customer.phone,

      address: customer.address,

      active: customer.active,
    });
  }

  static toUpdateDTO(customer: Customer): CustomerUpdateDTO {
    return new CustomerUpdateDTO({
      id: customer.id,

      name: customer.name,

      cpf: customer.cpf,

      email: customer.email,

      active: customer.active,

      phone: customer.phone,

      address: customer.address,
    });
  }

  static toModelList(dtos: CustomerDTO[]): Customer[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
