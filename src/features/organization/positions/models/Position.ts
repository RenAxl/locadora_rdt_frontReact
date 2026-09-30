export class Position {
  id?: number;
  name: string = "";
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(position?: Position) {
    if (position != null) {
      this.id = position.id;
      this.name = position.name;
      this.createdBy = position.createdBy || undefined;
      this.updatedBy = position.updatedBy || undefined;

      if (position.createdAt) {
        this.createdAt = new Date(position.createdAt);
      }

      if (position.updatedAt) {
        this.updatedAt = new Date(position.updatedAt);
      }
    }
  }
}
