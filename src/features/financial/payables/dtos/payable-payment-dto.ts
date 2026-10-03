export class PayablePaymentDTO {
  paymentAmount?: number | null;
  paymentDate?: string | null;
  paymentMethodId?: number | null;
  subtotal?: number | null;
  fee?: number | null;
  lateInterest?: number | null;
  lateFee?: number | null;

  constructor(payable?: Partial<PayablePaymentDTO>) {
    if (payable != null) {
      this.paymentAmount = payable.paymentAmount;
      this.paymentDate = payable.paymentDate;
      this.paymentMethodId = payable.paymentMethodId;
      this.subtotal = payable.subtotal;
      this.fee = payable.fee;
      this.lateInterest = payable.lateInterest;
      this.lateFee = payable.lateFee;
    }
  }
}
