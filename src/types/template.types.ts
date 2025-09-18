// Template Categories
export type TemplateCategory = 'general' | 'coding' | 'writing' | 'analysis' | 'creative' | 'business' | 'custom';

// Template Visibility
export type TemplateVisibility = 'private' | 'project' | 'organization' | 'public';

// Variable Types
export type VariableType = 'text' | 'number' | 'boolean' | 'date' | 'code' | 'json' | 'url' | 'email' | 'array' | 'object';

// Optimization Types
export type OptimizationType = 'token' | 'cost' | 'quality' | 'model-specific';

// Template Variable Interface
export interface TemplateVariable {
    name: string;
    type: VariableType;
    description?: string;
    defaultValue?: string;
    required: boolean;
    validationRules?: string[];
}

// Template Metadata Interface
export interface TemplateMetadata {
    estimatedTokens?: number;
    estimatedCost?: number;
    recommendedModel?: string;
    tags: string[];
    language?: string;
    aiGenerated?: boolean;
    generationConfidence?: number;
    lastOptimized?: Date;
    optimizationType?: OptimizationType;
    effectivenessScore?: number;
}

// Template Sharing Interface
export interface TemplateSharing {
    visibility: TemplateVisibility;
    sharedWith: string[];
    allowFork: boolean;
}

// Template Usage Statistics Interface
export interface TemplateUsage {
    count: number;
    lastUsed?: Date;
    totalTokensSaved?: number;
    totalCostSaved?: number;
    averageRating?: number;
    feedback: Array<{
        userId: string;
        rating: number;
        comment?: string;
        createdAt: Date;
    }>;
}

// AI Template Generation Request
export interface AITemplateGenerationRequest {
    intent: string;
    category?: TemplateCategory;
    context?: {
        projectType?: string;
        industry?: string;
        targetAudience?: string;
        tone?: 'formal' | 'casual' | 'technical' | 'creative' | 'professional';
        examples?: string[];
    };
    constraints?: {
        maxTokens?: number;
        targetModel?: string;
        costLimit?: number;
    };
}

// AI Template Optimization Request
export interface AITemplateOptimizationRequest {
    optimizationType: OptimizationType;
    targetModel?: string;
    preserveIntent?: boolean;
}

// AI Variable Detection Request
export interface AIVariableDetectionRequest {
    content: string;
    autoFillDefaults?: boolean;
    validateTypes?: boolean;
}

// Template Effectiveness Score
export interface TemplateEffectivenessScore {
    overall: number;
    clarity: number;
    specificity: number;
    tokenEfficiency: number;
    expectedOutputQuality: number;
    suggestions: string[];
    strengths?: string[];
    potentialIssues?: string[];
}

// Template Recommendation
export interface TemplateRecommendation {
    templateId: string;
    name: string;
    category: TemplateCategory;
    description?: string;
    relevanceScore: number;
    reason: string;
    estimatedEffectiveness: number;
    potentialCostSaving: number;
}

// Template Optimization Result
export interface TemplateOptimizationResult {
    original: {
        content: string;
        metadata: TemplateMetadata;
    };
    optimized: {
        content: string;
        metadata: TemplateMetadata;
    };
    metrics: {
        tokenReduction: number;
        costSaving: number;
        qualityScore: number;
        recommendations: string[];
    };
}

// Template Analytics
export interface TemplateAnalytics {
    totalTemplates: number;
    templatesByCategory: Record<TemplateCategory, number>;
    templatesByVisibility: Record<TemplateVisibility, number>;
    mostUsedTemplates: Array<{
        templateId: string;
        name: string;
        usageCount: number;
        category: TemplateCategory;
    }>;
    topRatedTemplates: Array<{
        templateId: string;
        name: string;
        averageRating: number;
        category: TemplateCategory;
    }>;
    aiGeneratedTemplates: number;
    optimizedTemplates: number;
    totalTokensSaved: number;
    totalCostSaved: number;
}

// Template Context for AI Generation
export interface TemplateContext {
    projectType?: string;
    industry?: string;
    targetAudience?: string;
    tone?: 'formal' | 'casual' | 'technical' | 'creative' | 'professional';
    examples?: string[];
}

// Template Alternative Version
export interface TemplateAlternative {
    content: string;
    style: 'concise' | 'detailed' | 'creative' | 'balanced';
    estimatedTokens?: number;
    description?: string;
}
