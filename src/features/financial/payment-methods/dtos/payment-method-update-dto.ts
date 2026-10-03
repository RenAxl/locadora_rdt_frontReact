export class PaymentMethodUpdateDTO {
  id?: number;

  name: string = "";

  fee: number | null = null;

  constructor(paymentMethod?: Partial<PaymentMethodUpdateDTO>) {
    if (paymentMethod != null) {
      this.id = paymentMethod.id;

      if (paymentMethod.name != null) {
        this.name = paymentMethod.name ?? "";
      }

      if (paymentMethod.fee != null) {
        this.fee = paymentMethod.fee ?? null;
      }
    }
  }
}
