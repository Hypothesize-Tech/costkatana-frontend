// src/services/dashboard.service.ts
import api from '../config/api';
import { apiClient } from '../config/api';

export interface DashboardStats {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCostPerRequest: number;
    costChange?: number;
    tokensChange?: number;
    requestsChange?: number;
}

export interface DashboardData {
    stats: DashboardStats;
    chartData: Array<{
        date: string;
        cost: number;
        tokens: number;
        requests: number;
    }>;
    serviceBreakdown: Array<{
        service: string;
        cost: number;
        requests: number;
        percentage: number;
    }>;
    recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        cost: number;
    }>;
}

export class DashboardService {
    /**
     * Get dashboard data from analytics endpoint
     */
    static async getDashboardData(): Promise<DashboardData> {
        try {
            const response = await apiClient.get('/analytics/dashboard');
            const data = response.data?.data || response.data; // Support both .data.data and .data

            // Defensive helpers
            const safeNumber = (val: any) => typeof val === 'number' && !isNaN(val) ? val : 0;

            // 1. Map stats from new API structure
            const overview = data.overview || {};
            const stats = {
                totalCost: safeNumber(overview.totalCost?.value),
                totalTokens: safeNumber(data.charts?.costOverTime?.reduce((sum: number, item: any) => sum + (item.tokens || 0), 0)),
                totalRequests: safeNumber(overview.totalCalls?.value),
                averageCostPerRequest: safeNumber(overview.avgCostPerCall?.value),
                costChange: safeNumber(overview.totalCost?.change?.percentage),
                tokensChange: 0, // Not provided directly
                requestsChange: safeNumber(overview.totalCalls?.change?.percentage)
            };

            // 2. Map chartData from costOverTime
            const chartData = Array.isArray(data.charts?.costOverTime)
                ? data.charts.costOverTime.map((item: any) => ({
                    date: item.date,
                    cost: safeNumber(item.cost),
                    tokens: safeNumber(item.tokens),
                    requests: safeNumber(item.calls)
                }))
                : [];

            // 3. Map serviceBreakdown from serviceBreakdown
            const serviceBreakdown = Array.isArray(data.charts?.serviceBreakdown)
                ? data.charts.serviceBreakdown.map((service: any) => ({
                    service: service.service,
                    cost: safeNumber(service.totalCost),
                    requests: safeNumber(service.totalRequests),
                    percentage: 0 // Not provided, can be calculated if needed
                }))
                : [];

            // 4. Map recentActivity (topPrompts/optimizationOpportunities not mapped here)
            // For backward compatibility, we keep the array structure
            const recentActivity = Array.isArray(data.recentActivity?.topPrompts)
                ? data.recentActivity.topPrompts.map((prompt: any, idx: number) => ({
                    id: prompt._id || `prompt-${idx}`,
                    type: 'prompt',
                    description: prompt.text || '',
                    timestamp: prompt.timestamp || '',
                    cost: safeNumber(prompt.cost)
                }))
                : [];

            return {
                stats,
                chartData,
                serviceBreakdown,
                recentActivity
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Return default data structure to prevent crashes
            return {
                stats: {
                    totalCost: 0,
                    totalTokens: 0,
                    totalRequests: 0,
                    averageCostPerRequest: 0,
                    costChange: 0,
                    tokensChange: 0,
                    requestsChange: 0
                },
                chartData: [],
                serviceBreakdown: [],
                recentActivity: []
            };
        }
    }

    /**
     * Get dashboard data with date range
     */
    static async getDashboardDataByRange(startDate: string, endDate: string): Promise<DashboardData> {
        try {
            const response = await apiClient.get('/analytics', {
                params: { startDate, endDate }
            });
            const data = response.data.data || response.data;

            // Transform the data to match our interface
            return {
                stats: {
                    totalCost: data.summary?.totalCost || 0,
                    totalTokens: data.summary?.totalTokens || 0,
                    totalRequests: data.summary?.totalRequests || 0,
                    averageCostPerRequest: data.summary?.averageCostPerRequest || 0,
                    costChange: data.trends?.costChange || 0,
                    tokensChange: data.trends?.tokensChange || 0,
                    requestsChange: data.trends?.requestsChange || 0
                },
                chartData: data.timeline?.map((item: any) => ({
                    date: item.date,
                    cost: item.cost,
                    tokens: item.tokens,
                    requests: item.requests
                })) || [],
                serviceBreakdown: data.breakdown?.services?.map((service: any) => ({
                    service: service.service,
                    cost: service.cost,
                    requests: service.requests,
                    percentage: service.percentage
                })) || [],
                recentActivity: data.recentActivity?.map((activity: any) => ({
                    id: activity._id,
                    type: activity.type || 'api_request',
                    description: activity.description || `${activity.service} - ${activity.model}`,
                    timestamp: activity.timestamp || activity.createdAt,
                    cost: activity.cost
                })) || []
            };
        } catch (error) {
            console.error('Error fetching dashboard data by range:', error);
            // Fallback to default dashboard data
            return this.getDashboardData();
        }
    }

    /**
     * Get insights data
     */
    static async getInsights(): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/insights');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching insights:', error);
            return {
                optimizationOpportunities: [],
                costSavings: 0,
                recommendations: []
            };
        }
    }

    /**
     * Get recent activity
     */
    static async getRecentActivity(limit: number = 10): Promise<any[]> {
        try {
            const response = await apiClient.get('/usage', {
                params: {
                    limit,
                    sort: 'createdAt',
                    order: 'desc'
                }
            });

            return response.data.data || response.data.map((usage: any) => ({
                id: usage._id,
                type: 'api_request',
                description: `${usage.service} - ${usage.model}`,
                timestamp: usage.createdAt,
                cost: usage.cost,
                metadata: {
                    service: usage.service,
                    model: usage.model,
                    tokens: usage.totalTokens,
                    projectId: usage.projectId
                }
            }));
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            return [];
        }
    }

    /**
     * Get cost trends
     */
    static async getCostTrends(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<any[]> {
        try {
            const endDate = new Date();
            const startDate = new Date();

            switch (period) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(endDate.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
            }

            const response = await apiClient.get('/analytics', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });

            return response.data.data || response.data.timeline || [];
        } catch (error) {
            console.error('Error fetching cost trends:', error);
            return [];
        }
    }

    /**
     * Get service performance
     */
    static async getServicePerformance(): Promise<any[]> {
        try {
            const response = await apiClient.get('/analytics');
            return response.data.data || response.data.breakdown?.services || [];
        } catch (error) {
            console.error('Error fetching service performance:', error);
            return [];
        }
    }

    async getQuickStats(): Promise<{
        currentMonthCost: number;
        lastMonthCost: number;
        costTrend: number;
        activeServices: number;
        totalOptimizations: number;
        savedThisMonth: number;
        topService: string;
        topModel: string;
    }> {
        const response = await api.get('/dashboard/quick-stats');
        return response.data.data || response.data;
    }

    async getServiceBreakdown(): Promise<{
        services: Array<{
            name: string;
            cost: number;
            calls: number;
            percentage: number;
            trend: number;
        }>;
        totalServices: number;
        mostUsedService: string;
        mostExpensiveService: string;
    }> {
        const response = await api.get('/dashboard/service-breakdown');
        return response.data.data || response.data;
    }

    async getModelPerformance(): Promise<{
        models: Array<{
            name: string;
            service: string;
            calls: number;
            cost: number;
            avgResponseTime: number;
            successRate: number;
            costPerToken: number;
            trend: number;
        }>;
        topPerforming: string;
        mostCostEffective: string;
        recommendations: Array<{
            currentModel: string;
            suggestedModel: string;
            potentialSavings: number;
            reason: string;
        }>;
    }> {
        const response = await api.get('/dashboard/model-performance');
        return response.data.data || response.data;
    }

    async refreshDashboard(): Promise<{
        message: string;
        lastUpdated: string;
    }> {
        const response = await api.post('/dashboard/refresh');
        return response.data.data || response.data;
    }
}

export const dashboardService = new DashboardService();