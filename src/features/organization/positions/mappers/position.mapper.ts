import { PositionDTO } from "../dtos/position-dto";
import { PositionInsertDTO } from "../dtos/position-insert-dto";
import { PositionUpdateDTO } from "../dtos/position-update-dto";
import { Position } from "../models/Position";

export class PositionMapper {
  static toModel(dto: PositionDTO): Position {
    return new Position({
      id: dto.id,

      name: dto.name || "",

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(position: Position): PositionInsertDTO {
    return new PositionInsertDTO({
      name: position.name.trim(),
    });
  }

  static toUpdateDTO(position: Position): PositionUpdateDTO {
    return new PositionUpdateDTO({
      id: position.id,

      name: position.name.trim(),
    });
  }

  static toModelList(dtos: PositionDTO[]): Position[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
