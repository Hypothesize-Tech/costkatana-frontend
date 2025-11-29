import { apiClient } from '../config/api';
import {
    AutomationConnection,
    AutomationConnectionFormData,
    AutomationAnalytics,
    AutomationStats,
    AutomationConnectionStats
} from '../types/automation.types';

export const automationService = {
    /**
     * Get all automation connections
     */
    async getConnections(filters?: { platform?: string; status?: string }): Promise<{ success: boolean; data: AutomationConnection[]; count: number }> {
        const params = new URLSearchParams();
        if (filters?.platform) params.append('platform', filters.platform);
        if (filters?.status) params.append('status', filters.status);

        const response = await apiClient.get(`/automation/connections${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Get a single automation connection
     */
    async getConnection(connectionId: string): Promise<{ success: boolean; data: AutomationConnection }> {
        const response = await apiClient.get(`/automation/connections/${connectionId}`);
        return response.data;
    },

    /**
     * Create a new automation connection
     */
    async createConnection(data: AutomationConnectionFormData): Promise<{ success: boolean; message: string; data: AutomationConnection }> {
        const response = await apiClient.post('/automation/connections', data);
        return response.data;
    },

    /**
     * Update an automation connection
     */
    async updateConnection(
        connectionId: string,
        updates: Partial<AutomationConnectionFormData & { status?: string }>
    ): Promise<{ success: boolean; message: string; data: AutomationConnection }> {
        const response = await apiClient.put(`/automation/connections/${connectionId}`, updates);
        return response.data;
    },

    /**
     * Delete an automation connection
     */
    async deleteConnection(connectionId: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete(`/automation/connections/${connectionId}`);
        return response.data;
    },

    /**
     * Get connection statistics
     */
    async getConnectionStats(connectionId: string): Promise<{ success: boolean; data: AutomationConnectionStats }> {
        const response = await apiClient.get(`/automation/connections/${connectionId}/stats`);
        return response.data;
    },

    /**
     * Get automation analytics
     */
    async getAnalytics(filters?: {
        startDate?: string;
        endDate?: string;
        platform?: string;
        workflowId?: string;
    }): Promise<{ success: boolean; data: AutomationAnalytics[] }> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.platform) params.append('platform', filters.platform);
        if (filters?.workflowId) params.append('workflowId', filters.workflowId);

        const response = await apiClient.get(`/automation/analytics${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Get automation statistics
     */
    async getStats(): Promise<{ success: boolean; data: AutomationStats }> {
        const response = await apiClient.get('/automation/stats');
        return response.data;
    },

    /**
     * Generate webhook URL for a connection
     */
    getWebhookUrl(connectionId: string): string {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        return `${baseUrl}/api/automation/webhook/${connectionId}`;
    }
};

