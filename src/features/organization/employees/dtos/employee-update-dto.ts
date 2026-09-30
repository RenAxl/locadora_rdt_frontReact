export class EmployeeUpdateDTO {
  id?: number;

  name: string = "";

  employeeCode: string = "";

  email: string = "";

  phone: string = "";

  address: string = "";

  salary: number | null = null;

  hireDate: string = "";

  terminationDate: string | null = null;

  employmentType: string = "";

  active: boolean = true;

  positionId?: number;

  departmentId?: number;

  constructor(employee?: Partial<EmployeeUpdateDTO>) {
    if (employee != null) {
      this.id = employee.id;

      if (employee.name != null) {
        this.name = employee.name;
      }

      if (employee.employeeCode != null) {
        this.employeeCode = employee.employeeCode;
      }

      if (employee.email != null) {
        this.email = employee.email;
      }

      if (employee.phone != null) {
        this.phone = employee.phone;
      }

      if (employee.address != null) {
        this.address = employee.address;
      }

      if (employee.salary != null) {
        this.salary = employee.salary;
      }

      if (employee.hireDate != null) {
        this.hireDate = employee.hireDate;
      }

      if (employee.terminationDate != null) {
        this.terminationDate = employee.terminationDate;
      }

      if (employee.employmentType != null) {
        this.employmentType = employee.employmentType;
      }

      if (employee.active != null) {
        this.active = employee.active;
      }

      this.positionId = employee.positionId;
      this.departmentId = employee.departmentId;
    }
  }
}
