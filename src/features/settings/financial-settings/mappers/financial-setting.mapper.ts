import { FinancialSettingDTO } from "../dtos/financial-setting-dto";
import { FinancialSettingUpdateDTO } from "../dtos/financial-setting-update-dto";
import { FinancialSetting } from "../models/FinancialSetting";

export class FinancialSettingMapper {
  static toModel(dto: FinancialSettingDTO): FinancialSetting {
    return new FinancialSetting({
      id: dto.id,
      defaultLateFeePercent: dto.defaultLateFeePercent ?? 0,

      defaultLateInterestPercent: dto.defaultLateInterestPercent ?? 0,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toUpdateDTO(
    financialSetting: FinancialSetting,
  ): FinancialSettingUpdateDTO {
    return new FinancialSettingUpdateDTO({
      defaultLateFeePercent: financialSetting.defaultLateFeePercent ?? 0,

      defaultLateInterestPercent:
        financialSetting.defaultLateInterestPercent ?? 0,
    });
  }
}
