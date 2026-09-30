export class DepartmentDTO {
  id?: number;

  name?: string;
  description?: string | null;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(department?: Partial<DepartmentDTO>) {
    if (department != null) {
      this.id = department.id;
      this.name = department.name;
      this.description = department.description;
      this.createdBy = department.createdBy;
      this.updatedBy = department.updatedBy;

      if (department.createdAt != null) {
        this.createdAt = new Date(department.createdAt);
      }

      if (department.updatedAt != null) {
        this.updatedAt = new Date(department.updatedAt);
      }
    }
  }
}
