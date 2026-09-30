import { SupplierFileDTO } from "../dtos/supplier-file-dto";
import { SupplierFile } from "../models/SupplierFile";

export class SupplierFileMapper {
  static toModel(dto: SupplierFileDTO): SupplierFile {
    return new SupplierFile({
      id: dto.id,
      name: dto.name || "",
      originalFileName: dto.originalFileName,
      storedFileName: dto.storedFileName,
      contentType: dto.contentType,
      size: dto.size,
      supplierId: dto.supplierId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}
