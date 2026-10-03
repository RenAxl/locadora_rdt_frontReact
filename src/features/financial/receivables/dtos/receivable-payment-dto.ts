export class ReceivablePaymentDTO {
  paymentAmount?: number | null;
  paymentDate?: string | null;
  paymentMethodId?: number | null;
  subtotal?: number | null;
  fee?: number | null;
  lateInterest?: number | null;
  lateFee?: number | null;

  constructor(receivable?: Partial<ReceivablePaymentDTO>) {
    if (receivable != null) {
      this.paymentAmount = receivable.paymentAmount;
      this.paymentDate = receivable.paymentDate;
      this.paymentMethodId = receivable.paymentMethodId;
      this.subtotal = receivable.subtotal;
      this.fee = receivable.fee;
      this.lateInterest = receivable.lateInterest;
      this.lateFee = receivable.lateFee;
    }
  }
}
