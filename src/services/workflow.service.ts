import api from '../config/api';

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    version: string;
    steps: WorkflowStep[];
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

export interface WorkflowStep {
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
        tokens?: {
            input: number;
            output: number;
            total: number;
        };
        cost?: number;
        retryAttempts?: number;
        cacheHit?: boolean;
        latency?: number;
        [key: string]: any;
    };
    dependencies?: string[];
    conditions?: {
        if: string;
        then: string;
        else?: string;
    };
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    name: string;
    userId: string;
    status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    steps: WorkflowStep[];
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
    traceId: string;
    parentExecutionId?: string;
}

export interface WorkflowMetrics {
    executionCount: number;
    successRate: number;
    averageDuration: number;
    averageCost: number;
    averageTokens: number;
    cacheHitRate: number;
    errorRate: number;
    topErrors: {
        error: string;
        count: number;
        percentage: number;
    }[];
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

export interface WorkflowTrace {
    execution: {
        id: string;
        workflowId: string;
        name: string;
        status: string;
        startTime: Date;
        endTime?: Date;
        duration?: number;
        traceId: string;
    };
    steps: WorkflowStep[];
    metrics: any;
    timeline: {
        stepId: string;
        stepName: string;
        startTime?: Date;
        endTime?: Date;
        duration?: number;
        status: string;
    }[];
    costBreakdown: {
        totalCost: number;
        stepBreakdown: {
            stepName: string;
            cost: number;
            tokens: number;
            model?: string;
        }[];
        costPerToken: number;
    };
    performanceInsights: {
        type: string;
        message: string;
        suggestion: string;
    }[];
}

export interface ObservabilityDashboard {
    overview: {
        totalExecutions: number;
        successRate: number;
        averageDuration: number;
        totalCost: number;
        activeWorkflows: number;
    };
    recentExecutions: {
        id: string;
        workflowName: string;
        status: string;
        duration: number | null;
        cost: number;
        startTime: Date;
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
    alerts: {
        type: 'warning' | 'info' | 'error';
        message: string;
        timestamp: Date;
    }[];
}

class WorkflowService {
    /**
     * Create a new workflow template
     */
    async createTemplate(template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowTemplate> {
        try {
            const response = await api.post('/workflows/templates', template);
            return response.data.data;
        } catch (error) {
            console.error('Failed to create workflow template:', error);
            throw error;
        }
    }

    /**
     * Get workflow template by ID
     */
    async getTemplate(templateId: string): Promise<WorkflowTemplate> {
        try {
            const response = await api.get(`/workflows/templates/${templateId}`);
            return response.data.data;
        } catch (error) {
            console.error('Failed to get workflow template:', error);
            throw error;
        }
    }

    /**
     * Execute a workflow
     */
    async executeWorkflow(
        templateId: string,
        input?: any,
        options?: {
            variables?: Record<string, any>;
            environment?: string;
            tags?: string[];
        }
    ): Promise<WorkflowExecution> {
        try {
            const response = await api.post(`/workflows/templates/${templateId}/execute`, {
                input,
                ...options
            });
            return response.data.data;
        } catch (error) {
            console.error('Failed to execute workflow:', error);
            throw error;
        }
    }

    /**
     * Get workflow execution status
     */
    async getExecution(executionId: string): Promise<WorkflowExecution> {
        try {
            const response = await api.get(`/workflows/executions/${executionId}`);
            return response.data.data;
        } catch (error) {
            console.error('Failed to get workflow execution:', error);
            throw error;
        }
    }

    /**
     * Get workflow execution trace
     */
    async getWorkflowTrace(executionId: string): Promise<WorkflowTrace> {
        try {
            const response = await api.get(`/workflows/executions/${executionId}/trace`);
            return response.data.data;
        } catch (error) {
            console.error('Failed to get workflow trace:', error);
            throw error;
        }
    }

    /**
     * Pause workflow execution
     */
    async pauseWorkflow(executionId: string): Promise<void> {
        try {
            await api.post(`/workflows/executions/${executionId}/pause`);
        } catch (error) {
            console.error('Failed to pause workflow:', error);
            throw error;
        }
    }

    /**
     * Resume workflow execution
     */
    async resumeWorkflow(executionId: string): Promise<void> {
        try {
            await api.post(`/workflows/executions/${executionId}/resume`);
        } catch (error) {
            console.error('Failed to resume workflow:', error);
            throw error;
        }
    }

    /**
     * Cancel workflow execution
     */
    async cancelWorkflow(executionId: string): Promise<void> {
        try {
            await api.post(`/workflows/executions/${executionId}/cancel`);
        } catch (error) {
            console.error('Failed to cancel workflow:', error);
            throw error;
        }
    }

    /**
     * Get workflow metrics
     */
    async getWorkflowMetrics(workflowId: string, timeRange?: string): Promise<WorkflowMetrics> {
        try {
            const params = timeRange ? { timeRange } : {};
            const response = await api.get(`/workflows/workflows/${workflowId}/metrics`, { params });
            return response.data.data;
        } catch (error) {
            console.error('Failed to get workflow metrics:', error);
            throw error;
        }
    }

    /**
     * Get observability dashboard data
     */
    async getObservabilityDashboard(timeRange?: string): Promise<ObservabilityDashboard> {
        try {
            const params = timeRange ? { timeRange } : {};
            const response = await api.get('/workflows/observability/dashboard', { params });
            return response.data.data;
        } catch (error) {
            console.error('Failed to get observability dashboard:', error);
            throw error;
        }
    }

    /**
     * List workflow templates
     */
    async listTemplates(filters?: {
        createdBy?: string;
        tags?: string[];
        limit?: number;
        offset?: number;
    }): Promise<{ templates: WorkflowTemplate[]; total: number }> {
        try {
            const response = await api.get('/workflows/templates', { params: filters });
            return response.data.data;
        } catch (error) {
            console.error('Failed to list workflow templates:', error);
            throw error;
        }
    }

    /**
     * List workflow executions
     */
    async listExecutions(filters?: {
        workflowId?: string;
        status?: string;
        userId?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ executions: WorkflowExecution[]; total: number }> {
        try {
            const response = await api.get('/workflows/executions', { params: filters });
            return response.data.data;
        } catch (error) {
            console.error('Failed to list workflow executions:', error);
            throw error;
        }
    }
}

export const workflowService = new WorkflowService();