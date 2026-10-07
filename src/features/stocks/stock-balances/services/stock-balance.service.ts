import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { Pagination } from "../../../../core/models/Pagination";
import { PageResponse } from "../../../../core/models/page-response";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { StockBalanceDTO } from "../dtos/stock-balance-dto";
import { StockBalanceMinimumUpdateDTO } from "../dtos/stock-balance-minimum-update-dto";

export const stockBalanceService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<StockBalanceDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<StockBalanceDTO>>(
      API.STOCK_BALANCES.ROOT,
      { params },
    );
    return response.data;
  },
  async findById(id: number | string): Promise<StockBalanceDTO> {
    const response = await httpClient.get<StockBalanceDTO>(
      API.STOCK_BALANCES.BY_ID(id),
    );
    return response.data;
  },
  async findByItemId(itemId: number | string): Promise<StockBalanceDTO> {
    const response = await httpClient.get<StockBalanceDTO>(
      API.STOCK_BALANCES.BY_ITEM(itemId),
    );
    return response.data;
  },
  async updateMinimum(
    dto: StockBalanceMinimumUpdateDTO,
  ): Promise<StockBalanceDTO> {
    if (!dto.id) throw new Error("Stock balance ID is required for update");
    const response = await httpClient.patch<StockBalanceDTO>(
      API.STOCK_BALANCES.UPDATE_MINIMUM(dto.id),
      { minimumQuantity: dto.minimumQuantity },
    );
    return response.data;
  },
};
