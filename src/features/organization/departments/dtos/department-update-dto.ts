export class DepartmentUpdateDTO {
  name: string = "";

  description: string | null = null;

  constructor(department?: Partial<DepartmentUpdateDTO>) {
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
