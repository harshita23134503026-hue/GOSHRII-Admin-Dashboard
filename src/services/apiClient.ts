import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Getshrii Centralized API Client
 *
 * Prepared for eventual backend integration with the JWT-authenticated Spring Boot / Node / Go service.
 * Currently runs alongside mock services without simulated or fake production credentials.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.getshrii.internal/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token when live auth is enabled
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // In future production:
    // const token = authService.getAccessToken();
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized error parsing
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const message = (error.response?.data as { message?: string })?.message || error.message || 'Network request failed';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
