import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PayableFileDTO } from "../dtos/payable-file-dto";

export const payableFileService = {
  async findAllByPayable(payableId: number): Promise<PayableFileDTO[]> {
    const response = await httpClient.get<PayableFileDTO[]>(
      API.PAYABLES.FILES.ROOT(payableId),
    );
    return response.data;
  },
  async getViewBlob(payableId: number, fileId: number): Promise<Blob> {
    const response = await httpClient.get(
      API.PAYABLES.FILES.VIEW(payableId, fileId),
      { responseType: "blob" },
    );
    return response.data;
  },
  async upload(
    payableId: number,
    name: string,
    file: File,
  ): Promise<PayableFileDTO> {
    const body = new FormData();
    body.append("name", name);
    body.append("file", file);
    const response = await httpClient.post<PayableFileDTO>(
      API.PAYABLES.FILES.ROOT(payableId),
      body,
    );
    return response.data;
  },
  async delete(payableId: number, fileId: number): Promise<void> {
    await httpClient.delete(API.PAYABLES.FILES.BY_ID(payableId, fileId));
  },
  async download(payableId: number, fileId: number) {
    return httpClient.get<Blob>(
      API.PAYABLES.FILES.DOWNLOAD(payableId, fileId),
      { responseType: "blob" },
    );
  },
};
