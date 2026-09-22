import axios from "axios";
import { tokenService } from "../../auth/services/token.service";
import { environment } from "../../../environments/environment";
import { errorHandlerService } from "../../error/services/error-handler.service";

export const httpClient = axios.create({
  baseURL: environment.apiUrl,
});

httpClient.interceptors.request.use((config) => {
  const url = new URL(config.url || "", config.baseURL);
  const apiUrl = new URL(environment.apiUrl);
  const token = tokenService.getToken();
  if (
    token &&
    url.origin === apiUrl.origin &&
    !url.pathname.endsWith("/oauth/token") &&
    !config.headers.Authorization
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const status = error.response?.status;
    const isUserPhotoEndpoint =
      url.includes("/user-profile/me/photo") ||
      /\/users\/\d+\/photo(\?|$)/.test(url);
    const isNoPhotoStatus = status === 404 || status === 204;

    if (!isUserPhotoEndpoint || !isNoPhotoStatus) {
      errorHandlerService.handle(error);
    }

    return Promise.reject(error);
  },
);
