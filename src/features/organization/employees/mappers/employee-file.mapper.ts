import { EmployeeFileDTO } from "../dtos/employee-file-dto";
import { EmployeeFile } from "../models/EmployeeFile";

export class EmployeeFileMapper {
  static toModel(dto: EmployeeFileDTO): EmployeeFile {
    return new EmployeeFile({
      id: dto.id,
      name: dto.name || "",
      originalFileName: dto.originalFileName,
      storedFileName: dto.storedFileName,
      contentType: dto.contentType,
      size: dto.size,
      employeeId: dto.employeeId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}
