import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";

export const passwordRecoveryService = {
  async requestReset(email: string): Promise<void> {
    await httpClient.post(API.RECOVERY_PASSWORD.REQUEST_PASSWORD_RESET, {
      email,
    });
  },
  async reset(token: string, password: string): Promise<void> {
    await httpClient.post(
      API.RECOVERY_PASSWORD.PASSWORD_RESET,
      { password },
      { params: { token } },
    );
  },
};
