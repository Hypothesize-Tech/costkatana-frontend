export type AutomationPlatform = 'zapier' | 'make' | 'n8n';

export interface AutomationConnection {
    id: string;
    platform: AutomationPlatform;
    name: string;
    description?: string;
    webhookUrl: string;
    status: 'active' | 'inactive' | 'error';
    stats: {
        totalRequests: number;
        totalCost: number;
        totalTokens: number;
        lastActivityAt?: string;
        lastRequestAt?: string;
        averageCostPerRequest: number;
        averageTokensPerRequest: number;
    };
    metadata?: {
        workflowCount?: number;
        lastWorkflowName?: string;
        workflowQuota?: {
            current: number;
            limit: number;
            percentage: number;
            plan: string;
        };
        [key: string]: any;
    };
    healthCheckStatus?: 'healthy' | 'degraded' | 'unhealthy';
    lastHealthCheck?: string;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AutomationWebhookPayload {
    platform: AutomationPlatform;
    workflowId: string;
    workflowName: string;
    workflowStep?: string;
    workflowSequence?: number; // Step order in workflow
    service: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    responseTime?: number;
    metadata?: Record<string, any>;
    tags?: string[];
    prompt?: string;
    completion?: string;
    // Support for non-AI steps
    isAIStep?: boolean; // true for AI steps, false for non-AI steps
    stepType?: 'ai' | 'action' | 'filter' | 'formatter' | 'webhook' | 'other';
    stepApp?: string; // App name (e.g., "OpenAI", "Anthropic", "Google Sheets", etc.)
}

// Support for batch/multi-step payloads
export interface AutomationBatchWebhookPayload {
    platform: AutomationPlatform;
    workflowId: string;
    workflowName: string;
    workflowExecutionId?: string; // Unique ID for this workflow run
    steps: AutomationWebhookPayload[]; // Multiple steps in one request
    totalCost?: number; // Optional: pre-calculated total
    metadata?: Record<string, any>;
    tags?: string[];
}

export interface AutomationWorkflow {
    workflowId: string;
    workflowName: string;
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
    lastActivity: string;
}

export interface AutomationAnalytics {
    platform: string;
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
    averageCostPerRequest: number;
    averageTokensPerRequest: number;
    workflows: AutomationWorkflow[];
    timeSeries: Array<{
        date: string;
        cost: number;
        requests: number;
        tokens: number;
    }>;
}

export interface AutomationStats {
    totalConnections: number;
    activeConnections: number;
    totalCost: number;
    totalRequests: number;
    totalTokens: number;
    platformBreakdown: Array<{
        platform: string;
        connections: number;
        cost: number;
        requests: number;
    }>;
    topWorkflows: Array<{
        workflowId: string;
        workflowName: string;
        platform: string;
        cost: number;
        requests: number;
    }>;
}

export interface AutomationConnectionFormData {
    platform: AutomationPlatform;
    name: string;
    description?: string;
    apiKey?: string;
}

export interface AutomationConnectionStats {
    connection: {
        id: string;
        platform: AutomationPlatform;
        name: string;
        status: 'active' | 'inactive' | 'error';
        stats: AutomationConnection['stats'];
    };
    usage: {
        totalCost: number;
        totalRequests: number;
        totalTokens: number;
        averageCost: number;
        averageTokens: number;
        lastActivity: string | null;
    };
}

export interface WorkflowQuotaStatus {
    current: number;
    limit: number;
    percentage: number;
    plan: string;
    canCreate: boolean;
    violation?: {
        type: string;
        message: string;
        suggestions: string[];
    };
}

export interface WorkflowOptimizationRecommendation {
    type: 'immediate' | 'short_term' | 'long_term';
    category: 'model_switch' | 'caching' | 'redundancy' | 'batching' | 'prompt_optimization' | 'workflow_design';
    title: string;
    description: string;
    workflowId?: string;
    workflowName?: string;
    step?: string;
    currentModel?: string;
    recommendedModel?: string;
    potentialSavings: number;
    potentialSavingsPercentage: number;
    implementationEffort: 'low' | 'medium' | 'high';
    estimatedTimeToImplement?: string;
    steps: string[];
    metadata?: Record<string, any>;
}

export interface WorkflowPerformanceMetrics {
    workflowId: string;
    workflowName: string;
    platform: string;
    totalCost: number;
    totalExecutions: number;
    totalTokens: number;
    averageCostPerExecution: number;
    averageTokensPerExecution: number;
    averageResponseTime: number;
    costPerStep: Array<{
        step: string;
        sequence: number;
        cost: number;
        tokens: number;
        executions: number;
        averageCost: number;
    }>;
    modelUsage: Array<{
        model: string;
        service: string;
        cost: number;
        tokens: number;
        executions: number;
        percentageOfTotal: number;
    }>;
    timeSeries: Array<{
        date: string;
        cost: number;
        executions: number;
        tokens: number;
    }>;
}

export interface OrchestrationOverheadAnalytics {
    totalOrchestrationCost: number;
    totalAICost: number;
    totalCost: number;
    averageOverheadPercentage: number;
    platformBreakdown: Array<{
        platform: string;
        orchestrationCost: number;
        aiCost: number;
        totalCost: number;
        overheadPercentage: number;
    }>;
}

export interface WorkflowROIMetrics {
    workflowId: string;
    workflowName: string;
    platform: string;
    timeRange: {
        startDate: string;
        endDate: string;
    };
    totalCost: number;
    totalOrchestrationCost: number;
    totalAICost: number;
    previousPeriodCost: number;
    costChange: number;
    costChangePercentage: number;
    totalExecutions: number;
    averageCostPerExecution: number;
    costPerStep: Array<{
        step: string;
        sequence: number;
        cost: number;
        executions: number;
        averageCost: number;
    }>;
    costPerOutcome?: number;
    outcomes?: Array<{
        type: string;
        count: number;
        totalCost: number;
        averageCost: number;
    }>;
    efficiencyScore: number;
    efficiencyFactors: {
        costPerExecution: number;
        orchestrationOverhead: number;
        modelEfficiency: number;
        cachingUtilization: number;
    };
    roiRank?: number;
    totalWorkflows?: number;
    trends: {
        dailyCosts: Array<{ date: string; cost: number; executions: number }>;
        costPerExecutionTrend: 'improving' | 'degrading' | 'stable';
    };
}

export interface WorkflowAlertConfig {
    workflowId?: string;
    userId: string;
    budgetThreshold?: number;
    budgetThresholdPercentages?: number[];
    spikeThreshold?: number;
    inefficiencyThreshold?: number;
    failureRateThreshold?: number;
    enabled: boolean;
    channels?: string[];
}

export interface WorkflowAlert {
    id: string;
    userId: string;
    type: 'workflow_budget' | 'workflow_spike' | 'workflow_inefficiency' | 'workflow_failure' | 'workflow_quota';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    data: {
        workflowId?: string;
        workflowName?: string;
        currentValue?: number;
        threshold?: number;
        percentage?: number;
        percentageIncrease?: number;
        costPerExecution?: number;
        failureRate?: number;
        totalErrors?: number;
        totalRequests?: number;
        suggestions?: string[];
        [key: string]: any;
    };
    actionRequired: boolean;
    sent: boolean;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowVersion {
    id: string;
    userId: string;
    automationConnectionId: string;
    workflowId: string;
    workflowName: string;
    versionNumber: number;
    changes: Array<{
        type: 'cost_change' | 'model_change' | 'step_add' | 'step_remove' | 'step_modify' | 'trigger_change' | 'metadata_change';
        description: string;
        details: Record<string, any>;
        timestamp: string;
    }>;
    snapshot: {
        platform: 'zapier' | 'make' | 'n8n';
        steps: Array<{
            stepName: string;
            stepType: string;
            service?: string;
            model?: string;
            estimatedCost?: number;
            isAIStep: boolean;
            metadata?: Record<string, any>;
        }>;
        totalEstimatedCost: number;
        totalEstimatedTokens: number;
        metadata?: Record<string, any>;
    };
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowVersionComparison {
    version1: WorkflowVersion | null;
    version2: WorkflowVersion | null;
    differences: Array<{
        type: 'cost_change' | 'model_change' | 'step_add' | 'step_remove' | 'step_modify' | 'trigger_change' | 'metadata_change';
        description: string;
        details: Record<string, any>;
    }>;
    costImpact: number;
}

