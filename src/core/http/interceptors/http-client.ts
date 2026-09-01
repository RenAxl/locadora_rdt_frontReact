import axios from 'axios';
import { environment } from '../../../environments/environment';
import { errorHandlerService } from '../../error/services/error-handler.service';

export const httpClient = axios.create({
  baseURL: environment.apiUrl,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    const isUserPhotoEndpoint =
      url.includes('/users/me/photo') || /\/users\/\d+\/photo(\?|$)/.test(url);
    const isNoPhotoStatus = status === 404 || status === 204;

    if (!isUserPhotoEndpoint || !isNoPhotoStatus) {
      errorHandlerService.handle(error);
    }

    return Promise.reject(error);
  },
);
