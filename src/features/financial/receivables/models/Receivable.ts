export class Receivable {
  id?: number;
  description: string = "";
  amount?: number | null;
  originalAmount?: number | null;
  dueDate?: string | null;
  paymentDate?: string | null;
  createdDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  note?: string | null;
  fileName?: string | null;
  paid?: boolean | null;
  remainingBalance?: number | null;
  lateFee?: number | null;
  lateInterest?: number | null;
  discount?: number | null;
  fee?: number | null;
  subtotal?: number | null;
  currentAmountWithLateCharges?: number | null;
  overdueDays?: number | null;
  calculatedLateInterest?: number | null;
  calculatedLateFee?: number | null;
  residual?: boolean | null;
  canceled?: boolean | null;
  parentReceivableId?: number | null;
  customerId?: number | null = null;
  customerName?: string | null;
  paymentMethodId?: number | null = null;
  paymentMethodName?: string | null;
  paymentFrequencyId?: number | null = null;
  paymentFrequency?: string | null;
  createdById?: number | null;
  createdByName?: string | null;
  updatedById?: number | null;
  updatedByName?: string | null;
  paidById?: number | null;
  paidByName?: string | null;
  status?: string;

  constructor(receivable?: Partial<Receivable>) {
    if (receivable != null) {
      this.id = receivable.id;
      this.description = receivable.description ?? "";
      this.amount = receivable.amount;
      this.originalAmount = receivable.originalAmount;
      this.dueDate = receivable.dueDate;
      this.paymentDate = receivable.paymentDate;
      this.note = receivable.note;
      this.fileName = receivable.fileName;
      this.paid = receivable.paid;
      this.remainingBalance = receivable.remainingBalance;
      this.lateFee = receivable.lateFee;
      this.lateInterest = receivable.lateInterest;
      this.discount = receivable.discount;
      this.fee = receivable.fee;
      this.subtotal = receivable.subtotal;
      this.currentAmountWithLateCharges =
        receivable.currentAmountWithLateCharges;
      this.overdueDays = receivable.overdueDays;
      this.calculatedLateInterest = receivable.calculatedLateInterest;
      this.calculatedLateFee = receivable.calculatedLateFee;
      this.residual = receivable.residual;
      this.canceled = receivable.canceled;
      this.parentReceivableId = receivable.parentReceivableId;
      this.customerId = receivable.customerId;
      this.customerName = receivable.customerName;
      this.paymentMethodId = receivable.paymentMethodId;
      this.paymentMethodName = receivable.paymentMethodName;
      this.paymentFrequencyId = receivable.paymentFrequencyId;
      this.paymentFrequency = receivable.paymentFrequency;
      this.createdById = receivable.createdById;
      this.createdByName = receivable.createdByName;
      this.updatedById = receivable.updatedById;
      this.updatedByName = receivable.updatedByName;
      this.paidById = receivable.paidById;
      this.paidByName = receivable.paidByName;
      this.status = receivable.status;

      if (receivable.createdDate != null) {
        this.createdDate = new Date(receivable.createdDate);
      }

      if (receivable.createdAt != null) {
        this.createdAt = new Date(receivable.createdAt);
      }

      if (receivable.updatedAt != null) {
        this.updatedAt = new Date(receivable.updatedAt);
      }
    }
  }
}
