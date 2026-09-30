export class PositionUpdateDTO {
  id?: number;

  name: string = "";

  constructor(position?: Partial<PositionUpdateDTO>) {
    if (position != null) {
      this.id = position.id;

      if (position.name != null) {
        this.name = position.name;
      }
    }
  }
}
