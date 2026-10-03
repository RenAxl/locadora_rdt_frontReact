export class FinancialSettingDTO {
  id?: number;

  defaultLateFeePercent?: number;
  defaultLateInterestPercent?: number;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(financialSetting?: Partial<FinancialSettingDTO>) {
    if (financialSetting != null) {
      this.id = financialSetting.id;
      this.defaultLateFeePercent = financialSetting.defaultLateFeePercent;
      this.defaultLateInterestPercent =
        financialSetting.defaultLateInterestPercent;
      this.createdBy = financialSetting.createdBy;
      this.updatedBy = financialSetting.updatedBy;

      if (financialSetting.createdAt != null) {
        this.createdAt = new Date(financialSetting.createdAt);
      }

      if (financialSetting.updatedAt != null) {
        this.updatedAt = new Date(financialSetting.updatedAt);
      }
    }
  }
}
