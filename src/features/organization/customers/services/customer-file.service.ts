import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { CustomerFileDTO } from "../dtos/customer-file-dto";

export const customerFileService = {
  async findAllByCustomer(customerId: number): Promise<CustomerFileDTO[]> {
    const response = await httpClient.get<CustomerFileDTO[]>(
      API.CUSTOMERS.FILES.ROOT(customerId),
    );
    return response.data;
  },
  async getViewBlob(customerId: number, fileId: number): Promise<Blob> {
    const response = await httpClient.get(
      API.CUSTOMERS.FILES.VIEW(customerId, fileId),
      { responseType: "blob" },
    );
    return response.data;
  },
  async upload(
    customerId: number,
    name: string,
    file: File,
  ): Promise<CustomerFileDTO> {
    const body = new FormData();
    body.append("name", name);
    body.append("file", file);
    const response = await httpClient.post<CustomerFileDTO>(
      API.CUSTOMERS.FILES.ROOT(customerId),
      body,
    );
    return response.data;
  },
  async delete(customerId: number, fileId: number): Promise<void> {
    await httpClient.delete(API.CUSTOMERS.FILES.BY_ID(customerId, fileId));
  },
  async download(customerId: number, fileId: number) {
    return httpClient.get<Blob>(
      API.CUSTOMERS.FILES.DOWNLOAD(customerId, fileId),
      { responseType: "blob" },
    );
  },
};
