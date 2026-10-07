export class CategoryDTO {
  id?: number;
  version?: number;

  name?: string;

  active?: boolean;

  imageContentType?: string;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(category?: Partial<CategoryDTO>) {
    if (category != null) {
      this.id = category.id;
      this.version = category.version;
      this.name = category.name;
      this.active = category.active;

      this.imageContentType = category.imageContentType;
      this.createdBy = category.createdBy;
      this.updatedBy = category.updatedBy;

      if (category.createdAt != null) {
        this.createdAt = new Date(category.createdAt);
      }

      if (category.updatedAt != null) {
        this.updatedAt = new Date(category.updatedAt);
      }
    }
  }
}
