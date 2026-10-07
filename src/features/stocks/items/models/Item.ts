import { Category } from "../../categories/models/Category";

export class Item {
  id?: number;
  version?: number;
  name: string = "";
  description: string = "";
  category?: Category;
  price?: number | null;
  active: boolean = true;
  imageContentType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(item?: Partial<Item>) {
    if (item != null) {
      if (item.id !== undefined) this.id = item.id;
      if (item.version !== undefined) this.version = item.version;
      if (item.name !== undefined) this.name = item.name;
      if (item.description !== undefined) this.description = item.description;
      if (item.price !== undefined) this.price = item.price;
      if (item.active !== undefined) this.active = item.active;
      if (item.imageContentType !== undefined)
        this.imageContentType = item.imageContentType;
      if (item.createdBy !== undefined) this.createdBy = item.createdBy;
      if (item.updatedBy !== undefined) this.updatedBy = item.updatedBy;

      if (item.category != null) {
        this.category = new Category(item.category);
      }

      if (item.createdAt != null) {
        this.createdAt = new Date(item.createdAt);
      }

      if (item.updatedAt != null) {
        this.updatedAt = new Date(item.updatedAt);
      }
    }
  }
}
