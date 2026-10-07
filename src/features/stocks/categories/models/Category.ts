export class Category {
  id?: number;
  version?: number;
  name: string = "";
  active: boolean = true;
  imageContentType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(category?: Partial<Category>) {
    if (category != null) {
      if (category.id !== undefined) this.id = category.id;
      if (category.version !== undefined) this.version = category.version;
      if (category.name !== undefined) this.name = category.name;
      if (category.active !== undefined) this.active = category.active;
      if (category.imageContentType !== undefined)
        this.imageContentType = category.imageContentType;
      if (category.createdBy !== undefined) this.createdBy = category.createdBy;
      if (category.updatedBy !== undefined) this.updatedBy = category.updatedBy;

      if (category.createdAt != null) {
        this.createdAt = new Date(category.createdAt);
      }

      if (category.updatedAt != null) {
        this.updatedAt = new Date(category.updatedAt);
      }
    }
  }
}
