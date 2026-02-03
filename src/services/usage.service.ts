// src/services/usage.service.ts
import { apiClient } from '../config/api';
import { 
    Usage, 
    UsageFilters, 
    DetailedUsageContext
} from '../types';

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
        projectId?: string;
        q?: string;
        minCost?: string;
        maxCost?: string;
        userEmail?: string;
        customerEmail?: string;
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
            totalTokens: number;
            totalPromptTokens: number;
            totalCompletionTokens: number;
            totalCalls: number;
            avgResponseTime: number;
            avgCostPerCall: number;
            chartData: Array<{
                cost: number;
                calls: number;
                tokens: number;
                date: string;
            }>;
        };
    }> {
        try {
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }

            const response = await apiClient.get('/usage', { params: requestParams });
            const responseData = response.data;
            
            // Handle both success and direct data structures
            const data = responseData.success ? responseData.data : responseData;
            const pagination = responseData.success ? responseData.pagination : null;

            // Transform backend data to match frontend expectations
            const transformedUsage = (data || []).map((item: any) => ({
                _id: item._id,
                userId: typeof item.userId === 'object' ? item.userId._id : item.userId,
                projectId: item.projectId,
                service: item.service,
                model: item.model,
                prompt: item.prompt,
                completion: item.completion,
                promptTokens: item.promptTokens || 0,
                completionTokens: item.completionTokens || 0,
                totalTokens: item.totalTokens || (item.promptTokens + item.completionTokens) || 0,
                cost: item.cost || 0,
                responseTime: item.responseTime || 0,
                metadata: {
                    ...item.metadata,
                    // Ensure messages array is properly handled
                    messages: Array.isArray(item.metadata?.messages) ? item.metadata.messages : undefined,
                    // Ensure system message is captured
                    system: item.metadata?.system || item.metadata?.systemMessage,
                    // Ensure prompt is captured in metadata if not at root level
                    prompt: item.metadata?.prompt || item.prompt,
                    // Ensure input is captured
                    input: item.metadata?.input || item.prompt
                },
                tags: item.tags || [],
                optimizationApplied: item.optimizationApplied || false,
                optimizationId: item.optimizationId,
                errorOccurred: item.errorOccurred || false,
                errorMessage: item.errorMessage,
                // Email tracking fields
                userEmail: item.userEmail,
                customerEmail: item.customerEmail,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                // Comprehensive tracking (headers, request/response body, network)
                requestTracking: item.requestTracking
            }));

            // Use backend pagination if available, otherwise calculate client-side
            const currentPage = pagination?.page || params?.page || 1;
            const itemsPerPage = pagination?.limit || params?.limit || 20;
            const totalItems = pagination?.total || transformedUsage.length;
            const totalPages = pagination?.pages || Math.ceil(totalItems / itemsPerPage);

            // Extract summary from backend response if available, otherwise calculate from current page
            const backendSummary = responseData.summary || {};
            
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
                    hasNext: pagination?.hasNext || currentPage < totalPages,
                    hasPrev: pagination?.hasPrev || currentPage > 1
                },
                summary: {
                    totalCost: backendSummary.totalCost || transformedUsage.reduce((sum: number, item: Usage) => sum + item.cost, 0),
                    totalTokens: backendSummary.totalTokens || transformedUsage.reduce((sum: number, item: Usage) => sum + (item.totalTokens || item.promptTokens + item.completionTokens), 0),
                    totalPromptTokens: backendSummary.totalPromptTokens || transformedUsage.reduce((sum: number, item: Usage) => sum + item.promptTokens, 0),
                    totalCompletionTokens: backendSummary.totalCompletionTokens || transformedUsage.reduce((sum: number, item: Usage) => sum + item.completionTokens, 0),
                    totalCalls: backendSummary.totalCalls || transformedUsage.length,
                    avgResponseTime: backendSummary.avgResponseTime || (transformedUsage.length > 0 ? transformedUsage.reduce((sum: number, item: Usage) => sum + (item.responseTime || 0), 0) / transformedUsage.length : 0),
                    avgCostPerCall: backendSummary.avgCostPerCall || (transformedUsage.length > 0 ? transformedUsage.reduce((sum: number, item: Usage) => sum + item.cost, 0) / transformedUsage.length : 0),
                    chartData: backendSummary.chartData || []
                }
            };
        } catch (error) {
            console.error('Error fetching usage:', error);
            // Re-throw the error to let React Query handle it properly
            throw error;
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

    /**
     * Fetch full network details (headers, request/response body) for a usage record.
     * Use when opening Request Details modal to show comprehensive tracking data.
     */
    async getNetworkDetails(usageId: string): Promise<{ requestTracking?: Usage['requestTracking'] }> {
        try {
            const response = await apiClient.get(`/usage/${usageId}/network-details`);
            return response.data?.data ?? {};
        } catch (error) {
            console.error('Error fetching network details:', error);
            return {};
        }
    }

    /**
     * Fetch optimization suggestions for a usage record (existing opportunities + generated).
     */
    async getOptimizationSuggestions(usageId: string): Promise<{
        existing?: unknown;
        generated?: Array<{ type?: string; priority?: string; title?: string; description?: string; potentialSavings?: number; implementation?: string }>;
        context?: { model?: string; service?: string; cost?: number; tokens?: number; responseTime?: number };
    }> {
        try {
            const response = await apiClient.get(`/usage/${usageId}/optimization-suggestions`);
            const data = response.data?.data;
            return data ?? { existing: undefined, generated: [], context: undefined };
        } catch (error) {
            console.error('Error fetching optimization suggestions:', error);
            return { generated: [], context: undefined };
        }
    }

    async createUsage(usageData: Partial<Usage> & { projectId?: string }): Promise<Usage> {
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
        projectId?: string;
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
                    if (key === 'projectId' && value && value !== 'all') {
                        formData.append(key, value.toString());
                    } else if (key !== 'projectId') {
                        formData.append(key, value.toString());
                    }
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

    async getUsageStats(timeframe: '24h' | '7d' | '30d' | '90d' = '7d', projectId?: string): Promise<{
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
            const params: any = { timeframe };
            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }
            const response = await apiClient.get('/usage/stats', { params });
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

    async getUsageSummary(timeframe: '24h' | '7d' | '30d' | '90d' = '7d', projectId?: string): Promise<{
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
            const params: any = { timeframe };
            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }
            const response = await apiClient.get('/usage/stats', { params });
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
        projectId?: string;
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
            const analyticsParams: any = {
                startDate: this.getStartDate(params.timeframe),
                endDate: new Date().toISOString(),
                groupBy: params.groupBy,
                service: params.service,
                model: params.model
            };

            if (params.projectId && params.projectId !== 'all') {
                analyticsParams.projectId = params.projectId;
            }

            const response = await apiClient.get('/analytics', { params: analyticsParams });

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

    async getServiceBreakdown(timeframe: '24h' | '7d' | '30d' | '90d' = '7d', projectId?: string): Promise<{
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
            const params: any = {
                startDate: this.getStartDate(timeframe),
                endDate: new Date().toISOString()
            };

            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }

            const response = await apiClient.get('/analytics', { params });

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
        projectId?: string;
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
            const requestParams: any = { ...params };
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/usage/top-users', { params: requestParams });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching top users:', error);
            return {
                users: []
            };
        }
    }

    async getPropertyAnalytics(params: {
        groupBy: string;
        startDate?: string;
        endDate?: string;
        projectId?: string;
    }): Promise<{
        groupBy: string;
        data: Array<{
            propertyValue: string;
            totalCost: number;
            totalTokens: number;
            totalRequests: number;
            averageCost: number;
            averageTokens: number;
            averageResponseTime: number;
        }>;
        totals: {
            totalCost: number;
            totalTokens: number;
            totalRequests: number;
        };
        summary: {
            uniqueValues: number;
            totalCost: number;
            totalTokens: number;
            totalRequests: number;
        };
    }> {
        try {
            const response = await apiClient.get('/usage/properties/analytics', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching property analytics:', error);
            throw error;
        }
    }

    async getAvailableProperties(params?: {
        startDate?: string;
        endDate?: string;
        projectId?: string;
    }): Promise<Array<{
        property: string;
        count: number;
        sampleValues: string[];
    }>> {
        try {
            const response = await apiClient.get('/usage/properties/available', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching available properties:', error);
            throw error;
        }
    }

    async updateUsageProperties(usageId: string, properties: Record<string, any>): Promise<{
        id: string;
        updatedProperties: string[];
        metadata: Record<string, any>;
    }> {
        try {
            const response = await apiClient.put(`/usage/${usageId}/properties`, properties);
            return response.data.data;
        } catch (error) {
            console.error('Error updating usage properties:', error);
            throw error;
        }
    }

    async exportUsage(params: {
        format: 'csv' | 'excel' | 'json';
        startDate?: string;
        endDate?: string;
        service?: string;
        model?: string;
        includeDetails?: boolean;
        projectId?: string;
    }): Promise<Blob> {
        try {
            const requestParams: any = { ...params };
            if (params.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/usage/export', {
                params: requestParams,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting usage:', error);
            throw error;
        }
    }

    async getUsageInsights(timeframe: '7d' | '30d' | '90d' = '30d', projectId?: string): Promise<{
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
            const params: any = {
                startDate: this.getStartDate(timeframe),
                endDate: new Date().toISOString()
            };

            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }

            const response = await apiClient.get('/analytics/insights', { params });
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
            const requestParams: any = { q: query };
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (key === 'projectId' && value === 'all') {
                            // Don't include projectId if it's 'all'
                            return;
                        }
                        requestParams[key] = value;
                    }
                });
            }
            const response = await apiClient.get('/usage/search', { params: requestParams });
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
        projectId?: string;
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
        projectId?: string;
    }): Promise<Usage[]> {
        try {
            const requestParams: any = { ...params };
            if (params.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            const response = await apiClient.get('/usage', { params: requestParams });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage history:', error);
            return [];
        }
    }

    // Helper method to get start date based on timeframe
    private getStartDate(timeframe: string): string {
        const now = new Date();
        switch (timeframe) {
            case '24h':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            case '90d':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
            default:
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        }
    }

    // New methods for real-time usage tracking dashboard
    async getRealTimeUsageSummary(projectId?: string): Promise<{
        currentPeriod: {
            totalCost: number;
            totalTokens: number;
            totalRequests: number;
            avgResponseTime: number;
            errorCount: number;
            successCount: number;
        };
        previousPeriod: {
            totalCost: number;
            totalTokens: number;
            totalRequests: number;
            avgResponseTime: number;
        };
        changes: {
            cost: number;
            requests: number;
            tokens: number;
        };
        modelBreakdown: Array<{
            _id: string;
            totalCost: number;
            totalTokens: number;
            requestCount: number;
            avgResponseTime: number;
            errorCount: number;
        }>;
        serviceBreakdown: Array<{
            _id: string;
            totalCost: number;
            totalTokens: number;
            requestCount: number;
            avgResponseTime: number;
            errorCount: number;
        }>;
        recentRequests: Array<{
            timestamp: Date;
            model: string;
            service: string;
            status: 'success' | 'error';
            statusCode: number;
        }>;
    }> {
        try {
            const params: any = {};
            if (projectId && projectId !== 'all') {
                params.projectId = projectId;
            }

            const response = await apiClient.get('/usage/realtime/summary', { params });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching real-time usage summary:', error);
            throw error;
        }
    }

    async getRealTimeRequests(params?: {
        projectId?: string;
        limit?: number;
    }): Promise<{
        data: Array<{
            id: string;
            timestamp: Date;
            model: string;
            service: string;
            status: 'success' | 'error';
            statusCode: number;
            latency: number;
            totalTokens: number;
            cost: number;
            user: string;
            errorMessage?: string;
            ipAddress?: string;
            userAgent?: string;
            metadata?: Record<string, any>;
        }>;
    }> {
        try {
            const requestParams: any = {};
            if (params?.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }
            if (params?.limit) {
                requestParams.limit = params.limit;
            }

            const response = await apiClient.get('/usage/realtime/requests', { params: requestParams });
            return response.data;
        } catch (error) {
            console.error('Error fetching real-time requests:', error);
            throw error;
        }
    }

    async getUsageAnalytics(params: {
        timeRange?: '1h' | '24h' | '7d' | '30d';
        status?: 'all' | 'success' | 'error';
        model?: string;
        service?: string;
        projectId?: string;
    }): Promise<{
        data: {
            requests: Array<{
                id: string;
                timestamp: Date;
                model: string;
                service: string;
                status: 'success' | 'error';
                statusCode: number;
                latency: number;
                totalTokens: number;
                cost: number;
                user: string;
            }>;
            stats: {
                totalCost: number;
                totalTokens: number;
                totalRequests: number;
                avgResponseTime: number;
                errorCount: number;
                successCount: number;
                successRate: string;
            };
        };
    }> {
        try {
            const requestParams: any = {};
            if (params.timeRange) requestParams.timeRange = params.timeRange;
            if (params.status) requestParams.status = params.status;
            if (params.model) requestParams.model = params.model;
            if (params.service) requestParams.service = params.service;
            if (params.projectId && params.projectId !== 'all') {
                requestParams.projectId = params.projectId;
            }

            const response = await apiClient.get('/usage/analytics', { params: requestParams });
            return response.data;
        } catch (error) {
            console.error('Error fetching usage analytics:', error);
            throw error;
        }
    }

    // Enhanced context methods for detailed usage analysis
    async getDetailedUsageContext(usageId: string, params?: {
        includeTemplateUsage?: boolean;
        includeWorkflowTrace?: boolean;
        includeAnalytics?: boolean;
        includePerformanceMetrics?: boolean;
    }): Promise<DetailedUsageContext> {
        try {
            // Get the basic usage record first with context
            const usage = await this.getUsageById(usageId);

            // Initialize detailed context
            const detailedContext: DetailedUsageContext = {
                usage,
                templateUsage: undefined,
                workflowTrace: undefined,
                performanceAnalysis: undefined,
                businessContext: undefined,
                historicalTrends: undefined,
                relatedRequests: undefined,
            };

            // Prepare additional data fetching with lazy loading
            const enhancementPromises: Promise<any>[] = [];

            // Add analytics if requested
            if (params?.includeAnalytics) {
                enhancementPromises.push(
                    this.getUsageAnalytics({
                        projectId: usage.projectId as string,
                        timeRange: '7d',
                        model: usage.model,
                        service: usage.service,
                    }).catch(error => {
                        console.warn('Failed to fetch analytics for detailed context:', error);
                        return null;
                    })
                );
            }

            // Fetch related requests based on trace or workflow ID with caching
            if (usage.traceId || usage.workflowId) {
                const searchParams: any = {
                    limit: 20,
                };
                
                if (usage.traceId) {
                    searchParams.q = usage.traceId;
                }
                
                enhancementPromises.push(
                    this.getUsage(searchParams).catch(error => {
                        console.warn('Failed to fetch related requests:', error);
                        return null;
                    })
                );
            }

            // Execute additional data fetching in parallel
            const results = await Promise.allSettled(enhancementPromises);
            let resultIndex = 0;

            // Process analytics if requested
            if (params?.includeAnalytics && results[resultIndex]) {
                const analyticsResult = results[resultIndex];
                if (analyticsResult.status === 'fulfilled' && analyticsResult.value) {
                    detailedContext.historicalTrends = {
                        requests: analyticsResult.value.data.requests,
                        stats: analyticsResult.value.data.stats,
                    };
                }
                resultIndex++;
            }

            // Process related requests
            if ((usage.traceId || usage.workflowId) && results[resultIndex]) {
                const relatedResult = results[resultIndex];
                if (relatedResult.status === 'fulfilled' && relatedResult.value) {
                    detailedContext.relatedRequests = relatedResult.value.usage.filter(
                        (u: Usage) => u._id !== usageId
                    );
                }
            }

            // Extract business context from metadata and fields (cached calculation)
            detailedContext.businessContext = {
                department: usage.metadata?.department,
                team: usage.metadata?.team,
                purpose: usage.metadata?.purpose,
                client: usage.metadata?.client,
                userEmail: usage.userEmail,
                customerEmail: usage.customerEmail,
                projectContext: usage.projectId,
            };

            // Extract workflow/template context
            if (usage.traceId || usage.traceName) {
                detailedContext.workflowTrace = {
                    traceId: usage.traceId,
                    traceName: usage.traceName,
                    traceStep: usage.traceStep,
                    traceSequence: usage.traceSequence,
                    workflowId: usage.workflowId,
                    workflowName: usage.workflowName,
                    workflowStep: usage.workflowStep,
                    workflowSequence: usage.workflowSequence,
                };
            }

            // Calculate performance analysis (cached computation)
            detailedContext.performanceAnalysis = {
                tokenBreakdown: {
                    promptTokens: usage.promptTokens,
                    completionTokens: usage.completionTokens,
                    totalTokens: usage.totalTokens,
                    costPerToken: usage.cost / usage.totalTokens,
                },
                responseMetrics: {
                    responseTime: usage.responseTime,
                    status: usage.errorOccurred ? 'error' : 'success',
                    errorType: usage.errorType,
                    httpStatusCode: usage.httpStatusCode,
                },
                costAnalysis: {
                    totalCost: usage.cost,
                    costBreakdown: {
                        inputCost: (usage.promptTokens / usage.totalTokens) * usage.cost,
                        outputCost: (usage.completionTokens / usage.totalTokens) * usage.cost,
                    },
                    optimizationApplied: usage.optimizationApplied,
                    optimizationId: usage.optimizationId,
                },
            };

            // Extract template context from metadata
            if (usage.metadata?.templateId || usage.metadata?.templateName) {
                detailedContext.templateUsage = {
                    templateId: usage.metadata.templateId,
                    templateName: usage.metadata.templateName,
                    variableResolution: usage.metadata.templateVariables,
                    templateVersion: usage.metadata.templateVersion,
                };
            }

            return detailedContext;
        } catch (error) {
            console.error('Error fetching detailed usage context:', error);
            throw error;
        }
    }
}

export const usageService = new UsageService();
export { UsageService };