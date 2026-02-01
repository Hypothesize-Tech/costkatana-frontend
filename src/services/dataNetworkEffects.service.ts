import { apiClient } from "@/config/api";

/**
 * Model Performance Fingerprint Interfaces
 */
export interface ModelPerformanceFingerprint {
  modelId: string;
  provider: string;
  modelName: string;
  routingWeight: number;
  window24h: WindowMetrics;
  window7d: WindowMetrics;
  window30d: WindowMetrics;
  capabilities: CapabilityPerformance[];
  trends: PerformanceTrend[];
  isActive: boolean;
}

export interface WindowMetrics {
  latency: PercentileStats;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  failureRate: number;
  avgCostPerRequest: number;
  costPer1KTokens: number;
  cacheHitRate: number;
}

export interface PercentileStats {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface CapabilityPerformance {
  capability: string;
  performanceScore: number;
  costEfficiency: number;
  qualityScore: number;
  sampleSize: number;
}

export interface PerformanceTrend {
  metric: 'latency' | 'cost' | 'failure_rate' | 'quality';
  direction: 'improving' | 'degrading' | 'stable';
  percentageChange: number;
  confidence: number;
}

/**
 * Learning Loop Interfaces
 */
export interface LearningStats {
  totalRecommendations: number;
  acceptanceRate: number;
  avgSuccessRate: number;
  avgUserTrust: number;
  topPerformingTypes: Array<{
    type: string;
    successRate: number;
    count: number;
  }>;
}

/**
 * Agent Behavior Interfaces
 */
export interface AgentEfficiencyMetrics {
  agentId: string;
  agentType: string;
  avgDurationMs: number;
  avgActionsPerSession: number;
  avgSuccessRate: number;
  avgCostPerSession: number;
  totalCost: number;
  costTrend: 'increasing' | 'stable' | 'decreasing';
  efficiencyScore: number;
  costEfficiencyScore: number;
  qualityScore: number;
  estimatedSavings: number;
  improvementAreas: string[];
  sampleSize: number;
}

export interface DetectedPattern {
  patternType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedSessions: string[];
  frequency: number;
  avgCostImpact: number;
  recommendation: string;
}

/**
 * Semantic Cluster Interfaces
 */
export interface SemanticCluster {
  clusterId: string;
  clusterName: string;
  size: number;
  category: string;
  semanticDescription: string;
  keywords: string[];
  costAnalysis: ClusterCostAnalysis;
  performanceAnalysis: ClusterPerformanceAnalysis;
  optimization: ClusterOptimization;
  dataStartDate: string;
  dataEndDate: string;
  totalRequests?: number;
  totalCostUSD?: number;
  avgCostPerRequest?: number;
  avgLatencyMS?: number;
  cacheHitRate?: number;
  commonPromptPatterns?: string[];
  optimizationOpportunities?: Array<{
    description: string;
    potentialSavingsUSD: number;
  }>;
}

export interface ClusterCostAnalysis {
  totalCost: number;
  avgCostPerRequest: number;
  isHighCost: boolean;
  potentialSavingsWithCache: number;
  potentialSavingsWithCheaperModel: number;
}

export interface ClusterPerformanceAnalysis {
  avgLatency: number;
  successRate: number;
  topModels: Array<{
    modelId: string;
    frequency: number;
    avgCost: number;
    avgLatency: number;
  }>;
}

export interface ClusterOptimization {
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: Array<{
    type: string;
    description: string;
    estimatedSavings: number;
    estimatedSavingsPercentage: number;
    implementationEffort: 'low' | 'medium' | 'high';
  }>;
  totalEstimatedSavings: number;
}

/**
 * Global Benchmark Interfaces
 */
export interface GlobalBenchmark {
  benchmarkId: string;
  benchmarkName: string;
  scope: 'model' | 'provider' | 'capability' | 'global';
  metrics: AggregatedMetrics;
  modelComparisons: ModelComparison[];
  trends: BenchmarkTrend[];
  bestPractices: BestPractice[];
  periodStart: string;
  periodEnd: string;
}

export interface AggregatedMetrics {
  totalRequests: number;
  uniqueTenants: number;
  p50Latency: number;
  p90Latency: number;
  p95Latency: number;
  avgCostPerRequest: number;
  avgCostPer1KTokens: number;
  successRate: number;
  avgCacheHitRate: number;
}

export interface ModelComparison {
  modelId: string;
  relativeSpeed: number;
  relativeCost: number;
  relativeQuality: number;
  overallScore: number;
  valueScore: number;
}

export interface BenchmarkTrend {
  date: string;
  avgLatency: number;
  avgCost: number;
  successRate: number;
  requestCount: number;
}

export interface BestPractice {
  practiceType: string;
  description: string;
  adoptionRate: number;
  avgCostSavings: number;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Learning Stats Response Interface
 */
export interface LearningStatsResponse {
  totalRecommendations?: number;
  totalOutcomes?: number;
  acceptanceRate?: number;
  avgSuccessRate?: number;
  avgUserTrust?: number;
  activeModels?: number;
  avgWeightChange?: number;
  topPerformingTypes?: Array<{
    type: string;
    successRate: number;
    count: number;
  }>;
}

/**
 * Recommendation Outcome Interface
 */
export interface RecommendationOutcome {
  id?: string;
  timestamp?: string;
  decisionType?: string;
  recommendationType?: string;
  outcome?: 'accepted' | 'rejected' | 'success' | 'failure' | 'pending';
  status?: 'accepted' | 'rejected' | 'pending' | 'ignored';
  costSavingsActual?: number;
  actualSavings?: number;
  feedbackWeight?: number;
}

/**
 * Agent Analytics Response Interface
 */
export interface AgentAnalyticsResponse {
  totalActions?: number;
  successRate?: number;
  avgCostPerAction?: number;
  patternsDetected?: number;
  byAgentType?: Record<string, {
    totalActions: number;
    totalCost: number;
    successRate: number;
    avgLatency: number;
    count: number;
  }>;
}

/**
 * Model Comparison Response Interface
 */
export interface ModelComparisonResponse {
  comparisons?: ModelComparison[];
  totalRequests?: number;
  avgLatency?: number;
  metrics?: AggregatedMetrics;
}

/**
 * Data Network Effects Service
 * Frontend service for accessing Data Network Effects features
 */
export class DataNetworkEffectsService {
  // ============================================================================
  // MODEL PERFORMANCE FINGERPRINTS
  // ============================================================================

