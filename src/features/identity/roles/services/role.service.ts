import { API } from '../../../../core/config/api.config';
import { httpClient } from '../../../../core/http/interceptors/http-client';
import { PageResponse } from '../../../../core/models/page-response';
import { Pagination } from '../../../../core/models/Pagination';
import { buildPaginationParams } from '../../../../core/utils/pagination-params.util';
import { RoleDetailsDTO } from '../dtos/role-details-dto';
import { RoleInsertDTO } from '../dtos/role-insert-dto';
import { RolePermissionsUpdateDTO } from '../dtos/role-permissions-update-dto';
import { RoleDTO } from '../dtos/role.dto';

export const roleService = {
  async list(pagination: Pagination, filterName: string): Promise<PageResponse<RoleDTO>> {
    const params = buildPaginationParams(pagination, 'authority', filterName);
    const response = await httpClient.get<PageResponse<RoleDTO>>(API.ROLES.ROOT, { params });
    return response.data;
  },

  async insert(role: RoleInsertDTO): Promise<RoleDTO> {
    const response = await httpClient.post<RoleDTO>(API.ROLES.ROOT, role);
    return response.data;
  },

  async findById(id: number | string): Promise<RoleDetailsDTO> {
    const response = await httpClient.get<RoleDetailsDTO>(API.ROLES.BY_ID(id));
    return response.data;
  },

  async updatePermissions(id: number, role: RolePermissionsUpdateDTO): Promise<RoleDTO> {
    const response = await httpClient.put<RoleDTO>(API.ROLES.PERMISSIONS(id), role);
    return response.data;
  },
};
