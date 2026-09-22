import { API } from "../../../../core/config/api.config";
import { httpClient } from "../../../../core/http/interceptors/http-client";

export const activateAccountService = {
  async activate(token: string, password: string): Promise<void> {
    await httpClient.post(
      API.ACTIVATE_ACCOUNT.ACTIVATE,
      { password },
      { params: { token } },
    );
  },
};
