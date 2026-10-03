import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { ReceivableFileDTO } from "../dtos/receivable-file-dto";

export const receivableFileService = {
  async findAllByReceivable(
    receivableId: number,
  ): Promise<ReceivableFileDTO[]> {
    const response = await httpClient.get<ReceivableFileDTO[]>(
      API.RECEIVABLES.FILES.ROOT(receivableId),
    );
    return response.data;
  },
  async getViewBlob(receivableId: number, fileId: number): Promise<Blob> {
    const response = await httpClient.get(
      API.RECEIVABLES.FILES.VIEW(receivableId, fileId),
      { responseType: "blob" },
    );
    return response.data;
  },
  async upload(
    receivableId: number,
    name: string,
    file: File,
  ): Promise<ReceivableFileDTO> {
    const body = new FormData();
    body.append("name", name);
    body.append("file", file);
    const response = await httpClient.post<ReceivableFileDTO>(
      API.RECEIVABLES.FILES.ROOT(receivableId),
      body,
    );
    return response.data;
  },
  async delete(receivableId: number, fileId: number): Promise<void> {
    await httpClient.delete(API.RECEIVABLES.FILES.BY_ID(receivableId, fileId));
  },
  async download(receivableId: number, fileId: number) {
    return httpClient.get<Blob>(
      API.RECEIVABLES.FILES.DOWNLOAD(receivableId, fileId),
      { responseType: "blob" },
    );
  },
};
