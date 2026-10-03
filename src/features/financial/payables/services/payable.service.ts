import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { PayableFilters } from "../models/PayableFilters";
import { PayableDTO } from "../dtos/payable-dto";
import { PayableInsertDTO } from "../dtos/payable-insert-dto";
import { PayableUpdateDTO } from "../dtos/payable-update-dto";
import { PayablePaymentDTO } from "../dtos/payable-payment-dto";
import { PayableReportDTO } from "../dtos/payable-report-dto";

export const payableService = {
  async list(
    pagination: Pagination,
    filters: PayableFilters,
  ): Promise<PageResponse<PayableDTO>> {
    const params = buildPaginationParams(
      pagination,
      "search",
      filters.search || filters.description,
    );
    params.status = filters.status;
    params.periodType = filters.periodType || filters.dateType;
    if (filters.startDate != null && filters.startDate !== "")
      params.startDate = filters.startDate;
    if (filters.endDate != null && filters.endDate !== "")
      params.endDate = filters.endDate;
    if (filters.supplierId != null)
      params.supplierId = filters.supplierId.toString();
    if (filters.employeeId != null)
      params.employeeId = filters.employeeId.toString();
    if (filters.paymentMethodId != null)
      params.paymentMethodId = filters.paymentMethodId.toString();
    if (filters.paymentFrequencyId != null)
      params.paymentFrequencyId = filters.paymentFrequencyId.toString();
    if (filters.minimumAmount != null)
      params.minimumAmount = filters.minimumAmount.toString();
    if (filters.maximumAmount != null)
      params.maximumAmount = filters.maximumAmount.toString();
    const response = await httpClient.get<PageResponse<PayableDTO>>(
      API.PAYABLES.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(dto: PayableInsertDTO): Promise<PayableDTO> {
    const response = await httpClient.post<PayableDTO>(API.PAYABLES.ROOT, dto);
    return response.data;
  },

  async findById(id: number | string): Promise<PayableDTO> {
    const response = await httpClient.get<PayableDTO>(API.PAYABLES.BY_ID(id));
    return response.data;
  },

  async update(dto: PayableUpdateDTO): Promise<PayableDTO> {
    if (!dto.id) throw new Error("Payable ID is required for update");
    const response = await httpClient.put<PayableDTO>(
      API.PAYABLES.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.PAYABLES.BY_ID(id));
  },

  async pay(id: number, dto: PayablePaymentDTO): Promise<PayableDTO> {
    const response = await httpClient.post<PayableDTO>(
      API.PAYABLES.PAY(id),
      dto,
    );
    return response.data;
  },

  async report(filters: PayableFilters): Promise<PayableReportDTO> {
    const params: Record<string, string> = {
      description: filters.description || "",
      status: filters.status || "all",
      dateType: filters.dateType || "due",
    };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    const response = await httpClient.get<PayableReportDTO>(
      API.PAYABLES.REPORT,
      { params },
    );
    return response.data;
  },
};
