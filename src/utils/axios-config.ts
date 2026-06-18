import axios, { AxiosInstance } from 'axios';
import { getSessionToken } from './storage';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Cria uma instância de Axios com configurações de autenticação
 * e interceptores para garantir rotas protegidas
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para adicionar o token em todas as requisições
  client.interceptors.request.use(
    async (config) => {
      try {
        const token = await getSessionToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Erro ao adicionar token na requisição:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para tratamento de erros de autenticação
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token inválido ou expirado
        console.warn('Sessão expirada. Fazendo logout...');
        try {
          // Limpar o token armazenado
          const { removeSessionToken } = await import('./storage');
          await removeSessionToken();
        } catch (err) {
          console.error('Erro ao remover token:', err);
        }
      }
      return Promise.reject(error);
    }
  );


  return client;
};

export const apiClient = createApiClient();
