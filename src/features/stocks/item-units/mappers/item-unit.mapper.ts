import { ItemUnitDTO } from "../dtos/item-unit-dto";
import { ItemUnitInsertDTO } from "../dtos/item-unit-insert-dto";
import { ItemUnitUpdateDTO } from "../dtos/item-unit-update-dto";
import { ItemMapper } from "../../items/mappers/item.mapper";
import { ItemUnit } from "../models/ItemUnit";

export class ItemUnitMapper {
  static toModel(dto: ItemUnitDTO): ItemUnit {
    const unit = new ItemUnit({
      id: dto.id,
      version: dto.version,
      assetCode: dto.assetCode || "",
      status: dto.status || "",
      conditionStatus: dto.conditionStatus || "",
      purchaseDate: dto.purchaseDate,
      notes: dto.notes || "",
      active: dto.active ?? true,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy,
      updatedBy: dto.updatedBy,
    });

    if (dto.item != null) {
      unit.item = ItemMapper.toModel(dto.item);
    }

    return unit;
  }

  static toInsertDTO(unit: ItemUnit): ItemUnitInsertDTO {
    return new ItemUnitInsertDTO({
      itemId: unit.item?.id ?? null,
      conditionStatus: unit.conditionStatus,
      purchaseDate: unit.purchaseDate || null,
      notes: unit.notes,
    });
  }

  static toUpdateDTO(unit: ItemUnit): ItemUnitUpdateDTO {
    return new ItemUnitUpdateDTO({
      id: unit.id,
      itemId: unit.item?.id ?? null,
      conditionStatus: unit.conditionStatus,
      purchaseDate: unit.purchaseDate || null,
      notes: unit.notes,
    });
  }

  static toModelList(dtos: ItemUnitDTO[]): ItemUnit[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
