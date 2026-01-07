import apiClient, { chatApiClient } from "@/config/api";
import { MessageAttachment } from "../types/attachment.types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachedDocuments?: Array<{
    documentId: string;
    fileName: string;
    chunksCount: number;
    fileType?: string;
  }>;
  attachments?: MessageAttachment[];
  metadata?: {
    cost?: number;
    latency?: number;
    tokenCount?: number;
  };
  mongodbSelectedViewType?: 'table' | 'json' | 'schema' | 'stats' | 'chart' | 'text' | 'error' | 'empty' | 'explain';
  integrationSelectorData?: any; 
  mongodbIntegrationData?: any; 
  requiresSelection?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  messageCount: number;
  updatedAt: Date;
  totalCost?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  githubContext?: {
    connectionId?: string;
    repositoryId?: number;
    repositoryName?: string;
    repositoryFullName?: string;
    integrationId?: string;
    branchName?: string;
  };
}

export interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing?: {
    input: number;
    output: number;
    unit: string;
  };
}

export interface SendMessageRequest {
  message?: string; // Now optional when templateId is provided
  modelId: string;
  conversationId?: string;
  temperature?: number;
  maxTokens?: number;
  chatMode?: 'fastest' | 'cheapest' | 'balanced';
  useMultiAgent?: boolean;
  useWebSearch?: boolean; // Enable web search
  documentIds?: string[]; // Document IDs for RAG context
  githubContext?: {
    connectionId: string;
    repositoryId: number;
    repositoryName: string;
    repositoryFullName: string;
  };
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: MessageAttachment[];
  // Integration agent selection response (for multi-turn parameter collection)
  selectionResponse?: {
    parameterName: string;
    value: string | number | boolean;
    pendingAction: string;
    collectedParams: Record<string, unknown>;
    integration?: string;
  };
}

export interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  response: string;
  cost: number;
  latency: number;
  tokenCount: number;
  model: string;
  thinking?: {
    title: string;
    steps: Array<{
      step: number;
      description: string;
      reasoning: string;
      outcome?: string;
    }>;
    summary?: string;
  };
  // Multi-agent enhancements
  optimizationsApplied?: string[];
  cacheHit?: boolean;
  agentPath?: string[];
  riskLevel?: string;
  // Web search metadata
  webSearchUsed?: boolean;
  quotaUsed?: number;
  // GitHub integration data
  githubIntegrationData?: {
    integrationId?: string;
    status?: string;
    progress?: number;
    currentStep?: string;
    prUrl?: string;
  };
  templateUsed?: {
    id: string;
    name: string;
    category: string;
    variablesResolved: Array<{
      variableName: string;
      value: string;
      confidence: number;
      source: 'user_provided' | 'context_inferred' | 'default' | 'missing';
      reasoning?: string;
    }>;
  };
  // Google services view links
  viewLinks?: Array<{
    label: string;
    url: string;
    type: 'document' | 'spreadsheet' | 'presentation' | 'file' | 'email' | 'calendar' | 'form';
  }>;
  metadata?: any;
  requiresIntegrationSelector?: boolean;
  integrationSelectorData?: {
    parameterName: string;
    question: string;
    options: Array<{
      id: string;
      label: string;
      value: string;
      description?: string;
      icon?: string;
    }>;
    allowCustom: boolean;
    customPlaceholder?: string;
    integration: string;
    pendingAction: string;
    collectedParams: Record<string, unknown>;
    originalMessage?: string;
  };
  requiresSelection?: boolean;
  selection?: {
    parameterName: string;
    question: string;
    options: Array<{
      id: string;
      label: string;
      value: string;
      description?: string;
      icon?: string;
    }>;
    allowCustom: boolean;
    customPlaceholder?: string;
    integration: string;
    pendingAction: string;
    collectedParams: Record<string, unknown>;
    originalMessage?: string;
  };
  // MongoDB integration data
  mongodbIntegrationData?: {
    action?: string;
    connectionId?: string;
    database?: string;
    connectionAlias?: string;
  };
  formattedResult?: {
    type: 'table' | 'json' | 'schema' | 'stats' | 'chart' | 'error' | 'empty' | 'text' | 'explain';
    data: any;
  };
  mongodbSelectedViewType?: 'table' | 'json' | 'schema' | 'stats' | 'chart' | 'text' | 'error' | 'empty' | 'explain';
}

export interface ConversationHistoryResponse {
  messages: ChatMessage[];
  total: number;
  conversation: Conversation | null;
}

export interface UserConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export class ChatService {
  private static baseUrl = "/chat";

