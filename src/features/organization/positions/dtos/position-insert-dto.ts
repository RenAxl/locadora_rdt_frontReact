export class PositionInsertDTO {
  name: string = "";

  constructor(position?: Partial<PositionInsertDTO>) {
    if (position != null) {
      if (position.name != null) {
        this.name = position.name;
      }
    }
  }
}
