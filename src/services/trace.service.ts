import { apiClient } from '../config/api';

export interface Trace {
    _id: string;
    traceId: string;
    userId: string;
    projectId?: string;
    name: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: string;
    endTime?: string;
    duration?: number;
    totalCost: number;
    totalTokens: number;
    callCount: number;
    rootSpanId?: string;
    spans: TraceSpan[];
    metadata: {
        environment?: string;
        version?: string;
        userId?: string;
        sessionId?: string;
        tags?: string[];
        customAttributes?: Record<string, any>;
    };
    dependencies: {
        services: string[];
        models: string[];
        providers: string[];
    };
    performance: {
        criticalPath: string[];
        bottlenecks: Array<{
            spanId: string;
            reason: string;
            impact: number;
        }>;
        parallelizable: string[];
        cacheOpportunities: Array<{
            spanId: string;
            promptHash: string;
            estimatedSavings: number;
        }>;
    };
    errors: Array<{
        spanId: string;
        error: string;
        timestamp: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    sampling: {
        sampled: boolean;
        sampleRate: number;
        reason?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface TraceSpan {
    spanId: string;
    parentSpanId?: string;
    name: string;
    operation: 'ai_call' | 'processing' | 'database' | 'http_request' | 'custom';
    startTime: string;
    endTime?: string;
    duration?: number;
    status: 'running' | 'completed' | 'failed';
    aiCall?: {
        provider: string;
        model: string;
        prompt: string;
        completion?: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost: number;
        promptHash: string;
        parameters: Record<string, any>;
        cacheHit: boolean;
        retryCount?: number;
    };
    performance: {
        latency: number;
        queueTime?: number;
        processingTime?: number;
        networkTime?: number;
    };
    relationships: {
        children: string[];
        dependencies: string[];
        triggers: string[];
    };
    error?: {
        message: string;
        code?: string;
        stack?: string;
        recoverable: boolean;
    };
    tags: Record<string, string>;
    logs: Array<{
        timestamp: string;
        level: 'debug' | 'info' | 'warn' | 'error';
        message: string;
        data?: any;
    }>;
}

export interface TraceQuery {
    projectId?: string;
    status?: string;
    search?: string;
    provider?: string;
    model?: string;
    minCost?: number;
    maxCost?: number;
    tags?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface TraceAnalysis {
    criticalPath: {
        spans: string[];
        totalDuration: number;
        bottlenecks: Array<{
            spanId: string;
            duration: number;
            percentage: number;
        }>;
    };
    dependencies: {
        graph: Record<string, string[]>;
        services: string[];
        models: string[];
        providers: string[];
    };
    performance: {
        totalCost: number;
        totalTokens: number;
        averageLatency: number;
        cacheHitRate: number;
        errorRate: number;
        parallelizationOpportunities: string[];
    };
    optimizations: Array<{
        type: 'parallelization' | 'caching' | 'model_optimization' | 'prompt_optimization';
        description: string;
        estimatedSavings: number;
        confidence: number;
        spans: string[];
    }>;
}

export interface TraceInsights {
    performance: {
        totalDuration?: number;
        totalCost: number;
        totalTokens: number;
        spanCount: number;
        averageSpanDuration: number;
    };
    efficiency: {
        cacheHitRate: number;
        errorRate: number;
        parallelizationScore: number;
    };
    costs: {
        breakdown: Array<{
            spanId: string;
            name: string;
            provider: string;
            model: string;
            cost: number;
            tokens: number;
        }>;
        topExpensive: Array<{
            spanId: string;
            name: string;
            cost: number;
            percentage: string;
        }>;
    };
    recommendations: Array<{
        type: string;
        description: string;
        impact: number;
        action: string;
    }>;
}

export interface TraceStats {
    totalTraces: number;
    totalCost: number;
    totalTokens: number;
    averageDuration: number;
    completedTraces: number;
    failedTraces: number;
    topProviders: Array<{
        provider: string;
        count: number;
        cost: number;
    }>;
    topModels: Array<{
        model: string;
        count: number;
        cost: number;
    }>;
}

export interface CreateTraceRequest {
    name: string;
    projectId?: string;
    metadata?: {
        environment?: string;
        version?: string;
        sessionId?: string;
        tags?: string[];
        customAttributes?: Record<string, any>;
    };
}

export class TraceService {
    /**
     * Create a new trace
     */
    static async createTrace(request: CreateTraceRequest): Promise<{
        traceId: string;
        name: string;
        status: string;
        startTime: string;
    }> {
        const response = await apiClient.post('/traces', request);
        return response.data.data;
    }

    /**
     * Get traces with filtering and pagination
     */
    static async getTraces(query: TraceQuery = {}): Promise<{
        traces: Trace[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v.toString()));
                } else if ((typeof value === 'string' && value !== '') || (typeof value === 'number' && value !== 0)) {
                    params.append(key, String(value));
                }
            }
        });

