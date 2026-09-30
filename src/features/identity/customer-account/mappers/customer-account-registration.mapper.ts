import { CustomerAccountRegistrationDTO } from "../dtos/customer-account-registration-dto";
import { CustomerAccountRegistration } from "../models/CustomerAccountRegistration";

export class CustomerAccountRegistrationMapper {
  static toDTO(
    account: CustomerAccountRegistration,
  ): CustomerAccountRegistrationDTO {
    return new CustomerAccountRegistrationDTO({
      name: account.name,
      cpf: account.cpf,
      email: account.email,
      phone: account.phone,
      street: account.street,
      number: account.number,
      complement: account.complement,
      neighborhood: account.neighborhood,
      city: account.city,
      state: account.state,
      zipCode: account.zipCode,
    });
  }
}
