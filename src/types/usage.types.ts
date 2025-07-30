export type AIService = 'openai' | 'aws-bedrock' | 'google-ai' | 'anthropic' | 'huggingface' | 'cohere';

export interface Usage {
    _id: string;
    userId: string;
    projectId?: string | { _id: string; name: string };
    service: AIService;
    model: string;
    prompt: string;
    completion?: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    responseTime: number;
    metadata?: Record<string, any>;
    tags?: string[];
    optimizationApplied: boolean;
    optimizationId?: string;
    errorOccurred: boolean;
    errorMessage?: string;
    // Workflow tracking fields
    workflowId?: string;
    workflowName?: string;
    workflowStep?: string;
    workflowSequence?: number;
    createdAt: string;
    updatedAt: string;
}

export interface UsageStats {
    period: 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    summary: {
        totalCost: number;
        totalTokens: number;
        totalCalls: number;
        avgCost: number;
        avgTokens: number;
        avgResponseTime: number;
    };
    serviceBreakdown: ServiceBreakdown[];
    modelBreakdown: ModelBreakdown[];
    totalSpent?: number;
    totalSaved?: number;
    apiCalls?: number;
    optimizations?: number;
    currentMonthSpent?: number;
    currentMonthSaved?: number;
    avgDailyCost?: number;
    mostUsedService?: string;
    mostUsedModel?: string;
    accountAge?: number;
}

export interface ServiceBreakdown {
    service: string;
    cost: number;
    tokens: number;
    calls: number;
}

export interface ModelBreakdown {
    service: string;
    model: string;
    cost: number;
    tokens: number;
    calls: number;
}

export interface UsageFilters {
    projectId?: string;
    service?: AIService;
    model?: string;
    startDate?: string;
    endDate?: string;
    dateRange?: string;
    tags?: string[];
    minCost?: number;
    maxCost?: number;
    customProperties?: Record<string, string>;
}

export interface TrackUsageData {
    projectId?: string;
    service: AIService;
    model: string;
    prompt: string;
    completion?: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    responseTime: number;
    metadata?: Record<string, any>;
    tags?: string[];
}

export interface UsageAnomaly {
    timestamp: string;
    type: 'cost_spike' | 'token_spike' | 'unusual_pattern';
    severity: 'low' | 'medium' | 'high';
    description: string;
}