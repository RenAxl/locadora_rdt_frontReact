import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";
import { CustomerAccountRegistrationDTO } from "../dtos/customer-account-registration-dto";
import { CustomerAccountPasswordDTO } from "../dtos/customer-account-password-dto";
import { CustomerAccountResendDTO } from "../dtos/customer-account-resend-dto";

export const customerAccountService = {
  async register(dto: CustomerAccountRegistrationDTO): Promise<void> {
    await httpClient.post(API.CUSTOMER_ACCOUNT.REGISTER, dto);
  },
  async createPassword(
    token: string,
    dto: CustomerAccountPasswordDTO,
  ): Promise<void> {
    await httpClient.post(API.CUSTOMER_ACCOUNT.CREATE_PASSWORD, dto, {
      params: { token },
    });
  },
  async resendActivation(dto: CustomerAccountResendDTO): Promise<void> {
    await httpClient.post(API.CUSTOMER_ACCOUNT.RESEND_ACTIVATION, dto);
  },
};
