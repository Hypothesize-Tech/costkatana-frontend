// src/config/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from '../services/auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create standard axios instance
const api: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 60000, // Increased to 60 seconds
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create chat-specific instance with longer timeout for complex queries (file attachments, RAG, etc.)
const chatApi: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 300000, // 5 minutes timeout for chat operations (multi-
    // agent processing can take time)
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create optimized instance for analytics operations (shorter timeout, faster failure)
const analyticsApi: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 15000, // 15 seconds timeout for analytics
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create instance for long-running operations with longer timeout
const longRunningApi: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 25000, // 25 seconds for forecasting operations
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track refresh attempts to prevent infinite loops
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// Function to add auth interceptors to an axios instance
const addAuthInterceptors = (instance: AxiosInstance) => {
    // Request interceptor to add auth token
    instance.interceptors.request.use(
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
    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
            
            if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                const url = originalRequest.url || '';
                const isMFAEndpoint = url.includes('/mfa/') || url.includes('/auth/login');
                const isRefreshEndpoint = url.includes('/auth/refresh');
                
                // Don't auto-logout for MFA-related endpoints or refresh endpoint
                if (!isMFAEndpoint && !isRefreshEndpoint) {
                    // Mark request as retried to prevent infinite loops
                    originalRequest._retry = true;
                    
                    // If already refreshing, wait for it to complete
                    if (isRefreshing) {
                        return new Promise((resolve) => {
                            addRefreshSubscriber((token: string) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                }
                                resolve(instance.request(originalRequest));
                            });
                        });
                    }
                    
                    // Try to refresh token first
                    try {
                        const refreshToken = authService.getRefreshToken();
                        if (refreshToken) {
                            isRefreshing = true;
                            const newToken = await authService.refreshToken();
                            isRefreshing = false;
                            
                            // Notify all waiting requests
                            onTokenRefreshed(newToken);
                            
                            // Retry the original request with new token
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            }
                            return instance.request(originalRequest);
                        }
                    } catch (refreshError) {
                        isRefreshing = false;
                        refreshSubscribers = [];
                        // Refresh failed, clear auth and redirect
                        authService.logout();
                        // Use a more gentle redirect that works with React Router
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login';
                        }
                        return Promise.reject(refreshError);
                    }
                } else if (isRefreshEndpoint) {
                    // If refresh endpoint returns 401, the refresh token is invalid
                    // Clear auth and redirect to login
                    authService.logout();
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
            }
            return Promise.reject(error);
        }
    );
};

// Apply interceptors to all instances
addAuthInterceptors(api);
addAuthInterceptors(chatApi);
addAuthInterceptors(analyticsApi);
addAuthInterceptors(longRunningApi);

// Export both default and named exports for compatibility
export const apiClient = api;
export const API_BASE_URL = API_URL;
export const chatApiClient = chatApi; // For chat operations with longer timeout
export const analyticsApiClient = analyticsApi; // For analytics operations with shorter timeout
export const longRunningApiClient = longRunningApi; // For forecasting and heavy operations

export default api;