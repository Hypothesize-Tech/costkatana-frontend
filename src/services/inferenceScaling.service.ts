import { API_BASE_URL } from "@/config/api";

export interface DemandPrediction {
    modelId: string;
    timeWindow: string;
    currentLoad: number;
    predictedLoad: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    peakTime?: string;
    minTime?: string;
    historicalPattern: {
        hourlyAverage: number[];
        dailyAverage: number[];
        weeklyAverage: number[];
    };
}

export interface ServingConfiguration {
    id: string;
    name: string;
    instanceType: string;
    provider: 'aws' | 'azure' | 'gcp' | 'custom';
    specifications: {
        cpu: number;
        memory: number;
        gpu?: {
            type: string;
            count: number;
            memory: number;
        };
        storage: number;
    };
    pricing: {
        hourlyRate: number;
        currency: string;
        billingModel: 'hourly' | 'per-request' | 'spot' | 'reserved';
    };
    performance: {
        requestsPerSecond: number;
        averageLatency: number;
        maxConcurrency: number;
        warmupTime: number;
    };
    costEfficiency: {
        costPerRequest: number;
        costPerHour: number;
        performanceScore: number;
    };
}

export interface ScalingRecommendation {
    id: string;
    modelId: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    action: 'scale_up' | 'scale_down' | 'switch_instance' | 'optimize_cost' | 'no_action';
    currentConfiguration: ServingConfiguration;
    recommendedConfiguration: ServingConfiguration;
    reasoning: string;
    impact: {
        costSavings: number;
        performanceChange: number;
        riskLevel: 'low' | 'medium' | 'high';
    };
    implementation: {
        complexity: 'low' | 'medium' | 'high';
        estimatedTime: number;
        rollbackPlan: string;
    };
    metrics: {
        currentLoad: number;
        predictedLoad: number;
        confidence: number;
        timeWindow: string;
    };
}

export interface RecommendationSummary {
    totalRecommendations: number;
    potentialSavings: number;
    highPriorityCount: number;
    byAction: Record<string, number>;
    byPriority: Record<string, number>;
    modelCoverage: number;
}

export interface AlertNotification {
    id: string;
    type: 'scaling_needed' | 'cost_optimization' | 'performance_degradation' | 'capacity_warning';
    severity: 'info' | 'warning' | 'error' | 'critical';
    modelId: string;
    message: string;
    timestamp: string;
    recommendation?: ScalingRecommendation;
    autoActionAvailable: boolean;
}

export interface DashboardOverview {
    overview: {
        totalModels: number;
        totalCurrentLoad: number;
        totalPredictedLoad: number;
        averageConfidence: number;
        loadTrend: 'increasing' | 'decreasing' | 'stable';
    };
    predictions: DemandPrediction[];
    recommendations: ScalingRecommendation[];
    summary: RecommendationSummary;
    alerts: AlertNotification[];
}

export interface ModelDemandHistory {
    modelId: string;
    timeSeriesData: Array<{
        timestamp: string;
        requestCount: number;
        averageResponseTime: number;
        totalCost: number;
        resourceUtilization: {
            cpu: number;
            gpu: number;
            memory: number;
        };
    }>;
    statistics: {
        totalRequests: number;
        averageRequestsPerHour: number;
        peakRequestsPerHour: number;
        costPerRequest: number;
    };
}

export interface CostPerformanceAnalysis {
    modelId: string;
    currentConfiguration: ServingConfiguration;
    alternativeConfigurations: ServingConfiguration[];
    recommendations: {
        type: 'scale_up' | 'scale_down' | 'switch_instance' | 'optimize_cost';
        configuration: ServingConfiguration;
        expectedSavings: number;
        performanceImpact: number;
        reasoning: string;
    }[];
    costBreakdown: {
        compute: number;
        storage: number;
        network: number;
        total: number;
    };
}

