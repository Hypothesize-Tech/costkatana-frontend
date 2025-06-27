// src/services/analytics.service.ts
import api from '@/config/api';
import { Analytics, DashboardData, TimeSeriesData, ServiceBreakdown } from '../types';

class AnalyticsService {
    async getAnalytics(params?: {
        startDate?: string;
        endDate?: string;
        service?: string;
        model?: string;
        groupBy?: 'hour' | 'day' | 'week' | 'month';
    }): Promise<{ success: boolean; data: Analytics }> {
        const response = await api.get('/analytics', { params });
        return response.data;
    }

    async getDashboardData(): Promise<{ success: boolean; data: DashboardData }> {
        const response = await api.get('/analytics/dashboard');
        return response.data;
    }

    async getInsights(params?: {
        startDate?: string;
        endDate?: string;
        focus?: 'cost' | 'usage' | 'optimization';
    }): Promise<{
        success: boolean;
        data: Array<{
            type: 'cost_spike' | 'usage_pattern' | 'optimization' | 'anomaly' | 'trend';
            title: string;
            description: string;
            impact?: string;
            recommendation?: string;
            severity?: 'low' | 'medium' | 'high';
            metadata?: any;
        }>;
    }> {
        const response = await api.get('/analytics/insights', { params });
        return response.data;
    }

    async comparePeriods(params: {
        period1Start: string;
        period1End: string;
        period2Start: string;
        period2End: string;
        metrics?: string[];
    }): Promise<{
        success: boolean;
        data: {
            period1: Analytics;
            period2: Analytics;
            comparison: {
                costChange: number;
                usageChange: number;
                efficiencyChange: number;
                highlights: string[];
            };
        };
    }> {
        const response = await api.post('/analytics/compare', params);
        return response.data;
    }

    async getCostTrends(params?: {
        startDate?: string;
        endDate?: string;
        interval?: 'hour' | 'day' | 'week' | 'month';
        service?: string;
    }): Promise<{
        success: boolean;
        data: {
            trends: TimeSeriesData[];
            forecast?: TimeSeriesData[];
            seasonality?: {
                daily?: number[];
                weekly?: number[];
                monthly?: number[];
            };
        };
    }> {
        const response = await api.get('/analytics/cost-trends', { params });
        return response.data;
    }

    async getServiceBreakdown(params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: ServiceBreakdown[];
    }> {
        const response = await api.get('/analytics/service-breakdown', { params });
        return response.data;
    }

    async getModelPerformance(params?: {
        startDate?: string;
        endDate?: string;
        service?: string;
        sortBy?: 'cost' | 'calls' | 'efficiency';
    }): Promise<{
        success: boolean;
        data: Array<{
            model: string;
            service: string;
            totalCost: number;
            totalCalls: number;
            avgCostPerCall: number;
            avgTokensPerCall: number;
            avgResponseTime: number;
            costEfficiency: number; // cost per 1k tokens
            trend: 'up' | 'down' | 'stable';
        }>;
    }> {
        const response = await api.get('/analytics/model-performance', { params });
        return response.data;
    }

    async exportAnalytics(params: {
        format: 'csv' | 'json' | 'pdf' | 'xlsx';
        startDate?: string;
        endDate?: string;
        includeCharts?: boolean;
        sections?: string[];
    }): Promise<Blob> {
        const response = await api.get('/analytics/export', {
            params,
            responseType: 'blob',
        });
        return response.data;
    }

    async getROIAnalysis(): Promise<{
        success: boolean;
        data: {
            totalSaved: number;
            optimizationRate: number;
            avgSavingsPerOptimization: number;
            projectedMonthlySavings: number;
            topOptimizationOpportunities: Array<{
                prompt: string;
                currentCost: number;
                potentialSavings: number;
                usage: number;
            }>;
            savingsByService: Record<string, number>;
        };
    }> {
        const response = await api.get('/analytics/roi');
        return response.data;
    }

    async getUsageHeatmap(params?: {
        startDate?: string;
        endDate?: string;
        timezone?: string;
    }): Promise<{
        success: boolean;
        data: {
            heatmap: Array<{
                hour: number;
                dayOfWeek: number;
                value: number;
                cost: number;
            }>;
            peakHours: number[];
            quietHours: number[];
        };
    }> {
        const response = await api.get('/analytics/usage-heatmap', { params });
        return response.data;
    }

    async getTeamAnalytics(params?: {
        startDate?: string;
        endDate?: string;
        groupBy?: 'user' | 'department' | 'project';
    }): Promise<{
        success: boolean;
        data: {
            breakdown: Array<{
                name: string;
                cost: number;
                calls: number;
                users: number;
                topModels: string[];
                trend: number;
            }>;
            topSpenders: Array<{
                userId: string;
                name: string;
                cost: number;
                calls: number;
            }>;
        };
    }> {
        const response = await api.get('/analytics/team', { params });
        return response.data;
    }
}

export const analyticsService = new AnalyticsService();