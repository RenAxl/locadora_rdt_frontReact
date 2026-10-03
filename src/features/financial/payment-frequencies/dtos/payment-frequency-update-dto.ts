export class PaymentFrequencyUpdateDTO {
  id?: number;

  frequency: string = "";

  days: number | null = null;

  constructor(paymentFrequency?: Partial<PaymentFrequencyUpdateDTO>) {
    if (paymentFrequency != null) {
      this.id = paymentFrequency.id;

      if (paymentFrequency.frequency != null) {
        this.frequency = paymentFrequency.frequency ?? "";
      }

      if (paymentFrequency.days != null) {
        this.days = paymentFrequency.days ?? null;
      }
    }
  }
}
