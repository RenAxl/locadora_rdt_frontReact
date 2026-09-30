export class DepartmentInsertDTO {
  name: string = "";

  description: string | null = null;

  constructor(department?: Partial<DepartmentInsertDTO>) {
    if (department != null) {
      if (department.name != null) {
        this.name = department.name;
      }

      if (department.description != null) {
        this.description = department.description;
      }
    }
  }
}
