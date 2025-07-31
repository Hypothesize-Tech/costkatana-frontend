import { apiClient } from "../config/api";

export interface ModelComparisonRequest {
  prompt: string;
  models: Array<{
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  }>;
  evaluationCriteria: string[];
  iterations?: number;
}

export interface ModelComparisonResult {
  id: string;
  provider: string;
  model: string;
  response: string;
  metrics: {
    cost: number;
    latency: number;
    tokenCount: number;
    qualityScore: number;
    errorRate: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    reliability: number;
  };
  costBreakdown: {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
  qualityMetrics: {
    accuracy: number;
    relevance: number;
    completeness: number;
    coherence: number;
  };
  timestamp: string;
}

export interface WhatIfScenario {
  id?: string;
  name: string;
  description: string;
  changes: Array<{
    type:
      | "model_switch"
      | "volume_change"
      | "feature_addition"
      | "optimization_applied";
    currentValue: any;
    proposedValue: any;
    affectedMetrics: string[];
    description: string;
  }>;
  timeframe: "daily" | "weekly" | "monthly" | "yearly";
  baselineData: {
    cost: number;
    volume: number;
    performance: number;
  };
  createdAt?: string;
  status?: string;
  isUserCreated?: boolean;
  analysis?: {
    projectedImpact: {
      costChange: number;
      costChangePercentage: number;
      performanceChange: number;
      performanceChangePercentage: number;
      riskLevel: "low" | "medium" | "high";
      confidence: number;
    };
    breakdown: {
      currentCosts: Record<string, number>;
      projectedCosts: Record<string, number>;
      savingsOpportunities: Array<{
        category: string;
        savings: number;
        effort: "low" | "medium" | "high";
      }>;
    };
    recommendations: string[];
    warnings: string[];
    aiInsights?: string[];
  };
}

export interface WhatIfResult {
  scenario: WhatIfScenario;
  projectedImpact: {
    costChange: number;
    costChangePercentage: number;
    performanceChange: number;
    performanceChangePercentage: number;
    riskLevel: "low" | "medium" | "high";
    confidence: number;
  };
  breakdown: {
    currentCosts: Record<string, number>;
    projectedCosts: Record<string, number>;
    savingsOpportunities: Array<{
      category: string;
      savings: number;
      effort: "low" | "medium" | "high";
    }>;
  };
  recommendations: string[];
  warnings: string[];
  aiInsights?: string[];
}

// Fine-tuning functionality removed - not core to business focus

export interface ExperimentResult {
  id: string;
  name: string;
  type: "model_comparison" | "what_if" | "fine_tuning";
  status: "running" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  results: any;
  metadata: {
    duration: number;
    iterations: number;
    confidence: number;
  };
}

export class ExperimentationService {
  /**
   * Model Comparison Methods
   */
  static async runModelComparison(
    request: ModelComparisonRequest,
  ): Promise<ExperimentResult> {
    const response = await apiClient.post(
      "/experimentation/model-comparison",
      request,
    );
    return response.data.data || response.data; // Handle wrapped response
  }

  /**
   * Start real-time model comparison with Bedrock
   */
  static async startRealTimeComparison(
    request: ModelComparisonRequest & {
      executeOnBedrock?: boolean;
      comparisonMode?: "quality" | "cost" | "speed" | "comprehensive";
      evaluationPrompt?: string;
    },
  ): Promise<{
    data: { sessionId: string; message: string; estimatedDuration: number };
  }> {
    const response = await apiClient.post(
      "/experimentation/real-time-comparison",
      request,
    );
    return response.data;
  }

  static async getModelComparisonResults(
    experimentId: string,
  ): Promise<ModelComparisonResult[]> {
    const response = await apiClient.get(
      `/experimentation/model-comparison/${experimentId}/results`,
    );
    return response.data.data || response.data;
  }

  static async getModelComparisonHistory(filters?: {
    startDate?: string;
    endDate?: string;
    models?: string[];
    limit?: number;
  }): Promise<ExperimentResult[]> {
    const response = await apiClient.get(
      "/experimentation/model-comparison/history",
      {
        params: filters,
      },
    );
    return response.data.data || response.data;
  }

