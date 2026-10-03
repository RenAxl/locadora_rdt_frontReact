export class ReceivableUpdateDTO {
  id?: number;
  description: string = "";
  amount?: number | null;
  dueDate?: string | null;
  paymentDate?: string | null;
  customerId?: number | null;
  paymentMethodId?: number | null;
  paymentFrequencyId?: number | null;
  note?: string | null;
  fileName?: string | null;

  constructor(receivable?: Partial<ReceivableUpdateDTO>) {
    if (receivable != null) {
      this.id = receivable.id;
      if (receivable.description != null) {
        this.description = receivable.description;
      }
      this.amount = receivable.amount;
      this.dueDate = receivable.dueDate;
      this.paymentDate = receivable.paymentDate;
      this.customerId = receivable.customerId;
      this.paymentMethodId = receivable.paymentMethodId;
      this.paymentFrequencyId = receivable.paymentFrequencyId;
      this.note = receivable.note;
      this.fileName = receivable.fileName;
    }
  }
}
