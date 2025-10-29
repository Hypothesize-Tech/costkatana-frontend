// Integration types for external AI tools
export const INTEGRATION_TYPES = {
    CHATGPT: 'chatgpt',
    CURSOR: 'cursor',
    NPMJS: 'npmjs',
    PYTHON_CLI: 'python-cli',
    JAVASCRIPT_CLI: 'javascript-cli',
    CLAUDE: 'claude',
    OTHER: 'other'
} as const;

// App feature types for in-app usage
export const APP_FEATURES = {
    CHAT: 'chat',
    EXPERIMENTATION: 'experimentation',
    MODEL_COMPARISON: 'model-comparison',
    WHAT_IF_SIMULATOR: 'what-if-simulator',
    PROMPT_OPTIMIZER: 'prompt-optimizer',
    COST_ANALYZER: 'cost-analyzer',
    OTHER: 'other'
} as const;

// Display labels with emojis
export const FEATURE_LABELS: Record<string, string> = {
    [APP_FEATURES.CHAT]: 'Chat',
    [APP_FEATURES.EXPERIMENTATION]: 'Experimentation',   
    [APP_FEATURES.MODEL_COMPARISON]: 'Model Comparison',
    [APP_FEATURES.WHAT_IF_SIMULATOR]: 'What-If Simulator',
    [APP_FEATURES.PROMPT_OPTIMIZER]: 'Prompt Optimizer',
    [APP_FEATURES.COST_ANALYZER]: 'Cost Analyzer'
};

export const INTEGRATION_LABELS: Record<string, string> = {
    [INTEGRATION_TYPES.CHATGPT]: 'ChatGPT',
    [INTEGRATION_TYPES.CURSOR]: 'Cursor',
    [INTEGRATION_TYPES.NPMJS]: 'NPM Package',
    [INTEGRATION_TYPES.PYTHON_CLI]: 'Python CLI',
    [INTEGRATION_TYPES.JAVASCRIPT_CLI]: 'JavaScript CLI',
    [INTEGRATION_TYPES.CLAUDE]: 'Claude',
    [INTEGRATION_TYPES.OTHER]: 'Other Integration'
};

// Helper function to get display label
export function getSessionDisplayInfo(session: SessionReplay): { label: string; icon: string; type: string } {
    if (session.source === 'in-app' && session.appFeature) {
        const label = FEATURE_LABELS[session.appFeature] || `${session.appFeature}`;
        return { label, icon: label.split(' ')[0], type: 'In-App' };
    }
    
    if (session.source === 'integration' && session.integrationName) {
        const label = INTEGRATION_LABELS[session.integrationName] || `🔌 ${session.integrationName}`;
        return { label, icon: label.split(' ')[0], type: 'Integration' };
    }
    
    const sourceLabels: Record<string, { label: string; icon: string; type: string }> = {
        'telemetry': { label: 'Telemetry', icon: 'Telemetry', type: 'Telemetry' },  
        'manual': { label: 'Manual Tracking', icon: 'Manual Tracking', type: 'Manual' },
        'unified': { label: 'Unified', icon: 'Unified', type: 'Unified' }
    };
    
    return sourceLabels[session.source || 'manual'] || { label: session.label || 'Session', icon: '📝', type: 'Unknown' };
}