export class InferenceScalingService {
    private static baseUrl = `${API_BASE_URL}/inference-scaling`;

    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Request failed');
        }

        return data.data;
    }

    /**
     * Get demand predictions for all models
     */
    static async getDemandPredictions(hoursAhead: number = 4): Promise<DemandPrediction[]> {
        return this.makeRequest<DemandPrediction[]>(`/demand/predictions?hoursAhead=${hoursAhead}`);
    }

    /**
     * Get demand prediction for a specific model
     */
    static async getModelDemandPrediction(
        modelId: string,
        hoursAhead: number = 4
    ): Promise<DemandPrediction> {
        return this.makeRequest<DemandPrediction>(
            `/demand/predictions/${encodeURIComponent(modelId)}?hoursAhead=${hoursAhead}`
        );
    }

    /**
     * Get historical demand data for a model
     */
    static async getModelDemandHistory(
        modelId: string,
        startDate: string,
        endDate: string
    ): Promise<ModelDemandHistory> {
        return this.makeRequest<ModelDemandHistory>(
            `/demand/history/${encodeURIComponent(modelId)}?startDate=${startDate}&endDate=${endDate}`
        );
    }

    /**
     * Get serving configurations for a model type
     */
    static async getServingConfigurations(modelType: string): Promise<ServingConfiguration[]> {
        return this.makeRequest<ServingConfiguration[]>(`/configurations/${modelType}`);
    }

    /**
     * Get model configuration with recommendations
     */
    static async getModelConfiguration(
        modelId: string,
        modelType: string
    ): Promise<{
        modelId: string;
        modelName: string;
        modelType: string;
        configurations: ServingConfiguration[];
        recommendations: {
            optimal: ServingConfiguration;
            budget: ServingConfiguration;
            performance: ServingConfiguration;
        };
        currentConfiguration?: ServingConfiguration;
    }> {
        return this.makeRequest(
            `/configurations/model/${encodeURIComponent(modelId)}?modelType=${modelType}`
        );
    }

    /**
     * Analyze cost-performance for a model
     */
    static async analyzeCostPerformance(
        modelId: string,
        modelType: string,
        currentLoad: number,
        predictedLoad: number
    ): Promise<CostPerformanceAnalysis> {
        return this.makeRequest<CostPerformanceAnalysis>(
            `/analyze/${encodeURIComponent(modelId)}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    modelType,
                    currentLoad,
                    predictedLoad,
                }),
            }
        );
    }

    /**
     * Calculate cost for a configuration
     */
    static async calculateCost(
        configurationId: string,
        requestsPerHour: number
    ): Promise<{
        configuration: ServingConfiguration;
        requestsPerHour: number;
        hourlyCost: number;
        dailyCost: number;
        monthlyCost: number;
    }> {
        return this.makeRequest('/cost/calculate', {
            method: 'POST',
            body: JSON.stringify({
                configurationId,
                requestsPerHour,
            }),
        });
    }

    /**
     * Get scaling recommendations for all models
     */
    static async getScalingRecommendations(
        hoursAhead: number = 4
    ): Promise<{
        recommendations: ScalingRecommendation[];
        summary: RecommendationSummary;
    }> {
        return this.makeRequest(`/recommendations?hoursAhead=${hoursAhead}`);
    }

    /**
     * Get alerts based on recommendations
     */
    static async getAlerts(hoursAhead: number = 4): Promise<AlertNotification[]> {
        return this.makeRequest<AlertNotification[]>(`/alerts?hoursAhead=${hoursAhead}`);
    }

    /**
     * Execute a scaling recommendation
     */
    static async executeRecommendation(
        recommendationId: string,
        dryRun: boolean = true
    ): Promise<{
        success: boolean;
        message: string;
        changes: {
            previousConfig: ServingConfiguration;
            newConfig: ServingConfiguration;
            estimatedSavings: number;
        } | null;
    }> {
        return this.makeRequest(`/recommendations/${recommendationId}/execute`, {
            method: 'POST',
            body: JSON.stringify({
                dryRun,
            }),
        });
    }

    /**
     * Get dashboard overview
     */
    static async getDashboardOverview(hoursAhead: number = 4): Promise<DashboardOverview> {
        return this.makeRequest<DashboardOverview>(`/dashboard?hoursAhead=${hoursAhead}`);
    }

    /**
     * Get recommendation by ID (helper method)
     */
    static async getRecommendationById(
        recommendationId: string
    ): Promise<ScalingRecommendation | null> {
        try {
            const { recommendations } = await this.getScalingRecommendations();
            return recommendations.find(r => r.id === recommendationId) || null;
        } catch (error) {
            console.error('Error getting recommendation by ID:', error);
            return null;
        }
    }

    /**
     * Get model types (helper method)
     */
    static getModelTypes(): Array<{
        value: string;
        label: string;
        description: string;
    }> {
        return [
            {
                value: 'llm',
                label: 'Large Language Model',
                description: 'GPT, Claude, LLaMA, etc.',
            },
            {
                value: 'embedding',
                label: 'Embedding Model',
                description: 'Text embeddings, vector search',
            },
            {
                value: 'image',
                label: 'Image Model',
                description: 'DALL-E, Stable Diffusion, etc.',
            },
            {
                value: 'audio',
                label: 'Audio Model',
                description: 'Whisper, speech synthesis, etc.',
            },
            {
                value: 'custom',
                label: 'Custom Model',
                description: 'Custom or other model types',
            },
        ];
    }

    /**
     * Get priority colors (helper method)
     */
    static getPriorityColor(priority: string): string {
        switch (priority) {
            case 'urgent':
                return 'text-red-600';
            case 'high':
                return 'text-orange-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    }

    /**
     * Get priority background colors (helper method)
     */
    static getPriorityBgColor(priority: string): string {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100';
            case 'high':
                return 'bg-orange-100';
            case 'medium':
                return 'bg-yellow-100';
            case 'low':
                return 'bg-green-100';
            default:
                return 'bg-gray-100';
        }
    }

    /**
     * Get action icons (helper method)
     */
    static getActionIcon(action: string): string {
        switch (action) {
            case 'scale_up':
                return '↗️';
            case 'scale_down':
                return '↘️';
            case 'switch_instance':
                return '🔄';
            case 'optimize_cost':
                return '💰';
            default:
                return '⚡';
        }
    }

    /**
     * Format currency (helper method)
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    /**
     * Format percentage (helper method)
     */
    static formatPercentage(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(value);
    }
} 