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
  savings?: number; // Alternative field name for costSaved
  improvementPercentage: number;
  service: string;
  model: string;
  category: OptimizationCategory;
  suggestions: OptimizationSuggestion[];
  metadata: OptimizationMetadata;
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
  
  // Cortex-specific fields
  cortexEnabled?: boolean;
  
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
  
  // Cortex-specific metadata
  cortex?: {
    processingTime: number;
    encodingConfidence: number;
    decodingConfidence: number;
    semanticIntegrity: number;
    tokensSaved: number;
    reductionPercentage: number;
    optimizationsApplied: number;
    cortexModel: {
      encoder: string;
      core: string;
      decoder: string;
    };
    error?: string;
    fallbackUsed?: boolean;
    detailsForDebugging?: {
      errorType?: string;
      errorMessage?: string;
      initStatus?: boolean;
    };
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
  options?: {
    targetReduction?: number;
    preserveIntent?: boolean;
    suggestAlternatives?: boolean;
  };
  
  // Cortex-specific fields
  enableCortex?: boolean;
  cortexOperation?: 'optimize' | 'compress' | 'analyze' | 'transform' | 'sast';
  cortexEncodingModel?: string;
  cortexCoreModel?: string;
  cortexDecodingModel?: string;
  cortexStyle?: 'formal' | 'casual' | 'technical' | 'conversational';
  cortexFormat?: 'plain' | 'markdown' | 'structured' | 'json';
  cortexSemanticCache?: boolean;
  cortexStructuredContext?: boolean;
  cortexPreserveSemantics?: boolean;
  cortexIntelligentRouting?: boolean;
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
