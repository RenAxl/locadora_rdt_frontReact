export class ItemUpdateDTO {
  id?: number;

  name: string = "";

  description: string = "";

  categoryId?: number | null;

  price?: number | null;

  constructor(item?: Partial<ItemUpdateDTO>) {
    if (item != null) {
      this.id = item.id;

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
