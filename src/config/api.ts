// src/config/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authService } from '../services/auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create standard axios instance
const api: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 60000, // Increased to 60 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create chat-specific instance with longer timeout for complex queries
const chatApi: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 120000, // 2 minutes timeout for chat operations
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create optimized instance for analytics operations (shorter timeout, faster failure)
const analyticsApi: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 15000, // 15 seconds timeout for analytics
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create instance for long-running operations with longer timeout
const longRunningApi: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 25000, // 25 seconds for forecasting operations
    headers: {
        'Content-Type': 'application/json',
    },
});

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
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                // Don't auto-logout for MFA-related endpoints
                const url = error.config?.url || '';
                const isMFAEndpoint = url.includes('/mfa/') || url.includes('/auth/login');
                
                if (!isMFAEndpoint) {
                    authService.logout();
                    window.location.href = '/login';
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