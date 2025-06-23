// src/services/dashboard.service.ts
import api from '../config/api';
import { DashboardData } from '../types';

class DashboardService {
    async getDashboardData(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<{
        success: boolean;
        data: DashboardData;
    }> {
        const response = await api.get(`/dashboard/${timeframe}`);
        return response.data;
    }

    async getQuickStats(): Promise<{
        success: boolean;
        data: {
            currentMonthCost: number;
            lastMonthCost: number;
            costTrend: number;
            activeServices: number;
            totalOptimizations: number;
            savedThisMonth: number;
            topService: string;
            topModel: string;
        };
    }> {
        const response = await api.get('/dashboard/quick-stats');
        return response.data;
    }

    async getRecentActivity(limit: number = 10): Promise<{
        success: boolean;
        data: Array<{
            id: string;
            type: 'usage' | 'optimization' | 'alert' | 'cost_spike';
            title: string;
            description: string;
            timestamp: string;
            icon: string;
            action?: {
                label: string;
                url: string;
            };
            metadata?: any;
        }>;
    }> {
        const response = await api.get('/dashboard/activity', {
            params: { limit },
        });
        return response.data;
    }

    async getCostForecast(days: number = 30): Promise<{
        success: boolean;
        data: {
            forecast: Array<{
                date: string;
                predicted: number;
                lower: number;
                upper: number;
            }>;
            projectedMonthlyTotal: number;
            confidence: number;
            trend: 'increasing' | 'stable' | 'decreasing';
        };
    }> {
        const response = await api.get('/dashboard/forecast', {
            params: { days },
        });
        return response.data;
    }

    async getServiceHealth(): Promise<{
        success: boolean;
        data: {
            services: Array<{
                name: string;
                status: 'healthy' | 'warning' | 'error';
                uptime: number;
                lastCheck: string;
                responseTime: number;
                issues?: string[];
            }>;
            overallStatus: 'healthy' | 'degraded' | 'down';
        };
    }> {
        const response = await api.get('/dashboard/health');
        return response.data;
    }

    async getInsightOfTheDay(): Promise<{
        success: boolean;
        data: {
            insight: string;
            type: 'tip' | 'fact' | 'recommendation';
            category: string;
            actionable: boolean;
            action?: {
                label: string;
                url: string;
            };
        };
    }> {
        const response = await api.get('/dashboard/insight');
        return response.data;
    }

    async getGoalProgress(): Promise<{
        success: boolean;
        data: {
            monthlyBudget: {
                limit: number;
                used: number;
                percentage: number;
                daysRemaining: number;
                onTrack: boolean;
            };
            savingsTarget: {
                target: number;
                achieved: number;
                percentage: number;
            };
            optimizationGoal: {
                target: number;
                completed: number;
                percentage: number;
            };
        };
    }> {
        const response = await api.get('/dashboard/goals');
        return response.data;
    }

    async getAnomalySummary(): Promise<{
        success: boolean;
        data: {
            hasAnomalies: boolean;
            count: number;
            totalImpact: number;
            anomalies: Array<{
                id: string;
                type: 'cost_spike' | 'usage_pattern' | 'new_model';
                severity: 'low' | 'medium' | 'high';
                description: string;
                detected: string;
                impact: number;
                resolved: boolean;
            }>;
        };
    }> {
        const response = await api.get('/dashboard/anomalies');
        return response.data;
    }

    async getTeamActivity(): Promise<{
        success: boolean;
        data: {
            activeUsers: number;
            topUsers: Array<{
                id: string;
                name: string;
                avatar?: string;
                usage: number;
                cost: number;
                optimizations: number;
            }>;
            recentActions: Array<{
                userId: string;
                userName: string;
                action: string;
                timestamp: string;
            }>;
        };
    }> {
        const response = await api.get('/dashboard/team-activity');
        return response.data;
    }

    async refreshDashboard(): Promise<{
        success: boolean;
        message: string;
        lastUpdated: string;
    }> {
        const response = await api.post('/dashboard/refresh');
        return response.data;
    }
}

export const dashboardService = new DashboardService();