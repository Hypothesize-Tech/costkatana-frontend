import { apiClient } from '../config/api';

export interface UserSpendingSummary {
    userId: string;
    userEmail: string;
    userName: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCostPerRequest: number;
    firstActivity: string;
    lastActivity: string;
    services: Array<{
        service: string;
        cost: number;
        tokens: number;
        requests: number;
    }>;
    models: Array<{
        model: string;
        cost: number;
        tokens: number;
        requests: number;
    }>;
    projects: Array<{
        projectId: string;
        projectName?: string;
        cost: number;
        tokens: number;
        requests: number;
    }>;
    workflows: Array<{
        workflowId: string;
        workflowName?: string;
        cost: number;
        tokens: number;
        requests: number;
    }>;
    features: Array<{
        feature: string;
        cost: number;
        tokens: number;
        requests: number;
    }>;
}

export interface SpendingTrends {
    date: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    userCount: number;
}

export interface PlatformSummary {
    totalUsers: number;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCostPerUser: number;
    topSpendingUsers: Array<{ userId: string; userEmail: string; cost: number }>;
}

export interface AdminUserSpendingFilters {
    startDate?: string;
    endDate?: string;
    service?: string;
    model?: string;
    projectId?: string;
    workflowId?: string;
    userId?: string;
    minCost?: number;
    maxCost?: number;
}

export class AdminUserSpendingService {
    /**
     * Get all users spending summary
     */
    static async getAllUsersSpending(filters: AdminUserSpendingFilters = {}): Promise<UserSpendingSummary[]> {
        try {
            const params = new URLSearchParams();
            
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.service) {
                params.append('service', filters.service);
            }
            if (filters.model) {
                params.append('model', filters.model);
            }
            if (filters.projectId) {
                params.append('projectId', filters.projectId);
            }
            if (filters.workflowId) {
                params.append('workflowId', filters.workflowId);
            }
            if (filters.userId) {
                params.append('userId', filters.userId);
            }
            if (filters.minCost !== undefined) {
                params.append('minCost', filters.minCost.toString());
            }
            if (filters.maxCost !== undefined) {
                params.append('maxCost', filters.maxCost.toString());
            }

            const response = await apiClient.get(`/admin/users/spending?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching all users spending:', error);
            throw error;
        }
    }

    /**
     * Get detailed spending for a specific user
     */
    static async getUserDetailedSpending(
        userId: string,
        filters: AdminUserSpendingFilters = {}
    ): Promise<UserSpendingSummary | null> {
        try {
            const params = new URLSearchParams();
            
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.service) {
                params.append('service', filters.service);
            }
            if (filters.model) {
                params.append('model', filters.model);
            }
            if (filters.projectId) {
                params.append('projectId', filters.projectId);
            }

            const response = await apiClient.get(`/admin/users/spending/${userId}?${params.toString()}`);
            return response.data.data || null;
        } catch (error: any) {
            console.error('Error fetching user detailed spending:', error);
            throw error;
        }
    }

    /**
     * Get users filtered by service
     */
    static async getUsersByService(
        service: string,
        filters: AdminUserSpendingFilters = {}
    ): Promise<UserSpendingSummary[]> {
        try {
            const params = new URLSearchParams();
            
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }

            const response = await apiClient.get(`/admin/users/spending/by-service/${service}?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching users by service:', error);
            throw error;
        }
    }

    /**
     * Get spending trends
     */
    static async getSpendingTrends(
        timeRange: 'daily' | 'weekly' | 'monthly' = 'daily',
        filters: AdminUserSpendingFilters = {}
    ): Promise<SpendingTrends[]> {
        try {
            const params = new URLSearchParams();
            params.append('timeRange', timeRange);
            
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.service) {
                params.append('service', filters.service);
            }
            if (filters.model) {
                params.append('model', filters.model);
            }
            if (filters.projectId) {
                params.append('projectId', filters.projectId);
            }
            if (filters.userId) {
                params.append('userId', filters.userId);
            }

            const response = await apiClient.get(`/admin/users/spending/trends?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching spending trends:', error);
            throw error;
        }
    }

    /**
     * Get platform summary statistics
     */
    static async getPlatformSummary(filters: AdminUserSpendingFilters = {}): Promise<PlatformSummary> {
        try {
            const params = new URLSearchParams();
            
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.service) {
                params.append('service', filters.service);
            }

            const response = await apiClient.get(`/admin/users/spending/summary?${params.toString()}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching platform summary:', error);
            throw error;
        }
    }

    /**
     * Export user spending data
     */
    static async exportUserSpending(
        format: 'json' | 'csv' = 'json',
        filters: AdminUserSpendingFilters = {}
    ): Promise<Blob> {
        try {
            const params = new URLSearchParams();
            params.append('format', format);
            
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.service) {
                params.append('service', filters.service);
            }
            if (filters.model) {
                params.append('model', filters.model);
            }

            const response = await apiClient.get(`/admin/users/spending/export?${params.toString()}`, {
                responseType: 'blob'
            });

            return response.data;
        } catch (error: any) {
            console.error('Error exporting user spending:', error);
            throw error;
        }
    }
}

