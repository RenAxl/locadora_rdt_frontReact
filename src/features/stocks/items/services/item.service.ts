import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { Pagination } from "../../../../core/models/Pagination";
import { PageResponse } from "../../../../core/models/page-response";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { ItemDTO } from "../dtos/item-dto";
import { ItemInsertDTO } from "../dtos/item-insert-dto";
import { ItemUpdateDTO } from "../dtos/item-update-dto";

export const itemService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<ItemDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<ItemDTO>>(
      API.ITEMS.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(dto: ItemInsertDTO): Promise<ItemDTO> {
    const response = await httpClient.post<ItemDTO>(API.ITEMS.ROOT, dto);
    return response.data;
  },

  async findById(id: number | string): Promise<ItemDTO> {
    const response = await httpClient.get<ItemDTO>(API.ITEMS.BY_ID(id));
    return response.data;
  },

  async update(dto: ItemUpdateDTO): Promise<ItemDTO> {
    if (!dto.id) throw new Error("Item ID is required for update");
    const response = await httpClient.put<ItemDTO>(
      API.ITEMS.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.ITEMS.BY_ID(id));
  },

  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.ITEMS.DELETE_ALL, { data: ids });
  },

  async changeActive(id: number, active: boolean): Promise<void> {
    await httpClient.patch(API.ITEMS.CHANGE_ACTIVE(id), active, {
      headers: { "Content-Type": "application/json" },
    });
  },

  async getItemImage(id: number): Promise<Blob> {
    const response = await httpClient.get(API.ITEMS.IMAGE(id), {
      responseType: "blob",
    });
    return response.data;
  },

  async updateImage(id: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    await httpClient.put(API.ITEMS.IMAGE(id), formData);
  },
};
