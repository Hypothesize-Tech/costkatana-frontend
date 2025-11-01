import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
apiClient.interceptors.response.use(
    (response) => response,
);

export const telemetryConfigApi = {
    /**
     * Get all telemetry configurations for the authenticated user
     */
    getAll: async () => {
        try {
            const response = await apiClient.get('/telemetry-config');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch configurations');
        }
    },

    /**
     * Get a specific telemetry configuration
     */
    getById: async (configId: string) => {
        try {
            const response = await apiClient.get(`/telemetry-config/${configId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch configuration');
        }
    },

    /**
     * Create a new telemetry configuration
     */
    create: async (data: {
        endpointType: string;
        endpoint: string;
        authType?: string;
        authToken?: string;
        syncIntervalMinutes?: number;
        queryTimeRangeMinutes?: number;
        queryFilters?: {
            serviceName?: string;
        };
        syncEnabled?: boolean;
    }) => {
        try {
            const response = await apiClient.post('/telemetry-config', data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create configuration');
        }
    },

    /**
     * Update an existing telemetry configuration
     */
    update: async (configId: string, data: {
        endpoint?: string;
        authToken?: string;
        syncIntervalMinutes?: number;
        queryTimeRangeMinutes?: number;
        syncEnabled?: boolean;
        isActive?: boolean;
        queryFilters?: {
            serviceName?: string;
        };
    }) => {
        try {
            const response = await apiClient.put(`/telemetry-config/${configId}`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update configuration');
        }
    },

    /**
     * Delete a telemetry configuration (soft delete)
     */
    delete: async (configId: string) => {
        try {
            const response = await apiClient.delete(`/telemetry-config/${configId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete configuration');
        }
    },

    /**
     * Test connectivity to a telemetry endpoint
     */
    test: async (data: {
        endpointType: string;
        endpoint: string;
        authToken?: string;
    }) => {
        try {
            const response = await apiClient.post('/telemetry-config/test', data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to test endpoint');
        }
    },

    /**
     * Trigger a manual sync for a specific configuration
     */
    triggerSync: async (configId: string) => {
        try {
            const response = await apiClient.post(`/telemetry-config/${configId}/sync`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to trigger sync');
        }
    },
};

