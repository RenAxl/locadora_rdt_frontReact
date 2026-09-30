import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { PageResponse } from "../../../../core/models/page-response";
import { Pagination } from "../../../../core/models/Pagination";
import { buildPaginationParams } from "../../../../core/utils/pagination-params.util";
import { UserDTO } from "../dtos/user-dto";
import { UserInsertDTO } from "../dtos/user-insert-dto";
import { UserUpdateDTO } from "../dtos/user-update-dto";

export const userService = {
  async list(
    pagination: Pagination,
    filterName: string,
  ): Promise<PageResponse<UserDTO>> {
    const params = buildPaginationParams(pagination, "name", filterName);
    const response = await httpClient.get<PageResponse<UserDTO>>(
      API.USERS.ROOT,
      { params },
    );
    return response.data;
  },

  async insert(user: UserInsertDTO): Promise<UserDTO> {
    const response = await httpClient.post<UserDTO>(API.USERS.ROOT, user);
    return response.data;
  },

  async findById(id: number | string): Promise<UserDTO> {
    const response = await httpClient.get<UserDTO>(API.USERS.BY_ID(id));
    return response.data;
  },

  async update(dto: UserUpdateDTO): Promise<UserDTO> {
    if (!dto.id) throw new Error("User ID is required for update");
    const response = await httpClient.put<UserDTO>(
      API.USERS.BY_ID(dto.id),
      dto,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(API.USERS.BY_ID(id));
  },

  async deleteAll(ids: number[]): Promise<void> {
    await httpClient.delete(API.USERS.DELETE_ALL, { data: ids });
  },

  async changeActive(id: number, active: boolean): Promise<void> {
    await httpClient.patch(API.USERS.CHANGE_ACTIVE(id), active, {
      headers: { "Content-Type": "application/json" },
    });
  },

  async getUserPhoto(id: number): Promise<Blob> {
    const response = await httpClient.get(API.USERS.PHOTO(id), {
      responseType: "blob",
    });
    return response.data;
  },
};
