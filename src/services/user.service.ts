import {
    User,
    UserPreferences,
    ApiKey,
    Alert,
    Subscription,
    PaginatedResponse,
} from '@/types';
import api from '@/config/api';

// src/services/user.service.ts
export class UserService {
    static async getProfile(): Promise<User> {
        const response = await api.get<User>('/users/profile');
        return response.data!;
    }

    static async updateProfile(data: {
        name?: string;
        preferences?: Partial<UserPreferences>;
    }): Promise<User> {
        const response = await api.put<User>('/users/profile', data);
        return response.data!;
    }

    // API Key Management
    static async getApiKeys(): Promise<ApiKey[]> {
        const response = await api.get<ApiKey[]>('/users/api-keys');
        return response.data!;
    }

    static async addApiKey(service: string, key: string): Promise<ApiKey> {
        const response = await api.post<ApiKey>('/users/api-keys', { service, key });
        return response.data!;
    }

    static async removeApiKey(service: string): Promise<void> {
        await api.delete(`/users/api-keys/${service}`);
    }

    // Alert Management
    static async getAlerts(params?: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    }): Promise<PaginatedResponse<Alert>> {
        const queryParams = new URLSearchParams();

        if (params) {
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());
        }

        const response = await api.get<Alert[]>(`/users/alerts?${queryParams.toString()}`);
        return response as any;
    }

    static async markAlertAsRead(alertId: string): Promise<void> {
        await api.put(`/users/alerts/${alertId}/read`);
    }

    static async markAllAlertsAsRead(): Promise<void> {
        await api.put('/users/alerts/read-all');
    }

    static async deleteAlert(alertId: string): Promise<void> {
        await api.delete(`/users/alerts/${alertId}`);
    }

    static async getUnreadAlertCount(): Promise<number> {
        const response = await this.getAlerts({ unreadOnly: true, limit: 1 });
        return response.pagination.total;
    }

    // Subscription Management
    static async getSubscription(): Promise<{
        plan: string;
        startDate: string;
        endDate?: string;
        limits: any;
        usage: any;
    }> {
        const response = await api.get('/users/subscription');
        return response.data!;
    }

    static async updateSubscription(plan: 'free' | 'pro' | 'enterprise'): Promise<Subscription> {
        const response = await api.put<Subscription>('/users/subscription', { plan });
        return response.data!;
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
        if (key.includes('...')) return key; // Already masked
        return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    }
}

export const userService = UserService;