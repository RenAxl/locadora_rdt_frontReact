export class PositionDTO {
  id?: number;

  name?: string;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(position?: Partial<PositionDTO>) {
    if (position != null) {
      this.id = position.id;
      this.name = position.name;

      this.createdBy = position.createdBy;
      this.updatedBy = position.updatedBy;

      if (position.createdAt != null) {
        this.createdAt = new Date(position.createdAt);
      }

      if (position.updatedAt != null) {
        this.updatedAt = new Date(position.updatedAt);
      }
    }
  }
}
