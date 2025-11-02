import { apiClient } from '../config/api';

// User Growth & Engagement Interfaces
export interface UserGrowthTrend {
    date: string;
    newUsers: number;
    totalUsers: number;
    activeUsers: number;
}

export interface EngagementMetrics {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
    retentionRate: number;
    averageEngagementScore: number;
    peakUsageHour: number;
    averageSessionsPerUser: number;
}

export interface UserSegment {
    segment: string;
    count: number;
    percentage: number;
    averageCost: number;
    totalCost: number;
}

// Anomaly Detection Interfaces
export interface Alert {
    id: string;
    type: 'spending' | 'error' | 'budget' | 'anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    userId?: string;
    userEmail?: string;
    projectId?: string;
    timestamp: string;
    acknowledged?: boolean;
    acknowledgedAt?: string;
}

export interface Anomaly {
    type: 'spending_spike' | 'error_spike' | 'budget_exceeded' | 'unusual_pattern';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    userEmail?: string;
    projectId?: string;
    projectName?: string;
    service?: string;
    model?: string;
    message: string;
    value: number;
    threshold: number;
    deviation: number;
    detectedAt: string;
    resolved?: boolean;
    resolvedAt?: string;
}

// Model/Service Comparison Interfaces
export interface ModelComparison {
    model: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    averageResponseTime: number;
    averageCostPerRequest: number;
    averageTokensPerRequest: number;
    efficiencyScore: number;
    costPerToken: number;
    tokensPerDollar: number;
    requestsPerDollar: number;
}

export interface ServiceComparison {
    service: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    averageResponseTime: number;
    averageCostPerRequest: number;
    averageTokensPerRequest: number;
    efficiencyScore: number;
    uniqueModels: string[];
    costPerToken: number;
    tokensPerDollar: number;
    requestsPerDollar: number;
}

// Feature Analytics Interfaces
export interface FeatureUsageStats {
    feature: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    uniqueUsers: number;
    averageCostPerRequest: number;
    averageTokensPerRequest: number;
    errorCount: number;
    errorRate: number;
}

export interface FeatureAdoption {
    feature: string;
    totalUsers: number;
    activeUsers: number;
    adoptionRate: number;
    growthRate: number;
}

export interface FeatureCostAnalysis {
    feature: string;
    totalCost: number;
    percentageOfTotal: number;
    averageCostPerUser: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}

// Project/Workspace Analytics Interfaces
export interface ProjectStats {
    projectId: string;
    projectName: string;
    workspaceId?: string;
    workspaceName?: string;
    ownerId: string;
    ownerEmail?: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCostPerRequest: number;
    budgetAmount: number;
    budgetUsagePercentage: number;
    isOverBudget: boolean;
    errorCount: number;
    errorRate: number;
    activeUsers: number;
    createdAt: string;
    lastActivity: string;
}

export interface WorkspaceStats {
    workspaceId: string;
    workspaceName: string;
    ownerId: string;
    ownerEmail?: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    projectCount: number;
    activeProjectCount: number;
    activeUsers: number;
    budgetAmount: number;
    budgetUsagePercentage: number;
    isOverBudget: boolean;
    createdAt: string;
}

export interface ProjectTrend {
    date: string;
    cost: number;
    tokens: number;
    requests: number;
}

// Filters
export interface AdminDashboardFilters {
    startDate?: string;
    endDate?: string;
    period?: 'daily' | 'weekly' | 'monthly';
    service?: string;
    userId?: string;
    workspaceId?: string;
    isActive?: boolean;
    timeWindow?: 'hour' | 'day' | 'week';
    threshold?: number;
}

export interface ActivityEvent {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    userId?: string;
    userEmail?: string;
    projectId?: string;
    projectName?: string;
    timestamp: string;
}

export interface ReportConfig {
    format: 'csv' | 'excel' | 'json';
    startDate?: Date | string;
    endDate?: Date | string;
    includeCharts?: boolean;
    sections?: string[];
}

