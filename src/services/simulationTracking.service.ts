import { apiClient } from "../config/api";

export interface SimulationTrackingData {
    sessionId: string;
    originalUsageId?: string;
    simulationType: 'real_time_analysis' | 'prompt_optimization' | 'context_trimming' | 'model_comparison';
    originalModel: string;
    originalPrompt: string;
    originalCost: number;
    originalTokens: number;
    parameters?: {
        temperature?: number;
        maxTokens?: number;
        trimPercentage?: number;
        alternativeModels?: string[];
    };
    optimizationOptions: Array<{
        type: string;
        description: string;
        newModel?: string;
        newCost?: number;
        savings?: number;
        savingsPercentage?: number;
        risk?: 'low' | 'medium' | 'high';
        implementation?: 'easy' | 'moderate' | 'complex';
        confidence?: number;
    }>;
    recommendations: any[];
    potentialSavings: number;
    confidence: number;
    projectId?: string;
}

export interface OptimizationApplication {
    optionIndex: number;
    type: string;
    estimatedSavings: number;
    userFeedback?: {
        satisfied: boolean;
        comment?: string;
        rating?: number;
    };
}

export interface LeaderboardEntry {
    userId: string;
    userName?: string;
    totalSavings: number;
    optimizationsApplied: number;
    averageSavings: number;
    topOptimizationType: string;
    rank?: number;
}

export interface SimulationStats {
    totalSimulations: number;
    totalOptimizationsApplied: number;
    acceptanceRate: number;
    averageSavings: number;
    totalPotentialSavings: number;
    totalActualSavings: number;
    topOptimizationTypes: Array<{
        type: string;
        count: number;
        averageSavings: number;
        acceptanceRate: number;
    }>;
    userEngagement: {
        averageTimeSpent: number;
        averageOptionsViewed: number;
        returnUsers: number;
    };
    weeklyTrends: Array<{
        week: string;
        simulations: number;
        applications: number;
        savings: number;
    }>;
}

export class SimulationTrackingService {
    private static baseUrl = '/simulation-tracking';

    /**
     * Track a new simulation
     */
    static async trackSimulation(data: SimulationTrackingData): Promise<string> {
        try {
            const response = await apiClient.post(`${this.baseUrl}/track`, data);
            return response.data.data.trackingId;
        } catch (error) {
            console.error('Error tracking simulation:', error);
            throw error;
        }
    }

    /**
     * Track optimization application
     */
    static async trackOptimizationApplication(
        trackingId: string,
        application: OptimizationApplication
    ): Promise<void> {
        try {
            await apiClient.post(`${this.baseUrl}/${trackingId}/apply`, application);
        } catch (error) {
            console.error('Error tracking optimization application:', error);
            throw error;
        }
    }

    /**
     * Update viewing metrics
     */
    static async updateViewingMetrics(
        trackingId: string,
        timeSpent: number,
        optionsViewed: number[]
    ): Promise<void> {
        try {
            await apiClient.put(`${this.baseUrl}/${trackingId}/metrics`, {
                timeSpent,
                optionsViewed
            });
        } catch (error) {
            console.error('Error updating viewing metrics:', error);
            throw error;
        }
    }

    /**
     * Get simulation statistics
     */
    static async getSimulationStats(
        global: boolean = false,
        startDate?: string,
        endDate?: string
    ): Promise<SimulationStats> {
        try {
            const params = new URLSearchParams();
            if (global) params.append('global', 'true');
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await apiClient.get(`${this.baseUrl}/stats?${params}`);
            return response.data.data;
        } catch (error) {
            console.error('Error getting simulation stats:', error);
            throw error;
        }
    }

    /**
     * Get top optimization wins leaderboard
     */
    static async getTopOptimizationWins(
        startDate?: string,
        endDate?: string,
        limit: number = 10
    ): Promise<LeaderboardEntry[]> {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('limit', limit.toString());

            const response = await apiClient.get(`${this.baseUrl}/leaderboard?${params}`);
            return response.data.data;
        } catch (error) {
            console.error('Error getting top optimization wins:', error);
            throw error;
        }
    }

    /**
     * Get user simulation history
     */
    static async getUserSimulationHistory(
        limit: number = 20,
        offset: number = 0
    ): Promise<any[]> {
        try {
            const params = new URLSearchParams();
            params.append('limit', limit.toString());
            params.append('offset', offset.toString());

            const response = await apiClient.get(`${this.baseUrl}/history?${params}`);
            return response.data.data;
        } catch (error) {
            console.error('Error getting user simulation history:', error);
            throw error;
        }
    }
}

export default SimulationTrackingService;