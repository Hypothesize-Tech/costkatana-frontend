/**
 * Template Execution Service
 * Frontend service for executing prompt templates with AI
 */

import { apiClient } from '../config/api';

export interface ModelRecommendation {
    modelId: string;
    provider: string;
    reasoning: string;
    estimatedCost: number;
    tier: 'ultra-cheap' | 'balanced' | 'premium' | 'specialized';
    confidence: number;
}

export interface TemplateExecutionRequest {
    variables: Record<string, any>;
    executionMode: 'single' | 'comparison' | 'recommended';
    modelId?: string;
    compareWith?: string[];
    enableOptimization?: boolean;
}

export interface TemplateExecutionResult {
    executionId: string;
    templateId: string;
    aiResponse: string;
    
    // Token usage
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    
    // Cost tracking
    actualCost: number;
    baselineCost: number;
    savingsAmount: number;
    savingsPercentage: number;
    
    // Model information
    modelUsed: string;
    modelProvider: string;
    modelRecommended?: string;
    recommendationFollowed: boolean;
    recommendationReasoning?: string;
    
    // Performance
    latencyMs: number;
    executedAt: Date;
    
    // Quality metrics (future)
    qualityScore?: number;
}

export interface ComparisonExecutionResult {
    results: TemplateExecutionResult[];
    bestCostModel: string;
    bestQualityModel?: string;
    summary: {
        totalCost: number;
        averageCost: number;
        costRange: { min: number; max: number };
    };
}

export interface ExecutionHistory {
    _id: string;
    templateId: string;
    userId: string;
    variables: Record<string, any>;
    modelUsed: string;
    modelRecommended?: string;
    recommendationFollowed: boolean;
    aiResponse: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    actualCost: number;
    baselineCost: number;
    savingsAmount: number;
    savingsPercentage: number;
    latencyMs: number;
    executedAt: Date;
}

export interface ExecutionStats {
    totalExecutions: number;
    totalCostSavings: number;
    averageCost: number;
    averageSavings: number;
    mostUsedModel: string;
    modelDistribution: Record<string, number>;
}

export class TemplateExecutionService {
    /**
     * Execute a template with AI
     */
    static async executeTemplate(
        templateId: string,
        request: TemplateExecutionRequest
    ): Promise<TemplateExecutionResult | ComparisonExecutionResult> {
        try {
            const response = await apiClient.post(
                `/prompt-templates/${templateId}/execute`,
                request
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Error executing template:', error);
            throw new Error(
                error.response?.data?.error || 'Failed to execute template'
            );
        }
    }

    /**
     * Get model recommendation for a template
     */
    static async getModelRecommendation(
        templateId: string
    ): Promise<ModelRecommendation> {
        try {
            const response = await apiClient.get(
                `/prompt-templates/${templateId}/recommendation`
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting model recommendation:', error);
            throw new Error(
                error.response?.data?.error || 'Failed to get model recommendation'
            );
        }
    }

    /**
     * Get execution history for a template
     */
    static async getExecutionHistory(
        templateId: string,
        limit: number = 10
    ): Promise<ExecutionHistory[]> {
        try {
            const response = await apiClient.get(
                `/prompt-templates/${templateId}/executions`,
                { params: { limit } }
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting execution history:', error);
            throw new Error(
                error.response?.data?.error || 'Failed to get execution history'
            );
        }
    }

    /**
     * Get execution statistics for a template
     */
    static async getExecutionStats(
        templateId: string
    ): Promise<ExecutionStats> {
        try {
            const response = await apiClient.get(
                `/prompt-templates/${templateId}/execution-stats`
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting execution stats:', error);
            throw new Error(
                error.response?.data?.error || 'Failed to get execution stats'
            );
        }
    }

    /**
     * Compare multiple models for a template
     */
    static async compareModels(
        templateId: string,
        variables: Record<string, any>,
        modelIds: string[]
    ): Promise<ComparisonExecutionResult> {
        try {
            const response = await apiClient.post(
                `/prompt-templates/${templateId}/execute`,
                {
                    variables,
                    executionMode: 'comparison',
                    compareWith: modelIds
                }
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Error comparing models:', error);
            throw new Error(
                error.response?.data?.error || 'Failed to compare models'
            );
        }
    }

    /**
     * Format currency
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
            maximumFractionDigits: 6
        }).format(amount);
    }

    /**
     * Format percentage
     */
    static formatPercentage(value: number): string {
        return `${value.toFixed(1)}%`;
    }

    /**
     * Format number with commas
     */
    static formatNumber(value: number): string {
        return new Intl.NumberFormat('en-US').format(value);
    }
}

