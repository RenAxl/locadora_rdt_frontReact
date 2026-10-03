export class Payable {
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
  parentPayableId?: number | null;
  supplierId?: number | null = null;
  supplierName?: string | null;
  employeeId?: number | null = null;
  employeeName?: string | null;
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

  constructor(payable?: Partial<Payable>) {
    if (payable != null) {
      this.id = payable.id;
      this.description = payable.description ?? "";
      this.amount = payable.amount;
      this.originalAmount = payable.originalAmount;
      this.dueDate = payable.dueDate;
      this.paymentDate = payable.paymentDate;
      this.note = payable.note;
      this.fileName = payable.fileName;
      this.paid = payable.paid;
      this.remainingBalance = payable.remainingBalance;
      this.lateFee = payable.lateFee;
      this.lateInterest = payable.lateInterest;
      this.discount = payable.discount;
      this.fee = payable.fee;
      this.subtotal = payable.subtotal;
      this.currentAmountWithLateCharges = payable.currentAmountWithLateCharges;
      this.overdueDays = payable.overdueDays;
      this.calculatedLateInterest = payable.calculatedLateInterest;
      this.calculatedLateFee = payable.calculatedLateFee;
      this.residual = payable.residual;
      this.canceled = payable.canceled;
      this.parentPayableId = payable.parentPayableId;
      this.supplierId = payable.supplierId;
      this.supplierName = payable.supplierName;
      this.employeeId = payable.employeeId;
      this.employeeName = payable.employeeName;
      this.paymentMethodId = payable.paymentMethodId;
      this.paymentMethodName = payable.paymentMethodName;
      this.paymentFrequencyId = payable.paymentFrequencyId;
      this.paymentFrequency = payable.paymentFrequency;
      this.createdById = payable.createdById;
      this.createdByName = payable.createdByName;
      this.updatedById = payable.updatedById;
      this.updatedByName = payable.updatedByName;
      this.paidById = payable.paidById;
      this.paidByName = payable.paidByName;
      this.status = payable.status;

      if (payable.createdDate != null) {
        this.createdDate = new Date(payable.createdDate);
      }

      if (payable.createdAt != null) {
        this.createdAt = new Date(payable.createdAt);
      }

      if (payable.updatedAt != null) {
        this.updatedAt = new Date(payable.updatedAt);
      }
    }
  }
}
