// Re-export types from trace service for convenience
export type {
    Trace,
    TraceSpan,
    TraceQuery,
    TraceAnalysis,
    TraceInsights,
    TraceStats,
    CreateTraceRequest
} from '../services/trace.service';

// Additional frontend-specific types for UI components
export interface TraceListItem {
    traceId: string;
    name: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: string;
    duration?: number;
    totalCost: number;
    totalTokens: number;
    callCount: number;
    providers: string[];
    models: string[];
    errors: number;
}

export interface TraceVisualizationData {
    spans: Array<{
        id: string;
        name: string;
        startTime: number;
        endTime: number;
        duration: number;
        parentId?: string;
        level: number;
        operation: string;
        status: 'running' | 'completed' | 'failed';
        cost?: number;
        tokens?: number;
        provider?: string;
        model?: string;
        error?: string;
    }>;
    criticalPath: string[];
    dependencies: Record<string, string[]>;
    totalDuration: number;
    maxLevel: number;
}

export interface TraceDependencyNode {
    id: string;
    name: string;
    type: 'span' | 'service' | 'model' | 'provider';
    operation?: string;
    cost?: number;
    duration?: number;
    status?: string;
    children: string[];
    parents: string[];
    level: number;
    position?: { x: number; y: number };
}

export interface TraceDependencyGraph {
    nodes: TraceDependencyNode[];
    edges: Array<{
        from: string;
        to: string;
        type: 'dependency' | 'parent-child' | 'trigger';
        weight?: number;
    }>;
    layout: {
        width: number;
        height: number;
        maxLevel: number;
    };
}

export interface TraceTimelineData {
    spans: Array<{
        id: string;
        name: string;
        startTime: number;
        endTime: number;
        duration: number;
        operation: string;
        status: string;
        cost: number;
        level: number;
        parentId?: string;
        aiCall?: {
            provider: string;
            model: string;
            tokens: number;
            cacheHit: boolean;
        };
        error?: string;
    }>;
    totalDuration: number;
    startTime: number;
    endTime: number;
}

export interface TraceFilter {
    status?: string[];
    providers?: string[];
    models?: string[];
    operations?: string[];
    costRange?: { min: number; max: number };
    durationRange?: { min: number; max: number };
    dateRange?: { start: string; end: string };
    hasErrors?: boolean;
    tags?: string[];
    search?: string;
}

export interface TraceSort {
    field: 'startTime' | 'duration' | 'cost' | 'tokens' | 'name' | 'status';
    direction: 'asc' | 'desc';
}

export interface TraceMetrics {
    overview: {
        totalTraces: number;
        totalCost: number;
        totalTokens: number;
        averageDuration: number;
        successRate: number;
        cacheHitRate: number;
    };
    breakdown: {
        byProvider: Array<{ name: string; count: number; cost: number; percentage: number }>;
        byModel: Array<{ name: string; count: number; cost: number; percentage: number }>;
        byStatus: Array<{ name: string; count: number; percentage: number }>;
        byOperation: Array<{ name: string; count: number; percentage: number }>;
    };
    trends: {
        costOverTime: Array<{ date: string; cost: number; count: number }>;
        durationOverTime: Array<{ date: string; avgDuration: number; count: number }>;
        errorRateOverTime: Array<{ date: string; errorRate: number; count: number }>;
    };
}

export interface TraceSearchResult {
    traceId: string;
    name: string;
    matchedSpans: Array<{
        spanId: string;
        name: string;
        operation: string;
        matches: Array<{
            field: 'prompt' | 'completion' | 'name';
            snippet: string;
            highlight: boolean;
        }>;
    }>;
    startTime: string;
    cost: number;
    tokens: number;
    relevanceScore: number;
}

export interface TraceReplayData {
    traceId: string;
    name: string;
    spans: Array<{
        spanId: string;
        name: string;
        operation: string;
        startTime: string;
        endTime: string;
        duration: number;
        aiCall?: {
            provider: string;
            model: string;
            prompt: string;
            completion: string;
            parameters: Record<string, any>;
        };
        replayable: boolean;
        replayResult?: {
            success: boolean;
            response?: any;
            error?: string;
            differences?: Array<{
                field: string;
                original: any;
                replay: any;
                significant: boolean;
            }>;
        };
    }>;
    replayConfiguration: {
        preservePrompts: boolean;
        preserveParameters: boolean;
        allowModelSubstitution: boolean;
        compareOutputs: boolean;
    };
}

export interface TraceOptimizationSuggestion {
    id: string;
    type: 'parallelization' | 'caching' | 'model_optimization' | 'prompt_optimization' | 'batching';
    title: string;
    description: string;
    impact: {
        estimatedSavings: number;
        estimatedTimeReduction?: number;
        confidence: number;
    };
    affectedSpans: string[];
    implementation: {
        difficulty: 'easy' | 'medium' | 'hard';
        automated: boolean;
        steps: string[];
        codeChanges?: string;
    };
    status: 'pending' | 'applied' | 'dismissed' | 'failed';
}

export interface TraceComparisonData {
    traces: Array<{
        traceId: string;
        name: string;
        metrics: {
            duration: number;
            cost: number;
            tokens: number;
            spanCount: number;
            errorCount: number;
        };
    }>;
    comparison: {
        commonSpans: Array<{
            name: string;
            operation: string;
            metrics: Array<{
                traceId: string;
                duration: number;
                cost: number;
                tokens: number;
                status: string;
            }>;
        }>;
        differences: Array<{
            type: 'missing_span' | 'extra_span' | 'different_implementation';
            description: string;
            traceIds: string[];
        }>;
        recommendations: string[];
    };
} 