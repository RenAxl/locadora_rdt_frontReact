export class PayableInsertDTO {
  description: string = "";
  amount?: number | null;
  dueDate?: string | null;
  paymentDate?: string | null;
  supplierId?: number | null;
  employeeId?: number | null;
  paymentMethodId?: number | null;
  paymentFrequencyId?: number | null;
  note?: string | null;
  fileName?: string | null;

  constructor(payable?: Partial<PayableInsertDTO>) {
    if (payable != null) {
      if (payable.description != null) {
        this.description = payable.description;
      }
      this.amount = payable.amount;
      this.dueDate = payable.dueDate;
      this.paymentDate = payable.paymentDate;
      this.supplierId = payable.supplierId;
      this.employeeId = payable.employeeId;
      this.paymentMethodId = payable.paymentMethodId;
      this.paymentFrequencyId = payable.paymentFrequencyId;
      this.note = payable.note;
      this.fileName = payable.fileName;
    }
  }
}
