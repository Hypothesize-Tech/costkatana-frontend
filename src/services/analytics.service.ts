// src/services/analytics.service.ts
import { apiClient } from '../config/api';
import { Analytics, TimeSeriesData, ServiceAnalytics } from '../types';

class AnalyticsService {
    async getAnalytics(params?: {
        startDate?: string;
        endDate?: string;
        service?: string;
        model?: string;
        groupBy?: 'hour' | 'date' | 'service' | 'model';
    }): Promise<Analytics> {
        try {
            const response = await apiClient.get('/analytics', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    async getDashboardData(): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/dashboard');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Return fallback data
            return {
                summary: {
                    totalCost: 0,
                    totalTokens: 0,
                    totalRequests: 0,
                    averageCostPerRequest: 0
                },
                timeline: [],
                breakdown: {
                    services: [],
                    models: []
                },
                recentActivity: []
            };
        }
    }

    async getTimeSeriesData(params: {
        metric: 'cost' | 'calls' | 'tokens';
        startDate: string;
        endDate: string;
        groupBy: 'hour' | 'date' | 'service' | 'model';
        service?: string;
        model?: string;
    }): Promise<TimeSeriesData[]> {
        try {
            const response = await apiClient.get('/analytics', {
                params: {
                    ...params,
                    format: 'timeseries'
                }
            });
            return response.data.data.timeline || [];
        } catch (error) {
            console.error('Error fetching time series data:', error);
            return [];
        }
    }

    async getCostAnalysis(params?: {
        startDate?: string;
        endDate?: string;
        groupBy?: 'service' | 'model' | 'user';
    }): Promise<{
        totalCost: number;
        breakdown: Array<{
            name: string;
            cost: number;
            percentage: number;
            trend: number;
        }>;
        trends: TimeSeriesData[];
        predictions: Array<{
            date: string;
            predicted: number;
            confidence: number;
        }>;
    }> {
        try {
            const response = await apiClient.get('/analytics', { params });
            const data = response.data.data;

            return {
                totalCost: data.summary?.totalCost || 0,
                breakdown: data.breakdown?.services?.map((service: any) => ({
                    name: service.service,
                    cost: service.cost,
                    percentage: service.percentage,
                    trend: service.trend || 0
                })) || [],
                trends: data.timeline || [],
                predictions: data.predictions || []
            };
        } catch (error) {
            console.error('Error fetching cost analysis:', error);
            return {
                totalCost: 0,
                breakdown: [],
                trends: [],
                predictions: []
            };
        }
    }

    async getUsagePatterns(params?: {
        startDate?: string;
        endDate?: string;
        service?: string;
    }): Promise<{
        patterns: Array<{
            pattern: string;
            frequency: number;
            impact: 'high' | 'medium' | 'low';
            description: string;
        }>;
        anomalies: Array<{
            date: string;
            type: string;
            severity: 'high' | 'medium' | 'low';
            description: string;
        }>;
        recommendations: string[];
    }> {
        try {
            const response = await apiClient.get('/analytics/insights', { params });
            const data = response.data.data;

            return {
                patterns: data.patterns || [],
                anomalies: data.anomalies || [],
                recommendations: data.recommendations || []
            };
        } catch (error) {
            console.error('Error fetching usage patterns:', error);
            return {
                patterns: [],
                anomalies: [],
                recommendations: []
            };
        }
    }

    async getServiceBreakdown(params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<ServiceAnalytics[]> {
        try {
            const response = await apiClient.get('/analytics', { params });
            return response.data.data.breakdown?.services || [];
        } catch (error) {
            console.error('Error fetching service breakdown:', error);
            return [];
        }
    }

    async getModelComparison(params?: {
        models?: string[];
        metric?: 'cost' | 'performance' | 'efficiency';
        startDate?: string;
        endDate?: string;
    }): Promise<{
        comparison: Array<{
            model: string;
            service: string;
            cost: number;
            calls: number;
            avgResponseTime: number;
            successRate: number;
            costPerToken: number;
            efficiency: number;
        }>;
        recommendations: Array<{
            currentModel: string;
            suggestedModel: string;
            potentialSavings: number;
            reason: string;
        }>;
    }> {
        try {
            const response = await apiClient.get('/analytics', { params });
            const data = response.data.data;

            return {
                comparison: data.breakdown?.models?.map((model: any) => ({
                    model: model.model,
                    service: model.service,
                    cost: model.cost,
                    calls: model.calls,
                    avgResponseTime: model.avgResponseTime || 0,
                    successRate: model.successRate || 100,
                    costPerToken: model.costPerToken || 0,
                    efficiency: model.efficiency || 0
                })) || [],
                recommendations: data.recommendations || []
            };
        } catch (error) {
            console.error('Error fetching model comparison:', error);
            return {
                comparison: [],
                recommendations: []
            };
        }
    }

    async getOptimizationOpportunities(): Promise<{
        opportunities: Array<{
            type: 'model_switch' | 'prompt_optimization' | 'caching' | 'batching';
            title: string;
            description: string;
            potentialSavings: number;
            difficulty: 'easy' | 'medium' | 'hard';
            impact: 'high' | 'medium' | 'low';
        }>;
        totalPotentialSavings: number;
    }> {
        try {
            const response = await apiClient.get('/analytics/insights');
            const data = response.data.data;

            return {
                opportunities: data.optimizationOpportunities || [],
                totalPotentialSavings: data.totalPotentialSavings || 0
            };
        } catch (error) {
            console.error('Error fetching optimization opportunities:', error);
            return {
                opportunities: [],
                totalPotentialSavings: 0
            };
        }
    }

    async exportAnalytics(params: {
        format: 'csv' | 'excel' | 'pdf';
        startDate: string;
        endDate: string;
        includeGraphs?: boolean;
    }): Promise<Blob> {
        try {
            const response = await apiClient.get('/analytics/export', {
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting analytics:', error);
            throw error;
        }
    }

    async getCustomReport(reportConfig: {
        name: string;
        metrics: string[];
        filters: Record<string, any>;
        groupBy: string[];
        timeRange: {
            start: string;
            end: string;
        };
    }): Promise<{
        data: any[];
        summary: Record<string, number>;
        metadata: {
            generatedAt: string;
            totalRecords: number;
            executionTime: number;
        };
    }> {
        try {
            const response = await apiClient.post('/analytics/custom-report', reportConfig);
            return response.data.data;
        } catch (error) {
            console.error('Error generating custom report:', error);
            throw error;
        }
    }

    static async getProjectAnalytics(projectId: string, filters: any = {}) {
        try {
            const response = await apiClient.get(`/analytics/projects/${projectId}`, {
                params: filters
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching project analytics:', error);
            throw error;
        }
    }

    static async compareProjects(filters: any = {}) {
        try {
            const response = await apiClient.get('/analytics/projects/compare', {
                params: filters
            });
            return response.data.data;
        } catch (error) {
            console.error('Error comparing projects:', error);
            throw error;
        }
    }

    // Additional methods for comprehensive analytics
    async getInsights(): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/insights');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching insights:', error);
            return {
                optimizationOpportunities: [],
                costSavings: 0,
                recommendations: []
            };
        }
    }

    async getComparativeAnalytics(compareData: any): Promise<any> {
        try {
            const response = await apiClient.post('/analytics/compare', compareData);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching comparative analytics:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();
export { AnalyticsService };