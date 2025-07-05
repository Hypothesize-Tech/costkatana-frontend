export interface Analytics {
    period: {
        startDate: string;
        endDate: string;
    };
    summary: AnalyticsSummary;
    timeSeries: TimeSeriesData[];
    timeline?: TimeSeriesData[];
    serviceBreakdown: ServiceAnalytics[];
    modelBreakdown: ModelAnalytics[];
    topPrompts: TopPrompt[];
    optimizationStats: OptimizationStats;
    trends: TrendAnalysis;
    predictions?: Predictions;
    breakdown?: {
        services: Array<{
            service: string;
            cost: number;
            percentage: number;
            requests: number;
        }>;
        models: Array<{
            model: string;
            cost: number;
            percentage: number;
            requests: number;
        }>;
    };
}

export interface AnalyticsSummary {
    totalCost: number;
    totalTokens: number;
    totalCalls: number;
    totalRequests?: number;
    avgCost: number;
    avgTokens: number;
    avgResponseTime: number;
    uniqueServicesCount: number;
    uniqueModelsCount: number;
}

export interface TimeSeriesData {
    date: string;
    cost: number;
    tokens: number;
    calls?: number;
    requests?: number;
}

export interface ServiceAnalytics {
    service: string;
    totalCost: number;
    totalTokens: number;
    totalCalls: number;
    calls?: number;
    percentage?: number;
    avgCost: number;
    avgTokens: number;
    trend: 'up' | 'down' | 'stable';
    percentageChange: number;
}

export interface ModelAnalytics {
    service: string;
    model: string;
    totalCost: number;
    totalTokens: number;
    totalCalls: number;
    calls?: number;
    avgCost: number;
    avgTokens: number;
    cost?: number;
    percentage?: number;
}

export interface TopPrompt {
    prompt: string;
    fullPrompt?: string;
    totalCost: number;
    totalCalls: number;
    avgCost: number;
    lastUsed: string;
    services: string[];
    models: string[];
    avgTokens?: number;
}

export interface OptimizationStats {
    totalOptimizations: number;
    totalSaved: number;
    totalTokensSaved: number;
    avgImprovement: number;
    appliedCount: number;
    applicationRate: number;
}

export interface TrendAnalysis {
    costTrend: 'up' | 'down' | 'stable';
    tokenTrend: 'up' | 'down' | 'stable';
    costSlope?: number;
    tokenSlope?: number;
    insights: string[];
}

export interface Predictions {
    next7Days: {
        estimatedCost: number;
        estimatedTokens: number;
        confidence: number;
    };
    next30Days: {
        estimatedCost: number;
        estimatedTokens: number;
        confidence: number;
    };
    insights: string[];
    recommendations: string[];
}

export interface DashboardData {
    stats: DashboardStats;
    chartData: Array<{
        date: string;
        cost: number;
        tokens: number;
        requests: number;
        calls?: number; // For backward compatibility
    }>;
    serviceBreakdown: Array<{
        service: string;
        cost: number;
        requests: number;
        percentage: number;
        totalCost?: number; // For backward compatibility
        totalTokens?: number;
        totalCalls?: number;
        calls?: number;
        avgCost?: number;
        avgTokens?: number;
        trend?: 'up' | 'down' | 'stable';
        percentageChange?: number;
    }>;
    recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        cost: number;
    }>;
    projectBreakdown?: Array<{
        projectId: string;
        projectName: string;
        cost: number;
        requests: number;
        percentage: number;
        budgetUtilization?: number;
    }>;
}

export interface DashboardStats {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCostPerRequest: number;
    costChange?: number;
    tokensChange?: number;
    requestsChange?: number;
}

export interface MetricWithChange {
    value: number;
    change: {
        value: number;
        percentage: number;
        trend: 'up' | 'down' | 'stable';
    };
}

export interface ComparativeAnalytics {
    period1: Analytics;
    period2: Analytics;
    comparison: {
        cost: ComparisonMetric;
        tokens: ComparisonMetric;
        calls: ComparisonMetric;
        avgCostPerCall: ComparisonMetric;
    };
}

export interface ComparisonMetric {
    period1: number;
    period2: number;
    change: number;
    percentageChange: number;
}

export interface AnalyticsData {
    summary: {
        totalCost: number;
        totalTokens: number;
        totalRequests: number;
        averageCostPerRequest: number;
        budgetUtilization?: number;
    };
    timeline: Array<{
        date: string;
        cost: number;
        tokens: number;
        requests: number;
        calls?: number;
    }>;
    breakdown: {
        services: Array<{
            service: string;
            cost: number;
            percentage: number;
            requests: number;
            calls?: number;
        }>;
        models: Array<{
            model: string;
            cost: number;
            percentage: number;
            requests: number;
            calls?: number;
            avgTokens?: number;
            avgCost?: number;
        }>;
    };
    trends: TrendAnalysis;
    insights: string[];
}