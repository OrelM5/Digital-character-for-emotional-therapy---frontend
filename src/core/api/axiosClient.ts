import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/core/store/useAuthStore';

/**
 * Singleton Axios instance for all REST API calls (Team 2 backend).
 * Base URL is injected from VITE_API_BASE_URL env variable.
 * The Vite dev-server proxies /api/* to avoid CORS issues in development.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor: attach JWT Bearer token ──────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Retrieves token from Zustand store (e.g. "mock_jwt_token_12345" in mock flow)
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 Unauthorized ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      useAuthStore.getState().logout();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  },
);
