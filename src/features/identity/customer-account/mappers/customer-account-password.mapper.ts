import { CustomerAccountPasswordDTO } from "../dtos/customer-account-password-dto";
import { CustomerAccountPassword } from "../models/CustomerAccountPassword";

export class CustomerAccountPasswordMapper {
  static toDTO(account: CustomerAccountPassword): CustomerAccountPasswordDTO {
    return new CustomerAccountPasswordDTO({
      password: account.password,
      passwordConfirmation: account.passwordConfirmation,
    });
  }
}
