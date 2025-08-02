import api, { analyticsApiClient, apiClient, longRunningApiClient } from "@/config/api";

export interface TagAnalytics {
  tag: string;
  totalCost: number;
  totalCalls: number;
  averageCost: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export interface RealTimeMetrics {
  tag: string;
  currentCost: number;
  hourlyRate: number;
  projectedDailyCost: number;
  projectedMonthlyCost: number;
}

export interface CostForecast {
  forecasts: Array<{
    date: string;
    predictedCost: number;
    confidence: number;
  }>;
  budgetAlerts?: Array<{
    message: string;
    severity: "low" | "medium" | "high";
  }>;
}

export interface PerformanceCorrelation {
  service: string;
  model: string;
  costPerRequest: number;
  performance: {
    latency: number;
    qualityScore: number;
  };
  efficiency: {
    costEfficiencyScore: number;
    performanceRating: "excellent" | "good" | "fair" | "poor";
  };
}

export class AdvancedMonitoringService {
  // Tag Analytics - using analyticsApiClient for shorter timeout
  static async getTagAnalytics(filters?: {
    timeRange?: string;
    tags?: string[];
  }): Promise<TagAnalytics[]> {
    try {
      const response = await analyticsApiClient.get("/tags/analytics", {
        params: filters,
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error("Tag analytics request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Tag analytics request timed out. Please try with fewer tags or a shorter time range.",
        );
      }
      throw error;
    }
  }

  static async getRealTimeMetrics(filters?: {
    tags?: string[];
  }): Promise<RealTimeMetrics[]> {
    try {
      const response = await analyticsApiClient.get("/tags/realtime", {
        params: filters,
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error("Real-time metrics request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Real-time metrics request timed out. Please try again.",
        );
      }
      throw error;
    }
  }

  // Cost Forecasting - using longRunningApiClient for longer operations
  static async generateCostForecast(params: {
    forecastType: "hourly" | "daily" | "weekly" | "monthly";
    timeHorizon: number;
    tags?: string[];
  }): Promise<CostForecast> {
    try {
      const response = await longRunningApiClient.post(
        "/forecasting/generate",
        params,
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Cost forecast request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Cost forecast request timed out. Please try with a smaller time horizon.",
        );
      }
      throw error;
    }
  }

  static async getPredictiveAlerts(params: {
    tags?: string[];
    budgetThreshold?: number;
  }): Promise<any> {
    try {
      const response = await longRunningApiClient.post(
        "/forecasting/alerts",
        params,
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error("Predictive alerts request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Predictive alerts request timed out. Please try again.",
        );
      }
      throw error;
    }
  }

  static async getSpendingPatterns(params: {
    timeRange?: string;
    tags?: string[];
  }): Promise<any> {
    try {
      const response = await analyticsApiClient.get("/forecasting/patterns", {
        params,
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error("Spending patterns request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Spending patterns request timed out. Please try with a shorter time range.",
        );
      }
      throw error;
    }
  }

  // Performance Cost Analysis - using analyticsApiClient for faster response
  static async analyzeCostPerformanceCorrelation(params: {
    tags?: string[];
    timeRange?: string;
  }): Promise<PerformanceCorrelation[]> {
    try {
      const response = await analyticsApiClient.post(
        "/performance-cost/analyze",
        params,
      );
      return response.data.data?.correlations || [];
    } catch (error: any) {
      console.error("Performance correlation request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Performance analysis request timed out. Please try with a smaller date range.",
        );
      }
      throw error;
    }
  }

  static async compareServices(params: {
    services: string[];
    timeRange?: string;
  }): Promise<any> {
    try {
      const response = await analyticsApiClient.post(
        "/performance-cost/compare",
        params,
      );
      return response.data.data || {};
    } catch (error: any) {
      console.error("Service comparison request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Service comparison request timed out. Please try with fewer services.",
        );
      }
      throw error;
    }
  }

  static async getPerformanceTrends(params: {
    timeRange?: string;
    tags?: string[];
  }): Promise<any> {
    try {
      const response = await analyticsApiClient.get(
        "/performance-cost/trends",
        { params },
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error("Performance trends request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Performance trends request timed out. Please try with a shorter time range.",
        );
      }
      throw error;
    }
  }

  static async getOptimizationOpportunities(params: {
    tags?: string[];
    threshold?: number;
  }): Promise<any> {
    try {
      const response = await analyticsApiClient.get(
        "/performance-cost/opportunities",
        { params },
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error(
        "Optimization opportunities request failed:",
        error.message,
      );
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Optimization opportunities request timed out. Please try again.",
        );
      }
      throw error;
    }
  }

  // Tag Management - using standard API for these operations
  static async createTagHierarchy(params: {
    parentTag: string;
    childTags: string[];
    rules?: any;
  }): Promise<any> {
    const response = await api.post("/tags/hierarchy", params);
    return response.data.data;
  }

  static async getTagSuggestions(params: {
    query?: string;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get("/tags/suggestions", { params });
    return response.data.data;
  }

  static async createCostAllocationRule(params: {
    name: string;
    conditions: any[];
    actions: any[];
    priority: number;
  }): Promise<any> {
    const response = await api.post("/tags/allocation-rules", params);
    return response.data.data;
  }

  static async compareTags(params: {
    tags: string[];
    timeRange?: string;
    metrics?: string[];
  }): Promise<any> {
    try {
      const response = await analyticsApiClient.post("/tags/compare", params);
      return response.data.data || {};
    } catch (error: any) {
      console.error("Tag comparison request failed:", error.message);
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Tag comparison request timed out. Please try with fewer tags.",
        );
      }
      throw error;
    }
  }
}

export default AdvancedMonitoringService;
