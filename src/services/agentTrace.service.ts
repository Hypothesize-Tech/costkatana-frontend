import api from '../config/api';

const AGENT_TRACE_BASE = '/agent-trace';

export interface AgentTraceTemplate {
    id: string;
    name: string;
    description: string;
    version: string;
    steps: AgentTraceStep[];
    variables?: Record<string, any>;
    triggers?: any[];
    settings?: {
        timeout?: number;
        retryPolicy?: {
            maxRetries: number;
            backoffStrategy: 'linear' | 'exponential';
            retryDelay: number;
        };
        parallelism?: number;
        caching?: boolean;
    };
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentTraceStep {
    id: string;
    name: string;
    type: 'llm_call' | 'data_processing' | 'api_call' | 'conditional' | 'parallel' | 'custom';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
    metadata?: {
        model?: string;
        provider?: string;
        tokens?: { input: number; output: number; total: number };
        cost?: number;
        retryAttempts?: number;
        cacheHit?: boolean;
        latency?: number;
        [key: string]: any;
    };
    dependencies?: string[];
    conditions?: { if: string; then: string; else?: string };
}

export interface AgentTraceExecution {
    id: string;
    traceId: string;
    name: string;
    userId: string;
    status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    steps: AgentTraceStep[];
    input?: any;
    output?: any;
    error?: string;
    metadata?: {
        totalCost?: number;
        totalTokens?: number;
        cacheHitRate?: number;
        averageLatency?: number;
        environment?: string;
        version?: string;
        tags?: string[];
        [key: string]: any;
    };
    executionTraceId?: string;
    parentExecutionId?: string;
}

export interface AgentTraceMetrics {
    executionCount: number;
    successRate: number;
    averageDuration: number;
    averageCost: number;
    averageTokens: number;
    cacheHitRate: number;
    errorRate: number;
    topErrors: { error: string; count: number; percentage: number }[];
    performanceByStep: {
        stepName: string;
        averageDuration: number;
        successRate: number;
        averageCost: number;
    }[];
    trends: {
        period: string;
        executions: number;
        avgDuration: number;
        avgCost: number;
        successRate: number;
    }[];
}

export interface AgentTraceDetail {
    execution: {
        id: string;
        traceId: string;
        name: string;
        status: string;
        startTime: Date;
        endTime?: Date;
        duration?: number;
    };
    steps: AgentTraceStep[];
    metrics: any;
    timeline: { stepId: string; stepName: string; startTime?: Date; endTime?: Date; duration?: number; status: string }[];
    costBreakdown: {
        totalCost: number;
        stepBreakdown: { stepName: string; cost: number; tokens: number; model?: string }[];
        costPerToken: number;
    };
    performanceInsights: { type: string; message: string; suggestion: string }[];
}

export interface ObservabilityDashboardResponse {
    success: boolean;
    data: ObservabilityDashboard;
}

export interface ObservabilityDashboard {
    overview: {
        totalExecutions: number;
        successRate: number;
        averageDuration: number;
        totalCost: number;
        activeTraces: number;
    };
    recentExecutions: {
        traceId: string;
        traceName: string;
        totalCost: number;
        totalTokens: number;
        requestCount: number;
        averageCost: number;
        steps: {
            step: string;
            sequence: number;
            cost: number;
            tokens: number;
            responseTime: number;
            model: string;
            service: string;
            timestamp: string;
        }[];
        startTime: string;
        endTime: string;
        duration: number;
    }[];
    performanceMetrics: {
        throughput: { period: string; values: number[] };
        latency: { p50: number; p95: number; p99: number };
        errorRate: { current: number; trend: number };
    };
    costAnalysis: {
        totalSpend: number;
        breakdown: { category: string; amount: number; percentage: number }[];
        trend: { daily: number[] };
    };
    alerts: { type: 'warning' | 'info' | 'error'; message: string; timestamp: Date }[];
}

class AgentTraceService {
    async createTemplate(template: Omit<AgentTraceTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentTraceTemplate> {
        const response = await api.post(`${AGENT_TRACE_BASE}/templates`, template);
        return response.data.data;
    }

    async getTemplate(templateId: string): Promise<AgentTraceTemplate> {
        const response = await api.get(`${AGENT_TRACE_BASE}/templates/${templateId}`);
        return response.data.data;
    }

    async executeTrace(
        templateId: string,
        input?: any,
        options?: { variables?: Record<string, any>; environment?: string; tags?: string[] }
    ): Promise<AgentTraceExecution> {
        const response = await api.post(`${AGENT_TRACE_BASE}/templates/${templateId}/execute`, { input, ...options });
        return response.data.data;
    }

    async getExecution(executionId: string): Promise<AgentTraceExecution> {
        const response = await api.get(`${AGENT_TRACE_BASE}/executions/${executionId}`);
        return response.data.data;
    }

    async getTraceDetail(executionId: string): Promise<AgentTraceDetail> {
        const response = await api.get(`${AGENT_TRACE_BASE}/executions/${executionId}/trace`);
        return response.data.data;
    }

    async pauseTrace(executionId: string): Promise<void> {
        await api.post(`${AGENT_TRACE_BASE}/executions/${executionId}/pause`);
    }

    async resumeTrace(executionId: string): Promise<void> {
        await api.post(`${AGENT_TRACE_BASE}/executions/${executionId}/resume`);
    }

    async cancelTrace(executionId: string): Promise<void> {
        await api.post(`${AGENT_TRACE_BASE}/executions/${executionId}/cancel`);
    }

    async getTraceMetrics(traceId: string, timeRange?: string): Promise<AgentTraceMetrics> {
        const params = timeRange ? { timeRange } : {};
        const response = await api.get(`${AGENT_TRACE_BASE}/${traceId}/metrics`, { params });
        return response.data.data;
    }

    async getObservabilityDashboard(timeRange?: string): Promise<ObservabilityDashboardResponse> {
        const params = timeRange ? { timeRange } : {};
        const response = await api.get(`${AGENT_TRACE_BASE}/dashboard`, { params });
        return response.data.data;
    }

    async listTemplates(filters?: { createdBy?: string; tags?: string[]; limit?: number; offset?: number }): Promise<{ templates: AgentTraceTemplate[]; total: number }> {
        const response = await api.get(`${AGENT_TRACE_BASE}/templates`, { params: filters });
        return response.data.data;
    }

    async listExecutions(filters?: { traceId?: string; status?: string; userId?: string; limit?: number; offset?: number; page?: number }): Promise<{ data: any[]; pagination: any }> {
        const response = await api.get(`${AGENT_TRACE_BASE}`, { params: filters });
        return response.data;
    }
}

export const agentTraceService = new AgentTraceService();
