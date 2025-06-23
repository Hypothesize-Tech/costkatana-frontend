// src/services/usage.service.ts
import api from '../config/api';
import { Usage, UsageStats, PaginatedResponse, UsageFilters } from '../types';

class UsageService {
    async trackUsage(data: {
        service: string;
        model: string;
        prompt: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost: number;
        responseTime: number;
        metadata?: any;
    }): Promise<{ success: boolean; data: Usage }> {
        const response = await api.post('/usage', data);
        return response.data;
    }

    async getUsageHistory(params?: {
        page?: number;
        limit?: number;
        service?: string;
        model?: string;
        startDate?: string;
        endDate?: string;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Usage>> {
        const response = await api.get('/usage', { params });
        return response.data;
    }

    async getUsageStats(params?: {
        startDate?: string;
        endDate?: string;
        groupBy?: 'day' | 'week' | 'month';
    }): Promise<{ success: boolean; data: UsageStats }> {
        const response = await api.get('/usage/stats', { params });
        return response.data;
    }

    async searchUsage(query: string, filters?: UsageFilters): Promise<PaginatedResponse<Usage>> {
        const response = await api.get('/usage/search', {
            params: {
                q: query,
                ...filters,
            },
        });
        return response.data;
    }

    async detectAnomalies(params?: {
        threshold?: number;
        lookbackDays?: number;
    }): Promise<{
        success: boolean;
        data: {
            anomalies: Array<{
                date: string;
                service: string;
                model: string;
                actualCost: number;
                expectedCost: number;
                deviation: number;
                severity: 'low' | 'medium' | 'high';
            }>;
        };
    }> {
        const response = await api.get('/usage/anomalies', { params });
        return response.data;
    }

    async exportUsage(params: {
        format: 'csv' | 'json' | 'pdf';
        startDate?: string;
        endDate?: string;
        service?: string;
        model?: string;
    }): Promise<Blob> {
        const response = await api.get('/usage/export', {
            params,
            responseType: 'blob',
        });
        return response.data;
    }

    async getUsageSummary(timeframe: '24h' | '7d' | '30d' | '90d' = '7d'): Promise<{
        success: boolean;
        data: {
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
        };
    }> {
        const response = await api.get(`/usage/summary/${timeframe}`);
        return response.data;
    }

    async bulkImportUsage(file: File): Promise<{
        success: boolean;
        data: {
            imported: number;
            failed: number;
            errors: string[];
        };
    }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/usage/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async getUsageByPrompt(promptId: string): Promise<{
        success: boolean;
        data: Usage[];
    }> {
        const response = await api.get(`/usage/prompt/${promptId}`);
        return response.data;
    }

    async compareUsage(params: {
        period1Start: string;
        period1End: string;
        period2Start: string;
        period2End: string;
        service?: string;
        model?: string;
    }): Promise<{
        success: boolean;
        data: {
            period1: UsageStats;
            period2: UsageStats;
            changes: {
                cost: number;
                calls: number;
                avgCost: number;
                costPercentage: number;
                callsPercentage: number;
            };
        };
    }> {
        const response = await api.post('/usage/compare', params);
        return response.data;
    }

    async getActivity(_params?: { limit?: number }): Promise<{ success: boolean; data: Array<{ id: string; type: 'usage' | 'optimization' | 'settings'; action: string; description: string; timestamp: string; }> }> {
        // Mock data for now
        return Promise.resolve({
            success: true,
            data: [
                {
                    id: '1',
                    type: 'usage',
                    action: 'API Call',
                    description: 'Used GPT-4 for code generation',
                    timestamp: new Date().toISOString(),
                },
                {
                    id: '2',
                    type: 'optimization',
                    action: 'Prompt Optimized',
                    description: 'Saved 45% on frequently used prompt',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                    id: '3',
                    type: 'settings',
                    action: 'Settings Updated',
                    description: 'Updated notification preferences',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                },
            ],
        });
    }
}

export const usageService = new UsageService();