import { DepartmentDTO } from "../dtos/department-dto";
import { DepartmentInsertDTO } from "../dtos/department-insert-dto";
import { DepartmentUpdateDTO } from "../dtos/department-update-dto";
import { Department } from "../models/Department";

export class DepartmentMapper {
  static toModel(dto: DepartmentDTO): Department {
    return new Department({
      id: dto.id,

      name: dto.name || "",

      description: dto.description || "",

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(department: Department): DepartmentInsertDTO {
    return new DepartmentInsertDTO({
      name: department.name,

      description: department.description || null,
    });
  }

  static toUpdateDTO(department: Department): DepartmentUpdateDTO {
    return new DepartmentUpdateDTO({
      name: department.name,

      description: department.description || null,
    });
  }

  static toModelList(dtos: DepartmentDTO[]): Department[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
