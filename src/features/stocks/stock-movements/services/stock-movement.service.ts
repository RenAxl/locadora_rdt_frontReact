import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { Pagination } from "../../../../core/models/Pagination";
import { PageResponse } from "../../../../core/models/page-response";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { StockMovementDTO } from "../dtos/stock-movement-dto";
import { StockMovementInsertDTO } from "../dtos/stock-movement-insert-dto";

export const stockMovementService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<StockMovementDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<StockMovementDTO>>(
      API.STOCK_MOVEMENTS.ROOT,
      { params },
    );
    return response.data;
  },
  async insert(dto: StockMovementInsertDTO): Promise<StockMovementDTO> {
    const response = await httpClient.post<StockMovementDTO>(
      API.STOCK_MOVEMENTS.ROOT,
      dto,
    );
    return response.data;
  },
};
