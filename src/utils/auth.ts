import axios from 'axios';
import { apiClient } from './axios-config';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Função para registrar um novo usuário
 */
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${baseURL}/api/auth/signup`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao criar conta';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Função para fazer login de um usuário
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${baseURL}/api/auth/login`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Credenciais inválidas';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Função para validar um sessionToken
 */
export const validateToken = async (sessionToken: string): Promise<boolean> => {
  try {
    const response = await apiClient.post(
      `/auth/validate`,
      { sessionToken }
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Função para fazer logout
 */
export const logout = async (sessionToken: string): Promise<void> => {
  try {
    await apiClient.post(
      `/auth/logout`,
      { sessionToken }
    );
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};
