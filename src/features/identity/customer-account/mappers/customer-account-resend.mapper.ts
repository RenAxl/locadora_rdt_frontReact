import { CustomerAccountResendDTO } from "../dtos/customer-account-resend-dto";
import { CustomerAccountResend } from "../models/CustomerAccountResend";

export class CustomerAccountResendMapper {
  static toDTO(account: CustomerAccountResend): CustomerAccountResendDTO {
    return new CustomerAccountResendDTO({
      email: account.email,
    });
  }
}
