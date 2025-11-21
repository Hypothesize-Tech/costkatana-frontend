import { apiClient } from "../config/api";
import {
  PromptTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateUsage,
  TemplateStats,
  TemplateSearchFilters,
  TemplateVersion,
  TemplateCollection,
} from "../types/promptTemplate.types";

export class PromptTemplateService {
  private static baseUrl = "/prompt-templates";

  // Get all templates for the current user
  static async getTemplates(
    filters?: TemplateSearchFilters,
  ): Promise<PromptTemplate[]> {
    const response = await apiClient.get(this.baseUrl, { params: filters });
    return response.data.data;
  }

  // Get a specific template by ID
  static async getTemplate(templateId: string): Promise<PromptTemplate> {
    const response = await apiClient.get(`${this.baseUrl}/${templateId}`);
    return response.data.data;
  }

  // Create a new template
  static async createTemplate(
    templateData: CreateTemplateRequest,
  ): Promise<PromptTemplate> {
    const response = await apiClient.post(this.baseUrl, templateData);
    return response.data.data;
  }

  // Update an existing template
  static async updateTemplate(
    templateId: string,
    updates: UpdateTemplateRequest,
  ): Promise<PromptTemplate> {
    const response = await apiClient.put(
      `${this.baseUrl}/${templateId}`,
      updates,
    );
    return response.data.data;
  }

