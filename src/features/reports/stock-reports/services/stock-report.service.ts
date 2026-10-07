import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { StockReportDTO } from "../dtos/stock-report-dto";
import { StockReportFilterDTO } from "../dtos/stock-report-filter-dto";
import { StockReportOptionsDTO } from "../dtos/stock-report-options-dto";

function buildParams(filters: StockReportFilterDTO) {
  const params: Record<string, string | number | boolean> = {};
  if (filters.search) params.search = filters.search;
  if (filters.categoryId != null) params.categoryId = filters.categoryId;
  if (filters.itemId != null) params.itemId = filters.itemId;
  if (filters.active != null) params.active = filters.active;
  if (filters.status) params.status = filters.status;
  if (filters.conditionStatus) params.conditionStatus = filters.conditionStatus;
  if (filters.movementType) params.movementType = filters.movementType;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  return params;
}

export const stockReportService = {
  async generate(
    reportType: string,
    format: string,
    filters: StockReportFilterDTO,
  ): Promise<Blob> {
    const response = await httpClient.get(
      API.STOCK_REPORTS.GENERATE(reportType, format),
      { params: buildParams(filters), responseType: "blob" },
    );
    return response.data;
  },
  async summary(filters: StockReportFilterDTO): Promise<StockReportDTO> {
    const response = await httpClient.get<StockReportDTO>(
      API.STOCK_REPORTS.SUMMARY,
      { params: buildParams(filters) },
    );
    return response.data;
  },
  async options(): Promise<StockReportOptionsDTO> {
    const response = await httpClient.get<StockReportOptionsDTO>(
      API.STOCK_REPORTS.OPTIONS,
    );
    return response.data;
  },
};
