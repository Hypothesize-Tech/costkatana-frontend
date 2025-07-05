// Intelligence and quality assessment types
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

export interface IntelligenceSettings {
    enableProactiveTips: boolean;
    enableQualityScoring: boolean;
    qualityThreshold: number;
    tipFrequency: 'high' | 'medium' | 'low';
    tipCategories: string[];
} 