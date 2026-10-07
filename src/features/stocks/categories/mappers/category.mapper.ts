import { CategoryDTO } from "../dtos/category-dto";
import { CategoryInsertDTO } from "../dtos/category-insert-dto";
import { CategoryUpdateDTO } from "../dtos/category-update-dto";
import { Category } from "../models/Category";

export class CategoryMapper {
  static toModel(dto: CategoryDTO): Category {
    return new Category({
      id: dto.id,

      version: dto.version,

      name: dto.name || "",

      active: dto.active ?? true,

      imageContentType: dto.imageContentType,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(category: Category): CategoryInsertDTO {
    return new CategoryInsertDTO({
      name: category.name,
    });
  }

  static toUpdateDTO(category: Category): CategoryUpdateDTO {
    return new CategoryUpdateDTO({
      id: category.id,

      name: category.name,
    });
  }

  static toModelList(dtos: CategoryDTO[]): Category[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
