import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { PaymentMethodDTO } from "../dtos/payment-method-dto";
import { PaymentMethodInsertDTO } from "../dtos/payment-method-insert-dto";
import { PaymentMethodUpdateDTO } from "../dtos/payment-method-update-dto";

export const paymentMethodService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<PaymentMethodDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<PaymentMethodDTO>>(
      API.PAYMENT_METHODS.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(
    paymentMethod: PaymentMethodInsertDTO,
  ): Promise<PaymentMethodDTO> {
    const response = await httpClient.post<PaymentMethodDTO>(
      API.PAYMENT_METHODS.ROOT,
      paymentMethod,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<PaymentMethodDTO> {
    const response = await httpClient.get<PaymentMethodDTO>(
      API.PAYMENT_METHODS.BY_ID(id),
    );
    return response.data;
  },

  async update(dto: PaymentMethodUpdateDTO): Promise<PaymentMethodDTO> {
    if (!dto.id) throw new Error("PaymentMethod ID is required for update");
    const response = await httpClient.put<PaymentMethodDTO>(
      API.PAYMENT_METHODS.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.PAYMENT_METHODS.BY_ID(id));
  },
  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.PAYMENT_METHODS.DELETE_ALL, { data: ids });
  },
};
