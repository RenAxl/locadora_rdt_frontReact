import axios from "axios";
import { API } from "../../config/api.config";
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
  const publicRoutes = [
    API.AUTH.TOKEN,
    API.CUSTOMER_ACCOUNT.REGISTER,
    API.CUSTOMER_ACCOUNT.CREATE_PASSWORD,
    API.CUSTOMER_ACCOUNT.RESEND_ACTIVATION,
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => new URL(route).pathname === url.pathname,
  );
  if (
    token &&
    url.origin === apiUrl.origin &&
    !isPublicRoute &&
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
