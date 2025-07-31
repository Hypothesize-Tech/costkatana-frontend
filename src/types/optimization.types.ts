export interface Optimization {
  _id: string;
  userId: string;
  originalPrompt: string;
  optimizedPrompt: string;
  optimizationTechniques: string[];
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  originalCost: number;
  optimizedCost: number;
  costSaved: number;
  improvementPercentage: number;
  service: string;
  model: string;
  category: OptimizationCategory;
  suggestions: OptimizationSuggestion[];
  metadata: OptimizationMetadata;
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
