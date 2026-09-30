import { Department } from "../../departments/models/Department";
import { Position } from "../../positions/models/Position";

export class Employee {
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
  photo?: any;
  photoContentType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  position?: Position;
  department?: Department;

  constructor(employee?: Employee) {
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
      this.photo = employee.photo;
      this.photoContentType = employee.photoContentType;
      this.createdBy = employee.createdBy;
      this.updatedBy = employee.updatedBy;

      if (employee.position != null) {
        this.position = new Position(employee.position);
      }

      if (employee.department != null) {
        this.department = new Department(employee.department);
      }

      if (employee.createdAt != null) {
        this.createdAt = new Date(employee.createdAt);
      }

      if (employee.updatedAt != null) {
        this.updatedAt = new Date(employee.updatedAt);
      }
    }
  }
}
