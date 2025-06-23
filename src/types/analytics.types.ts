export interface Analytics {
    period: {
        startDate: string;
        endDate: string;
    };
    summary: AnalyticsSummary;
    timeSeries: TimeSeriesData[];
    serviceBreakdown: ServiceAnalytics[];
    modelBreakdown: ModelAnalytics[];
    topPrompts: TopPrompt[];
    optimizationStats: OptimizationStats;
    trends: TrendAnalysis;
    predictions?: Predictions;
}

export interface AnalyticsSummary {
    totalCost: number;
    totalTokens: number;
    totalCalls: number;
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
    calls: number;
}

export interface ServiceAnalytics {
    service: string;
    totalCost: number;
    totalTokens: number;
    totalCalls: number;
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
    avgCost: number;
    avgTokens: number;
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
    overview: {
        totalCost: MetricWithChange;
        totalCalls: MetricWithChange;
        avgCostPerCall: MetricWithChange;
        totalOptimizationSavings: MetricWithChange;
    };
    charts: {
        costOverTime: TimeSeriesData[];
        serviceBreakdown: ServiceAnalytics[];
        modelUsage: ModelAnalytics[];
    };
    recentActivity: {
        topPrompts: TopPrompt[];
        optimizationOpportunities: number;
    };
    insights: string[];
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