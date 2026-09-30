import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { EmployeeDTO } from "../dtos/employee-dto";
import { EmployeeInsertDTO } from "../dtos/employee-insert-dto";
import { EmployeeUpdateDTO } from "../dtos/employee-update-dto";

export const employeeService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<EmployeeDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<EmployeeDTO>>(
      API.EMPLOYEES.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(employee: EmployeeInsertDTO): Promise<EmployeeDTO> {
    const response = await httpClient.post<EmployeeDTO>(
      API.EMPLOYEES.ROOT,
      employee,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<EmployeeDTO> {
    const response = await httpClient.get<EmployeeDTO>(API.EMPLOYEES.BY_ID(id));
    return response.data;
  },

  async update(dto: EmployeeUpdateDTO): Promise<EmployeeDTO> {
    if (!dto.id) throw new Error("Employee ID is required for update");
    const response = await httpClient.put<EmployeeDTO>(
      API.EMPLOYEES.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.EMPLOYEES.BY_ID(id));
  },

  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.EMPLOYEES.DELETE_ALL, { data: ids });
  },

  async changeActive(id: number, active: boolean): Promise<void> {
    await httpClient.patch(API.EMPLOYEES.CHANGE_ACTIVE(id), active, {
      headers: { "Content-Type": "application/json" },
    });
  },

  async getEmployeePhoto(id: number): Promise<Blob> {
    const response = await httpClient.get(API.EMPLOYEES.PHOTO(id), {
      responseType: "blob",
    });
    return response.data;
  },
  async updatePhoto(id: number, file: File): Promise<void> {
    const body = new FormData();
    body.append("file", file);
    await httpClient.put(API.EMPLOYEES.PHOTO(id), body);
  },
};