  // Delete a template
  static async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${templateId}`);
  }

  // Duplicate a template
  static async duplicateTemplate(
    templateId: string,
    customizations?: {
      name?: string;
      description?: string;
      category?: string;
      projectId?: string;
      metadata?: {
        tags?: string[];
        [key: string]: any;
      };
      sharing?: {
        visibility?: 'private' | 'project' | 'organization' | 'public';
        sharedWith?: string[];
        allowFork?: boolean;
      };
    }
  ): Promise<PromptTemplate> {
    const response = await apiClient.post(
      `${this.baseUrl}/${templateId}/duplicate`,
      customizations || {},
    );
    return response.data.data;
  }

  // Toggle favorite status
  static async toggleFavorite(templateId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${templateId}/favorite`);
  }

  // Get template usage history
  static async getTemplateUsage(
    templateId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    usage: TemplateUsage[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(
      `${this.baseUrl}/${templateId}/usage`,
      {
        params: { page, limit },
      },
    );
    return response.data.data;
  }

  // Record template usage
  static async recordUsage(
    templateId: string,
    usageData: {
      variables: Record<string, any>;
      generatedPrompt: string;
      model: string;
      tokens: number;
      cost: number;
      projectId?: string;
    },
  ): Promise<TemplateUsage> {
    const response = await apiClient.post(
      `${this.baseUrl}/${templateId}/usage`,
      usageData,
    );
    return response.data.data;
  }

  // Simple template usage tracking (for UI components)
  static async useTemplate(
    templateId: string,
    variables: Record<string, string>,
  ): Promise<void> {
    // Track usage with minimal data
    await apiClient.post(`${this.baseUrl}/${templateId}/use`, {
      variables,
      timestamp: new Date().toISOString(),
    });
  }

  // Rate a template
  static async rateTemplate(
    templateId: string,
    rating: number,
    comment?: string,
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${templateId}/rating`, {
      rating,
      comment,
    });
  }

  // Get template versions
  static async getTemplateVersions(
    templateId: string,
  ): Promise<TemplateVersion[]> {
    const response = await apiClient.get(
      `${this.baseUrl}/${templateId}/versions`,
    );
    return response.data.data;
  }

  // Get specific template version
  static async getTemplateVersion(
    templateId: string,
    version: number,
  ): Promise<TemplateVersion> {
    const response = await apiClient.get(
      `${this.baseUrl}/${templateId}/versions/${version}`,
    );
    return response.data.data;
  }

  // Restore template to specific version
  static async restoreVersion(
    templateId: string,
    version: number,
  ): Promise<PromptTemplate> {
    const response = await apiClient.post(
      `${this.baseUrl}/${templateId}/versions/${version}/restore`,
    );
    return response.data.data;
  }

  // Share template with users
  static async shareTemplate(
    templateId: string,
    shareData: {
      userIds: string[];
      permissions: ("view" | "use" | "edit" | "share")[];
      expiresAt?: string;
    },
  ): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${templateId}/share`, shareData);
  }

  // Get shared templates
  static async getSharedTemplates(): Promise<PromptTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/shared`);
    return response.data.data;
  }

  // Get public templates
  static async getPublicTemplates(
    filters?: TemplateSearchFilters,
  ): Promise<PromptTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/public`, {
      params: filters,
    });
    return response.data.data;
  }

  // Get template statistics
  static async getTemplateStats(): Promise<TemplateStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data.data;
  }

  // Search templates
  static async searchTemplates(
    query: string,
    filters?: TemplateSearchFilters,
  ): Promise<PromptTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/search`, {
      params: { query, ...filters },
    });
    return response.data.data;
  }

  // Get template suggestions based on context
  static async getTemplateSuggestions(context: {
    task?: string;
    model?: string;
    projectId?: string;
    tags?: string[];
  }): Promise<PromptTemplate[]> {
    const response = await apiClient.post(
      `${this.baseUrl}/suggestions`,
      context,
    );
    return response.data.data;
  }

  // Export template data
  static async exportTemplate(
    templateId: string,
    format: "json" | "yaml" | "txt" = "json",
  ): Promise<Blob> {
    const response = await apiClient.get(
      `${this.baseUrl}/${templateId}/export`,
      {
        params: { format },
        responseType: "blob",
      },
    );
    return response.data.data;
  }

  // Import template from file
  static async importTemplate(file: File): Promise<PromptTemplate> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  }

  // Get template collections
  static async getCollections(): Promise<TemplateCollection[]> {
    const response = await apiClient.get(`${this.baseUrl}/collections`);
    return response.data;
  }

  // Create template collection
  static async createCollection(collectionData: {
    name: string;
    description?: string;
    templates: string[];
    isPublic?: boolean;
    tags?: string[];
  }): Promise<TemplateCollection> {
    const response = await apiClient.post(
      `${this.baseUrl}/collections`,
      collectionData,
    );
    return response.data.data;
  }

  // Add template to collection
  static async addToCollection(
    collectionId: string,
    templateId: string,
  ): Promise<void> {
    await apiClient.post(
      `${this.baseUrl}/collections/${collectionId}/templates`,
      { templateId },
    );
  }

  // Remove template from collection
  static async removeFromCollection(
    collectionId: string,
    templateId: string,
  ): Promise<void> {
    await apiClient.delete(
      `${this.baseUrl}/collections/${collectionId}/templates/${templateId}`,
    );
  }

  // Generate prompt from template
  static async generatePrompt(
    templateId: string,
    variables: Record<string, any>,
  ): Promise<{
    generatedPrompt: string;
    estimatedTokens: number;
    estimatedCost: number;
  }> {
    const response = await apiClient.post(
      `${this.baseUrl}/${templateId}/generate`,
      { variables },
    );
    return response.data.data;
  }

  // Validate template variables
  static async validateTemplate(templateData: {
    content: string;
    variables: any[];
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await apiClient.post(
      `${this.baseUrl}/validate`,
      templateData,
    );
    return response.data.data;
  }

  // Get template analytics
  static async getTemplateAnalytics(
    templateId: string,
    period: "week" | "month" | "quarter" | "year" = "month",
  ): Promise<{
    usage: { date: string; count: number; tokens: number; cost: number }[];
    topUsers: { userId: string; name: string; usage: number }[];
    averageRating: number;
    totalSavings: number;
  }> {
    const response = await apiClient.get(
      `${this.baseUrl}/${templateId}/analytics`,
      {
        params: { period },
      },
    );
    return response.data.data;
  }

  // Get recommended templates for user
  static async getRecommendedTemplates(
    limit: number = 10,
  ): Promise<PromptTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/recommendations`, {
      params: { limit },
    });
    return response.data.data;
  }

  // Get trending templates
  static async getTrendingTemplates(
    period: "day" | "week" | "month" = "week",
  ): Promise<PromptTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/trending`, {
      params: { period },
    });
    return response.data.data;
  }

  // ============ AI-POWERED ENDPOINTS ============

  // AI: Generate template from intent
  static async generateFromIntent(data: {
    intent: string;
    category?: string;
    context?: any;
    constraints?: any;
  }): Promise<{
    template: PromptTemplate;
    metadata: any;
    alternatives: any[];
  }> {
    const response = await apiClient.post(`${this.baseUrl}/ai/generate`, data);
    return response.data.data;
  }

  // AI: Detect variables in template content
  static async detectVariables(data: {
    content: string;
    autoFillDefaults?: boolean;
    validateTypes?: boolean;
  }): Promise<{
    variables: any[];
    suggestions: string[];
    confidence: number;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/ai/detect-variables`, data);
    return response.data.data;
  }

  // AI: Optimize template
  static async optimizeTemplate(
    templateId: string,
    data: {
      optimizationType: 'token' | 'cost' | 'quality' | 'model-specific';
      targetModel?: string;
      preserveIntent?: boolean;
    }
  ): Promise<{
    original: any;
    optimized: any;
    metrics: any;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/${templateId}/ai/optimize`, data);
    return response.data.data;
  }

  // AI: Get template recommendations
  static async getRecommendations(data: {
    context?: any;
    limit?: number;
  }): Promise<{
    recommendations: any[];
    reasoning: string[];
  }> {
    const response = await apiClient.post(`${this.baseUrl}/ai/recommendations`, data);
    return response.data.data;
  }

  // AI: Predict template effectiveness
  static async predictEffectiveness(
    templateId: string,
    variables?: Record<string, any>
  ): Promise<{
    overall: number;
    clarity: number;
    specificity: number;
    tokenEfficiency: number;
    expectedOutputQuality: number;
    suggestions: string[];
  }> {
    const response = await apiClient.post(`${this.baseUrl}/${templateId}/ai/effectiveness`, { variables });
    return response.data.data;
  }

  // AI: Get template insights
  static async getInsights(
    templateId?: string,
    timeframe?: string
  ): Promise<{
    usagePatterns: any;
    performance: any;
    recommendations: any;
    trends?: any;
  }> {
    const url = templateId 
      ? `${this.baseUrl}/${templateId}/ai/insights`
      : `${this.baseUrl}/ai/insights`;
    const response = await apiClient.get(url, {
      params: { timeframe }
    });
    return response.data.data;
  }

  // AI: Semantic search templates
  static async searchSemantic(data: {
    query: string;
    limit?: number;
    threshold?: number;
  }): Promise<{
    results: any[];
    totalResults: number;
    searchTime: number;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/ai/search`, data);
    return response.data.data;
  }

  // AI: Personalize template
  static async personalizeTemplate(
    templateId: string,
    data: {
      preferences?: any;
      context?: any;
    }
  ): Promise<{
    personalizedContent: string;
    adaptations: string[];
    confidence: number;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/${templateId}/ai/personalize`, data);
    return response.data.data;
  }

  // AI: Apply optimization to template
  static async applyOptimization(
    templateId: string,
    data: {
      optimizedContent: string;
      metadata: any;
    }
  ): Promise<PromptTemplate> {
    const response = await apiClient.post(`${this.baseUrl}/${templateId}/ai/apply-optimization`, data);
    return response.data.data;
  }

  // ============ VISUAL COMPLIANCE TEMPLATE METHODS ============

  // Create visual compliance template
  static async createVisualComplianceTemplate(
    data: {
      name: string;
      description?: string;
      content?: string;
      complianceCriteria: string[];
      imageVariables: Array<{
        name: string;
        imageRole: 'reference' | 'evidence';
        description?: string;
        required: boolean;
      }>;
      industry: 'jewelry' | 'grooming' | 'retail' | 'fmcg' | 'documents';
      mode?: 'optimized' | 'standard';
      metaPromptPresetId?: string;
      projectId?: string;
      referenceImage?: {
        s3Url: string;
        s3Key: string;
        uploadedAt: string;
        uploadedBy: string;
      };
    }
  ): Promise<PromptTemplate> {
    const response = await apiClient.post(`${this.baseUrl}/visual-compliance`, data);
    return response.data.data;
  }

  // Use visual compliance template
  static async useVisualTemplate(
    templateId: string,
    data: {
      textVariables?: Record<string, string>;
      imageVariables: Record<string, string>;
      projectId?: string;
    }
  ): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${templateId}/use-visual`, data);
    // Return the full response structure to match what VisualComplianceTab expects
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  }

  // Upload image for template variable
  static async uploadTemplateImage(
    templateId: string,
    data: {
      variableName: string;
      imageData: string;
      mimeType: string;
    }
  ): Promise<{ s3Url: string; variable: any }> {
    const response = await apiClient.post(`${this.baseUrl}/${templateId}/upload-image`, data);
    return response.data.data;
  }
}
