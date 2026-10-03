export class FinancialSetting {
  id?: number;
  defaultLateFeePercent: number | null = 0;
  defaultLateInterestPercent: number | null = 0;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(financialSetting?: FinancialSetting) {
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
