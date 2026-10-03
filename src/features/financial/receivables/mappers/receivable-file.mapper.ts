import { ReceivableFileDTO } from "../dtos/receivable-file-dto";
import { ReceivableFile } from "../models/ReceivableFile";

export class ReceivableFileMapper {
  static toModel(dto: ReceivableFileDTO): ReceivableFile {
    return new ReceivableFile({
      id: dto.id,
      name: dto.name || "",
      originalFileName: dto.originalFileName,
      storedFileName: dto.storedFileName,
      contentType: dto.contentType,
      size: dto.size,
      receivableId: dto.receivableId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}
