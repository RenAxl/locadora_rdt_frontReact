import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { SupplierDTO } from "../dtos/supplier-dto";
import { SupplierInsertDTO } from "../dtos/supplier-insert-dto";
import { SupplierUpdateDTO } from "../dtos/supplier-update-dto";

export const supplierService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<SupplierDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<SupplierDTO>>(
      API.SUPPLIERS.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(supplier: SupplierInsertDTO): Promise<SupplierDTO> {
    const response = await httpClient.post<SupplierDTO>(
      API.SUPPLIERS.ROOT,
      supplier,
    );
    return response.data;
  },

  async findById(id: number | string): Promise<SupplierDTO> {
    const response = await httpClient.get<SupplierDTO>(API.SUPPLIERS.BY_ID(id));
    return response.data;
  },

  async update(dto: SupplierUpdateDTO): Promise<SupplierDTO> {
    if (!dto.id) throw new Error("Supplier ID is required for update");
    const response = await httpClient.put<SupplierDTO>(
      API.SUPPLIERS.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.SUPPLIERS.BY_ID(id));
  },

  async getSupplierImage(id: number): Promise<Blob> {
    const response = await httpClient.get(API.SUPPLIERS.IMAGE(id), {
      responseType: "blob",
    });
    return response.data;
  },
  async updateImage(id: number, file: File): Promise<void> {
    const body = new FormData();
    body.append("file", file);
    await httpClient.put(API.SUPPLIERS.IMAGE(id), body);
  },
};
