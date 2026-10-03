export class ReceivableReportDTO {
  totalItems?: number;
  totalAmount?: number;
  paidAmount?: number;
  openAmount?: number;

  constructor(receivable?: Partial<ReceivableReportDTO>) {
    if (receivable != null) {
      this.totalItems = receivable.totalItems;
      this.totalAmount = receivable.totalAmount;
      this.paidAmount = receivable.paidAmount;
      this.openAmount = receivable.openAmount;
    }
  }
}
