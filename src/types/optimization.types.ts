export interface Optimization {
  _id: string;
  userId: string;
  userQuery?: string;
  generatedAnswer?: string;
  originalPrompt: string;
  optimizedPrompt: string;
  optimizationTechniques: string[];
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  originalCost: number;
  optimizedCost: number;
  costSaved: number;
  savings?: number; // Alternative field name for costSaved
  improvementPercentage: number;
  service: string;
  model: string;
  category: OptimizationCategory;
  suggestions: OptimizationSuggestion[];
  metadata: OptimizationMetadata;
  cortexImpactMetrics?: {
    tokenReduction?: {
      withoutCortex: number;
      withCortex: number;
      absoluteSavings: number;
      percentageSavings: number;
    };
    qualityMetrics?: {
      clarityScore: number;
      completenessScore: number;
      relevanceScore: number;
      ambiguityReduction: number;
      redundancyRemoval: number;
    };
    performanceMetrics?: {
      processingTime: number;
      responseLatency: number;
      compressionRatio: number;
    };
    costImpact?: {
      estimatedCostWithoutCortex: number;
      actualCostWithCortex: number;
      costSavings: number;
      savingsPercentage: number;
    };
    justification?: {
      optimizationTechniques: string[];
      keyImprovements: string[];
      confidenceScore: number;
    };
  };
  parameters?: {
    model?: string;
    threshold?: number;
    confidence?: number;
    impactLevel?: string;
    businessValue?: number;
  };
  status?: string; // Alternative field for applied status
  applied: boolean;
  appliedAt?: string;
  appliedCount: number;
  feedback?: OptimizationFeedback;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OptimizationCategory =
  | "prompt_reduction"
  | "context_optimization"
  | "response_formatting"
  | "batch_processing"
  | "model_selection";

export interface OptimizationSuggestion {
  type: string;
  description: string;
  impact: "low" | "medium" | "high";
  implemented: boolean;
}

export interface OptimizationMetadata {
  analysisTime?: number;
  confidence?: number;
  alternatives?: Array<{
    prompt: string;
    tokens: number;
    cost: number;
  }>;
  cortexOptimized?: boolean;
  cortexMetrics?: {
    encodingReduction?: number;
    semanticCompression?: number;
    processingTime?: number;
    cacheUtilization?: number;
    tokenReduction?: number;
    costReduction?: number;
  };
  [key: string]: any;
}

export interface OptimizationFeedback {
  helpful: boolean;
  rating?: number;
  comment?: string;
  submittedAt?: string;
}

export interface OptimizationRequest {
  prompt: string;
  service: string;
  model: string;
  context?: string;
  useCortex?: boolean;
  options?: {
    targetReduction?: number;
    preserveIntent?: boolean;
    suggestAlternatives?: boolean;
  };
}

export interface OptimizationOpportunity {
  prompt: string;
  usageCount: number;
  totalCost: number;
  avgTokens: number;
  service: string;
  model: string;
  potentialSavings: number;
}

export interface OptimizationSummary {
  total: number;
  totalSaved: number;
  totalTokensSaved: number;
  avgImprovement: number;
  applied: number;
  applicationRate: number;
  byCategory: Record<
    OptimizationCategory,
    {
      count: number;
      totalSaved: number;
      avgImprovement: number;
    }
  >;
  topOptimizations: Optimization[];
}

export interface BulkOptimizationResult {
  total: number;
  successful: number;
  failed: number;
  optimizations: Optimization[];
}
