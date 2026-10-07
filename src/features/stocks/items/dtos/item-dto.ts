import { CategoryDTO } from "../../categories/dtos/category-dto";

export class ItemDTO {
  id?: number;
  version?: number;

  name?: string;
  description?: string;
  category?: CategoryDTO;
  price?: number | null;

  active?: boolean;

  imageContentType?: string;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(item?: Partial<ItemDTO>) {
    if (item != null) {
      this.id = item.id;
      this.version = item.version;
      this.name = item.name;
      this.description = item.description;
      this.category = item.category;
      this.price = item.price;
      this.active = item.active;

      this.imageContentType = item.imageContentType;
      this.createdBy = item.createdBy;
      this.updatedBy = item.updatedBy;

      if (item.createdAt != null) {
        this.createdAt = new Date(item.createdAt);
      }

      if (item.updatedAt != null) {
        this.updatedAt = new Date(item.updatedAt);
      }
    }
  }
}