        const response = await apiClient.get(`/traces?${params}`);
        return {
            traces: response.data.data,
            pagination: response.data.pagination
        };
    }

    /**
     * Get a single trace by ID
     */
    static async getTrace(traceId: string): Promise<Trace> {
        const response = await apiClient.get(`/traces/${traceId}`);
        return response.data.data;
    }

    /**
     * Delete a trace
     */
    static async deleteTrace(traceId: string): Promise<void> {
        await apiClient.delete(`/traces/${traceId}`);
    }

    /**
     * Complete a trace
     */
    static async completeTrace(traceId: string): Promise<{
        traceId: string;
        status: string;
        duration?: number;
        totalCost: number;
        totalTokens: number;
        spanCount: number;
        performance: any;
    }> {
        const response = await apiClient.put(`/traces/${traceId}/complete`);
        return response.data.data;
    }

    /**
     * Analyze a trace for performance insights
     */
    static async analyzeTrace(traceId: string): Promise<TraceAnalysis> {
        const response = await apiClient.get(`/traces/${traceId}/analysis`);
        return response.data.data;
    }

    /**
     * Get detailed trace performance insights
     */
    static async getTraceInsights(traceId: string): Promise<TraceInsights> {
        const response = await apiClient.get(`/traces/${traceId}/insights`);
        return response.data.data;
    }

    /**
     * Export trace data
     */
    static async exportTrace(traceId: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
        const response = await apiClient.get(`/traces/${traceId}/export?format=${format}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get trace statistics
     */
    static async getTraceStats(query: {
        projectId?: string;
        startDate?: string;
        endDate?: string;
    } = {}): Promise<TraceStats> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/traces/stats?${params}`);
        return response.data.data;
    }

    /**
     * Search traces by prompt content
     */
    static async searchTraces(searchData: {
        promptText?: string;
        model?: string;
        provider?: string;
        timeRange?: {
            start?: string;
            end?: string;
        };
    }, query: { page?: number; limit?: number } = {}): Promise<{
        traces: Trace[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> {
        const params = new URLSearchParams();

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v.toString()));
                } else if ((typeof value === 'string' && value !== '') || (typeof value === 'number' && value !== 0)) {
                    params.append(key, String(value));
                }
            }
        });

        const response = await apiClient.post(`/traces/search?${params}`, searchData);
        return {
            traces: response.data.data,
            pagination: response.data.pagination
        };
    }

    /**
     * Add a span to a trace
     */
    static async addSpan(traceId: string, spanData: {
        name: string;
        operation: 'ai_call' | 'processing' | 'database' | 'http_request' | 'custom';
        parentSpanId?: string;
        aiCall?: {
            provider: string;
            model: string;
            prompt: string;
            completion?: string;
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
            cost: number;
            parameters: Record<string, any>;
            cacheHit?: boolean;
            retryCount?: number;
        };
        performance?: {
            latency: number;
            queueTime?: number;
            processingTime?: number;
            networkTime?: number;
        };
        tags?: Record<string, string>;
        error?: {
            message: string;
            code?: string;
            stack?: string;
            recoverable: boolean;
        };
    }): Promise<{
        traceId: string;
        spanCount: number;
        lastSpan: TraceSpan;
    }> {
        const response = await apiClient.post(`/traces/${traceId}/spans`, spanData);
        return response.data.data;
    }

    /**
     * Complete a span
     */
    static async completeSpan(
        traceId: string,
        spanId: string,
        completion?: {
            endTime?: string;
            duration?: number;
            aiCall?: {
                completion?: string;
                completionTokens?: number;
                totalTokens?: number;
                cost?: number;
            };
            logs?: Array<{
                level: 'debug' | 'info' | 'warn' | 'error';
                message: string;
                data?: any;
            }>;
        }
    ): Promise<{
        traceId: string;
        spanId: string;
        status: string;
    }> {
        const response = await apiClient.put(`/traces/${traceId}/spans/${spanId}/complete`, completion);
        return response.data.data;
    }
} 