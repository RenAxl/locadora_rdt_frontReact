export class PaymentMethodDTO {
  id?: number;

  name?: string;
  fee?: number | null;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;

  constructor(paymentMethod?: Partial<PaymentMethodDTO>) {
    if (paymentMethod != null) {
      this.id = paymentMethod.id;
      this.name = paymentMethod.name ?? "";
      this.fee = paymentMethod.fee ?? null;
      this.createdBy = paymentMethod.createdBy;
      this.updatedBy = paymentMethod.updatedBy;

      if (paymentMethod.createdAt != null) {
        this.createdAt = new Date(paymentMethod.createdAt);
      }

      if (paymentMethod.updatedAt != null) {
        this.updatedAt = new Date(paymentMethod.updatedAt);
      }
    }
  }
}
