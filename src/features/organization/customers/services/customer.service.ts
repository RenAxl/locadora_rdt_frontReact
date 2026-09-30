import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { CustomerDTO } from "../dtos/customer-dto";
import { CustomerInsertDTO } from "../dtos/customer-insert-dto";
import { CustomerUpdateDTO } from "../dtos/customer-update-dto";

export const customerService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<CustomerDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<CustomerDTO>>(
      API.CUSTOMERS.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(customer: CustomerInsertDTO): Promise<CustomerDTO> {
    const response = await httpClient.post<CustomerDTO>(
      API.CUSTOMERS.ROOT,
      customer,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<CustomerDTO> {
    const response = await httpClient.get<CustomerDTO>(
      API.CUSTOMERS.BY_ID(id),
    );
    return response.data;
  },

  async update(dto: CustomerUpdateDTO): Promise<CustomerDTO> {
    if (!dto.id) throw new Error("Customer ID is required for update");
    const response = await httpClient.put<CustomerDTO>(
      API.CUSTOMERS.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.CUSTOMERS.BY_ID(id));
  },

  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.CUSTOMERS.DELETE_ALL, { data: ids });
  },

  async changeActive(id: number, active: boolean): Promise<void> {
    await httpClient.patch(API.CUSTOMERS.CHANGE_ACTIVE(id), active, {
      headers: { "Content-Type": "application/json" },
    });
  },

  async getCustomerPhoto(id: number): Promise<Blob> {
    const response = await httpClient.get(API.CUSTOMERS.PHOTO(id), {
      responseType: "blob",
    });
    return response.data;
  },
  async updatePhoto(id: number, file: File): Promise<void> {
    const body = new FormData();
    body.append("file", file);
    await httpClient.put(API.CUSTOMERS.PHOTO(id), body);
  },
};
