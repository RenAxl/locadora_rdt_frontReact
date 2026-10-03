import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { PaymentFrequencyDTO } from "../dtos/payment-frequency-dto";
import { PaymentFrequencyInsertDTO } from "../dtos/payment-frequency-insert-dto";
import { PaymentFrequencyUpdateDTO } from "../dtos/payment-frequency-update-dto";

export const paymentFrequencyService = {
  async list(
    pagination: Pagination,
    filterFrequency: string,
  ): Promise<PageResponse<PaymentFrequencyDTO>> {
    const params = buildPaginationParams(
      pagination,
      "frequency",
      filterFrequency,
    );
    const response = await httpClient.get<PageResponse<PaymentFrequencyDTO>>(
      API.PAYMENT_FREQUENCIES.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(
    paymentFrequency: PaymentFrequencyInsertDTO,
  ): Promise<PaymentFrequencyDTO> {
    const response = await httpClient.post<PaymentFrequencyDTO>(
      API.PAYMENT_FREQUENCIES.ROOT,
      paymentFrequency,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<PaymentFrequencyDTO> {
    const response = await httpClient.get<PaymentFrequencyDTO>(
      API.PAYMENT_FREQUENCIES.BY_ID(id),
    );
    return response.data;
  },

  async update(dto: PaymentFrequencyUpdateDTO): Promise<PaymentFrequencyDTO> {
    if (!dto.id) throw new Error("PaymentFrequency ID is required for update");
    const response = await httpClient.put<PaymentFrequencyDTO>(
      API.PAYMENT_FREQUENCIES.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.PAYMENT_FREQUENCIES.BY_ID(id));
  },
  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.PAYMENT_FREQUENCIES.DELETE_ALL, { data: ids });
  },
};
