export class ItemInsertDTO {
  name: string = "";

  description: string = "";

  categoryId?: number | null;

  price?: number | null;

  constructor(item?: Partial<ItemInsertDTO>) {
    if (item != null) {
      if (item.name != null) {
        this.name = item.name;
      }

      if (item.description != null) {
        this.description = item.description;
      }

      this.categoryId = item.categoryId;
      this.price = item.price;
    }
  }
}
