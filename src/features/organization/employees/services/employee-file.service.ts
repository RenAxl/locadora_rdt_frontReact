import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { EmployeeFileDTO } from "../dtos/employee-file-dto";

export const employeeFileService = {
  async findAllByEmployee(employeeId: number): Promise<EmployeeFileDTO[]> {
    const response = await httpClient.get<EmployeeFileDTO[]>(
      API.EMPLOYEES.FILES.ROOT(employeeId),
    );
    return response.data;
  },
  async getViewBlob(employeeId: number, fileId: number): Promise<Blob> {
    const response = await httpClient.get(
      API.EMPLOYEES.FILES.VIEW(employeeId, fileId),
      { responseType: "blob" },
    );
    return response.data;
  },
  async upload(
    employeeId: number,
    name: string,
    file: File,
  ): Promise<EmployeeFileDTO> {
    const body = new FormData();
    body.append("name", name);
    body.append("file", file);
    const response = await httpClient.post<EmployeeFileDTO>(
      API.EMPLOYEES.FILES.ROOT(employeeId),
      body,
    );
    return response.data;
  },
  async delete(employeeId: number, fileId: number): Promise<void> {
    await httpClient.delete(API.EMPLOYEES.FILES.BY_ID(employeeId, fileId));
  },
  async download(employeeId: number, fileId: number) {
    return httpClient.get<Blob>(
      API.EMPLOYEES.FILES.DOWNLOAD(employeeId, fileId),
      { responseType: "blob" },
    );
  },
};
