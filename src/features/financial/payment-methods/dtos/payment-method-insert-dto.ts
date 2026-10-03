export class PaymentMethodInsertDTO {
  name: string = "";

  fee: number | null = null;

  constructor(paymentMethod?: Partial<PaymentMethodInsertDTO>) {
    if (paymentMethod != null) {
      if (paymentMethod.name != null) {
        this.name = paymentMethod.name ?? "";
      }

      if (paymentMethod.fee != null) {
        this.fee = paymentMethod.fee ?? null;
      }
    }
  }
}