export class AdminDashboardService {
    /**
     * Get user growth trends
     */
    static async getUserGrowthTrends(filters: AdminDashboardFilters = {}): Promise<UserGrowthTrend[]> {
        try {
            const params = new URLSearchParams();
            if (filters.period) params.append('period', filters.period);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/admin/analytics/user-growth?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching user growth trends:', error);
            throw error;
        }
    }

    /**
     * Get user engagement metrics
     */
    static async getUserEngagementMetrics(filters: AdminDashboardFilters = {}): Promise<EngagementMetrics> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/admin/analytics/engagement?${params.toString()}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching user engagement metrics:', error);
            throw error;
        }
    }

    /**
     * Get user segments
     */
    static async getUserSegments(filters: AdminDashboardFilters = {}): Promise<UserSegment[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/admin/analytics/user-segments?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching user segments:', error);
            throw error;
        }
    }

    /**
     * Get current alerts
     */
    static async getCurrentAlerts(): Promise<Alert[]> {
        try {
            const response = await apiClient.get('/admin/alerts');
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching alerts:', error);
            throw error;
        }
    }

    /**
     * Detect spending anomalies
     */
    static async detectSpendingAnomalies(filters: AdminDashboardFilters = {}): Promise<Anomaly[]> {
        try {
            const params = new URLSearchParams();
            if (filters.timeWindow) params.append('timeWindow', filters.timeWindow);
            if (filters.threshold !== undefined) params.append('threshold', filters.threshold.toString());

            const response = await apiClient.get(`/admin/anomalies/spending?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error detecting spending anomalies:', error);
            throw error;
        }
    }

    /**
     * Detect error anomalies
     */
    static async detectErrorAnomalies(filters: AdminDashboardFilters = {}): Promise<Anomaly[]> {
        try {
            const params = new URLSearchParams();
            if (filters.timeWindow) params.append('timeWindow', filters.timeWindow);
            if (filters.threshold !== undefined) params.append('threshold', filters.threshold.toString());

            const response = await apiClient.get(`/admin/anomalies/errors?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error detecting error anomalies:', error);
            throw error;
        }
    }

    /**
     * Get model comparison
     */
    static async getModelComparison(filters: AdminDashboardFilters = {}): Promise<ModelComparison[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.service) params.append('service', filters.service);
            if (filters.userId) params.append('userId', filters.userId);

            const response = await apiClient.get(`/admin/analytics/model-comparison?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching model comparison:', error);
            throw error;
        }
    }

    /**
     * Get service comparison
     */
    static async getServiceComparison(filters: AdminDashboardFilters = {}): Promise<ServiceComparison[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.userId) params.append('userId', filters.userId);

            const response = await apiClient.get(`/admin/analytics/service-comparison?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching service comparison:', error);
            throw error;
        }
    }

    /**
     * Get feature usage stats
     */
    static async getFeatureUsageStats(filters: AdminDashboardFilters = {}): Promise<FeatureUsageStats[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.userId) params.append('userId', filters.userId);

            const response = await apiClient.get(`/admin/analytics/feature-usage?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching feature usage stats:', error);
            throw error;
        }
    }

    /**
     * Get feature adoption rates
     */
    static async getFeatureAdoptionRates(filters: AdminDashboardFilters = {}): Promise<FeatureAdoption[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/admin/analytics/feature-adoption?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching feature adoption rates:', error);
            throw error;
        }
    }

    /**
     * Get feature cost analysis
     */
    static async getFeatureCostAnalysis(filters: AdminDashboardFilters = {}): Promise<FeatureCostAnalysis[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/admin/analytics/feature-cost?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching feature cost analysis:', error);
            throw error;
        }
    }

    /**
     * Get project analytics
     */
    static async getProjectAnalytics(filters: AdminDashboardFilters = {}): Promise<ProjectStats[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.workspaceId) params.append('workspaceId', filters.workspaceId);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

            const response = await apiClient.get(`/admin/analytics/projects?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching project analytics:', error);
            throw error;
        }
    }

    /**
     * Get workspace analytics
     */
    static async getWorkspaceAnalytics(filters: AdminDashboardFilters = {}): Promise<WorkspaceStats[]> {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/admin/analytics/workspaces?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching workspace analytics:', error);
            throw error;
        }
    }

    /**
     * Get project trends
     */
    static async getProjectTrends(
        projectId: string,
        filters: AdminDashboardFilters = {}
    ): Promise<ProjectTrend[]> {
        try {
            const params = new URLSearchParams();
            if (filters.period) params.append('period', filters.period);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get(`/admin/analytics/projects/${projectId}/trends?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching project trends:', error);
            throw error;
        }
    }

    /**
     * Get recent activity events
     */
    static async getRecentActivity(filters: { limit?: number } = {}): Promise<ActivityEvent[]> {
        const limit = filters.limit || 50;
        try {
            const params = new URLSearchParams();
            if (filters.limit) params.append('limit', filters.limit.toString());

            const response = await apiClient.get(`/admin/analytics/activity/recent?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }

    /**
     * Export report
     */
    static async exportReport(config: ReportConfig): Promise<string | ArrayBuffer> {
        try {
            const body = {
                format: config.format,
                startDate: config.startDate instanceof Date 
                    ? config.startDate.toISOString() 
                    : config.startDate,
                endDate: config.endDate instanceof Date 
                    ? config.endDate.toISOString() 
                    : config.endDate,
                includeCharts: config.includeCharts || false,
                sections: config.sections || [],
            };

            const response = await apiClient.post('/admin/reports/export', body, {
                responseType: config.format === 'excel' ? 'arraybuffer' : 'text',
            });

            return response.data;
        } catch (error: any) {
            console.error('Error exporting report:', error);
            throw error;
        }
    }

    /**
     * Get all users (admin management)
     */
    static async getAllUsers(filters: {
        search?: string;
        role?: 'user' | 'admin';
        isActive?: boolean;
        emailVerified?: boolean;
        subscriptionPlan?: 'free' | 'pro' | 'enterprise' | 'plus';
        sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin' | 'totalCost';
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
    } = {}): Promise<AdminUserSummary[]> {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });

            const response = await apiClient.get(`/admin/users?${params.toString()}`);
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }

    /**
     * Get user detail
     */
    static async getUserDetail(userId: string): Promise<UserDetail> {
        try {
            const response = await apiClient.get(`/admin/users/${userId}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching user detail:', error);
            throw error;
        }
    }

    /**
     * Update user status
     */
    static async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
        try {
            await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
        } catch (error: any) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }

    /**
     * Update user role
     */
    static async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
        try {
            await apiClient.patch(`/admin/users/${userId}/role`, { role });
        } catch (error: any) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    /**
     * Delete user
     */
    static async deleteUser(userId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/users/${userId}`);
        } catch (error: any) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(): Promise<UserStats> {
        try {
            const response = await apiClient.get('/admin/users/stats');
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }
}

export interface AdminUserSummary {
    userId: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'user' | 'admin';
    isActive: boolean;
    emailVerified: boolean;
    subscriptionPlan: 'free' | 'pro' | 'enterprise' | 'plus';
    createdAt: string;
    lastLogin?: string;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    projectCount: number;
    workspaceCount: number;
}

export interface UserDetail extends AdminUserSummary {
    workspaceId?: string;
    workspaceMemberships: Array<{
        workspaceId: string;
        workspaceName?: string;
        role: 'owner' | 'admin' | 'developer' | 'viewer';
        joinedAt: string;
    }>;
    projects: Array<{
        projectId: string;
        projectName: string;
        role?: string;
    }>;
    apiKeyCount: number;
    dashboardApiKeyCount: number;
    preferences: {
        emailAlerts: boolean;
        alertThreshold: number;
        optimizationSuggestions: boolean;
    };
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    byPlan: {
        free: number;
        pro: number;
        enterprise: number;
        plus: number;
    };
}

