import api from '../config/api';

export interface ModelPricing {
    modelId: string;
    modelName: string;
    inputPricePerMToken: number | null;
    outputPricePerMToken: number | null;
    contextWindow: number | null;
    capabilities: string[];
    category: 'text' | 'multimodal' | 'embedding' | 'code';
    isLatest: boolean;
}

export interface ProviderPricing {
    provider: string;
    models: ModelPricing[];
    lastUpdated: Date;
    source: string;
}

export interface PricingComparison {
    task: string;
    estimatedTokens: number;
    providers: Array<{
        provider: string;
        model: string;
        estimatedCost: number;
        inputCost: number;
        outputCost: number;
        pricePerMToken: number;
        features: string[];
    }>;
    lastUpdated: Date;
}

export interface CacheStatus {
    provider: string;
    lastUpdate: Date | null;
    cached: boolean;
}

// Remove ScrapingStatus interface - backend handles this automatically

export interface PricingApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class PricingService {
    private baseUrl = '/pricing';

    /**
     * Get all pricing data for all providers
     */
    async getAllPricing(): Promise<PricingApiResponse<{
        pricing: ProviderPricing[];
        cacheStatus: CacheStatus[];
        lastUpdate: Date;
    }>> {
        try {
            console.log('🌐 Making API call to:', `${this.baseUrl}/all`);
            const response = await api.get(`${this.baseUrl}/all`);
            console.log('✅ API Response received:', response.status, response.data.success);
            return response.data;
        } catch (error: any) {
            console.error('❌ API Error:', error.message);
            console.error('❌ Error details:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch pricing data'
            };
        }
    }

    /**
     * Get pricing for a specific provider
     */
    async getProviderPricing(provider: string): Promise<PricingApiResponse<ProviderPricing>> {
        try {
            const response = await api.get(`${this.baseUrl}/provider/${encodeURIComponent(provider)}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || `Failed to fetch ${provider} pricing`
            };
        }
    }

    /**
     * Compare pricing across providers for a specific task
     */
    async comparePricing(task: string, estimatedTokens: number): Promise<PricingApiResponse<PricingComparison>> {
        try {
            const response = await api.post(`${this.baseUrl}/compare`, {
                task,
                estimatedTokens
            });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to compare pricing'
            };
        }
    }

    /**
     * Force update all pricing data using AWS Bedrock web search
     */
    async forceUpdate(): Promise<PricingApiResponse<{ message: string }>> {
        try {
            const response = await api.post(`${this.baseUrl}/update`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update pricing'
            };
        }
    }

    // Remove scraping methods - backend handles this automatically

    /**
     * Get cache status for all providers
     */
    async getCacheStatus(): Promise<PricingApiResponse<{
        cacheStatus: CacheStatus[];
        currentTime: Date;
    }>> {
        try {
            const response = await api.get(`${this.baseUrl}/cache-status`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get cache status'
            };
        }
    }

    /**
     * Initialize pricing service
     */
    async initialize(): Promise<PricingApiResponse<{ message: string }>> {
        try {
            const response = await api.post(`${this.baseUrl}/initialize`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to initialize pricing service'
            };
        }
    }

    /**
     * Utility function to format price display
     */
    formatPrice(price: number): string {
        if (price < 0.001) {
            return `$${(price * 1000000).toFixed(2)}μ`;
        } else if (price < 0.01) {
            return `$${(price * 1000).toFixed(3)}k`;
        } else {
            return `$${price.toFixed(4)}`;
        }
    }

    /**
     * Calculate estimated cost for a given token count and provider
     */
    calculateEstimatedCost(
        model: ModelPricing,
        inputTokens: number,
        outputTokens: number
    ): {
        inputCost: number;
        outputCost: number;
        totalCost: number;
    } | null {
        // Return null if pricing data is not available
        if (model.inputPricePerMToken === null || model.outputPricePerMToken === null) {
            return null;
        }

        const inputCost = (inputTokens / 1_000_000) * model.inputPricePerMToken;
        const outputCost = (outputTokens / 1_000_000) * model.outputPricePerMToken;
        const totalCost = inputCost + outputCost;

        return {
            inputCost,
            outputCost,
            totalCost
        };
    }

    /**
     * Find the cheapest model for a given task
     */
    findCheapestModel(
        providers: ProviderPricing[],
        estimatedTokens: number,
        category?: string
    ): {
        provider: string;
        model: ModelPricing;
        estimatedCost: number;
    } | null {
        let cheapest: {
            provider: string;
            model: ModelPricing;
            estimatedCost: number;
        } | null = null;

        const inputRatio = 0.6;
        const outputRatio = 0.4;
        const inputTokens = Math.round(estimatedTokens * inputRatio);
        const outputTokens = Math.round(estimatedTokens * outputRatio);

        for (const providerData of providers) {
            for (const model of providerData.models) {
                if (category && model.category !== category) continue;

                const cost = this.calculateEstimatedCost(model, inputTokens, outputTokens);

                // Skip models with null pricing data
                if (!cost) continue;

                if (!cheapest || cost.totalCost < cheapest.estimatedCost) {
                    cheapest = {
                        provider: providerData.provider,
                        model,
                        estimatedCost: cost.totalCost
                    };
                }
            }
        }

        return cheapest;
    }
}

export const pricingService = new PricingService(); 