import {
  User,
  UserPreferences,
  Alert,
  Subscription,
  PaginatedResponse,
} from "../types";
import { apiClient } from "../config/api";

interface DashboardApiKey {
  keyId: string;
  name: string;
  maskedKey: string;
  permissions: string[];
  lastUsed?: string;
  createdAt: string;
  expiresAt?: string;
  isExpired: boolean;
}

// src/services/user.service.ts
export class UserService {
  static async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get("/user/profile");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  static async updateProfile(data: Partial<UserPreferences>): Promise<User> {
    try {
      const response = await apiClient.put("/user/profile", data);
      return response.data.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  // Dashboard API Key Management
  static async getDashboardApiKeys(): Promise<DashboardApiKey[]> {
    try {
      const response = await apiClient.get("/user/dashboard-api-keys");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching dashboard API keys:", error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  static async createDashboardApiKey(
    name: string,
    permissions: string[],
    expiresAt?: string,
  ): Promise<any> {
    try {
      const response = await apiClient.post("/user/dashboard-api-keys", {
        name,
        permissions,
        expiresAt,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating dashboard API key:", error);
      throw error;
    }
  }

  static async deleteDashboardApiKey(keyId: string): Promise<void> {
    try {
      await apiClient.delete(`/user/dashboard-api-keys/${keyId}`);
    } catch (error) {
      console.error("Error deleting dashboard API key:", error);
      throw error;
    }
  }

  static async updateDashboardApiKey(
    keyId: string,
    data: { name?: string; permissions?: string[]; expiresAt?: string },
  ): Promise<DashboardApiKey> {
    try {
      const response = await apiClient.put(
        `/user/dashboard-api-keys/${keyId}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating dashboard API key:", error);
      throw error;
    }
  }

  // Alert Management
  static async getAlerts(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<PaginatedResponse<Alert>> {
    try {
      const response = await apiClient.get("/user/alerts", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw error;
    }
  }

  static async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await apiClient.put(`/user/alerts/${alertId}/read`);
    } catch (error) {
      console.error("Error marking alert as read:", error);
      throw error;
    }
  }

  static async markAllAlertsAsRead(): Promise<void> {
    try {
      await apiClient.put("/user/alerts/read-all");
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
      throw error;
    }
  }

  static async deleteAlert(alertId: string): Promise<void> {
    try {
      await apiClient.delete(`/user/alerts/${alertId}`);
    } catch (error) {
      console.error("Error deleting alert:", error);
      throw error;
    }
  }

  static async getUnreadAlertCount(): Promise<number> {
    try {
      const response = await this.getAlerts({ unreadOnly: true, limit: 1 });
      return response.pagination.total;
    } catch (error) {
      console.error("Error fetching unread alert count:", error);
      return 0;
    }
  }

  // Subscription Management
  static async getSubscription(): Promise<{
    plan: string;
    startDate: string;
    endDate?: string;
    limits: any;
    usage: any;
  }> {
    try {
      const response = await apiClient.get("/user/subscription");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      // Return default subscription
      return {
        plan: "free",
        startDate: new Date().toISOString(),
        limits: {
          requests: 1000,
          projects: 3,
        },
        usage: {
          requests: 0,
          projects: 0,
        },
      };
    }
  }

  static async updateSubscription(plan: string): Promise<Subscription> {
    try {
      const response = await apiClient.put("/user/subscription", { plan });
      return response.data.data;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  }

  // Helper methods
  static isSubscriptionActive(subscription: Subscription): boolean {
    if (!subscription.endDate) return true;
    return new Date(subscription.endDate) > new Date();
  }

  static getUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  }

  static formatApiKey(key: string): string {
    if (key.includes("...")) return key; // Already masked
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  static async getAvatarUploadUrl(
    fileName: string,
    fileType: string,
  ): Promise<{
    uploadUrl: string;
    key: string;
    finalUrl: string;
  }> {
    try {
      const response = await apiClient.post("/user/profile/avatar-upload-url", {
        fileName,
        fileType,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error getting avatar upload URL:", error);
      throw error;
    }
  }

  static async getUserStats(): Promise<any> {
    try {
      const response = await apiClient.get("/user/stats");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        totalProjects: 0,
        totalCost: 0,
        totalRequests: 0,
        joinedDate: new Date().toISOString(),
      };
    }
  }

  static async getUserActivities(params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.get("/user/activities", { params });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user activities:", error);
      return {
        activities: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }
}

export const userService = UserService;
