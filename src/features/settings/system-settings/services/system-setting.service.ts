import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { SystemSettingDTO } from "../dtos/system-setting-dto";
import { SystemSettingUpdateDTO } from "../dtos/system-setting-update-dto";

export const systemSettingService = {
  async findCurrent(): Promise<SystemSettingDTO> {
    const response = await httpClient.get<SystemSettingDTO>(
      API.SYSTEM_SETTINGS.ROOT,
    );
    return response.data;
  },
  async update(setting: SystemSettingUpdateDTO): Promise<SystemSettingDTO> {
    const response = await httpClient.put<SystemSettingDTO>(
      API.SYSTEM_SETTINGS.ROOT,
      setting,
    );
    return response.data;
  },
};
