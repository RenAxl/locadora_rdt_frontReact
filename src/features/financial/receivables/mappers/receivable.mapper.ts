import { ReceivableDTO } from "../dtos/receivable-dto";
import { ReceivableInsertDTO } from "../dtos/receivable-insert-dto";
import { ReceivableUpdateDTO } from "../dtos/receivable-update-dto";
import { Receivable } from "../models/Receivable";

export class ReceivableMapper {
  static toModel(dto: ReceivableDTO): Receivable {
    return new Receivable({
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

      parentReceivableId: dto.parentReceivableId,

      customerId: dto.customerId ?? null,

      customerName: dto.customerName,

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

  static toInsertDTO(receivable: Receivable): ReceivableInsertDTO {
    return new ReceivableInsertDTO({
      description: receivable.description,

      amount: receivable.amount,

      dueDate: receivable.dueDate,

      paymentDate: receivable.paymentDate,

      customerId: receivable.customerId,

      paymentMethodId: receivable.paymentMethodId,

      paymentFrequencyId: receivable.paymentFrequencyId,

      note: receivable.note,

      fileName: receivable.fileName,
    });
  }

  static toUpdateDTO(receivable: Receivable): ReceivableUpdateDTO {
    return new ReceivableUpdateDTO({
      id: receivable.id,

      description: receivable.description,

      amount: receivable.amount,

      dueDate: receivable.dueDate,

      paymentDate: receivable.paymentDate,

      customerId: receivable.customerId,

      paymentMethodId: receivable.paymentMethodId,

      paymentFrequencyId: receivable.paymentFrequencyId,

      note: receivable.note,

      fileName: receivable.fileName,
    });
  }

  static toModelList(dtos: ReceivableDTO[]): Receivable[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
