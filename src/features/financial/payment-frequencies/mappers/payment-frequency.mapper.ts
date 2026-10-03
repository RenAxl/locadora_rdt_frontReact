import { PaymentFrequencyDTO } from "../dtos/payment-frequency-dto";
import { PaymentFrequencyInsertDTO } from "../dtos/payment-frequency-insert-dto";
import { PaymentFrequencyUpdateDTO } from "../dtos/payment-frequency-update-dto";
import { PaymentFrequency } from "../models/PaymentFrequency";

export class PaymentFrequencyMapper {
  static toModel(dto: PaymentFrequencyDTO): PaymentFrequency {
    return new PaymentFrequency({
      id: dto.id,

      frequency: dto.frequency || "",

      days: dto.days ?? null,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(
    paymentFrequency: PaymentFrequency,
  ): PaymentFrequencyInsertDTO {
    return new PaymentFrequencyInsertDTO({
      frequency: paymentFrequency.frequency,

      days: paymentFrequency.days,
    });
  }

  static toUpdateDTO(
    paymentFrequency: PaymentFrequency,
  ): PaymentFrequencyUpdateDTO {
    return new PaymentFrequencyUpdateDTO({
      id: paymentFrequency.id,

      frequency: paymentFrequency.frequency,

      days: paymentFrequency.days,
    });
  }

  static toModelList(dtos: PaymentFrequencyDTO[]): PaymentFrequency[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
