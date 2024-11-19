import axios, { AxiosError } from 'axios';

const API_KEY = '580799';
const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configuration des retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const fetchWithRetry = async <T>(endpoint: string, retries = MAX_RETRIES): Promise<T> => {
  try {
    const response = await api.get<T>(`/${API_KEY}${endpoint}`);
    return response.data;
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry<T>(endpoint, retries - 1);
    }
    throw formatApiError(error);
  }
};

const isRetryableError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    return !status || status >= 500 || status === 429;
  }
  return false;
};

export const isNetworkError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && !error.response;
};

export const formatApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (!axiosError.response) {
      return new Error('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    }

    switch (axiosError.response.status) {
      case 404:
        return new Error('Ressource non trouvée.');
      case 429:
        return new Error('Trop de requêtes. Veuillez réessayer dans quelques minutes.');
      case 500:
      case 502:
      case 503:
      case 504:
        return new Error('Le service est temporairement indisponible.');
      default:
        return new Error('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
  }
  
  return error instanceof Error ? error : new Error('Une erreur inattendue est survenue.');
};

export function hasData<T>(response: unknown): response is { events: T[] } {
  return typeof response === 'object' && 
         response !== null && 
         'events' in response &&
         Array.isArray((response as { events: T[] }).events);
}

export function isValidDate(date: string): boolean {
  const timestamp = Date.parse(date);
  return !isNaN(timestamp) && timestamp > 0;
}

export function sanitizeUrl(url: string): string {
  try {
    new URL(url);
    return url;
  } catch {
    return '';
  }
}