export class CategoryUpdateDTO {
  id?: number;

  name: string = "";

  constructor(category?: Partial<CategoryUpdateDTO>) {
    if (category != null) {
      this.id = category.id;

      if (category.name != null) {
        this.name = category.name;
      }
    }
  }
}