  /**
   * Get available models for chat
   */
  static async getAvailableModels(): Promise<AvailableModel[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/models`);
      return response.data.data || [];
    } catch (error) {
      console.error("Error getting available models:", error);
      throw new Error("Failed to get available models");
    }
  }

  /**
   * Send a message to a model
   */
  static async sendMessage(
    request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    try {
      const response = await chatApiClient.post(`${this.baseUrl}/message`, request);
      return response.data.data;
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Preserve error code and details for better handling
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const timeoutError = new Error("Request timed out. This may happen with large files or complex requests.");
        (timeoutError as any).code = 'ECONNABORTED';
        throw timeoutError;
      }
      
      if (error.code === 'ERR_NETWORK') {
        const networkError = new Error("Network error. Please check your internet connection.");
        (networkError as any).code = 'ERR_NETWORK';
        throw networkError;
      }
      
      // Preserve response error details
      if (error.response) {
        const responseError = new Error(error.response.data?.message || "Failed to send message");
        (responseError as any).response = error.response;
        throw responseError;
      }
      
      const message = error.response?.data?.message || error.message || "Failed to send message";
      throw new Error(message);
    }
  }

  /**
   * Create a new conversation
   */
  static async createConversation(request: {
    title: string;
    modelId: string;
  }): Promise<Conversation> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/conversations`,
        request,
      );
      return this.normalizeConversation(response.data.data);
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw new Error("Failed to create conversation");
    }
  }

  /**
   * Get all conversations for the current user
   */
  static async getUserConversations(
    limit: number = 20,
    offset: number = 0,
    includeArchived: boolean = false,
  ): Promise<UserConversationsResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/conversations`, {
        params: { limit, offset, includeArchived },
      });

      const data = response.data.data;
      return {
        conversations: data.conversations.map(this.normalizeConversation),
        total: data.total,
      };
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw new Error("Failed to get conversations");
    }
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ConversationHistoryResponse> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/conversations/${conversationId}/history`,
        {
          params: { limit, offset },
        },
      );

      const data = response.data.data;
      return {
        messages: data.messages.map(this.normalizeMessage),
        total: data.total,
        conversation: data.conversation
          ? this.normalizeConversation(data.conversation)
          : null,
      };
    } catch (error) {
      console.error("Error getting conversation history:", error);
      throw new Error("Failed to get conversation history");
    }
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/conversations/${conversationId}`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw new Error("Failed to delete conversation");
    }
  }

  /**
   * Rename a conversation
   */
  static async renameConversation(conversationId: string, title: string): Promise<Conversation> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/conversations/${conversationId}/rename`, {
        title,
      });
      return this.normalizeConversation(response.data.data);
    } catch (error) {
      console.error("Error renaming conversation:", error);
      throw new Error("Failed to rename conversation");
    }
  }

  /**
   * Archive or unarchive a conversation
   */
  static async archiveConversation(conversationId: string, archived: boolean): Promise<Conversation> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/conversations/${conversationId}/archive`, {
        archived,
      });
      return this.normalizeConversation(response.data.data);
    } catch (error) {
      console.error("Error archiving conversation:", error);
      throw new Error("Failed to archive conversation");
    }
  }

  /**
   * Pin or unpin a conversation
   */
  static async pinConversation(conversationId: string, pinned: boolean): Promise<Conversation> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/conversations/${conversationId}/pin`, {
        pinned,
      });
      return this.normalizeConversation(response.data.data);
    } catch (error) {
      console.error("Error pinning conversation:", error);
      throw new Error("Failed to pin conversation");
    }
  }

  /**
   * Categorize conversations by time
   */
  static categorizeConversationsByTime(conversations: Conversation[]): {
    today: Conversation[];
    yesterday: Conversation[];
    thirtyDays: Conversation[];
    earlier: Conversation[];
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const categorized = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      thirtyDays: [] as Conversation[],
      earlier: [] as Conversation[],
    };

    conversations.forEach((conv) => {
      const updatedAt = new Date(conv.updatedAt);
      const convDate = new Date(
        updatedAt.getFullYear(),
        updatedAt.getMonth(),
        updatedAt.getDate()
      );

      if (convDate.getTime() === today.getTime()) {
        categorized.today.push(conv);
      } else if (convDate.getTime() === yesterday.getTime()) {
        categorized.yesterday.push(conv);
      } else if (updatedAt >= thirtyDaysAgo) {
        categorized.thirtyDays.push(conv);
      } else {
        categorized.earlier.push(conv);
      }
    });

    return categorized;
  }

  /**
   * Normalize conversation data from API response
   */
  private static normalizeConversation(conversation: any): Conversation {
    return {
      ...conversation,
      updatedAt: new Date(conversation.updatedAt),
      createdAt: conversation.createdAt
        ? new Date(conversation.createdAt)
        : undefined,
    };
  }

  /**
   * Normalize message data from API response
   */
  private static normalizeMessage(message: any): ChatMessage {
    // Map backend fields to frontend ChatMessage structure
    const normalized: ChatMessage = {
      ...message,
      timestamp: new Date(message.timestamp),
      // Map MongoDB integration fields
      mongodbSelectedViewType: message.mongodbSelectedViewType,
      // Map integrationSelectorData to selection (for backward compatibility)
      selection: message.integrationSelectorData || message.selection,
      // Construct mongodbResult from saved data if available
      mongodbResult: message.formattedResult ? {
        type: message.formattedResult.type || 'json',
        data: message.formattedResult.data,
        action: message.mongodbIntegrationData?.action,
        connectionId: message.mongodbIntegrationData?.connectionId,
        database: message.mongodbIntegrationData?.database,
        connectionAlias: message.mongodbIntegrationData?.connectionAlias
      } : (message.mongodbIntegrationData ? {
        // If we have mongodbIntegrationData but no formattedResult, construct basic result
        type: message.mongodbSelectedViewType || 'table',
        data: message.mongodbIntegrationData, // Fallback to integrationData
        action: message.mongodbIntegrationData?.action,
        connectionId: message.mongodbIntegrationData?.connectionId,
        database: message.mongodbIntegrationData?.database,
        connectionAlias: message.mongodbIntegrationData?.connectionAlias
      } : undefined)
    };

    // Set requiresSelection if integrationSelectorData exists
    if (message.integrationSelectorData) {
      normalized.requiresSelection = true;
    }

    return normalized;
  }
}
