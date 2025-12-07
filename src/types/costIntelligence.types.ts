/**
 * Cost Intelligence Types
 */

export interface CostTelemetryEvent {
  eventType: 'cost_tracked' | 'cost_spike' | 'budget_warning' | 'optimization_opportunity' | 'cache_hit' | 'cache_miss';
  timestamp: Date;
  userId?: string;
  workspaceId?: string;
  data: {
    model?: string;
    vendor?: string;
    cost?: number;
    tokens?: number;
    latency?: number;
    operation?: string;
    template?: string;
    cacheHit?: boolean;
    budgetRemaining?: number;
    estimatedCost?: number;
    actualCost?: number;
    metadata?: Record<string, any>;
  };
}

export interface CostIntelligence {
  id: string;
  timestamp: Date;
  userId?: string;
  workspaceId?: string;
  intelligenceType: 'anomaly' | 'trend' | 'waste_pattern' | 'optimization' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metrics: {
    currentCost?: number;
    expectedCost?: number;
    deviation?: number;
    affectedOperations?: string[];
    timeWindow?: string;
  };
  recommendations: Array<{
    action: string;
    estimatedSavings?: number;
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}

export interface CostSimulation {
  requestId: string;
  timestamp: Date;
  originalRequest: {
    model: string;
    provider: string;
    estimatedTokens: {
      input: number;
      output: number;
      total: number;
    };
    estimatedCost: number;
    estimatedLatency: number;
    confidence: number;
  };
  alternatives: Array<{
    model: string;
    provider: string;
    estimatedCost: number;
    estimatedLatency: number;
    costSavings: number;
    costSavingsPercentage: number;
    quality: 'lower' | 'similar' | 'higher';
    recommendation: string;
    confidence: number;
  }>;
  costBreakdown: {
    inputCost: number;
    outputCost: number;
    processingCost: number;
    overheadCost: number;
  };
  riskAssessment: {
    budgetRisk: 'low' | 'medium' | 'high';
    performanceRisk: 'low' | 'medium' | 'high';
    recommendation: string;
  };
}

export interface CostIntelligenceStats {
  cachedIntelligence: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

export interface StreamingStats {
  activeClients: number;
  clientsByUser: Record<string, number>;
  clientsByWorkspace: Record<string, number>;
  bufferedEvents: number;
  oldestConnection?: Date;
}

export interface CostIntelligenceConfig {
  telemetry: {
    enabled: boolean;
    sampleRate: number;
    streaming: {
      enabled: boolean;
      heartbeatInterval: number;
      clientTimeout: number;
    };
    failSafe: boolean;
  };
  intelligence: {
    enabled: boolean;
    continuousAnalysis: boolean;
    intervals: {
      fast: number;
      medium: number;
      slow: number;
    };
    anomalyDetection: {
      enabled: boolean;
      spikeThreshold: number;
    };
    recommendations: boolean;
  };
  routing: {
    enabled: boolean;
    useTelemetryData: boolean;
    fallbackStrategy: 'cost' | 'speed' | 'quality' | 'balanced';
    planTierMapping: {
      free: string;
      plus: string;
      pro: string;
      enterprise: string;
    };
  };
  enforcement: {
    enabled: boolean;
    preFlightChecks: boolean;
    hardLimits: boolean;
    softLimitThresholds: {
      free: number;
      plus: number;
      pro: number;
      enterprise: number;
    };
    allowDowngrade: boolean;
    budgetReservation: {
      enabled: boolean;
      ttl: number;
    };
  };
  caching: {
    enabled: boolean;
    strategies: {
      exact: boolean;
      semantic: boolean;
      deduplication: boolean;
    };
    semanticCache: {
      enabledByDefault: boolean;
      similarityThreshold: number;
      ttl: number;
    };
    warmingEnabled: boolean;
  };
  simulation: {
    enabled: boolean;
    includeAlternatives: boolean;
    maxAlternatives: number;
    trackAccuracy: boolean;
    confidenceThreshold: number;
  };
  global: {
    failOpen: boolean;
    performanceMode: 'low' | 'medium' | 'high';
    logging: {
      level: 'debug' | 'info' | 'warn' | 'error';
      includeMetrics: boolean;
    };
  };
}

