import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { FinancialReportDTO } from "../dtos/financial-report-dto";
import { FinancialReportFilterDTO } from "../dtos/financial-report-filter-dto";

const buildParams = (
  filters: FinancialReportFilterDTO,
): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filters.search != null && filters.search !== "")
    params.search = filters.search;
  if (filters.startDate != null && filters.startDate !== "")
    params.startDate = filters.startDate;
  if (filters.endDate != null && filters.endDate !== "")
    params.endDate = filters.endDate;
  if (filters.status != null && filters.status !== "")
    params.status = filters.status;
  if (filters.periodType != null && filters.periodType !== "")
    params.periodType = filters.periodType;
  if (filters.customerId != null)
    params.customerId = filters.customerId.toString();
  if (filters.supplierId != null)
    params.supplierId = filters.supplierId.toString();
  if (filters.employeeId != null)
    params.employeeId = filters.employeeId.toString();
  if (filters.paymentMethodId != null)
    params.paymentMethodId = filters.paymentMethodId.toString();
  if (filters.minimumAmount != null)
    params.minimumAmount = filters.minimumAmount.toString();
  if (filters.maximumAmount != null)
    params.maximumAmount = filters.maximumAmount.toString();
  if (filters.year != null) params.year = filters.year.toString();
  return params;
};

export const financialReportService = {
  async generate(
    reportType: string,
    format: string,
    filters: FinancialReportFilterDTO,
  ): Promise<Blob> {
    const params = buildParams(filters);
    const response = await httpClient.get<Blob>(
      API.FINANCIAL_REPORTS.GENERATE(reportType, format),
      { params, responseType: "blob" },
    );
    return response.data;
  },

  async comparison(
    filters: FinancialReportFilterDTO,
  ): Promise<FinancialReportDTO> {
    const params = buildParams(filters);
    const response = await httpClient.get<FinancialReportDTO>(
      API.FINANCIAL_REPORTS.COMPARISON,
      { params },
    );
    return response.data;
  },
};
