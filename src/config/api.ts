// src/config/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from '../services/auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = authService.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/refresh')) {
                // Refresh token is also invalid, redirect to login
                authService.logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const newToken = await authService.refreshToken();
                    isRefreshing = false;
                    onTokenRefreshed(newToken);
                } catch (refreshError) {
                    isRefreshing = false;
                    authService.logout();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            // Wait for token refresh to complete
            return new Promise((resolve) => {
                subscribeTokenRefresh((token: string) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    resolve(api(originalRequest));
                });
            });
        }

        // Handle other errors
        if (error.response?.status === 403) {
            // Forbidden - insufficient permissions
            console.error('Access denied:', error.response.data);
        } else if (error.response?.status === 404) {
            // Not found
            console.error('Resource not found:', error.response.data);
        } else if (error.response?.status === 429) {
            // Rate limited
            console.error('Rate limited:', error.response.data);
        } else if (error.response?.status === 500) {
            // Server error
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

// Export both default and named exports for compatibility
export const apiClient = api;
export default api;