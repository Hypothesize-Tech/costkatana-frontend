import api from '../config/api';

export interface UsageMetrics {
    tokens: number;
    requests: number;
    logs: number;
    projects: number;
    agentTraces: number;
    cost: number;
    period: 'daily' | 'monthly';
}

export interface PlanLimits {
    tokensPerMonth: number;
    requestsPerMonth: number;
    logsPerMonth: number;
    projects: number;
    agentTraces: number;
    seats: number;
    models: string[];
    features: string[];
}

export interface UsageStats {
    current: UsageMetrics;
    limits: PlanLimits;
    percentages: {
        tokens: number;
        requests: number;
        logs: number;
        projects: number;
        agentTraces: number;
    };
    plan: string;
    recommendations: string[];
    predictions: {
        tokens: number;
        requests: number;
        logs: number;
    };
    dailyTrend?: any[];
}

export interface GuardrailViolation {
    type: 'soft' | 'hard' | 'warning';
    metric: string;
    current: number;
    limit: number;
    percentage: number;
    message: string;
    action: 'allow' | 'throttle' | 'block';
    suggestions: string[];
}

export interface UsageAlert {
    _id: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    metadata: any;
    read: boolean;
    createdAt: string;
}

class GuardrailsService {
    /**
     * Get current usage statistics
     */
    async getUserUsage(): Promise<UsageStats> {
        try {
            const response = await api.get('/guardrails/usage');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage stats:', error);
            throw error;
        }
    }

    /**
     * Get usage trend over time by days
     */
    async getUsageTrend(days: number = 7): Promise<any[]> {
        try {
            const response = await api.get(`/guardrails/usage/trend?days=${days}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage trend:', error);
            throw error;
        }
    }

    /**
     * Get usage trend over time by date range
     */
    async getUsageTrendByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
        try {
            const response = await api.get(`/guardrails/usage/trend/range`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage trend by date range:', error);
            throw error;
        }
    }

    /**
     * Get usage alerts
     */
    async getUsageAlerts(): Promise<UsageAlert[]> {
        try {
            const response = await api.get('/guardrails/usage/alerts');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching usage alerts:', error);
            throw error;
        }
    }

    /**
     * Check if a request would violate guardrails
     */
    async checkGuardrails(
        requestType: 'token' | 'request' | 'log',
        amount: number = 1,
        modelId?: string
    ): Promise<{ allowed: boolean; violation?: GuardrailViolation }> {
        try {
            const response = await api.post('/guardrails/check', {
                requestType,
                amount,
                modelId
            });
            return response.data.data;
        } catch (error) {
            console.error('Error checking guardrails:', error);
            throw error;
        }
    }

    /**
     * Get plan limits
     */
    async getPlanLimits(plan: string = 'free'): Promise<any> {
        try {
            const response = await api.get(`/guardrails/plans/${plan}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching plan limits:', error);
            throw error;
        }
    }

    /**
     * Update subscription
     */
    async updateSubscription(plan: string, seats?: number): Promise<any> {
        try {
            const response = await api.put('/guardrails/subscription', {
                plan,
                seats
            });
            return response.data.data;
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    }

    /**
     * Mark alert as read
     */
    async markAlertAsRead(alertId: string): Promise<void> {
        try {
            await api.put(`/alerts/${alertId}/read`);
        } catch (error) {
            console.error('Error marking alert as read:', error);
            throw error;
        }
    }

    /**
     * Format usage percentage for display
     */
    formatUsagePercentage(current: number, limit: number): string {
        if (limit === -1) return 'Unlimited';
        const percentage = (current / limit) * 100;
        return `${percentage.toFixed(1)}%`;
    }

    /**
     * Get usage status color
     */
    getUsageStatusColor(percentage: number): string {
        if (percentage >= 90) return 'danger';
        if (percentage >= 75) return 'warning';
        if (percentage >= 50) return 'info';
        return 'success';
    }

    /**
     * Check if user should be warned about usage
     */
    shouldWarnAboutUsage(percentage: number): boolean {
        return percentage >= 75;
    }

    /**
     * Check if user should be blocked
     */
    shouldBlockUsage(percentage: number): boolean {
        return percentage >= 100;
    }

    /**
     * Calculate days until limit reset
     */
    getDaysUntilReset(): number {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const diffTime = Math.abs(nextMonth.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Format bytes to human readable
     */
    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Calculate cost savings from optimizations
     */
    calculateSavings(originalCost: number, optimizedCost: number): {
        amount: number;
        percentage: number;
    } {
        const amount = originalCost - optimizedCost;
        const percentage = (amount / originalCost) * 100;
        return {
            amount: parseFloat(amount.toFixed(2)),
            percentage: parseFloat(percentage.toFixed(1))
        };
    }
}

export const guardrailsService = new GuardrailsService();
