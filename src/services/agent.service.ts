import { apiClient } from "@/config/api";

export interface AgentQuery {
  query: string;
  context?: {
    projectId?: string;
    conversationId?: string;
    previousMessages?: Array<{ role: string; content: string }>;
    [key: string]: any;
  };
}

export interface AgentResponse {
  success: boolean;
  response: string;
  metadata?: {
    toolsUsed?: string[];
    executionTime?: number;
    tokensUsed?: number;
    cost?: number;
    confidence?: number;
    sources?: string[];
    [key: string]: any;
  };
  error?: string;
}

export interface WizardStartRequest {
  projectType?: string;
  quickStart?: boolean;
}

export interface WizardContinueRequest {
  response: string;
  wizardState: {
    step: number;
    responses?: string[];
    [key: string]: any;
  };
}

export interface SuggestedQueriesResponse {
  success: boolean;
  data: {
    suggestions: string[];
    categories: {
      projectManagement: string[];
      modelSelection: string[];
      costOptimization: string[];
    };
    timestamp: string;
  };
}

export interface ConversationHistoryResponse {
  success: boolean;
  data: {
    conversationId: string;
    messages: Array<{
      id: string;
      role: "user" | "agent";
      content: string;
      timestamp: string;
      metadata?: any;
    }>;
    totalMessages: number;
  };
}

export interface AgentStatusResponse {
  success: boolean;
  data: {
    status: "online" | "offline" | "busy";
    capabilities: string[];
    toolsAvailable: string[];
    lastUpdated: string;
    version: string;
  };
}

class AgentService {
  private baseURL = "/api/agent";

