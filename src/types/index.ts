export * from "./analytics.types";
export * from "./auth.types";
export * from "./optimization.types";
export * from "./usage.types";
export * from "./intelligence.types";
export * from "./project.types";
export * from "./webhook.types";
export * from "./cortex.types";

// AI Provider types
export enum AIProvider {
  OpenAI = 'openai',
  AWSBedrock = 'aws-bedrock',
  Anthropic = 'anthropic',
  Google = 'google',
  Cohere = 'cohere',
  Gemini = 'gemini',
  DeepSeek = 'deepseek',
  Groq = 'groq',
  HuggingFace = 'huggingface',
  Ollama = 'ollama',
  Replicate = 'replicate',
  Azure = 'azure'
}

// Cost Debugger types
export interface TokenAttribution {
  systemPrompt: { tokens: number; cost: number; impact: 'high' | 'medium' | 'low' };
  userMessage: { tokens: number; cost: number; impact: 'high' | 'medium' | 'low' };
  conversationHistory: { tokens: number; cost: number; impact: 'high' | 'medium' | 'low' };
  toolCalls: { tokens: number; cost: number; impact: 'high' | 'medium' | 'low' };
  metadata: { tokens: number; cost: number; impact: 'high' | 'medium' | 'low' };
  total: { tokens: number; cost: number; impact: 'high' | 'medium' | 'low' };
}

export interface PromptSection {
  id: string;
  type: 'system' | 'user' | 'history' | 'tool' | 'metadata';
  content: string;
  tokens: number;
  cost: number;
  impact: 'high' | 'medium' | 'low';
  startIndex: number;
  endIndex: number;
  optimizationSuggestions: string[];
}

export interface PromptAnalysis {
  promptId: string;
  timestamp: Date;
  provider: AIProvider;
  model: string;
  tokenAttribution: TokenAttribution;
  sections: PromptSection[];
  totalTokens: number;
  totalCost: number;
  optimizationOpportunities: {
    highImpact: string[];
    mediumImpact: string[];
    lowImpact: string[];
    estimatedSavings: number;
    confidence: number;
  };
  qualityMetrics: {
    instructionClarity: number;
    contextRelevance: number;
    exampleEfficiency: number;
    overallScore: number;
  };
  pricingInfo: {
    modelPricing: any;
    costPerToken: number;
    provider: string;
    modelName: string;
  };
}

export interface DeadWeightAnalysis {
  redundantInstructions: string[];
  unnecessaryExamples: string[];
  verbosePhrasing: string[];
  duplicateContext: string[];
  estimatedSavings: number;
  confidence: number;
}

export interface PromptComparison {
  originalAnalysis: PromptAnalysis;
  optimizedAnalysis: PromptAnalysis;
  improvements: {
    tokensSaved: number;
    costSaved: number;
    savingsPercentage: number;
    qualityImpact: number;
  };
}

// Common types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
}

export interface Alert {
  _id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  data?: Record<string, any>;
  sent: boolean;
  sentAt?: string;
  read: boolean;
  readAt?: string;
  actionRequired: boolean;
  actionTaken?: boolean;
  actionTakenAt?: string;
  actionDetails?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertType =
  | "cost_threshold"
  | "usage_spike"
  | "optimization_available"
  | "weekly_summary"
  | "monthly_summary"
  | "error_rate";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface SortConfig {
  field: string;
  order: "asc" | "desc";
}
