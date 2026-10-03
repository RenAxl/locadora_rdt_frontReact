import { FinancialReportMonth } from "./FinancialReportMonth";

export class FinancialReport {
  receivableTotal: number = 0;
  payableTotal: number = 0;
  balance: number = 0;
  receivableCount: number = 0;
  payableCount: number = 0;
  year: number = new Date().getFullYear();
  months: FinancialReportMonth[] = [];

  constructor(report?: FinancialReport) {
    if (report != null) {
      this.receivableTotal = report.receivableTotal;
      this.payableTotal = report.payableTotal;
      this.balance = report.balance;
      this.receivableCount = report.receivableCount;
      this.payableCount = report.payableCount;
      this.year = report.year;
      this.months = report.months;
    }
  }
}
