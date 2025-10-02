import { apiClient } from "@/config/api";

export interface PredictiveIntelligenceData {
    projectId?: string;
    teamId?: string;
    userId: string;
    timeHorizon: number;
    historicalTokenTrends: any;
    promptLengthGrowth: any;
    modelSwitchPatterns: any;
    proactiveAlerts: any[];
    budgetExceedanceProjections: any[];
    optimizationRecommendations: any[];
    scenarioSimulations: any[];
    crossPlatformInsights: any[];
    confidenceScore: number;
    lastUpdated: string;
}

export interface PredictiveIntelligenceOptions {
    scope?: 'user' | 'project' | 'team';
    scopeId?: string;
    timeHorizon?: number;
    includeScenarios?: boolean;
    includeCrossPlatform?: boolean;
}

export const predictiveIntelligenceService = {
    /**
     * Get comprehensive predictive intelligence analysis
     */
    async getPredictiveIntelligence(options: PredictiveIntelligenceOptions = {}): Promise<PredictiveIntelligenceData> {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence?${params}`);
        return response.data.data;
    },

    /**
     * Get dashboard summary
     */
    async getDashboardSummary(options: Pick<PredictiveIntelligenceOptions, 'scope' | 'scopeId'> = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/dashboard?${params}`);
        return response.data.data;
    },

    /**
     * Get proactive alerts
     */
    async getProactiveAlerts(options: {
        scope?: 'user' | 'project' | 'team';
        scopeId?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        limit?: number;
    } = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/alerts?${params}`);
        return response.data.data;
    },

    /**
     * Get budget projections
     */
    async getBudgetProjections(options: {
        scope?: 'user' | 'project' | 'team';
        scopeId?: string;
        daysAhead?: number;
    } = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/budget-projections?${params}`);
        return response.data.data;
    },

    /**
     * Get intelligent optimizations
     */
    async getIntelligentOptimizations(options: {
        scope?: 'user' | 'project' | 'team';
        scopeId?: string;
        minSavings?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
        type?: 'model_switch' | 'prompt_optimization' | 'caching' | 'batch_processing' | 'parameter_tuning';
    } = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/optimizations?${params}`);
        return response.data.data;
    },

    /**
     * Get scenario simulations
     */
    async getScenarioSimulations(options: {
        scope?: 'user' | 'project' | 'team';
        scopeId?: string;
        timeHorizon?: number;
        timeframe?: '1_month' | '3_months' | '6_months' | '1_year';
    } = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/scenarios?${params}`);
        return response.data.data;
    },

    /**
     * Get token trends
     */
    async getTokenTrends(options: {
        scope?: 'user' | 'project' | 'team';
        scopeId?: string;
    } = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/token-trends?${params}`);
        return response.data.data;
    },

    /**
     * Get model patterns
     */
    async getModelPatterns(options: {
        scope?: 'user' | 'project' | 'team';
        scopeId?: string;
    } = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/model-patterns?${params}`);
        return response.data.data;
    },

    /**
     * Get cross-platform insights
     */
    async getCrossPlatformInsights(options: {
        scope?: 'user' | 'project' | 'team';
        scopeId?: string;
    } = {}) {
        const params = new URLSearchParams();
        
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await apiClient.get(`/predictive-intelligence/cross-platform?${params}`);
        return response.data.data;
    },

    /**
     * Auto-optimize an alert
     */
    async autoOptimize(alertId: string) {
        const response = await apiClient.post(`/predictive-intelligence/auto-optimize/${alertId}`);
        return response.data;
    }
};

export default predictiveIntelligenceService;