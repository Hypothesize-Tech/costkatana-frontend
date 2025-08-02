import { apiClient } from "../config/api";
import { analyticsService } from "./analytics.service";

export interface DashboardStats {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  averageCostPerRequest: number;
  costChange?: number;
  tokensChange?: number;
  requestsChange?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  chartData: Array<{
    date: string;
    cost: number;
    tokens: number;
    requests: number;
  }>;
  serviceBreakdown: Array<{
    service: string;
    cost: number;
    requests: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    cost: number;
  }>;
  projectBreakdown?: Array<{
    projectId: string;
    projectName: string;
    cost: number;
    requests: number;
    percentage: number;
    budgetUtilization?: number;
  }>;
}

export class DashboardService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_TTL = 60000; // 1 minute

  /**
   * Get dashboard data from analytics endpoint
   */
  static async getDashboardData(projectId?: string): Promise<DashboardData> {
    try {
      const cacheKey = `dashboard_${projectId || "all"}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      const safeNumber = (val: any) =>
        typeof val === "number" && !isNaN(val) ? val : 0;

      const response = await analyticsService.getDashboardData(projectId);

      // Ensure the response has the expected structure
      const overview = response.overview || {};
      const charts = response.charts || {};

      const dashboardData: DashboardData = {
        stats: {
          totalCost: safeNumber(overview.totalCost?.value),
          totalTokens: safeNumber(
            overview.totalTokens?.value ||
              charts.costOverTime?.reduce(
                (sum: number, item: any) => sum + safeNumber(item.tokens),
                0,
              ),
          ),
          totalRequests: safeNumber(overview.totalCalls?.value),
          averageCostPerRequest: safeNumber(overview.avgCostPerCall?.value),
          costChange: safeNumber(overview.totalCost?.change?.percentage),
          tokensChange: safeNumber(overview.totalTokens?.change?.percentage),
          requestsChange: safeNumber(overview.totalCalls?.change?.percentage),
        },
        chartData: (charts.costOverTime || []).map((item: any) => ({
          date: item.date,
          cost: safeNumber(item.cost),
          tokens: safeNumber(item.tokens),
          requests: safeNumber(item.requests || item.calls),
        })),
        serviceBreakdown: (charts.serviceBreakdown || []).map((item: any) => ({
          service: item.service || "Unknown",
          cost: safeNumber(item.totalCost || item.cost),
          requests: safeNumber(
            item.totalRequests || item.requests || item.calls,
          ),
          percentage: safeNumber(item.percentage),
        })),
        recentActivity: [],
        projectBreakdown: (response.projectBreakdown || []).map(
          (item: any) => ({
            projectId: item.projectId,
            projectName: item.projectName || "Unknown Project",
            cost: safeNumber(item.totalCost || item.cost),
            requests: safeNumber(item.totalRequests || item.requests),
            percentage: safeNumber(item.percentage),
            budgetUtilization: safeNumber(item.budgetUtilization),
          }),
        ),
      };

      this.cache.set(cacheKey, { data: dashboardData, timestamp: Date.now() });
      return dashboardData;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Return fallback data structure
      return {
        stats: {
          totalCost: 0,
          totalTokens: 0,
          totalRequests: 0,
          averageCostPerRequest: 0,
          costChange: 0,
          tokensChange: 0,
          requestsChange: 0,
        },
        chartData: [],
        serviceBreakdown: [],
        recentActivity: [],
        projectBreakdown: [],
      };
    }
  }

  /**
   * Get dashboard data with date range
   */
  static async getDashboardDataByRange(
    startDate: string,
    endDate: string,
    projectId?: string,
  ): Promise<DashboardData> {
    try {
      const endpoint = projectId
        ? `/analytics/projects/${projectId}`
        : "/analytics";
      const response = await apiClient.get(endpoint, {
        params: { startDate, endDate },
      });
      const data = response.data.data || response.data;

      // Transform the data to match our interface
      return {
        stats: {
          totalCost: data.summary?.totalCost || 0,
          totalTokens: data.summary?.totalTokens || 0,
          totalRequests: data.summary?.totalRequests || 0,
          averageCostPerRequest: data.summary?.averageCostPerRequest || 0,
          costChange: data.trends?.costChange || 0,
          tokensChange: data.trends?.tokensChange || 0,
          requestsChange: data.trends?.requestsChange || 0,
        },
        chartData:
          data.timeline?.map((item: any) => ({
            date: item.date,
            cost: item.cost,
            tokens: item.tokens,
            requests: item.requests,
          })) || [],
        serviceBreakdown:
          data.breakdown?.services?.map((service: any) => ({
            service: service.service,
            cost: service.cost,
            requests: service.requests,
            percentage: service.percentage,
          })) || [],
        recentActivity:
          data.recentActivity?.map((activity: any) => ({
            id: activity._id,
            type: activity.type || "api_request",
            description:
              activity.description || `${activity.service} - ${activity.model}`,
            timestamp: activity.timestamp || activity.createdAt,
            cost: activity.cost,
          })) || [],
      };
    } catch (error) {
      console.error("Error fetching dashboard data by range:", error);
      // Fallback to default dashboard data
      return this.getDashboardData();
    }
  }

  /**
   * Get insights data
   */
  static async getInsights(): Promise<any> {
    try {
      const response = await apiClient.get("/analytics/insights");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching insights:", error);
      return {
        optimizationOpportunities: [],
        costSavings: 0,
        recommendations: [],
      };
    }
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(
    limit: number = 10,
    projectId?: string,
  ): Promise<any[]> {
    try {
      const params: any = {
        limit,
        sort: "createdAt",
        order: "desc",
      };

      if (projectId && projectId !== "all") {
        params.projectId = projectId;
      }

      const response = await apiClient.get("/usage", { params });

      return (
        response.data.data ||
        response.data.map((usage: any) => ({
          id: usage._id,
          type: "api_request",
          description: `${usage.service} - ${usage.model}`,
          timestamp: usage.createdAt,
          cost: usage.cost,
          metadata: {
            service: usage.service,
            model: usage.model,
            tokens: usage.totalTokens,
            projectId: usage.projectId,
          },
        }))
      );
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }
  }

  /**
   * Get cost trends
   */
  static async getCostTrends(
    period: "week" | "month" | "quarter" | "year" = "month",
    projectId?: string,
  ): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const params: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      if (projectId && projectId !== "all") {
        params.projectId = projectId;
      }

      const response = await apiClient.get("/analytics", { params });

      return response.data.data || response.data.timeline || [];
    } catch (error) {
      console.error("Error fetching cost trends:", error);
      return [];
    }
  }

  /**
   * Get service performance
   */
  static async getServicePerformance(projectId?: string): Promise<any[]> {
    try {
      const params: any = {};

      if (projectId && projectId !== "all") {
        params.projectId = projectId;
      }

      const response = await apiClient.get("/analytics", { params });
      return response.data.data || response.data.breakdown?.services || [];
    } catch (error) {
      console.error("Error fetching service performance:", error);
      return [];
    }
  }

  /**
   * Connect to real-time usage updates via SSE
   */
  static connectToUsageUpdates(
    onUpdate: (data: any) => void,
  ): EventSource | null {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No auth token available for SSE connection");
        return null;
      }

      const eventSource = new EventSource(
        `${API_URL}/api/usage/stream?token=${token}`,
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onopen = () => {
        console.log("✅ Connected to real-time usage updates");
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE connection error:", error);
      };

      return eventSource;
    } catch (error) {
      console.error("Failed to connect to usage updates:", error);
      return null;
    }
  }

  async getQuickStats(): Promise<{
    currentMonthCost: number;
    lastMonthCost: number;
    costTrend: number;
    activeServices: number;
    totalOptimizations: number;
    savedThisMonth: number;
    topService: string;
    topModel: string;
  }> {
    const response = await apiClient.get("/dashboard/quick-stats");
    return response.data.data || response.data;
  }

  async getServiceBreakdown(): Promise<{
    services: Array<{
      name: string;
      cost: number;
      calls: number;
      percentage: number;
      trend: number;
    }>;
    totalServices: number;
    mostUsedService: string;
    mostExpensiveService: string;
  }> {
    const response = await apiClient.get("/dashboard/service-breakdown");
    return response.data.data || response.data;
  }

  async getModelPerformance(): Promise<{
    models: Array<{
      name: string;
      service: string;
      calls: number;
      cost: number;
      avgResponseTime: number;
      successRate: number;
      costPerToken: number;
      trend: number;
    }>;
    topPerforming: string;
    mostCostEffective: string;
    recommendations: Array<{
      currentModel: string;
      suggestedModel: string;
      potentialSavings: number;
      reason: string;
    }>;
  }> {
    const response = await apiClient.get("/dashboard/model-performance");
    return response.data.data || response.data;
  }

  async refreshDashboard(): Promise<{
    message: string;
    lastUpdated: string;
  }> {
    const response = await apiClient.post("/dashboard/refresh");
    return response.data.data || response.data;
  }
}

export const dashboardService = new DashboardService();
