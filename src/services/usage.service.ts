// src/services/usage.service.ts
import { apiClient } from '../config/api';
import { Usage, UsageFilters } from '../types';

class UsageService {
    async getUsage(params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        service?: string;
        model?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        usage: Usage[];
        total: number;
        page: number;
        totalPages: number;
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        summary: {
            totalCost: number;
            totalCalls: number;
            avgCostPerCall: number;
        };
    }> {
        try {
            const response = await apiClient.get('/usage', { params });
            const data = response.data.data || response.data;

            // Transform backend data to match frontend expectations
            const transformedUsage = (data || []).map((item: any) => ({
                _id: item._id,
                userId: typeof item.userId === 'object' ? item.userId._id : item.userId,
                service: item.service,
                model: item.model,
                prompt: item.prompt,
                completion: item.completion || '',
                promptTokens: item.promptTokens || 0,
                completionTokens: item.completionTokens || 0,
                totalTokens: item.totalTokens || (item.promptTokens + item.completionTokens) || 0,
                cost: item.cost || 0,
                responseTime: item.responseTime || 0,
                metadata: item.metadata || {},
                tags: item.tags || [],
                optimizationApplied: item.optimizationApplied || false,
                optimizationId: item.optimizationId,
                errorOccurred: item.errorOccurred || false,
                errorMessage: item.errorMessage,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));

            // Calculate pagination info
            const currentPage = params?.page || 1;
            const itemsPerPage = params?.limit || 20;
            const totalItems = transformedUsage.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            return {
                usage: transformedUsage,
                total: totalItems,
                page: currentPage,
                totalPages: totalPages,
                pagination: {
                    currentPage,
                    totalPages,
                    totalItems,
                    itemsPerPage,
                    hasNext: currentPage < totalPages,
                    hasPrev: currentPage > 1
                },
                summary: {
                    totalCost: transformedUsage.reduce((sum: number, item: Usage) => sum + item.cost, 0),
                    totalCalls: transformedUsage.length,
                    avgCostPerCall: transformedUsage.length > 0 ? transformedUsage.reduce((sum: number, item: Usage) => sum + item.cost, 0) / transformedUsage.length : 0
                }
            };
        } catch (error) {
            console.error('Error fetching usage:', error);
            return {
                usage: [],
                total: 0,
                page: 1,
                totalPages: 0,
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: 20,
                    hasNext: false,
                    hasPrev: false
                },
                summary: {
                    totalCost: 0,
                    totalCalls: 0,
                    avgCostPerCall: 0
                }
            };
        }
    }

