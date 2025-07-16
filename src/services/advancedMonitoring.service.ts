import api from "@/config/api";

export interface TagAnalytics {
    tag: string;
    totalCost: number;
    totalCalls: number;
    averageCost: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
}

export interface RealTimeMetrics {
    tag: string;
    currentCost: number;
    hourlyRate: number;
    projectedDailyCost: number;
    projectedMonthlyCost: number;
}

export interface CostForecast {
    forecasts: Array<{
        date: string;
        predictedCost: number;
        confidence: number;
    }>;
    budgetAlerts?: Array<{
        message: string;
        severity: 'low' | 'medium' | 'high';
    }>;
}

export interface PerformanceCorrelation {
    service: string;
    model: string;
    costPerRequest: number;
    performance: {
        latency: number;
        qualityScore: number;
    };
    efficiency: {
        costEfficiencyScore: number;
        performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
    };
}

export class AdvancedMonitoringService {
    // Tag Analytics
    static async getTagAnalytics(filters?: {
        timeRange?: string;
        tags?: string[];
    }): Promise<TagAnalytics[]> {
        const response = await api.get('/tags/analytics', { params: filters });
        return response.data.data;
    }

    static async getRealTimeMetrics(filters?: {
        tags?: string[];
    }): Promise<RealTimeMetrics[]> {
        const response = await api.get('/tags/realtime', { params: filters });
        return response.data.data;
    }

    // Cost Forecasting
    static async generateCostForecast(params: {
        forecastType: 'hourly' | 'daily' | 'weekly' | 'monthly';
        timeHorizon: number;
        tags?: string[];
    }): Promise<CostForecast> {
        const response = await api.post('/forecasting/generate', params);
        return response.data.data;
    }

    static async getPredictiveAlerts(params: {
        tags?: string[];
        budgetThreshold?: number;
    }): Promise<any> {
        const response = await api.post('/forecasting/alerts', params);
        return response.data.data;
    }

    static async getSpendingPatterns(params: {
        timeRange?: string;
        tags?: string[];
    }): Promise<any> {
        const response = await api.get('/forecasting/patterns', { params });
        return response.data.data;
    }

    // Performance Cost Analysis
    static async analyzeCostPerformanceCorrelation(params: {
        tags?: string[];
        timeRange?: string;
    }): Promise<PerformanceCorrelation[]> {
        const response = await api.post('/performance-cost/analyze', params);
        return response.data.data.correlations;
    }

    static async compareServices(params: {
        services: string[];
        timeRange?: string;
    }): Promise<any> {
        const response = await api.post('/performance-cost/compare', params);
        return response.data.data;
    }

    static async getPerformanceTrends(params: {
        timeRange?: string;
        tags?: string[];
    }): Promise<any> {
        const response = await api.get('/performance-cost/trends', { params });
        return response.data.data;
    }

    static async getOptimizationOpportunities(params: {
        tags?: string[];
        threshold?: number;
    }): Promise<any> {
        const response = await api.get('/performance-cost/opportunities', { params });
        return response.data.data;
    }

    // Tag Management
    static async createTagHierarchy(params: {
        parentTag: string;
        childTags: string[];
        rules?: any;
    }): Promise<any> {
        const response = await api.post('/tags/hierarchy', params);
        return response.data.data;
    }

    static async getTagSuggestions(params: {
        query?: string;
        limit?: number;
    }): Promise<any> {
        const response = await api.get('/tags/suggestions', { params });
        return response.data.data;
    }

    static async createCostAllocationRule(params: {
        name: string;
        conditions: any[];
        actions: any[];
        priority: number;
    }): Promise<any> {
        const response = await api.post('/tags/allocation-rules', params);
        return response.data.data;
    }

    static async compareTags(params: {
        tags: string[];
        timeRange?: string;
        metrics?: string[];
    }): Promise<any> {
        const response = await api.post('/tags/compare', params);
        return response.data.data;
    }
}

export default AdvancedMonitoringService; 