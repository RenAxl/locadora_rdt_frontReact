import { PermissionDTO } from "../dtos/permission-dto";
import { Permission } from "../models/Permission";

export class PermissionMapper {
  static toModel(dto: PermissionDTO): Permission {
    return new Permission({
      id: dto.id,
      name: dto.name || "",
      groupName: dto.groupName || "",
    });
  }

  static toModelList(dtos: PermissionDTO[]): Permission[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
