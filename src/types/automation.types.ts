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

