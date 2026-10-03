export class PaymentMethod {
  id?: number;
  name: string = "";
  fee: number | null = null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(paymentMethod?: Partial<PaymentMethod>) {
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
