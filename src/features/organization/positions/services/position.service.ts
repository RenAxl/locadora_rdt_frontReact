import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { PositionDTO } from "../dtos/position-dto";
import { PositionInsertDTO } from "../dtos/position-insert-dto";
import { PositionUpdateDTO } from "../dtos/position-update-dto";

export const positionService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<PositionDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<PositionDTO>>(
      API.POSITIONS.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(position: PositionInsertDTO): Promise<PositionDTO> {
    const response = await httpClient.post<PositionDTO>(
      API.POSITIONS.ROOT,
      position,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<PositionDTO> {
    const response = await httpClient.get<PositionDTO>(API.POSITIONS.BY_ID(id));
    return response.data;
  },

  async update(dto: PositionUpdateDTO): Promise<PositionDTO> {
    if (!dto.id) throw new Error("Position ID is required for update");
    const response = await httpClient.put<PositionDTO>(
      API.POSITIONS.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.POSITIONS.BY_ID(id));
  },
};
