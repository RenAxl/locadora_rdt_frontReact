export class CategoryInsertDTO {
  name: string = "";

  constructor(category?: Partial<CategoryInsertDTO>) {
    if (category != null) {
      if (category.name != null) {
        this.name = category.name;
      }
    }
  }
}
