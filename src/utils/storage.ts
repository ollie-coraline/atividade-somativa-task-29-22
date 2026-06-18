import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = 'session_token';

const secureStoreAvailable = typeof (SecureStore as any).setItemAsync === 'function';

/**
 * Salva o sessionToken de forma segura no dispositivo.
 * Usa SecureStore quando disponível, senão usa localStorage (web fallback).
 */
export const saveSessionToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web' || !secureStoreAvailable) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    throw error;
  }
};

/**
 * Recupera o sessionToken do armazenamento seguro
 */
export const getSessionToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web' || !secureStoreAvailable) {
      const t = localStorage.getItem(SESSION_TOKEN_KEY);
      return t || null;
    }
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    return token || null;
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
    return null;
  }
};

/**
 * Remove o sessionToken do armazenamento seguro
 */
export const removeSessionToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web' || !secureStoreAvailable) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error('Erro ao remover token:', error);
    throw error;
  }
};

/**
 * Verifica se existe um token válido salvo no dispositivo
 */
export const hasValidSessionToken = async (): Promise<boolean> => {
  try {
    const token = await getSessionToken();
    return !!token;
  } catch (error) {
    return false;
  }
};
