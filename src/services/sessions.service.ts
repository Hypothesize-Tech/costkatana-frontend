import api from '../config/api';

export interface Session {
    _id: string;
    sessionId: string;
    userId?: string;
    label?: string;
    startedAt: string;
    endedAt?: string;
    duration?: number;
    status: 'active' | 'completed' | 'error';
    source?: 'telemetry' | 'manual' | 'unified' | 'in-app' | 'integration';
    metadata?: Record<string, any>;
    replayData?: {
        aiInteractions?: Array<any>;
        userActions?: Array<any>;
        codeContext?: Array<any>;
        systemMetrics?: Array<any>;
        workspaceState?: any;
    };
    error?: {
        message: string;
        stack?: string;
    };
    summary?: {
        totalSpans: number;
        totalDuration?: number;
        totalCost?: number;
        totalTokens?: {
            input: number;
            output: number;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface TraceNode {
    id: string;
    label: string;
    start: string;
    end?: string;
    status: 'ok' | 'error';
    depth: number;
    aiModel?: string;
    tokens?: {
        input: number;
        output: number;
    };
    costUSD?: number;
    type: string;
    duration?: number;
}

export interface TraceEdge {
    from: string;
    to: string;
}

export interface SessionGraph {
    nodes: TraceNode[];
    edges: TraceEdge[];
}

export interface Message {
    _id: string;
    messageId: string;
    sessionId: string;
    traceId: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    contentPreview: string;
    fullContentStored: boolean;
    fullContentUrl?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface SessionDetails {
    session: Session;
    messages: Message[];
}

export interface SessionsListResponse {
    sessions: Session[];
    total: number;
    page: number;
    totalPages: number;
}

export interface SessionsSummary {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    errorSessions: number;
    totalCost: number;
    totalTokens: {
        input: number;
        output: number;
    };
    averageDuration: number;
}

class SessionsService {
    /**
     * List sessions with filters
     */
    async listSessions(params?: {
        userId?: string;
        label?: string;
        from?: string;
        to?: string;
        status?: string;
        source?: string;
        minCost?: number;
        maxCost?: number;
        minSpans?: number;
        maxSpans?: number;
        page?: number;
        limit?: number;
    }): Promise<SessionsListResponse> {
        const response = await api.get('/v1/sessions', { params });
        return response.data.data;
    }

    /**
     * Get session graph
     */
    async getSessionGraph(sessionId: string): Promise<SessionGraph> {
        const response = await api.get(`/v1/sessions/${sessionId}/graph`);
        return response.data.data;
    }

    /**
     * Get session details
     */
    async getSessionDetails(sessionId: string): Promise<SessionDetails> {
        const response = await api.get(`/v1/sessions/${sessionId}/details`);
        return response.data.data;
    }

    /**
     * End a session
     */
    async endSession(sessionId: string): Promise<Session> {
        const response = await api.post(`/v1/sessions/${sessionId}/end`, {});
        return response.data.data;
    }

    /**
     * Get sessions summary
     */
    async getSessionsSummary(): Promise<SessionsSummary> {
        const response = await api.get('/v1/sessions/summary');
        return response.data.data;
    }

    /**
     * Ingest trace data
     */
    async ingestTrace(trace: {
        sessionId?: string;
        parentId?: string;
        name: string;
        type?: 'http' | 'llm' | 'tool' | 'database' | 'custom';
        status?: 'ok' | 'error';
        startedAt: string;
        endedAt?: string;
        error?: {
            message: string;
            stack?: string;
        };
        aiModel?: string;
        tokens?: {
            input: number;
            output: number;
        };
        costUSD?: number;
        tool?: string;
        resourceIds?: string[];
        metadata?: Record<string, any>;
    }): Promise<{ traceId: string; sessionId: string }> {
        const response = await api.post('/v1/traces/ingest', trace);
        return response.data.data;
    }
}

export const sessionsService = new SessionsService();
