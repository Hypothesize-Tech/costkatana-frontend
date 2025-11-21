export interface PromptTemplate {
  _id: string;
  name: string;
  description?: string;
  content: string;
  category:
    | "general"
    | "coding"
    | "writing"
    | "analysis"
    | "creative"
    | "business"
    | "custom"
    | "visual-compliance";
  projectId?: string;
  createdBy:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  version: number;
  parentId?: string;
  variables: TemplateVariable[];
  metadata: {
    estimatedTokens?: number;
    estimatedCost?: number;
    recommendedModel?: string;
    tags: string[];
    language?: string;
  };
  usage: {
    count: number;
    lastUsed?: string;
    totalTokensSaved?: number;
    totalCostSaved?: number;
    averageRating?: number;
    feedback: TemplateFeedback[];
  };
  sharing: {
    visibility: "private" | "project" | "organization" | "public";
    sharedWith: string[];
    allowFork: boolean;
  };
  isVisualCompliance?: boolean;
  visualComplianceConfig?: {
    industry: "jewelry" | "grooming" | "retail" | "fmcg" | "documents";
    mode?: "optimized" | "standard";
    metaPromptPresetId?: string;
  };
  referenceImage?: {
    s3Url: string;
    s3Key: string;
    uploadedAt: string;
    uploadedBy: string;
    extractedFeatures?: {
      extractedAt: string;
      extractedBy: string;
      status: "pending" | "processing" | "completed" | "failed";
      errorMessage?: string;
      analysis: {
        visualDescription: string;
        structuredData: any;
        criteriaAnalysis: Array<{
          criterionId: string;
          criterionText: string;
          referenceState: any;
          comparisonInstructions: any;
          confidence: number;
        }>;
      };
      extractionCost: {
        initialCallTokens: { input: number; output: number; cost: number };
        followUpCalls: Array<{
          reason: string;
          input: number;
          output: number;
          cost: number;
        }>;
        totalTokens: number;
        totalCost: number;
      };
      usage: {
        checksPerformed: number;
        totalTokensSaved: number;
        totalCostSaved: number;
        averageConfidence: number;
        lowConfidenceCount: number;
        lastUsedAt?: string;
      };
    };
  };
  isFavorite?: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  executionStats?: {
    totalExecutions: number;
    totalCostSavings: number;
    averageCost: number;
    mostUsedModel: string;
    lastExecutedAt?: Date;
  };
}

export interface TemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
  required: boolean;
  type?: "text" | "number" | "boolean" | "select" | "multiselect" | "image";
  imageRole?: "reference" | "evidence";
  s3Url?: string;
  accept?: string;
  metadata?: {
    format?: string;
    dimensions?: string;
    uploadedAt?: string;
  };
  options?: string[];
}

export interface TemplateFeedback {
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  content: string;
  category?: string;
  projectId?: string;
  variables?: TemplateVariable[];
  metadata?: {
    estimatedTokens?: number;
    recommendedModel?: string;
    tags?: string[];
    language?: string;
  };
  sharing?: {
    visibility?: "private" | "project" | "organization" | "public";
    sharedWith?: string[];
    allowFork?: boolean;
  };
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  variables?: TemplateVariable[];
  metadata?: Partial<PromptTemplate["metadata"]>;
  sharing?: Partial<PromptTemplate["sharing"]>;
}

export interface TemplateUsage {
  templateId: string;
  userId: string;
  projectId?: string;
  variables: Record<string, any>;
  generatedPrompt: string;
  model: string;
  tokens: number;
  cost: number;
  rating?: number;
  feedback?: string;
  createdAt: string;
}

export interface TemplateStats {
  totalTemplates: number;
  totalUsage: number;
  totalTokensSaved: number;
  totalCostSaved: number;
  averageRating: number;
  topCategories: {
    category: string;
    count: number;
  }[];
  mostUsedTemplates: {
    templateId: string;
    name: string;
    usage: number;
  }[];
}

export interface TemplateSearchFilters {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  tags?: string[];
  visibility?: string;
  projectId?: string;
  createdBy?: string;
  minRating?: number;
  sortBy?: "name" | "created" | "updated" | "usage" | "rating";
  sortOrder?: "asc" | "desc";
}

export interface TemplateVersion {
  _id: string;
  templateId: string;
  version: number;
  content: string;
  variables: TemplateVariable[];
  metadata: PromptTemplate["metadata"];
  createdBy: string;
  createdAt: string;
  changelog?: string;
}

export interface TemplateShare {
  _id: string;
  templateId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: ("view" | "use" | "edit" | "share")[];
  createdAt: string;
  expiresAt?: string;
}

export interface TemplateCollection {
  _id: string;
  name: string;
  description?: string;
  templates: string[];
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Visual Compliance Template Types
export interface CreateVisualTemplateRequest {
  name: string;
  description?: string;
  content?: string;
  complianceCriteria: string[];
  imageVariables: Array<{
    name: string;
    imageRole: "reference" | "evidence";
    description?: string;
    required: boolean;
  }>;
  industry: "jewelry" | "grooming" | "retail" | "fmcg" | "documents";
  mode?: "optimized" | "standard";
  metaPromptPresetId?: string;
  projectId?: string;
}

export interface UseVisualTemplateRequest {
  textVariables?: Record<string, string>;
  imageVariables: Record<string, string>; // variable name -> S3 URL or base64
  projectId?: string;
}

export interface UploadTemplateImageRequest {
  variableName: string;
  imageData: string; // base64
  mimeType: string;
}
