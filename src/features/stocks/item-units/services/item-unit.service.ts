import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { Pagination } from "../../../../core/models/Pagination";
import { PageResponse } from "../../../../core/models/page-response";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { ItemUnitDTO } from "../dtos/item-unit-dto";
import { ItemUnitInsertDTO } from "../dtos/item-unit-insert-dto";
import { ItemUnitUpdateDTO } from "../dtos/item-unit-update-dto";
import { ItemUnitStatusUpdateDTO } from "../dtos/item-unit-status-update-dto";

export const itemUnitService = {
  async list(
    pagination: Pagination,
    filterName: string,
    itemId?: number,
    active?: boolean,
    signal?: AbortSignal,
  ): Promise<PageResponse<ItemUnitDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    if (itemId != null) params.itemId = String(itemId);
    if (active != null) params.active = String(active);
    const response = await httpClient.get<PageResponse<ItemUnitDTO>>(
      API.ITEM_UNITS.ROOT,
      { params, signal },
    );
    return response.data;
  },

  async insert(dto: ItemUnitInsertDTO): Promise<ItemUnitDTO> {
    const response = await httpClient.post<ItemUnitDTO>(
      API.ITEM_UNITS.ROOT,
      dto,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<ItemUnitDTO> {
    const response = await httpClient.get<ItemUnitDTO>(
      API.ITEM_UNITS.BY_ID(id),
    );
    return response.data;
  },

  async update(dto: ItemUnitUpdateDTO): Promise<ItemUnitDTO> {
    if (!dto.id) throw new Error("ItemUnit ID is required for update");
    const response = await httpClient.put<ItemUnitDTO>(
      API.ITEM_UNITS.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.ITEM_UNITS.BY_ID(id));
  },

  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.ITEM_UNITS.DELETE_ALL, { data: ids });
  },

  async changeActive(id: number, active: boolean): Promise<void> {
    await httpClient.patch(API.ITEM_UNITS.CHANGE_ACTIVE(id), active, {
      headers: { "Content-Type": "application/json" },
    });
  },

  async changeMaintenance(
    id: number,
    maintenance: boolean,
  ): Promise<ItemUnitDTO> {
    const response = await httpClient.patch<ItemUnitDTO>(
      API.ITEM_UNITS.CHANGE_MAINTENANCE(id),
      maintenance,
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  },

  async updateStatus(
    id: number,
    dto: ItemUnitStatusUpdateDTO,
  ): Promise<ItemUnitDTO> {
    const response = await httpClient.patch<ItemUnitDTO>(
      API.ITEM_UNITS.UPDATE_STATUS(id),
      dto,
    );
    return response.data;
  },
};
