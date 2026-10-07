import { ItemDTO } from "../dtos/item-dto";
import { ItemInsertDTO } from "../dtos/item-insert-dto";
import { ItemUpdateDTO } from "../dtos/item-update-dto";
import { CategoryMapper } from "../../categories/mappers/category.mapper";
import { Item } from "../models/Item";

export class ItemMapper {
  static toModel(dto: ItemDTO): Item {
    const item = new Item({
      id: dto.id,

      version: dto.version,

      name: dto.name || "",

      description: dto.description || "",

      price: dto.price,

      active: dto.active ?? true,

      imageContentType: dto.imageContentType,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });

    if (dto.category != null) {
      item.category = CategoryMapper.toModel(dto.category);
    }

    return item;
  }

  static toInsertDTO(item: Item): ItemInsertDTO {
    return new ItemInsertDTO({
      name: item.name,

      description: item.description,

      categoryId: item.category?.id ?? null,

      price: item.price ?? null,
    });
  }

  static toUpdateDTO(item: Item): ItemUpdateDTO {
    return new ItemUpdateDTO({
      id: item.id,

      name: item.name,

      description: item.description,

      categoryId: item.category?.id ?? null,

      price: item.price ?? null,
    });
  }

  static toModelList(dtos: ItemDTO[]): Item[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