  /**
   * Query best models for a capability
   */
  static async queryBestModels(params: {
    capability?: string;
    maxCostPer1KTokens?: number;
    minQualityScore?: number;
    maxLatencyMs?: number;
    minRoutingWeight?: number;
    limit?: number;
  }): Promise<ModelPerformanceFingerprint[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/models/best', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to query best models:', error);
      return [];
    }
  }

  /**
   * Get performance trend for a model
   */
  static async getModelPerformanceTrend(
    modelId: string,
    metric: 'latency' | 'cost' | 'failure_rate' | 'quality' = 'cost'
  ): Promise<PerformanceTrend | null> {
    try {
      const response = await apiClient.get(`/admin/data-network-effects/models/${modelId}/trend`, {
        params: { metric }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get model performance trend:', error);
      return null;
    }
  }

  // ============================================================================
  // LEARNING LOOP
  // ============================================================================

  /**
   * Record recommendation interaction
   */
  static async recordRecommendationInteraction(params: {
    recommendationId: string;
    status: 'viewed' | 'accepted' | 'rejected' | 'dismissed';
    feedback?: string;
    rating?: number;
    reason?: string;
  }): Promise<boolean> {
    try {
      await apiClient.post('/admin/data-network-effects/learning-loop/interaction', params);
      return true;
    } catch (error) {
      console.error('Failed to record recommendation interaction:', error);
      return false;
    }
  }

  /**
   * Get learning statistics for current user
   */
  static async getUserLearningStats(userId: string): Promise<LearningStats | null> {
    try {
      const response = await apiClient.get(`/admin/data-network-effects/learning-loop/stats/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get learning stats:', error);
      return null;
    }
  }

  /**
   * Get learning loop statistics (general)
   */
  static async getLearningStats(): Promise<LearningStatsResponse | null> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/learning-loop/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to get learning stats:', error);
      return null;
    }
  }

  /**
   * Get recent recommendation outcomes
   */
  static async getRecentOutcomes(params?: { limit?: number }): Promise<RecommendationOutcome[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/learning-loop/outcomes/recent', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get recent outcomes:', error);
      return [];
    }
  }

  // ============================================================================
  // AGENT BEHAVIOR ANALYTICS
  // ============================================================================

  /**
   * Get agent efficiency metrics
   */
  static async getAgentEfficiencyMetrics(params?: {
    agentId?: string;
    agentType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AgentEfficiencyMetrics[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/agents/efficiency', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get agent efficiency metrics:', error);
      return [];
    }
  }

  /**
   * Detect agent patterns
   */
  static async detectAgentPatterns(params?: {
    agentId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    minOccurrences?: number;
  }): Promise<DetectedPattern[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/agents/patterns', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to detect agent patterns:', error);
      return [];
    }
  }

  /**
   * Get top inefficient agents
   */
  static async getTopInefficientAgents(limit: number = 10): Promise<AgentEfficiencyMetrics[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/agents/inefficient', {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get inefficient agents:', error);
      return [];
    }
  }

  /**
   * Get agent analytics
   */
  static async getAgentAnalytics(): Promise<AgentAnalyticsResponse | null> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/agents/analytics');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to get agent analytics:', error);
      return null;
    }
  }

  /**
   * Detect bad agent patterns (alias for detectAgentPatterns)
   */
  static async detectBadAgentPatterns(): Promise<DetectedPattern[]> {
    return this.detectAgentPatterns();
  }

  // ============================================================================
  // SEMANTIC PATTERNS
  // ============================================================================

  /**
   * Run clustering analysis
   */
  static async runClusteringAnalysis(params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    tenantId?: string;
    numClusters?: number;
  }): Promise<SemanticCluster[]> {
    try {
      const response = await apiClient.post('/admin/data-network-effects/semantic/cluster', params);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to run clustering analysis:', error);
      return [];
    }
  }

  /**
   * Get high-cost clusters
   */
  static async getHighCostClusters(limit: number = 10): Promise<SemanticCluster[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/semantic/high-cost', {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get high-cost clusters:', error);
      return [];
    }
  }

  /**
   * Get clusters with high optimization potential
   */
  static async getClustersWithOptimizationPotential(limit: number = 10): Promise<SemanticCluster[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/semantic/optimization-potential', {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get optimization potential clusters:', error);
      return [];
    }
  }

  /**
   * Get semantic clusters
   */
  static async getSemanticClusters(): Promise<SemanticCluster[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/semantic/clusters');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get semantic clusters:', error);
      return [];
    }
  }

  // ============================================================================
  // GLOBAL BENCHMARKS
  // ============================================================================

  /**
   * Get latest global benchmark
   */
  static async getLatestGlobalBenchmark(): Promise<GlobalBenchmark | null> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/benchmarks/global');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get global benchmark:', error);
      return null;
    }
  }

  /**
   * Get benchmark for a specific model
   */
  static async getModelBenchmark(modelId: string): Promise<GlobalBenchmark | null> {
    try {
      const response = await apiClient.get(`/admin/data-network-effects/benchmarks/model/${modelId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get model benchmark:', error);
      return null;
    }
  }

  /**
   * Generate benchmarks manually
   */
  static async generateBenchmarks(): Promise<boolean> {
    try {
      await apiClient.post('/admin/data-network-effects/benchmarks/generate');
      return true;
    } catch (error) {
      console.error('Failed to generate benchmarks:', error);
      return false;
    }
  }

  /**
   * Get global benchmarks (all)
   */
  static async getGlobalBenchmarks(): Promise<GlobalBenchmark[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/benchmarks/global');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get global benchmarks:', error);
      return [];
    }
  }

  /**
   * Get best practices
   */
  static async getBestPractices(): Promise<BestPractice[]> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/benchmarks/best-practices');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get best practices:', error);
      return [];
    }
  }

  /**
   * Compare models
   */
  static async compareModels(): Promise<ModelComparisonResponse | null> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/benchmarks/compare');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to compare models:', error);
      return null;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Check health of Data Network Effects system
   */
  static async checkHealth(): Promise<{
    healthy: boolean;
    checks: Record<string, boolean>;
  }> {
    try {
      const response = await apiClient.get('/admin/data-network-effects/health');
      return {
        healthy: response.data.healthy,
        checks: response.data.checks
      };
    } catch (error) {
      console.error('Failed to check health:', error);
      return {
        healthy: false,
        checks: {}
      };
    }
  }
}

export default DataNetworkEffectsService;

