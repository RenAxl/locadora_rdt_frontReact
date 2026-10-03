export class FinancialReportMonthDTO {
  month?: number;
  label?: string;
  receivableTotal?: number;
  payableTotal?: number;

  constructor(month?: Partial<FinancialReportMonthDTO>) {
    if (month != null) {
      this.month = month.month;
      this.label = month.label;
      this.receivableTotal = month.receivableTotal;
      this.payableTotal = month.payableTotal;
    }
  }
}