  /**
   * What-If Scenarios
   */
  static async createWhatIfScenario(
    scenario: Omit<WhatIfScenario, "id">,
  ): Promise<WhatIfScenario> {
    const response = await apiClient.post(
      "/experimentation/what-if-scenarios",
      scenario,
    );
    return response.data.data || response.data;
  }

  static async getWhatIfScenarios(): Promise<WhatIfScenario[]> {
    const response = await apiClient.get("/experimentation/what-if-scenarios");
    return response.data.data || response.data;
  }

  static async getWhatIfResults(scenarioId: string): Promise<WhatIfResult> {
    const response = await apiClient.get(
      `/experimentation/what-if-scenario/${scenarioId}/results`,
    );
    return response.data.data || response.data;
  }

  static async runWhatIfAnalysis(scenarioName: string): Promise<WhatIfResult> {
    const response = await apiClient.post(
      `/experimentation/what-if-scenarios/${scenarioName}/analyze`,
    );
    return response.data.data || response.data;
  }

  static async deleteWhatIfScenario(scenarioName: string): Promise<void> {
    await apiClient.delete(
      `/experimentation/what-if-scenarios/${scenarioName}`,
    );
  }

  /**
   * General Experiment Methods
   */
  static async getExperimentHistory(filters?: {
    type?: "model_comparison" | "what_if" | "fine_tuning";
    status?: "running" | "completed" | "failed";
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ExperimentResult[]> {
    const response = await apiClient.get("/experimentation/history", {
      params: filters,
    });
    // Handle the wrapped response format from backend
    return response.data.data || response.data;
  }

  static async getExperimentById(
    experimentId: string,
  ): Promise<ExperimentResult> {
    const response = await apiClient.get(`/experimentation/${experimentId}`);
    return response.data.data || response.data;
  }

  static async deleteExperiment(experimentId: string): Promise<void> {
    await apiClient.delete(`/experimentation/${experimentId}`);
  }

  static async exportExperimentResults(
    experimentId: string,
    format: "json" | "csv",
  ): Promise<Blob> {
    const response = await apiClient.get(
      `/experimentation/${experimentId}/export`,
      {
        params: { format },
        responseType: "blob",
      },
    );
    return response.data;
  }

  /**
   * Utility Methods
   */
  static async getAvailableModels(): Promise<
    Array<{
      provider: string;
      model: string;
      pricing: {
        input: number;
        output: number;
        unit: string;
      };
      capabilities: string[];
      contextWindow: number;
      category?: string;
      isLatest?: boolean;
      notes?: string;
    }>
  > {
    const response = await apiClient.get("/experimentation/available-models");
    // Handle the wrapped response format from backend
    return response.data.data || response.data;
  }

  static async estimateExperimentCost(request: {
    type: "model_comparison" | "what_if" | "fine_tuning";
    parameters: any;
  }): Promise<{
    estimatedCost: number;
    breakdown: Record<string, number>;
    duration: number;
  }> {
    const response = await apiClient.post(
      "/experimentation/estimate-cost",
      request,
    );
    return response.data.data || response.data;
  }

  static async getExperimentRecommendations(_userId?: string): Promise<
    Array<{
      type: "model_comparison" | "what_if" | "fine_tuning";
      title: string;
      description: string;
      priority: "low" | "medium" | "high";
      potentialSavings: number;
      effort: "low" | "medium" | "high";
      actions: string[];
    }>
  > {
    try {
      // Note: userId parameter ignored since backend gets it from req.user
      const response = await apiClient.get("/experimentation/recommendations");
      const data = response.data.data || response.data;

      // Ensure we return an array even if backend returns empty
      if (Array.isArray(data)) {
        return data;
      } else {
        console.warn("Backend returned non-array recommendations:", data);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * New methods for real data integration
   */
  static async getExperiments(): Promise<{
    experiments: Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      status: "active" | "completed" | "pending";
      createdAt: string;
      results: {
        accuracy: number | null;
        cost: number;
        latency: number | null;
        savings: number;
        efficiency: number;
        roi: number;
      };
      projectId?: string;
      projectName?: string;
      budgetUsage?: number;
      modelInfo?: {
        model: string;
        provider: string;
        totalTokens: number;
        requestCount: number;
      };
    }>;
    totalExperiments: number;
    activeExperiments: number;
    completedExperiments: number;
  }> {
    const response = await apiClient.get("/experimentation/experiments");
    return response.data.data;
  }
}

export default ExperimentationService;
