/**
 * Cortex Meta-Language Frontend Types
 * 
 * TypeScript interfaces for the Cortex meta-language system integration
 * in the frontend application.
 */

// ============================================================================
// CORTEX CONFIGURATION TYPES
// ============================================================================

export interface CortexConfig {
  // Model configuration
  encodingModel: string;
  coreProcessingModel: string;
  decodingModel: string;
  
  // Processing options
  processingOperation: 'optimize' | 'compress' | 'analyze' | 'transform' | 'sast';
  optimizationLevel: 'conservative' | 'balanced' | 'aggressive';
  
  // Output configuration
  outputStyle: 'formal' | 'casual' | 'technical' | 'conversational';
  outputFormat: 'plain' | 'markdown' | 'structured' | 'json';
  
  // Advanced options
  enableSemanticCache: boolean;
  enableStructuredContext: boolean;
  preserveSemantics: boolean;
  enableIntelligentRouting: boolean;
  
  // SAST (Semantic Abstract Syntax Tree) options
  enableSastProcessing: boolean;
  enableAmbiguityResolution: boolean;
  enableCrossLingualMode: boolean;
}

export const DEFAULT_CORTEX_CONFIG: CortexConfig = {
  encodingModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  coreProcessingModel: 'anthropic.claude-opus-4-1-20250805-v1:0',
  decodingModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  processingOperation: 'optimize',
  optimizationLevel: 'balanced',
  outputStyle: 'conversational',
  outputFormat: 'plain',
  enableSemanticCache: true,
  enableStructuredContext: false,
  preserveSemantics: true,
  enableIntelligentRouting: false,
  enableSastProcessing: false,
  enableAmbiguityResolution: false,
  enableCrossLingualMode: false,
};

// ============================================================================
// CORTEX RESULTS AND METADATA TYPES
// ============================================================================

export interface CortexMetadata {
  // Core performance metrics
  processingTime: number;
  encodingConfidence: number;
  decodingConfidence: number;
  semanticIntegrity: number;
  
  // Optimization results
  tokensSaved: number;
  reductionPercentage: number;
  optimizationsApplied: number;
  
  // Model information
  cortexModel: {
    encoder: string;
    core: string;
    decoder: string;
  };
  
  // SAST-specific metadata
  sast?: {
    usedSast: boolean;
    semanticPrimitives?: {
      totalVocabulary: number;
      categoryCoverage: Record<string, number>;
      crossLingualSupport: Record<string, number>;
    };
    ambiguitiesResolved?: number;
    syntacticComplexity?: number;
    semanticDepth?: number;
    universalCompatibility?: boolean;
    evolutionComparison?: {
      tokenReduction: number;
      ambiguityReduction: number;
      semanticClarityGain: number;
      recommendedApproach: 'traditional' | 'sast' | 'hybrid';
    };
  };
  
  // Error handling
  error?: string;
  fallbackUsed?: boolean;
  
  // Additional debugging info
  detailsForDebugging?: {
    errorType?: string;
    errorMessage?: string;
    initStatus?: boolean;
  };
}

export interface CortexFrame {
  frameType: 'query' | 'answer' | 'event' | 'state' | 'entity' | 'list' | 'error';
  [key: string]: any;
}

export interface CortexAnalysis {
  originalStructure?: CortexFrame;
  optimizedStructure?: CortexFrame;
  compressionRatio: number;
  semanticPreservation: number;
  processingSteps: string[];
}

// ============================================================================
// EXTENDED OPTIMIZATION TYPES WITH CORTEX SUPPORT
// ============================================================================

export interface CortexOptimizationRequest {
  // Standard optimization fields
  prompt: string;
  service: string;
  model: string;
  context?: string;
  
  // Cortex-specific fields
  enableCortex: boolean;
  cortexConfig?: Partial<CortexConfig>;
  
  // Advanced Cortex options
  cortexOperation?: CortexConfig['processingOperation'];
  cortexEncodingModel?: string;
  cortexCoreModel?: string;
  cortexDecodingModel?: string;
  cortexStyle?: CortexConfig['outputStyle'];
  cortexFormat?: CortexConfig['outputFormat'];
  cortexSemanticCache?: boolean;
  cortexStructuredContext?: boolean;
  cortexPreserveSemantics?: boolean;
  cortexIntelligentRouting?: boolean;
  
  // Standard optimization options
  enableCompression?: boolean;
  enableContextTrimming?: boolean;
  enableRequestFusion?: boolean;
  
  // Conversation history
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
  }>;
}

export interface CortexOptimizationResult {
  // Standard optimization result fields
  id: string;
  originalPrompt: string;
  optimizedPrompt: string;
  improvementPercentage: number;
  tokensSaved: number;
  costSaved: number;
  
  // Cortex-specific results
  cortexEnabled: boolean;
  cortexMetadata?: CortexMetadata;
  cortexAnalysis?: CortexAnalysis;
  
  // Performance comparison
  standardOptimization?: {
    tokens: number;
    cost: number;
    time: number;
  };
  cortexOptimization?: {
    tokens: number;
    cost: number;
    time: number;
  };
}

// ============================================================================
// UI STATE AND COMPONENT TYPES
// ============================================================================

export interface CortexUIState {
  enabled: boolean;
  showAdvancedOptions: boolean;
  config: CortexConfig;
  isProcessing: boolean;
  lastResults?: CortexMetadata;
}

export interface CortexConfigPanelProps {
  config: Partial<CortexConfig>;
  onChange: (config: Partial<CortexConfig>) => void;
  disabled?: boolean;
}

export interface CortexResultsDisplayProps {
  metadata?: CortexMetadata;
  analysis?: CortexAnalysis;
  loading?: boolean;
  error?: string;
}

export interface CortexToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  showAdvancedOptions?: boolean;
  onAdvancedToggle?: (show: boolean) => void;
}

export interface CortexMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<any>;
  loading?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type CortexProcessingStatus = 
  | 'idle' 
  | 'encoding' 
  | 'processing' 
  | 'decoding' 
  | 'complete' 
  | 'error';

export interface CortexError {
  code: string;
  message: string;
  stage: 'encoding' | 'processing' | 'decoding';
  recoverable: boolean;
}

// Validation types
export interface CortexConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Export utility functions type
export type CortexConfigValidator = (config: Partial<CortexConfig>) => CortexConfigValidation;
export type CortexMetricsFormatter = (metadata: CortexMetadata) => Record<string, string>;
