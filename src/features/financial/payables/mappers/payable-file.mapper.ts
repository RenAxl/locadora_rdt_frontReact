import { PayableFileDTO } from "../dtos/payable-file-dto";
import { PayableFile } from "../models/PayableFile";

export class PayableFileMapper {
  static toModel(dto: PayableFileDTO): PayableFile {
    return new PayableFile({
      id: dto.id,
      name: dto.name || "",
      originalFileName: dto.originalFileName,
      storedFileName: dto.storedFileName,
      contentType: dto.contentType,
      size: dto.size,
      payableId: dto.payableId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}
