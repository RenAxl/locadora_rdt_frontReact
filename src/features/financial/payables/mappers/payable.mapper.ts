import { PayableDTO } from "../dtos/payable-dto";
import { PayableInsertDTO } from "../dtos/payable-insert-dto";
import { PayableUpdateDTO } from "../dtos/payable-update-dto";
import { Payable } from "../models/Payable";

export class PayableMapper {
  static toModel(dto: PayableDTO): Payable {
    return new Payable({
      id: dto.id,

      description: dto.description || "",

      amount: dto.amount,

      originalAmount: dto.originalAmount ?? dto.amount,

      dueDate: dto.dueDate,

      paymentDate: dto.paymentDate,

      createdDate: dto.createdDate,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      note: dto.note,

      fileName: dto.fileName,

      paid: dto.paid ?? false,

      remainingBalance: dto.remainingBalance,

      lateFee: dto.lateFee,

      lateInterest: dto.lateInterest,

      discount: dto.discount,

      fee: dto.fee,

      subtotal: dto.subtotal,

      currentAmountWithLateCharges: dto.currentAmountWithLateCharges,

      overdueDays: dto.overdueDays,

      calculatedLateInterest: dto.calculatedLateInterest,

      calculatedLateFee: dto.calculatedLateFee,

      residual: dto.residual ?? false,

      canceled: dto.canceled ?? false,

      parentPayableId: dto.parentPayableId,

      supplierId: dto.supplierId ?? null,

      supplierName: dto.supplierName,

      employeeId: dto.employeeId ?? null,

      employeeName: dto.employeeName,

      paymentMethodId: dto.paymentMethodId ?? null,

      paymentMethodName: dto.paymentMethodName,

      paymentFrequencyId: dto.paymentFrequencyId ?? null,

      paymentFrequency: dto.paymentFrequency,

      createdById: dto.createdById,

      createdByName: dto.createdByName,

      updatedById: dto.updatedById,

      updatedByName: dto.updatedByName,

      paidById: dto.paidById,

      paidByName: dto.paidByName,
    });
  }

  static toInsertDTO(payable: Payable): PayableInsertDTO {
    return new PayableInsertDTO({
      description: payable.description,

      amount: payable.amount,

      dueDate: payable.dueDate,

      paymentDate: payable.paymentDate,

      supplierId: payable.supplierId,

      employeeId: payable.employeeId,

      paymentMethodId: payable.paymentMethodId,

      paymentFrequencyId: payable.paymentFrequencyId,

      note: payable.note,

      fileName: payable.fileName,
    });
  }

  static toUpdateDTO(payable: Payable): PayableUpdateDTO {
    return new PayableUpdateDTO({
      id: payable.id,

      description: payable.description,

      amount: payable.amount,

      dueDate: payable.dueDate,

      paymentDate: payable.paymentDate,

      supplierId: payable.supplierId,

      employeeId: payable.employeeId,

      paymentMethodId: payable.paymentMethodId,

      paymentFrequencyId: payable.paymentFrequencyId,

      note: payable.note,

      fileName: payable.fileName,
    });
  }

  static toModelList(dtos: PayableDTO[]): Payable[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
