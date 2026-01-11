import apiClient, { chatApiClient } from "@/config/api";
import { MessageAttachment } from "../types/attachment.types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  messageType?: 'user' | 'assistant' | 'system' | 'governed_plan';
  governedTaskId?: string;
  planState?: 'SCOPE' | 'CLARIFY' | 'PLAN' | 'BUILD' | 'VERIFY' | 'DONE';
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
  fileReference?: {
    type: 'file_reference';
    path: string;
    relativePath: string;
    size: number;
    summary?: string;
    instructions?: string;
    metadata?: {
      toolName?: string;
      userId?: string;
      requestId?: string;
      createdAt: Date;
    };
  };
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
  governedTasks?: {
    count: number;
    active?: {
      taskId: string;
      mode: string;
      status: string;
    };
  };
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
  // Governed agent fields
  governedTaskId?: string;
  messageType?: 'user' | 'assistant' | 'system' | 'governed_plan';
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
  fileReference?: {
    type: 'file_reference';
    path: string;
    relativePath: string;
    size: number;
    summary?: string;
    instructions?: string;
  };
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

// Governed Agent Types
export interface TaskClassification {
  type: 'simple_query' | 'complex_query' | 'cross_integration' | 'coding' | 'research' | 'data_transformation';
  integrations: string[];
  complexity: 'low' | 'medium' | 'high';
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  requiresPlanning: boolean;
  route: 'DIRECT_EXECUTION' | 'GOVERNED_WORKFLOW';
  reasoning: string;
  estimatedDuration?: number;
}

export interface ClassifyMessageResponse {
  shouldUseGovernedAgent: boolean;
  classification: TaskClassification;
  reason: string;
}

export interface GovernedTaskInitiateResponse {
  taskId: string;
  conversationId?: string;
  mode: string;
  classification: TaskClassification;
  status: string;
  message: string;
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
    sevenDays: Conversation[];
    thirtyDays: Conversation[];
    earlier: Conversation[];
    } {
    // Get the start of today in local timezone (midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Calculate other boundaries
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const sevenDaysAgoStart = new Date(todayStart);
    sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 7);
    
    const thirtyDaysAgoStart = new Date(todayStart);
    thirtyDaysAgoStart.setDate(thirtyDaysAgoStart.getDate() - 30);

    const categorized = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      sevenDays: [] as Conversation[],
      thirtyDays: [] as Conversation[],
      earlier: [] as Conversation[],
    };

    conversations.forEach((conv) => {
      const updatedAt = new Date(conv.updatedAt);

      if (updatedAt >= todayStart) {
        // Today: from midnight today onwards
        categorized.today.push(conv);
      } else if (updatedAt >= yesterdayStart && updatedAt < todayStart) {
        // Yesterday: from midnight yesterday to midnight today
        categorized.yesterday.push(conv);
      } else if (updatedAt >= sevenDaysAgoStart && updatedAt < yesterdayStart) {
        // Last 7 Days: from 7 days ago to yesterday (excluding yesterday)
        categorized.sevenDays.push(conv);
      } else if (updatedAt >= thirtyDaysAgoStart && updatedAt < sevenDaysAgoStart) {
        // Last 30 Days: from 30 days ago to 7 days ago
        categorized.thirtyDays.push(conv);
      } else {
        // Earlier: older than 30 days
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
      // Map messageType, governedTaskId, and planState for governed agent messages
      messageType: message.messageType,
      governedTaskId: message.governedTaskId?.toString(),
      planState: message.planState,
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
  
  /**
   * Classify a message to determine if governed agent should be used
   */
  static async classifyMessage(message: string): Promise<ClassifyMessageResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/classify`, { message });
      return response.data.data;
    } catch (error: any) {
      console.error("Error classifying message:", error);
      throw new Error(error.response?.data?.message || "Failed to classify message");
    }
  }

  /**
   * Initiate a governed agent task from chat
   */
  static async initiateGovernedTask(message: string, conversationId?: string): Promise<GovernedTaskInitiateResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/governed/initiate`, {
        message,
        conversationId
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Error initiating governed task:", error);
      throw new Error(error.response?.data?.message || "Failed to initiate governed task");
    }
  }

  /**
   * Stream governed agent task progress via SSE
   */
  static streamGovernedTaskProgress(
    taskId: string,
    onUpdate: (data: any) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): () => void {
    const token = localStorage.getItem('access_token');
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL + '/api'|| 'http://localhost:8000/api'}/chat/governed/${taskId}/stream?token=${token}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('SSE connected for task:', data.taskId);
        } else if (data.type === 'update') {
          onUpdate(data);
        } else if (data.type === 'complete') {
          onComplete();
          eventSource.close();
        } else if (data.type === 'error') {
          onError(data.message || 'Unknown error occurred');
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      onError('Connection to server lost');
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  /**
   * Get clarifying questions for a governed task
   */
  static async getClarifyingQuestions(taskId: string): Promise<{
    clarificationNeeded: string[];
    ambiguities: string[];
    hasClarifications: boolean;
  }> {
    try {
      const response = await apiClient.get(`/governed-agent/${taskId}/clarify`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error getting clarifying questions:", error);
      throw new Error(error.response?.data?.message || "Failed to get clarifying questions");
    }
  }

  /**
   * Submit answers to clarifying questions and generate plan
   */
  static async generatePlanWithAnswers(taskId: string, clarifyingAnswers?: Record<string, string>): Promise<any> {
    try {
      const response = await apiClient.post(`/governed-agent/${taskId}/generate-plan`, {
        clarifyingAnswers
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Error generating plan:", error);
      throw new Error(error.response?.data?.message || "Failed to generate plan");
    }
  }
}
