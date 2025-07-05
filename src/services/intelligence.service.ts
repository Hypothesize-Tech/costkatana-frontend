import { apiClient } from '../config/api';

export interface TipData {
    tip: {
        tipId: string;
        title: string;
        message: string;
        type: 'optimization' | 'feature' | 'cost_saving' | 'quality' | 'best_practice';
        priority: 'low' | 'medium' | 'high';
        action?: {
            type: 'enable_feature' | 'optimize_prompt' | 'change_model' | 'view_guide' | 'run_wizard';
            feature?: string;
            targetModel?: string;
            guideUrl?: string;
        };
        potentialSavings?: {
            percentage?: number;
            amount?: number;
            description: string;
        };
    };
    relevanceScore: number;
    context?: any;
}

export interface QualityAssessment {
    score: number;
    criteria: {
        accuracy: number;
        relevance: number;
        completeness: number;
        coherence: number;
        factuality: number;
    };
    confidence: number;
    explanation?: string;
}

export interface ComparisonResult {
    originalScore: number;
    optimizedScore: number;
    qualityRetention: number;
    recommendation: 'accept' | 'review' | 'reject';
    costSavings: {
        amount: number;
        percentage: number;
    };
}

export interface QualityStats {
    averageQualityRetention: number;
    totalCostSavings: number;
    acceptedOptimizations: number;
    rejectedOptimizations: number;
    optimizationTypes: Record<string, number>;
}

class IntelligenceService {
    /**
     * Get personalized tips for dashboard
     */
    async getPersonalizedTips(limit: number = 3): Promise<TipData[]> {
        try {
            const response = await apiClient.get(`/intelligence/tips/personalized?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching personalized tips:', error);
            return [];
        }
    }

    /**
     * Get tips for a specific usage
     */
    async getTipsForUsage(usageId: string): Promise<TipData[]> {
        try {
            const response = await apiClient.get(`/intelligence/tips/usage/${usageId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching tips for usage:', error);
            return [];
        }
    }

    /**
     * Track tip interaction
     */
    async trackTipInteraction(tipId: string, interaction: 'display' | 'click' | 'dismiss' | 'success'): Promise<void> {
        try {
            await apiClient.post(`/intelligence/tips/${tipId}/interaction`, { interaction });
        } catch (error) {
            console.error('Error tracking tip interaction:', error);
        }
    }

    /**
     * Score response quality
     */
    async scoreResponseQuality(
        prompt: string,
        response: string,
        expectedOutput?: string,
        method: 'ai_model' | 'automated' | 'hybrid' = 'hybrid'
    ): Promise<QualityAssessment> {
        try {
            const result = await apiClient.post('/intelligence/quality/score', {
                prompt,
                response,
                expectedOutput,
                method
            });
            return result.data;
        } catch (error) {
            console.error('Error scoring response quality:', error);
            throw error;
        }
    }

    /**
     * Compare quality of original vs optimized response
     */
    async compareQuality(
        prompt: string,
        originalResponse: string,
        optimizedResponse: string,
        costSavings: { amount: number; percentage: number }
    ): Promise<{ comparison: ComparisonResult; scoreId: string }> {
        try {
            const result = await apiClient.post('/intelligence/quality/compare', {
                prompt,
                originalResponse,
                optimizedResponse,
                costSavings
            });
            return result.data;
        } catch (error) {
            console.error('Error comparing quality:', error);
            throw error;
        }
    }

    /**
     * Get quality statistics for user
     */
    async getQualityStats(): Promise<QualityStats> {
        try {
            const response = await apiClient.get('/intelligence/quality/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching quality stats:', error);
            throw error;
        }
    }

    /**
     * Update user feedback for quality score
     */
    async updateQualityFeedback(
        scoreId: string,
        feedback: {
            rating?: number;
            isAcceptable: boolean;
            comment?: string;
        }
    ): Promise<void> {
        try {
            await apiClient.put(`/intelligence/quality/${scoreId}/feedback`, feedback);
        } catch (error) {
            console.error('Error updating quality feedback:', error);
            throw error;
        }
    }

    /**
     * Initialize default tips (admin only)
     */
    async initializeTips(): Promise<void> {
        try {
            await apiClient.post('/intelligence/tips/initialize');
        } catch (error) {
            console.error('Error initializing tips:', error);
            throw error;
        }
    }
}

export const intelligenceService = new IntelligenceService(); 