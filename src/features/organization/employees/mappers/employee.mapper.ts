import { EmployeeDTO } from "../dtos/employee-dto";
import { EmployeeInsertDTO } from "../dtos/employee-insert-dto";
import { EmployeeUpdateDTO } from "../dtos/employee-update-dto";
import { Employee } from "../models/Employee";
import { PositionMapper } from "../../positions/mappers/position.mapper";
import { DepartmentMapper } from "../../departments/mappers/department.mapper";

export class EmployeeMapper {
  static toModel(dto: EmployeeDTO): Employee {
    return new Employee({
      id: dto.id,

      name: dto.name || "",

      employeeCode: dto.employeeCode || "",

      email: dto.email || "",

      phone: dto.phone || "",

      address: dto.address || "",

      salary: dto.salary ?? null,

      hireDate: dto.hireDate || "",

      terminationDate: dto.terminationDate ?? null,

      employmentType: dto.employmentType || "",

      active: dto.active ?? true,

      position: dto.position ? PositionMapper.toModel(dto.position) : undefined,

      department: dto.department
        ? DepartmentMapper.toModel(dto.department)
        : undefined,

      photoContentType: dto.photoContentType,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(employee: Employee): EmployeeInsertDTO {
    return new EmployeeInsertDTO({
      name: employee.name,

      employeeCode: employee.employeeCode,

      email: employee.email,

      phone: employee.phone,

      address: employee.address,

      salary: employee.salary,

      hireDate: employee.hireDate,

      terminationDate: employee.terminationDate || null,

      employmentType: employee.employmentType,

      active: employee.active,

      positionId: employee.position?.id,

      departmentId: employee.department?.id,
    });
  }

  static toUpdateDTO(employee: Employee): EmployeeUpdateDTO {
    return new EmployeeUpdateDTO({
      id: employee.id,

      name: employee.name,

      employeeCode: employee.employeeCode,

      email: employee.email,

      phone: employee.phone,

      address: employee.address,

      salary: employee.salary,

      hireDate: employee.hireDate,

      terminationDate: employee.terminationDate || null,

      employmentType: employee.employmentType,

      active: employee.active,

      positionId: employee.position?.id,

      departmentId: employee.department?.id,
    });
  }

  static toModelList(dtos: EmployeeDTO[]): Employee[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