    async getUsageById(id: string): Promise<Usage> {
        try {
            const response = await apiClient.get(`/usage/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage by ID:', error);
            throw error;
        }
    }

    async createUsage(usageData: Partial<Usage>): Promise<Usage> {
        try {
            const response = await apiClient.post('/usage', usageData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating usage:', error);
            throw error;
        }
    }

    async updateUsage(id: string, updates: Partial<Usage>): Promise<Usage> {
        try {
            const response = await apiClient.put(`/usage/${id}`, updates);
            return response.data.data;
        } catch (error) {
            console.error('Error updating usage:', error);
            throw error;
        }
    }

    async deleteUsage(id: string): Promise<void> {
        try {
            await apiClient.delete(`/usage/${id}`);
        } catch (error) {
            console.error('Error deleting usage:', error);
            throw error;
        }
    }

    async bulkDeleteUsage(ids: string[]): Promise<void> {
        try {
            await apiClient.post('/usage/bulk-delete', { ids });
        } catch (error) {
            console.error('Error bulk deleting usage:', error);
            throw error;
        }
    }

    async uploadUsage(file: File, options?: {
        format?: 'csv' | 'json';
        skipValidation?: boolean;
        dryRun?: boolean;
    }): Promise<{
        success: boolean;
        imported: number;
        errors: string[];
        warnings: string[];
        preview?: Usage[];
    }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (options) {
                Object.entries(options).forEach(([key, value]) => {
                    formData.append(key, value.toString());
                });
            }

            const response = await apiClient.post('/usage/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            console.error('Error uploading usage:', error);
            throw error;
        }
    }

    async getUsageStats(timeframe: '24h' | '7d' | '30d' | '90d' = '7d'): Promise<{
        totalCost: number;
        totalCalls: number;
        avgCostPerCall: number;
        mostUsedService: string;
        mostUsedModel: string;
        costTrend: number;
        callsTrend: number;
        topProviders: Array<{
            service: string;
            cost: number;
            calls: number;
            percentage: number;
        }>;
    }> {
        try {
            const response = await apiClient.get('/usage/stats', {
                params: { timeframe }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage stats:', error);
            return {
                totalCost: 0,
                totalCalls: 0,
                avgCostPerCall: 0,
                mostUsedService: '',
                mostUsedModel: '',
                costTrend: 0,
                callsTrend: 0,
                topProviders: []
            };
        }
    }

    async getUsageSummary(timeframe: '24h' | '7d' | '30d' | '90d' = '7d'): Promise<{
        totalCost: number;
        totalCalls: number;
        avgCostPerCall: number;
        mostUsedService: string;
        mostUsedModel: string;
        costTrend: number; // percentage change
        callsTrend: number; // percentage change
        topProviders: Array<{
            service: string;
            cost: number;
            calls: number;
            percentage: number;
        }>;
    }> {
        try {
            const response = await apiClient.get('/usage/stats', {
                params: { timeframe }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage summary:', error);
            return {
                totalCost: 0,
                totalCalls: 0,
                avgCostPerCall: 0,
                mostUsedService: '',
                mostUsedModel: '',
                costTrend: 0,
                callsTrend: 0,
                topProviders: []
            };
        }
    }

    async getUsageTrends(params: {
        timeframe: '24h' | '7d' | '30d' | '90d';
        metric: 'cost' | 'calls' | 'tokens';
        groupBy: 'hour' | 'day' | 'week';
        service?: string;
        model?: string;
    }): Promise<{
        trends: Array<{
            date: string;
            value: number;
            cost?: number;
            calls?: number;
            tokens?: number;
        }>;
        total: number;
        average: number;
        trend: number; // percentage change
    }> {
        try {
            // Use analytics endpoint for trends
            const response = await apiClient.get('/analytics', {
                params: {
                    startDate: this.getStartDate(params.timeframe),
                    endDate: new Date().toISOString(),
                    groupBy: params.groupBy,
                    service: params.service,
                    model: params.model
                }
            });

            const timeline = response.data.data.timeline || [];
            return {
                trends: timeline.map((item: any) => ({
                    date: item.date,
                    value: item[params.metric] || 0,
                    cost: item.cost,
                    calls: item.requests,
                    tokens: item.tokens
                })),
                total: timeline.reduce((sum: number, item: any) => sum + (item[params.metric] || 0), 0),
                average: timeline.length > 0 ? timeline.reduce((sum: number, item: any) => sum + (item[params.metric] || 0), 0) / timeline.length : 0,
                trend: 0 // Would need to calculate based on historical data
            };
        } catch (error) {
            console.error('Error fetching usage trends:', error);
            return {
                trends: [],
                total: 0,
                average: 0,
                trend: 0
            };
        }
    }

    async getServiceBreakdown(timeframe: '24h' | '7d' | '30d' | '90d' = '7d'): Promise<{
        services: Array<{
            service: string;
            cost: number;
            calls: number;
            percentage: number;
            models: Array<{
                model: string;
                cost: number;
                calls: number;
            }>;
        }>;
    }> {
        try {
            // Use analytics endpoint for service breakdown
            const response = await apiClient.get('/analytics', {
                params: {
                    startDate: this.getStartDate(timeframe),
                    endDate: new Date().toISOString()
                }
            });

            const services = response.data.data.breakdown?.services || [];
            return {
                services: services.map((service: any) => ({
                    service: service.service,
                    cost: service.cost,
                    calls: service.requests,
                    percentage: service.percentage,
                    models: service.models || []
                }))
            };
        } catch (error) {
            console.error('Error fetching service breakdown:', error);
            return {
                services: []
            };
        }
    }

    async getTopUsers(params?: {
        timeframe?: '24h' | '7d' | '30d' | '90d';
        limit?: number;
        metric?: 'cost' | 'calls';
    }): Promise<{
        users: Array<{
            userId: string;
            name: string;
            email: string;
            cost: number;
            calls: number;
            mostUsedService: string;
            mostUsedModel: string;
        }>;
    }> {
        try {
            const response = await apiClient.get('/usage/top-users', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching top users:', error);
            return {
                users: []
            };
        }
    }

    async exportUsage(params: {
        format: 'csv' | 'excel' | 'json';
        startDate?: string;
        endDate?: string;
        service?: string;
        model?: string;
        includeDetails?: boolean;
    }): Promise<Blob> {
        try {
            const response = await apiClient.get('/usage/export', {
                params,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting usage:', error);
            throw error;
        }
    }

    async getUsageInsights(timeframe: '7d' | '30d' | '90d' = '30d'): Promise<{
        insights: Array<{
            type: 'cost_spike' | 'unusual_pattern' | 'optimization_opportunity' | 'efficiency_gain';
            title: string;
            description: string;
            impact: 'high' | 'medium' | 'low';
            actionable: boolean;
            metadata?: Record<string, any>;
        }>;
        recommendations: Array<{
            title: string;
            description: string;
            potentialSavings: number;
            difficulty: 'easy' | 'medium' | 'hard';
        }>;
    }> {
        try {
            const response = await apiClient.get('/analytics/insights', {
                params: {
                    startDate: this.getStartDate(timeframe),
                    endDate: new Date().toISOString()
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage insights:', error);
            return {
                insights: [],
                recommendations: []
            };
        }
    }

    async validateUsageData(data: Partial<Usage>[]): Promise<{
        valid: Partial<Usage>[];
        invalid: Array<{
            data: Partial<Usage>;
            errors: string[];
        }>;
        summary: {
            total: number;
            valid: number;
            invalid: number;
        };
    }> {
        try {
            const response = await apiClient.post('/usage/validate', { data });
            return response.data.data;
        } catch (error) {
            console.error('Error validating usage data:', error);
            return {
                valid: [],
                invalid: data.map(item => ({
                    data: item,
                    errors: ['Validation service unavailable']
                })),
                summary: {
                    total: data.length,
                    valid: 0,
                    invalid: data.length
                }
            };
        }
    }

    async getUsageAlerts(): Promise<{
        alerts: Array<{
            id: string;
            type: 'cost_threshold' | 'usage_spike' | 'anomaly';
            severity: 'low' | 'medium' | 'high';
            title: string;
            description: string;
            timestamp: string;
            acknowledged: boolean;
            metadata?: Record<string, any>;
        }>;
        unreadCount: number;
    }> {
        try {
            const response = await apiClient.get('/usage/anomalies');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage alerts:', error);
            return {
                alerts: [],
                unreadCount: 0
            };
        }
    }

    async acknowledgeAlert(alertId: string): Promise<void> {
        try {
            await apiClient.post(`/usage/alerts/${alertId}/acknowledge`);
        } catch (error) {
            console.error('Error acknowledging alert:', error);
            throw error;
        }
    }

    async searchUsage(query: string, filters?: UsageFilters): Promise<{
        results: Usage[];
        total: number;
        took: number;
        suggestions?: string[];
    }> {
        try {
            const response = await apiClient.get('/usage/search', {
                params: { q: query, ...filters }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error searching usage:', error);
            return {
                results: [],
                total: 0,
                took: 0,
                suggestions: []
            };
        }
    }

    static async trackUsage(usageData: {
        provider: string;
        model: string;
        prompt: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        estimatedCost: number;
        responseTime: number;
        metadata: Record<string, any>;
    }): Promise<Usage> {
        try {
            const response = await apiClient.post('/usage', usageData);
            return response.data.data;
        } catch (error) {
            console.error('Error tracking usage:', error);
            throw error;
        }
    }

    static async getUsageHistory(params: {
        startDate?: string;
        endDate?: string;
        provider?: string;
        model?: string;
        limit?: number;
    }): Promise<Usage[]> {
        try {
            const response = await apiClient.get('/usage', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage history:', error);
            return [];
        }
    }

    // Helper method to get start date based on timeframe
    private getStartDate(timeframe: string): string {
        const now = new Date();
        const startDate = new Date(now);

        switch (timeframe) {
            case '24h':
                startDate.setDate(now.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        return startDate.toISOString();
    }
}

export const usageService = new UsageService();
export { UsageService };