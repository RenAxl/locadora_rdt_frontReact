import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { SupplierFileDTO } from "../dtos/supplier-file-dto";

export const supplierFileService = {
  async findAllBySupplier(supplierId: number): Promise<SupplierFileDTO[]> {
    const response = await httpClient.get<SupplierFileDTO[]>(
      API.SUPPLIERS.FILES.ROOT(supplierId),
    );
    return response.data;
  },
  async getViewBlob(supplierId: number, fileId: number): Promise<Blob> {
    const response = await httpClient.get(
      API.SUPPLIERS.FILES.VIEW(supplierId, fileId),
      { responseType: "blob" },
    );
    return response.data;
  },
  async upload(
    supplierId: number,
    name: string,
    file: File,
  ): Promise<SupplierFileDTO> {
    const body = new FormData();
    body.append("name", name);
    body.append("file", file);
    const response = await httpClient.post<SupplierFileDTO>(
      API.SUPPLIERS.FILES.ROOT(supplierId),
      body,
    );
    return response.data;
  },
  async delete(supplierId: number, fileId: number): Promise<void> {
    await httpClient.delete(API.SUPPLIERS.FILES.BY_ID(supplierId, fileId));
  },
  async download(supplierId: number, fileId: number) {
    return httpClient.get<Blob>(
      API.SUPPLIERS.FILES.DOWNLOAD(supplierId, fileId),
      { responseType: "blob" },
    );
  },
};
