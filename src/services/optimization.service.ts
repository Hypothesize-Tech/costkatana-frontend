// src/services/optimization.service.ts
import { apiClient } from "../config/api";
import { Optimization, OptimizationRequest, PaginatedResponse } from "../types";
import type { CortexConfig } from "../types/cortex.types";

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

interface BatchOptimizationRequest {
  id: string;
  prompt: string;
  timestamp: number;
  model: string;
  provider: string;
}

class OptimizationService {
  async createOptimization(
    request: OptimizationRequest & {
      conversationHistory?: ConversationMessage[];
      enableCompression?: boolean;
      enableContextTrimming?: boolean;
      enableRequestFusion?: boolean;
      // Cortex-specific parameters
      enableCortex?: boolean;
      cortexOperation?: 'optimize' | 'compress' | 'analyze' | 'transform' | 'sast' | 'answer';
      cortexEncodingModel?: string;
      cortexCoreModel?: string;
      cortexDecodingModel?: string;
      cortexStyle?: 'formal' | 'casual' | 'technical' | 'conversational';
      cortexFormat?: 'plain' | 'markdown' | 'structured' | 'json';
      cortexSemanticCache?: boolean;
      cortexStructuredContext?: boolean;
      cortexPreserveSemantics?: boolean;
      cortexIntelligentRouting?: boolean;
    },
  ): Promise<Optimization> {
    try {
      console.log("🚀 OPTIMIZATION SERVICE: Creating optimization", {
        requestKeys: Object.keys(request),
        enableCortex: request.enableCortex,
        preserveSemantics: request.cortexPreserveSemantics,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.post("/optimizations", request);
      
      console.log("✅ OPTIMIZATION SERVICE: Response received", {
        status: response.status,
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        timestamp: new Date().toISOString()
      });

      // Validate response structure before returning
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure - missing data');
      }

      const optimization = response.data.data;
      
      // Ensure optimization has required properties with safe defaults
      const safeOptimization = {
        ...optimization,
        suggestions: Array.isArray(optimization.suggestions) ? optimization.suggestions : [],
        metadata: optimization.metadata || {},
        costSaved: typeof optimization.costSaved === 'number' ? optimization.costSaved : 0,
        tokensSaved: typeof optimization.tokensSaved === 'number' ? optimization.tokensSaved : 0,
        improvementPercentage: typeof optimization.improvementPercentage === 'number' ? optimization.improvementPercentage : 0,
        optimizedPrompt: optimization.optimizedPrompt || optimization.originalPrompt || ''
      };

      return safeOptimization;
    } catch (error: any) {
      console.error("❌ OPTIMIZATION SERVICE: Error creating optimization", {
        error: error.message || 'Unknown error',
        status: error.response?.status,
        responseData: error.response?.data,
        timestamp: new Date().toISOString()
      });
      
      // Re-throw with more context for debugging
      const enhancedError = new Error(`Optimization failed: ${error.message || 'Unknown error'}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).responseStatus = error.response?.status;
      (enhancedError as any).responseData = error.response?.data;
      
      throw enhancedError;
    }
  }

  async getOptimizations(params?: {
    page?: number;
    limit?: number;
    applied?: boolean;
    service?: string;
    model?: string;
    category?: string;
    minSavings?: number;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: "asc" | "desc";
  }): Promise<PaginatedResponse<Optimization>> {
    try {
      const response = await apiClient.get("/optimizations", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching optimizations:", error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  async getOptimization(id: string): Promise<Optimization> {
    try {
      const response = await apiClient.get(`/optimizations/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching optimization:", error);
      throw error;
    }
  }

  async applyOptimization(id: string): Promise<{
    message: string;
    updatedPrompt: string;
    actualSavings: number;
  }> {
    try {
      const response = await apiClient.post(`/optimizations/${id}/apply`);
      return response.data.data;
    } catch (error) {
      console.error("Error applying optimization:", error);
      throw error;
    }
  }

  async provideFeedback(
    id: string,
    feedback: {
      helpful: boolean;
      comment?: string;
      actualSavings?: number;
    },
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(
        `/optimizations/${id}/feedback`,
        feedback,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error providing feedback:", error);
      throw error;
    }
  }

  async getPromptsForBulkOptimization(params: {
    service?: string;
    minCalls?: number;
    timeframe?: string;
  }): Promise<{ prompt: string; count: number; promptId: string }[]> {
    try {
      const response = await apiClient.get("/optimizations/bulk-prompts", {
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching prompts for bulk optimization:", error);
      return [];
    }
  }

  async analyzeOptimizationOpportunities(params?: {
    minUsage?: number;
    lookbackDays?: number;
    service?: string;
  }): Promise<{
    opportunities: Array<{
      prompt: string;
      currentCost: number;
      estimatedSavings: number;
      usageCount: number;
      avgTokens: number;
      confidence: number;
      service: string;
      model: string;
    }>;
    totalPotentialSavings: number;
    topPrompts: string[];
  }> {
    try {
      const response = await apiClient.get("/optimizations/opportunities", {
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error analyzing optimization opportunities:", error);
      return {
        opportunities: [],
        totalPotentialSavings: 0,
        topPrompts: [],
      };
    }
  }

  async getOptimizationPreview(request: {
    prompt: string;
    model: string;
    service: string;
    conversationHistory?: ConversationMessage[];
    enableCompression?: boolean;
    enableContextTrimming?: boolean;
    enableRequestFusion?: boolean;
    
    // Cortex-specific parameters
    enableCortex?: boolean;
    cortexOperation?: 'optimize' | 'compress' | 'analyze' | 'transform' | 'sast' | 'answer';
    cortexEncodingModel?: string;
    cortexCoreModel?: string;
    cortexDecodingModel?: string;
    cortexStyle?: 'formal' | 'casual' | 'technical' | 'conversational';
    cortexFormat?: 'plain' | 'markdown' | 'structured' | 'json';
    cortexSemanticCache?: boolean;
    cortexStructuredContext?: boolean;
    cortexPreserveSemantics?: boolean;
    cortexIntelligentRouting?: boolean;
  }): Promise<{
    suggestions: Array<{
      type: string;
      optimizedPrompt?: string;
      estimatedSavings: number;
      confidence: number;
      explanation: string;
      compressionDetails?: {
        technique: string;
        compressionRatio: number;
      };
      contextTrimDetails?: {
        technique: string;
        originalMessages: number;
        trimmedMessages: number;
      };
    }>;
    totalSavings: number;
    techniques: string[];
  }> {
    try {
      const response = await apiClient.post("/optimizations/preview", request);
      return response.data.data;
    } catch (error) {
      console.error("Error getting optimization preview:", error);
      return {
        suggestions: [],
        totalSavings: 0,
        techniques: [],
      };
    }
  }

  async createBatchOptimization(request: {
    requests: BatchOptimizationRequest[];
    enableFusion?: boolean;
    
    // Cortex batch options
    enableCortex?: boolean;
    cortexOperation?: 'optimize' | 'compress' | 'analyze' | 'transform' | 'sast' | 'answer';
    cortexStyle?: 'formal' | 'casual' | 'technical' | 'conversational';
  }): Promise<{
    message: string;
    data: Array<{
      id: string;
      improvementPercentage: number;
      costSaved: number;
      tokensSaved: number;
      fusionStrategy?: string;
    }>;
  }> {
    try {
      const response = await apiClient.post("/optimizations/batch", request);
      return response.data.data;
    } catch (error) {
      console.error("Error creating batch optimization:", error);
      throw error;
    }
  }

  async optimizeConversation(request: {
    messages: ConversationMessage[];
    model: string;
    service: string;
    enableCompression?: boolean;
    enableContextTrimming?: boolean;
    
    // Cortex conversation optimization
    enableCortex?: boolean;
    cortexOperation?: 'optimize' | 'compress' | 'analyze' | 'transform' | 'sast' | 'answer';
    cortexStyle?: 'formal' | 'casual' | 'technical' | 'conversational';
  }): Promise<{
    message: string;
    id: string;
    originalMessages: number;
    trimmedMessages?: number;
    improvementPercentage: number;
    costSaved: number;
    tokensSaved: number;
    optimizationType?: string;
    trimmingTechnique?: string;
  }> {
    try {
      const response = await apiClient.post(
        "/optimizations/conversation",
        request,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error optimizing conversation:", error);
      throw error;
    }
  }

  async bulkOptimize(params?: {
    service?: string;
    minCalls?: number;
    timeframe?: string;
    limit?: number;
    promptIds?: string[];
    cortexEnabled?: boolean;
    cortexConfig?: CortexConfig;
  }): Promise<{
    total: number;
    successful: number;
    failed: number;
    totalSavings: number;
    results: Array<{
      promptId: string;
      status: "success" | "failed";
      savings?: number;
      error?: string;
    }>;
  }> {
    try {
      const response = await apiClient.post(
        "/optimizations/bulk-legacy",
        params,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error bulk optimizing:", error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        totalSavings: 0,
        results: [],
      };
    }
  }

  async getOptimizationSummary(timeframe?: "7d" | "30d" | "all"): Promise<{
    total: number;
    applied: number;
    totalSaved: number;
    totalTokensSaved: number;
    avgImprovement: number;
    applicationRate: number;
    topCategories: Array<{
      category: string;
      count: number;
      avgSavings: number;
    }>;
    recentOptimizations: Optimization[];
  }> {
    try {
      const response = await apiClient.get("/optimizations/summary", {
        params: { timeframe },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching optimization summary:", error);
      return {
        total: 0,
        applied: 0,
        totalSaved: 0,
        totalTokensSaved: 0,
        avgImprovement: 0,
        applicationRate: 0,
        topCategories: [],
        recentOptimizations: [],
      };
    }
  }

  async testOptimization(request: {
    prompt: string;
    service: string;
    model: string;
    context?: string;
  }): Promise<{
    original: {
      tokens: number;
      cost: number;
    };
    optimized: {
      prompt: string;
      tokens: number;
      cost: number;
    };
    savings: {
      tokens: number;
      cost: number;
      percentage: number;
    };
    techniques: string[];
  }> {
    try {
      const response = await apiClient.post("/optimizations/preview", request);
      const data = response.data.data;

      // Transform preview data to test format
      return {
        original: {
          tokens: data.originalTokens || 0,
          cost: data.originalCost || 0,
        },
        optimized: {
          prompt: data.suggestions?.[0]?.optimizedPrompt || request.prompt,
          tokens: data.optimizedTokens || 0,
          cost: data.optimizedCost || 0,
        },
        savings: {
          tokens: data.tokensSaved || 0,
          cost: data.totalSavings || 0,
          percentage: data.improvementPercentage || 0,
        },
        techniques: data.techniques || [],
      };
    } catch (error) {
      console.error("Error testing optimization:", error);
      throw error;
    }
  }

  async getOptimizationHistory(promptHash: string): Promise<{
    history: Array<{
      id: string;
      version: number;
      prompt: string;
      tokens: number;
      cost: number;
      createdAt: string;
      appliedAt?: string;
    }>;
    currentVersion: number;
  }> {
    try {
      const response = await apiClient.get(
        `/optimizations/history/${promptHash}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching optimization history:", error);
      return {
        history: [],
        currentVersion: 1,
      };
    }
  }

  async revertOptimization(
    id: string,
    version: number,
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/optimizations/${id}/revert`, {
        version,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error reverting optimization:", error);
      throw error;
    }
  }

  async getOptimizationTemplates(category?: string): Promise<
    Array<{
      id: string;
      name: string;
      category: string;
      description: string;
      examples: Array<{
        before: string;
        after: string;
        savings: number;
      }>;
      techniques: string[];
      avgImprovement: number;
    }>
  > {
    try {
      const response = await apiClient.get("/optimizations/templates", {
        params: { category },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching optimization templates:", error);
      return [];
    }
  }

  async getOptimizationConfig(): Promise<Record<string, unknown>> {
    try {
      const response = await apiClient.get("/optimizations/config");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching optimization config:", error);
      return {
        enabledTechniques: [],
        defaultSettings: {},
        thresholds: {},
      };
    }
  }

  async updateOptimizationConfig(config: Record<string, unknown>): Promise<void> {
    try {
      await apiClient.put("/optimizations/config", config);
    } catch (error) {
      console.error("Error updating optimization config:", error);
      throw error;
    }
  }
}

export const optimizationService = new OptimizationService();
export { OptimizationService };
