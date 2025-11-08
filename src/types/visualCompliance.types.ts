export type Industry = 'jewelry' | 'grooming' | 'retail' | 'fmcg' | 'documents';

export interface ComplianceCheckRequest {
  referenceImage: string; // base64
  evidenceImage: string; // base64
  complianceCriteria: string[];
  industry: Industry;
  projectId?: string;
  useUltraCompression?: boolean;
}

export interface ComplianceResult {
  compliance_score: number;
  pass_fail: boolean;
  feedback_message: string;
  metadata: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    latency: number;
    cacheHit: boolean;
    optimizationSavings: number;
    compressionRatio: number;
    technique: string;
  };
}

export interface ComplianceCheckResponse {
  success: boolean;
  data: ComplianceResult;
  optimization?: {
    technique: string;
    tokenReduction: string;
    costSavings: string;
  };
  error?: string;
}

export interface BatchComplianceRequest {
  referenceImage: string;
  evidenceImage: string;
  complianceCriteria: string[];
  industry: Industry;
}

export interface BatchComplianceResult {
  index: number;
  success: boolean;
  data: ComplianceResult | null;
  error: string | null;
}

export interface BatchComplianceResponse {
  success: boolean;
  results: BatchComplianceResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalCost: string;
  };
}

export interface QualityPreset {
  description: string;
  maxDimensions: string;
  estimatedTokensPerImage: number;
  estimatedCostPerRequest: string;
  accuracy: string;
  recommendedFor: string[];
}

export interface PresetsResponse {
  success: boolean;
  presets: {
    economy: QualityPreset;
    balanced: QualityPreset;
    premium: QualityPreset;
  };
  note?: string;
}

export interface CostComparisonData {
  traditional: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    description: string;
  };
  optimized: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    description: string;
  };
  savings: {
    tokenReduction: number;
    costReduction: number;
    technique: string;
  };
  breakdown: {
    featureExtraction: {
      reduction: number;
      description: string;
    };
    toonEncoding: {
      reduction: number;
      description: string;
    };
    cortexOutput: {
      reduction: number;
      description: string;
    };
  };
}

export interface CostComparisonResponse {
  success: boolean;
  comparison: CostComparisonData;
}

