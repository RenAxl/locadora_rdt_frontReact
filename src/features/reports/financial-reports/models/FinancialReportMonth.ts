export class FinancialReportMonth {
  month: number = 0;
  label: string = "";
  receivableTotal: number = 0;
  payableTotal: number = 0;

  constructor(month?: FinancialReportMonth) {
    if (month != null) {
      this.month = month.month;
      this.label = month.label;
      this.receivableTotal = month.receivableTotal;
      this.payableTotal = month.payableTotal;
    }
  }
}
