import { PaymentMethodDTO } from "../dtos/payment-method-dto";
import { PaymentMethodInsertDTO } from "../dtos/payment-method-insert-dto";
import { PaymentMethodUpdateDTO } from "../dtos/payment-method-update-dto";
import { PaymentMethod } from "../models/PaymentMethod";

export class PaymentMethodMapper {
  static toModel(dto: PaymentMethodDTO): PaymentMethod {
    return new PaymentMethod({
      id: dto.id,

      name: dto.name || "",

      fee: dto.fee ?? null,

      createdAt: dto.createdAt,

      updatedAt: dto.updatedAt,

      createdBy: dto.createdBy,

      updatedBy: dto.updatedBy,
    });
  }

  static toInsertDTO(paymentMethod: PaymentMethod): PaymentMethodInsertDTO {
    return new PaymentMethodInsertDTO({
      name: paymentMethod.name,

      fee: paymentMethod.fee,
    });
  }

  static toUpdateDTO(paymentMethod: PaymentMethod): PaymentMethodUpdateDTO {
    return new PaymentMethodUpdateDTO({
      id: paymentMethod.id,

      name: paymentMethod.name,

      fee: paymentMethod.fee,
    });
  }

  static toModelList(dtos: PaymentMethodDTO[]): PaymentMethod[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}
