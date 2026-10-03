import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { FinancialSettingDTO } from "../dtos/financial-setting-dto";
import { FinancialSettingUpdateDTO } from "../dtos/financial-setting-update-dto";

export const financialSettingService = {
  async findCurrent(): Promise<FinancialSettingDTO> {
    const response = await httpClient.get<FinancialSettingDTO>(
      API.FINANCIAL_SETTINGS.ROOT,
    );
    return response.data;
  },

  async update(dto: FinancialSettingUpdateDTO): Promise<FinancialSettingDTO> {
    const response = await httpClient.put<FinancialSettingDTO>(
      API.FINANCIAL_SETTINGS.ROOT,
      dto,
    );
    return response.data;
  },
};
