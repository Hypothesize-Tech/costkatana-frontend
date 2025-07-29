import { apiClient } from '../config/api';
import { Analytics, TimeSeriesData, ServiceAnalytics } from '../types';

class AnalyticsService {
    async getAnalytics(params?: {
        startDate?: string;
        endDate?: string;
        service?: string;
        model?: string;
        groupBy?: 'hour' | 'date' | 'service' | 'model';
        projectId?: string;
    }): Promise<Analytics> {
        try {
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics', { params: requestParams });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    async getDashboardData(projectId?: string): Promise<any> {
        try {
            const params: any = {};
            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }

            const response = await apiClient.get('/analytics/dashboard', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Return fallback structure on error
            return {
                overview: {
                    totalCost: { value: 0, change: { value: 0, percentage: 0, trend: 'stable' } },
                    totalCalls: { value: 0, change: { value: 0, percentage: 0, trend: 'stable' } },
                    avgCostPerCall: { value: 0, change: { value: 0, percentage: 0, trend: 'stable' } },
                    totalOptimizationSavings: { value: 0, change: 0 }
                },
                charts: {
                    costOverTime: [],
                    serviceBreakdown: [],
                    modelUsage: []
                },
                recentActivity: {
                    topPrompts: [],
                    optimizationOpportunities: 0
                },
                insights: []
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
        projectId?: string;
    }): Promise<TimeSeriesData[]> {
        try {
            const requestParams: any = {
                ...params,
                format: 'timeseries'
            };
            if (params.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics', { params: requestParams });
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
        projectId?: string;
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
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics', { params: requestParams });
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
        projectId?: string;
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
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics/insights', { params: requestParams });
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
        projectId?: string;
    }): Promise<ServiceAnalytics[]> {
        try {
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics', { params: requestParams });
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
        projectId?: string;
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
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics', { params: requestParams });
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

    async getOptimizationOpportunities(projectId?: string): Promise<{
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
            const params: any = {};
            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }
            const response = await apiClient.get('/analytics/insights', { params });
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
        projectId?: string;
    }): Promise<Blob> {
        try {
            const requestParams: any = { ...params };
            if (params.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics/export', {
                params: requestParams,
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
            // Manually construct query parameters to ensure proper array handling
            const params = new URLSearchParams();

            // Add individual projectIds as separate parameters
            if (filters.projectIds && Array.isArray(filters.projectIds)) {
                filters.projectIds.forEach((id: string) => {
                    params.append('projectIds', id);
                });
            }

            // Add other parameters
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.metric) params.append('metric', filters.metric);

            const response = await apiClient.get(`/analytics/projects/compare?${params.toString()}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error comparing projects:', error);
            console.error('Request URL:', error.config?.url);
            console.error('Request params:', error.config?.params);
            console.error('Response status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            throw error;
        }
    }

    // Additional methods for comprehensive analytics
    async getInsights(projectId?: string): Promise<any> {
        try {
            const params: any = {};
            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }
            const response = await apiClient.get('/analytics/insights', { params });
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

    async getRecentUsage(params?: {
        limit?: number;
        projectId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<any[]> {
        try {
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/analytics/recent-usage', { params: requestParams });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching recent usage:', error);
            return [];
        }
    }
}

export const analyticsService = new AnalyticsService();
export { AnalyticsService };