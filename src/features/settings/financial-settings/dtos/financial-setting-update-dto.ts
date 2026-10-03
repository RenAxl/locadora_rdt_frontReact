export class FinancialSettingUpdateDTO {
  defaultLateFeePercent: number = 0;

  defaultLateInterestPercent: number = 0;

  constructor(financialSetting?: Partial<FinancialSettingUpdateDTO>) {
    if (financialSetting != null) {
      if (financialSetting.defaultLateFeePercent != null) {
        this.defaultLateFeePercent = financialSetting.defaultLateFeePercent;
      }

      if (financialSetting.defaultLateInterestPercent != null) {
        this.defaultLateInterestPercent =
          financialSetting.defaultLateInterestPercent;
      }
    }
  }
}
