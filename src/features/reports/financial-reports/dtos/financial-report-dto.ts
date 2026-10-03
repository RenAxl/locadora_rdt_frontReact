import { FinancialReportMonthDTO } from "./financial-report-month-dto";

export class FinancialReportDTO {
  receivableTotal?: number;
  payableTotal?: number;
  balance?: number;
  receivableCount?: number;
  payableCount?: number;
  year?: number;
  months?: FinancialReportMonthDTO[];

  constructor(report?: Partial<FinancialReportDTO>) {
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
