import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { Pagination } from "../../../../core/models/Pagination";
import { PageResponse } from "../../../../core/models/page-response";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { CategoryDTO } from "../dtos/category-dto";
import { CategoryInsertDTO } from "../dtos/category-insert-dto";
import { CategoryUpdateDTO } from "../dtos/category-update-dto";

export const categoryService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<CategoryDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<CategoryDTO>>(
      API.CATEGORIES.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(dto: CategoryInsertDTO): Promise<CategoryDTO> {
    const response = await httpClient.post<CategoryDTO>(
      API.CATEGORIES.ROOT,
      dto,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<CategoryDTO> {
    const response = await httpClient.get<CategoryDTO>(
      API.CATEGORIES.BY_ID(id),
    );
    return response.data;
  },

  async update(dto: CategoryUpdateDTO): Promise<CategoryDTO> {
    if (!dto.id) throw new Error("Category ID is required for update");
    const response = await httpClient.put<CategoryDTO>(
      API.CATEGORIES.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.CATEGORIES.BY_ID(id));
  },

  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.CATEGORIES.DELETE_ALL, { data: ids });
  },

  async changeActive(id: number, active: boolean): Promise<void> {
    await httpClient.patch(API.CATEGORIES.CHANGE_ACTIVE(id), active, {
      headers: { "Content-Type": "application/json" },
    });
  },

  async getCategoryImage(id: number): Promise<Blob> {
    const response = await httpClient.get(API.CATEGORIES.IMAGE(id), {
      responseType: "blob",
    });
    return response.data;
  },

  async updateImage(id: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    await httpClient.put(API.CATEGORIES.IMAGE(id), formData);
  },
};
