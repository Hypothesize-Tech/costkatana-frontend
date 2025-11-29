import { apiClient } from '../config/api';
import {
    AutomationConnection,
    AutomationConnectionFormData,
    AutomationAnalytics,
    AutomationStats,
    AutomationConnectionStats,
    WorkflowQuotaStatus,
    WorkflowOptimizationRecommendation,
    WorkflowPerformanceMetrics,
    WorkflowROIMetrics,
    OrchestrationOverheadAnalytics,
    WorkflowAlertConfig,
    WorkflowAlert,
    WorkflowVersion
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
    },

    /**
     * Get workflow quota status
     */
    async getWorkflowQuota(): Promise<{ success: boolean; data: WorkflowQuotaStatus }> {
        const response = await apiClient.get('/automation/quota');
        return response.data;
    },

    /**
     * Get orchestration overhead analytics
     */
    async getOrchestrationOverhead(filters?: {
        startDate?: string;
        endDate?: string;
        platform?: string;
    }): Promise<{ success: boolean; data: OrchestrationOverheadAnalytics }> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.platform) params.append('platform', filters.platform);

        const response = await apiClient.get(`/automation/orchestration-overhead${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Get workflow optimization recommendations
     */
    async getWorkflowRecommendations(
        workflowId: string,
        filters?: {
            startDate?: string;
            endDate?: string;
        }
    ): Promise<{ success: boolean; data: { workflowId: string; recommendations: WorkflowOptimizationRecommendation[]; totalPotentialSavings: number } }> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await apiClient.get(`/automation/workflows/${workflowId}/recommendations${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Get all workflow recommendations
     */
    async getAllRecommendations(filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{ success: boolean; data: { workflows: Array<{ workflowId: string; workflowName: string; platform: string; recommendations: WorkflowOptimizationRecommendation[]; totalPotentialSavings: number }>; totalWorkflows: number; totalPotentialSavings: number } }> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await apiClient.get(`/automation/recommendations${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Get workflow performance metrics
     */
    async getWorkflowMetrics(
        workflowId: string,
        filters?: {
            startDate?: string;
            endDate?: string;
        }
    ): Promise<{ success: boolean; data: WorkflowPerformanceMetrics }> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await apiClient.get(`/automation/workflows/${workflowId}/metrics${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Get workflow ROI metrics
     */
    async getWorkflowROI(
        workflowId: string,
        startDate: string,
        endDate: string
    ): Promise<{ success: boolean; data: WorkflowROIMetrics }> {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);

        const response = await apiClient.get(`/automation/workflows/${workflowId}/roi?${params}`);
        return response.data;
    },

    /**
     * Get workflow ROI comparison
     */
    async getWorkflowROIComparison(
        startDate: string,
        endDate: string
    ): Promise<{ success: boolean; data: { workflows: WorkflowROIMetrics[]; summary: { totalWorkflows: number; averageEfficiencyScore: number; totalCost: number; totalExecutions: number } } }> {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);

        const response = await apiClient.get(`/automation/workflows/roi-comparison?${params}`);
        return response.data;
    },

    /**
     * Check workflow alerts
     */
    async checkWorkflowAlerts(
        workflowId: string,
        config?: WorkflowAlertConfig
    ): Promise<{ success: boolean; data: { alerts: WorkflowAlert[]; count: number } }> {
        const response = await apiClient.post(`/automation/workflows/${workflowId}/check-alerts`, config || {});
        return response.data;
    },

    /**
     * Get workflow version history
     */
    async getWorkflowVersions(workflowId: string): Promise<{ success: boolean; data: WorkflowVersion[] }> {
        const response = await apiClient.get(`/automation/workflows/${workflowId}/versions`);
        return response.data;
    },

    /**
     * Compare workflow versions
     */
    async compareWorkflowVersions(
        workflowId: string,
        version1: number,
        version2: number
    ): Promise<{ success: boolean; data: { version1: WorkflowVersion | null; version2: WorkflowVersion | null; differences: Array<{ type: string; description: string; details: Record<string, unknown> }>; costImpact: number } }> {
        const params = new URLSearchParams();
        params.append('version1', version1.toString());
        params.append('version2', version2.toString());

        const response = await apiClient.get(`/automation/workflows/${workflowId}/versions/compare?${params}`);
        return response.data;
    }
};

