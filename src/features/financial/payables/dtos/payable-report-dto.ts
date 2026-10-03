export class PayableReportDTO {
  totalItems?: number;
  totalAmount?: number;
  paidAmount?: number;
  openAmount?: number;

  constructor(payable?: Partial<PayableReportDTO>) {
    if (payable != null) {
      this.totalItems = payable.totalItems;
      this.totalAmount = payable.totalAmount;
      this.paidAmount = payable.paidAmount;
      this.openAmount = payable.openAmount;
    }
  }
}
