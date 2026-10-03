export class FinancialReportFilterDTO {
  search?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  periodType?: string;
  customerId?: number | null;
  supplierId?: number | null;
  employeeId?: number | null;
  paymentMethodId?: number | null;
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  year?: number | null;

  constructor(filter?: Partial<FinancialReportFilterDTO>) {
    if (filter != null) {
      this.search = filter.search;
      this.startDate = filter.startDate;
      this.endDate = filter.endDate;
      this.status = filter.status;
      this.periodType = filter.periodType;
      this.customerId = filter.customerId;
      this.supplierId = filter.supplierId;
      this.employeeId = filter.employeeId;
      this.paymentMethodId = filter.paymentMethodId;
      this.minimumAmount = filter.minimumAmount;
      this.maximumAmount = filter.maximumAmount;
      this.year = filter.year;
    }
  }
}