  /**
   * Send a query to the AI agent
   */
  async query(queryData: AgentQuery): Promise<AgentResponse> {
    try {
      const response = await apiClient.post(`${this.baseURL}/query`, queryData);
      return response.data;
    } catch (error: any) {
      console.error("Agent query failed:", error);
      return {
        success: false,
        response:
          "I apologize, but I encountered an error processing your request. Please try again.",
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Start conversational project creation wizard
   */
  async startProjectWizard(data: WizardStartRequest): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseURL}/wizard/start`, data);
      return response.data;
    } catch (error: any) {
      console.error("Project wizard start failed:", error);
      throw error;
    }
  }

  /**
   * Continue project creation wizard conversation
   */
  async continueProjectWizard(data: WizardContinueRequest): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseURL}/wizard/continue`, data);
      return response.data;
    } catch (error: any) {
      console.error("Project wizard continue failed:", error);
      throw error;
    }
  }

  /**
   * Get suggested queries for the user
   */
  async getSuggestedQueries(): Promise<SuggestedQueriesResponse> {
    try {
      const response = await apiClient.get(`${this.baseURL}/suggestions`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to get suggested queries:", error);
      return {
        success: false,
        data: {
          suggestions: [],
          categories: {
            projectManagement: [],
            modelSelection: [],
            costOptimization: [],
          },
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    conversationId?: string,
    limit?: number,
  ): Promise<ConversationHistoryResponse> {
    try {
      const params = new URLSearchParams();
      if (conversationId) params.append("conversationId", conversationId);
      if (limit) params.append("limit", limit.toString());

      const response = await apiClient.get(
        `${this.baseURL}/conversations?${params.toString()}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to get conversation history:", error);
      throw error;
    }
  }

  /**
   * Get agent status and capabilities
   */
  async getStatus(): Promise<AgentStatusResponse> {
    try {
      const response = await apiClient.get(`${this.baseURL}/status`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to get agent status:", error);
      return {
        success: false,
        data: {
          status: "offline",
          capabilities: [],
          toolsAvailable: [],
          lastUpdated: new Date().toISOString(),
          version: "unknown",
        },
      };
    }
  }

  /**
   * Provide feedback on agent responses
   */
  async provideFeedback(data: {
    messageId: string;
    rating: "positive" | "negative";
    feedback?: string;
    category?: string;
  }): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post(`${this.baseURL}/feedback`, data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to provide feedback:", error);
      return { success: false };
    }
  }

  /**
   * Stream responses for real-time conversation
   */
  async streamQuery(
    queryData: AgentQuery,
  ): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const response = await fetch(
        `${apiClient.defaults.baseURL}${this.baseURL}/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(queryData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error("Stream query failed:", error);
      return null;
    }
  }

  /**
   * Comprehensive analytics query
   */
  async getAnalytics(
    query: string,
    options?: {
      timeRange?: {
        startDate?: string;
        endDate?: string;
        period?: "day" | "week" | "month" | "quarter" | "year";
      };
      filters?: {
        models?: string[];
        providers?: string[];
        tags?: string[];
      };
    },
  ): Promise<AgentResponse> {
    const analyticsQuery = `${query}${options ? ` with the following options: ${JSON.stringify(options)}` : ""}`;

    return this.query({
      query: analyticsQuery,
      context: {
        type: "analytics",
        options,
      },
    });
  }

  /**
   * Optimization analysis query
   */
  async getOptimizations(
    query: string,
    options?: {
      minSavingsThreshold?: number;
      targetCostReduction?: number;
      optimizationTypes?: string[];
    },
  ): Promise<AgentResponse> {
    const optimizationQuery = `${query}${options ? ` with optimization parameters: ${JSON.stringify(options)}` : ""}`;

    return this.query({
      query: optimizationQuery,
      context: {
        type: "optimization",
        options,
      },
    });
  }

  /**
   * Model recommendation query
   */
  async getModelRecommendations(
    query: string,
    useCase?: {
      type?:
        | "api-calls"
        | "chatbot"
        | "content-generation"
        | "data-analysis"
        | "code-generation"
        | "summarization";
      volume?: "low" | "medium" | "high";
      complexity?: "simple" | "moderate" | "complex";
      priority?: "cost" | "quality" | "speed" | "balanced";
    },
  ): Promise<AgentResponse> {
    const modelQuery = `${query}${useCase ? ` for use case: ${JSON.stringify(useCase)}` : ""}`;

    return this.query({
      query: modelQuery,
      context: {
        type: "model_recommendation",
        useCase,
      },
    });
  }

  /**
   * Project management query
   */
  async manageProject(
    action: string,
    projectData?: any,
  ): Promise<AgentResponse> {
    return this.query({
      query: `${action}${projectData ? ` with data: ${JSON.stringify(projectData)}` : ""}`,
      context: {
        type: "project_management",
        action,
        projectData,
      },
    });
  }

  /**
   * Quick actions for common use cases
   */
  quickActions = {
    createProject: (name: string, type: string, requirements?: any) =>
      this.manageProject(
        `Create a new ${type} project named "${name}"`,
        requirements,
      ),

    analyzeSpending: (timeRange?: string) =>
      this.getAnalytics(
        `Analyze my spending patterns${timeRange ? ` for ${timeRange}` : ""}`,
      ),

    findSavings: (minAmount?: number) =>
      this.getOptimizations(
        `Find cost optimization opportunities${minAmount ? ` with minimum savings of $${minAmount}` : ""}`,
      ),

    recommendModel: (useCase: string, priority?: string) =>
      this.getModelRecommendations(
        `Recommend the best AI model for ${useCase}${priority ? ` with ${priority} priority` : ""}`,
      ),

    getDashboard: () =>
      this.getAnalytics(
        "Show me my dashboard analytics with key metrics and insights",
      ),

    detectAnomalies: () =>
      this.getAnalytics(
        "Detect any cost anomalies or unusual spending patterns",
      ),

    compareModels: (models: string[]) =>
      this.getModelRecommendations(
        `Compare these models: ${models.join(", ")} and tell me which is best`,
      ),

    optimizeProject: (projectId: string) =>
      this.getOptimizations(
        `Analyze and optimize project ${projectId} for cost savings`,
      ),
  };

  /**
   * Batch operations
   */
  async batchAnalysis(queries: string[]): Promise<AgentResponse[]> {
    try {
      const results = await Promise.all(
        queries.map((query) => this.query({ query })),
      );
      return results;
    } catch (error) {
      console.error("Batch analysis failed:", error);
      return [];
    }
  }

  /**
   * Export conversation data
   */
  async exportConversation(
    conversationId: string,
    format: "json" | "csv" | "txt" = "json",
  ): Promise<Blob | null> {
    try {
      const response = await apiClient.get(
        `${this.baseURL}/conversations/${conversationId}/export`,
        {
          params: { format },
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to export conversation:", error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.getStatus();
      return response.success && response.data.status !== "offline";
    } catch (error) {
      return false;
    }
  }
}

export const agentService = new AgentService();