export interface SessionReplay {
    sessionId: string;
    userId?: string;
    workspaceId?: string;
    label?: string;
    startedAt: string;
    endedAt?: string;
    status: 'active' | 'completed' | 'error';
    source?: 'telemetry' | 'manual' | 'unified' | 'in-app' | 'integration';
    telemetryTraceId?: string;
    trackingEnabled?: boolean;
    sessionReplayEnabled?: boolean;
    trackingEnabledAt?: string;
    duration?: number;
    hasErrors?: boolean;
    errorCount?: number;
    integrationName?: string;
    appFeature?: string;
    trackingHistory?: TrackingHistoryEntry[];
    replayData?: ReplayData;
    metadata?: Record<string, any>;
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

export interface TrackingHistoryEntry {
    enabled: boolean;
    sessionReplayEnabled: boolean;
    timestamp: string;
    request?: {
        model: string;
        tokens: number;
        cost: number;
    };
    context?: {
        files?: string[];
        workspace?: any;
    };
}

export interface ReplayData {
    codeContext?: CodeContext[];
    workspaceState?: WorkspaceState;
    aiInteractions?: AIInteraction[];
    userActions?: UserAction[];
    systemMetrics?: SystemMetrics[];
}

export interface CodeContext {
    filePath: string;
    content: string;
    language?: string;
    timestamp: string;
}

export interface WorkspaceState {
    environment?: Record<string, any>;
    settings?: Record<string, any>;
    activeFiles?: string[];
    projectStructure?: any;
}

export interface AIInteraction {
    timestamp: string;
    model: string;
    prompt: string;
    response: string;
    parameters?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        [key: string]: any;
    };
    tokens?: {
        input: number;
        output: number;
    };
    cost?: number;
    latency?: number;
    provider?: string;
    requestMetadata?: Record<string, any>;
    responseMetadata?: Record<string, any>;
}

export interface UserAction {
    timestamp: string;
    action: string;
    details?: any;
}

export interface SystemMetrics {
    timestamp: string;
    cpu?: number;
    memory?: number;
    network?: {
        sent: number;
        received: number;
    };
}

export interface SessionPlayerData {
    sessionId: string;
    userId?: string;
    workspaceId?: string;
    label?: string;
    startedAt: string;
    endedAt?: string;
    status: 'active' | 'completed' | 'error';
    source?: 'telemetry' | 'manual' | 'unified';
    trackingEnabled?: boolean;
    sessionReplayEnabled?: boolean;
    duration: number;
    summary?: {
        totalSpans: number;
        totalDuration?: number;
        totalCost?: number;
        totalTokens?: {
            input: number;
            output: number;
        };
    };
    timeline: {
        aiInteractions: AIInteraction[];
        userActions: UserAction[];
        systemMetrics: SystemMetrics[];
    };
    codeSnapshots: CodeContext[];
    trackingHistory: TrackingHistoryEntry[];
}

export interface SessionListResponse {
    success: boolean;
    data: SessionReplay[];
    meta: {
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface SessionPlayerResponse {
    success: boolean;
    data: SessionPlayerData;
}

// Advanced filtering interface
export interface SessionFilters {
    userId?: string;
    workspaceId?: string;
    source?: 'telemetry' | 'manual' | 'unified' | 'in-app' | 'integration';
    from?: Date;
    to?: Date;
    status?: 'active' | 'completed' | 'error';
    hasErrors?: boolean;
    minCost?: number;
    maxCost?: number;
    minTokens?: number;
    maxTokens?: number;
    minDuration?: number;
    maxDuration?: number;
    aiModel?: string;
    searchQuery?: string;
    appFeature?: string;
    page?: number;
    limit?: number;
    sortBy?: 'startedAt' | 'totalCost' | 'totalTokens' | 'duration';
    sortOrder?: 'asc' | 'desc';
}

// Session statistics interface
export interface SessionStats {
    totalSessions: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
    byAppFeature: Record<string, number>;
    totalCost: number;
    totalTokens: { input: number; output: number };
    averageDuration: number;
    errorRate: number;
    topModels: Array<{ model: string; count: number }>;
    costBySource: Record<string, number>;
}

// Export options interface
export interface SessionExportOptions {
    sessionId: string;
    format: 'json' | 'csv';
    includeInteractions?: boolean;
    includeActions?: boolean;
    includeCodeContext?: boolean;
    includeMetrics?: boolean;
}

// Share options interface
export interface SessionShareOptions {
    sessionId: string;
    accessLevel?: 'public' | 'team' | 'password';
    expiresIn?: number; // hours
    password?: string;
}

// Share response interface
export interface SessionShareResponse {
    shareToken: string;
    shareUrl: string;
    expiresAt?: string;
}

