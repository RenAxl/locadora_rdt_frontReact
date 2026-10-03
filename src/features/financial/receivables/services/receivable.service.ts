import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { ReceivableFilters } from "../models/ReceivableFilters";
import { ReceivableDTO } from "../dtos/receivable-dto";
import { ReceivableInsertDTO } from "../dtos/receivable-insert-dto";
import { ReceivableUpdateDTO } from "../dtos/receivable-update-dto";
import { ReceivablePaymentDTO } from "../dtos/receivable-payment-dto";
import { ReceivableReportDTO } from "../dtos/receivable-report-dto";

export const receivableService = {
  async list(
    pagination: Pagination,
    filters: ReceivableFilters,
  ): Promise<PageResponse<ReceivableDTO>> {
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
    if (filters.customerId != null)
      params.customerId = filters.customerId.toString();
    if (filters.paymentMethodId != null)
      params.paymentMethodId = filters.paymentMethodId.toString();
    if (filters.paymentFrequencyId != null)
      params.paymentFrequencyId = filters.paymentFrequencyId.toString();
    if (filters.minimumAmount != null)
      params.minimumAmount = filters.minimumAmount.toString();
    if (filters.maximumAmount != null)
      params.maximumAmount = filters.maximumAmount.toString();
    const response = await httpClient.get<PageResponse<ReceivableDTO>>(
      API.RECEIVABLES.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(dto: ReceivableInsertDTO): Promise<ReceivableDTO> {
    const response = await httpClient.post<ReceivableDTO>(
      API.RECEIVABLES.ROOT,
      dto,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<ReceivableDTO> {
    const response = await httpClient.get<ReceivableDTO>(
      API.RECEIVABLES.BY_ID(id),
    );
    return response.data;
  },

  async update(dto: ReceivableUpdateDTO): Promise<ReceivableDTO> {
    if (!dto.id) throw new Error("Receivable ID is required for update");
    const response = await httpClient.put<ReceivableDTO>(
      API.RECEIVABLES.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.RECEIVABLES.BY_ID(id));
  },

  async pay(id: number, dto: ReceivablePaymentDTO): Promise<ReceivableDTO> {
    const response = await httpClient.post<ReceivableDTO>(
      API.RECEIVABLES.PAY(id),
      dto,
    );
    return response.data;
  },

  async report(filters: ReceivableFilters): Promise<ReceivableReportDTO> {
    const params: Record<string, string> = {
      description: filters.description || "",
      status: filters.status || "all",
      dateType: filters.dateType || "due",
    };
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    const response = await httpClient.get<ReceivableReportDTO>(
      API.RECEIVABLES.REPORT,
      { params },
    );
    return response.data;
  },

  async receipt(id: number): Promise<Blob> {
    const response = await httpClient.get<Blob>(API.RECEIVABLES.RECEIPT(id), {
      responseType: "blob",
    });
    return response.data;
  },

  async fiscalCoupon(id: number): Promise<Blob> {
    const response = await httpClient.get<Blob>(
      API.RECEIVABLES.FISCAL_COUPON(id),
      { responseType: "blob" },
    );
    return response.data;
  },
};
