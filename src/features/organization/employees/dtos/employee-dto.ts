import { DepartmentDTO } from "../../departments/dtos/department-dto";
import { PositionDTO } from "../../positions/dtos/position-dto";

export class EmployeeDTO {
  id?: number;

  name?: string;
  employeeCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  salary?: number | null;
  hireDate?: string;
  terminationDate?: string | null;
  employmentType?: string;
  active?: boolean;

  photoContentType?: string;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  position?: PositionDTO;
  department?: DepartmentDTO;

  constructor(employee?: Partial<EmployeeDTO>) {
    if (employee != null) {
      this.id = employee.id;
      this.name = employee.name;
      this.employeeCode = employee.employeeCode;
      this.email = employee.email;
      this.phone = employee.phone;
      this.address = employee.address;
      this.salary = employee.salary;
      this.hireDate = employee.hireDate;
      this.terminationDate = employee.terminationDate;
      this.employmentType = employee.employmentType;
      this.active = employee.active;
      this.photoContentType = employee.photoContentType;
      this.createdBy = employee.createdBy;
      this.updatedBy = employee.updatedBy;
      this.position = employee.position;
      this.department = employee.department;

      if (employee.createdAt != null) {
        this.createdAt = new Date(employee.createdAt);
      }

      if (employee.updatedAt != null) {
        this.updatedAt = new Date(employee.updatedAt);
      }
    }
  }
}
