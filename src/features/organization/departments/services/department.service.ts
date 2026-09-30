import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { DepartmentDTO } from "../dtos/department-dto";
import { DepartmentInsertDTO } from "../dtos/department-insert-dto";
import { DepartmentUpdateDTO } from "../dtos/department-update-dto";

export const departmentService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<DepartmentDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<DepartmentDTO>>(
      API.DEPARTMENTS.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(department: DepartmentInsertDTO): Promise<DepartmentDTO> {
    const response = await httpClient.post<DepartmentDTO>(
      API.DEPARTMENTS.ROOT,
      department,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<DepartmentDTO> {
    const response = await httpClient.get<DepartmentDTO>(
      API.DEPARTMENTS.BY_ID(id),
    );
    return response.data;
  },

  async update(id: number, dto: DepartmentUpdateDTO): Promise<DepartmentDTO> {
    const response = await httpClient.put<DepartmentDTO>(
      API.DEPARTMENTS.BY_ID(id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.DEPARTMENTS.BY_ID(id));
  },
};
