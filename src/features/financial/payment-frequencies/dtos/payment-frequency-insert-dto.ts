export class PaymentFrequencyInsertDTO {
  frequency: string = "";

  days: number | null = null;

  constructor(paymentFrequency?: Partial<PaymentFrequencyInsertDTO>) {
    if (paymentFrequency != null) {
      if (paymentFrequency.frequency != null) {
        this.frequency = paymentFrequency.frequency ?? "";
      }

      if (paymentFrequency.days != null) {
        this.days = paymentFrequency.days ?? null;
      }
    }
  }
}
