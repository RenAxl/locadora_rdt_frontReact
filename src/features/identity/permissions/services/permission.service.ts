import { API } from '../../../../core/config/api.config';
import { httpClient } from '../../../../core/http/interceptors/http-client';
import { PermissionDTO } from '../dtos/permission-dto';

export const permissionService = {
  async list(groupName: string): Promise<PermissionDTO[]> {
    const response = await httpClient.get<PermissionDTO[]>(API.PERMISSIONS.ROOT, {
      params: { groupName: groupName || '' },
    });
    return response.data;
  },

  async listGroups(): Promise<string[]> {
    const response = await httpClient.get<string[]>(API.PERMISSIONS.GROUPS);
    return response.data;
  },
};
