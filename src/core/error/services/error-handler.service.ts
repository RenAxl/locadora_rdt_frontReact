import axios from 'axios';
import { notificationService } from './notification.service';

class ErrorHandlerService {
  handle(error: unknown): void {
    const message = this.extractMessage(error);
    console.error('Ocorreu um erro', error);
    notificationService.add({ severity: 'error', detail: message });
  }

  private extractMessage(error: unknown): string {
    if (typeof error === 'string') return error;

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return 'Não foi possível conectar ao servidor. Verifique se o backend está ligado e se o CORS está configurado.';
      }

      const status = error.response.status;
      if (status === 403) return 'Você não tem permissão para executar esta ação';
      if (status === 401) return 'Sua sessão expirou. Faça login novamente.';

      const extracted = this.tryExtractFromBody(error.response.data);
      if (status >= 400 && status <= 499) {
        return extracted || 'Ocorreu um erro ao processar a sua solicitação';
      }
      if (status >= 500) return extracted || 'Erro no servidor. Tente novamente mais tarde.';
    }

    return 'Erro ao processar serviço remoto. Tente novamente.';
  }

  private tryExtractFromBody(body: any): string | null {
    if (body && typeof body === 'object') {
      if (Array.isArray(body.errors) && body.errors.length > 0) {
        const first = body.errors[0];
        if (typeof first === 'string') return first;
        if (first && typeof first.message === 'string') return first.message;
      }
      if (typeof body.message === 'string') return body.message;
      if (typeof body.error === 'string') return body.error;
    }
    if (typeof body === 'string' && body.trim()) return body;
    return null;
  }
}

export const errorHandlerService = new ErrorHandlerService();
