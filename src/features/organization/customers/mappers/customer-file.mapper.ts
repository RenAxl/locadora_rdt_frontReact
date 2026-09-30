import { CustomerFileDTO } from "../dtos/customer-file-dto";
import { CustomerFile } from "../models/CustomerFile";

export class CustomerFileMapper {
  static toModel(dto: CustomerFileDTO): CustomerFile {
    return new CustomerFile({
      id: dto.id,
      name: dto.name || "",
      originalFileName: dto.originalFileName,
      storedFileName: dto.storedFileName,
      contentType: dto.contentType,
      size: dto.size,
      customerId: dto.customerId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}
