import { apiClient } from "@/config/api";
import { Alert, PaginatedResponse } from "../types";

class AlertService {
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: "low" | "medium" | "high" | "critical";
    read?: boolean;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: "asc" | "desc";
  }): Promise<PaginatedResponse<Alert>> {
    const response = await apiClient.get("/user/alerts", { params });
    const raw = response.data;
    // Normalize Nest { alerts, pagination } to Express { data, pagination }
    if (raw?.alerts !== undefined && raw?.data === undefined) {
      return {
        data: Array.isArray(raw.alerts) ? raw.alerts : [],
        pagination: raw.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 },
      };
    }
    return {
      data: Array.isArray(raw?.data) ? raw.data : [],
      pagination: raw?.pagination ?? { page: 1, limit: 20, total: 0, pages: 0 },
    };
  }

  async getAlert(id: string): Promise<{
    success: boolean;
    data: Alert;
  }> {
    const response = await apiClient.get(`/user/alerts/${id}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.put(`/user/alerts/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<{
    success: boolean;
    message: string;
    updated: number;
  }> {
    const response = await apiClient.put("/user/alerts/read-all");
    return response.data;
  }

  async deleteAlert(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(`/user/alerts/${id}`);
    return response.data;
  }

  async getAlertSettings(): Promise<{
    success: boolean;
    data: {
      email: {
        costAlerts: boolean;
        optimizationSuggestions: boolean;
        monthlyReports: boolean;
        anomalyDetection: boolean;
      };
      push: {
        costAlerts: boolean;
        optimizationSuggestions: boolean;
        anomalyDetection: boolean;
      };
      thresholds: {
        dailyCostLimit: number;
        weeklyCostLimit: number;
        monthlyCostLimit: number;
        anomalyPercentage: number;
      };
    };
  }> {
    const response = await apiClient.get("/user/alerts/settings");
    return response.data;
  }

  async updateAlertSettings(settings: any): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.put("/user/alerts/settings", settings);
    return response.data;
  }

  async testAlert(type: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.post("/user/alerts/test", { type });
    return response.data;
  }

  async getUnreadCount(): Promise<{
    success: boolean;
    data: {
      count: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  }> {
    const response = await apiClient.get("/user/alerts/unread-count");
    const raw = response.data;
    // Normalize Nest { count } or { data: { count, ... } } to expected shape
    const data = raw?.data ?? raw;
    const count = data?.count ?? 0;
    return {
      success: true,
      data: {
        count,
        critical: data?.critical ?? 0,
        high: data?.high ?? 0,
        medium: data?.medium ?? 0,
        low: data?.low ?? 0,
      },
    };
  }

  async snoozeAlert(
    id: string,
    until: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.put(`/user/alerts/${id}/snooze`, { until });
    return response.data;
  }

  async getAlertHistory(params?: {
    page?: number;
    limit?: number;
    groupBy?: "day" | "week" | "month";
  }): Promise<{
    success: boolean;
    data: {
      history: Array<{
        date: string;
        counts: {
          total: number;
          costAlerts: number;
          optimizations: number;
          anomalies: number;
          system: number;
        };
        totalCostImpact: number;
      }>;
      summary: {
        totalAlerts: number;
        avgPerDay: number;
        mostCommonType: string;
        totalCostImpact: number;
      };
    };
  }> {
    const response = await apiClient.get("/user/alerts/history", { params });
    return response.data;
  }
}

export const alertService = new AlertService();
