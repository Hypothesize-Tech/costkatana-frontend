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
    | "custom";
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
  isFavorite?: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
  required: boolean;
  type?: "text" | "number" | "boolean" | "select" | "multiselect";
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
