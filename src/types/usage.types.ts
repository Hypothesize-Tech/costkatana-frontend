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
    // Enhanced error tracking
    httpStatusCode?: number;
    errorType?: 'client_error' | 'server_error' | 'network_error' | 'auth_error' | 'rate_limit' | 'timeout' | 'validation_error' | 'integration_error';
    errorDetails?: {
        code?: string;
        type?: string;
        statusText?: string;
        requestId?: string;
        timestamp?: string;
        endpoint?: string;
        method?: string;
        userAgent?: string;
        clientVersion?: string;
        [key: string]: any;
    };
    isClientError?: boolean;
    isServerError?: boolean;
    ipAddress?: string;
    userAgent?: string;
    traceId?: string;
    traceName?: string;
    traceStep?: string;
    traceSequence?: number;
    workflowId?: string;
    workflowName?: string;
    workflowStep?: string;
    workflowSequence?: number;
    // Email tracking fields
    userEmail?: string;
    customerEmail?: string;
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
    // Email filter fields
    userEmail?: string;
    customerEmail?: string;
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

export interface UsageContext {
    usage: Usage[];
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
        totalCalls: number;
        avgCostPerCall: number;
    };
}

export interface UsageTrendAnalysis {
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
}

export interface TemplateUsageInfo {
    templateId?: string;
    templateName?: string;
    variableResolution?: Record<string, any>;
    templateVersion?: string;
}

export interface WorkflowTrace {
    traceId?: string;
    traceName?: string;
    traceStep?: string;
    traceSequence?: number;
    workflowId?: string;
    workflowName?: string;
    workflowStep?: string;
    workflowSequence?: number;
}

export interface ProjectBreakdown {
    projectId: string;
    projectName: string;
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    avgResponseTime: number;
    errorRate: number;
}

export interface BusinessContext {
    department?: string;
    team?: string;
    purpose?: string;
    client?: string;
    userEmail?: string;
    customerEmail?: string;
    projectContext?: string | { _id: string; name: string };
}

export interface PerformanceAnalysis {
    tokenBreakdown: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        costPerToken: number;
    };
    responseMetrics: {
        responseTime: number;
        status: 'success' | 'error';
        errorType?: 'client_error' | 'server_error' | 'network_error' | 'auth_error' | 'rate_limit' | 'timeout' | 'validation_error' | 'integration_error';
        httpStatusCode?: number;
    };
    costAnalysis: {
        totalCost: number;
        costBreakdown: {
            inputCost: number;
            outputCost: number;
        };
        optimizationApplied: boolean;
        optimizationId?: string;
    };
}

export interface DetailedUsageContext {
    usage: Usage;
    templateUsage?: TemplateUsageInfo;
    workflowTrace?: WorkflowTrace;
    performanceAnalysis?: PerformanceAnalysis;
    businessContext?: BusinessContext;
    historicalTrends?: UsageTrendAnalysis;
    relatedRequests?: Usage[];
}