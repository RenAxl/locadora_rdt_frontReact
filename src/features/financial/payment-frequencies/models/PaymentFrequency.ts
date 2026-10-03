export class PaymentFrequency {
  id?: number;
  frequency: string = "";
  days: number | null = null;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(paymentFrequency?: Partial<PaymentFrequency>) {
    if (paymentFrequency != null) {
      this.id = paymentFrequency.id;
      this.frequency = paymentFrequency.frequency ?? "";
      this.days = paymentFrequency.days ?? null;
      this.createdBy = paymentFrequency.createdBy;
      this.updatedBy = paymentFrequency.updatedBy;

      if (paymentFrequency.createdAt != null) {
        this.createdAt = new Date(paymentFrequency.createdAt);
      }

      if (paymentFrequency.updatedAt != null) {
        this.updatedAt = new Date(paymentFrequency.updatedAt);
      }
    }
  }
}
