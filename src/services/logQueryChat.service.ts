import { apiClient } from '../config/api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    query?: string;
    mongoQuery?: any;
    resultsCount?: number;
    visualization?: {
        type: 'stat-card' | 'line' | 'bar' | 'pie' | 'area' | 'table';
        metric: string;
        title: string;
        size: 'small' | 'medium' | 'large' | 'full';
        data?: any;
        chartConfig?: any;
    };
    suggestedQueries?: string[];
    timestamp: Date | string;
}

export interface Conversation {
    conversationId: string;
    userId: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface SendQueryResponse {
    success: boolean;
    data: any[];
    visualization: ChatMessage['visualization'];
    summary: string;
    conversationId: string;
    suggestedQueries?: string[];
    blocked?: boolean;
}

export interface ChatHistoryResponse {
    success: boolean;
    data: Conversation[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

class LogQueryChatService {
    /**
     * Send a natural language query
     */
    async sendQuery(
        query: string,
        conversationId?: string,
        additionalFilters?: any
    ): Promise<SendQueryResponse> {
        try {
            const response = await apiClient.post('/logs/ai/chat', {
                query,
                conversationId,
                additionalFilters
            });

            return response.data;
        } catch (error: any) {
            console.error('Error sending query:', error);

            // Handle rate limiting
            if (error.response?.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            }

            // Handle validation errors
            if (error.response?.status === 400) {
                throw new Error(error.response.data.error || 'Invalid query');
            }

            // Handle authentication errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('Authentication required. Please log in again.');
            }

            throw new Error(error.response?.data?.message || 'Failed to process query');
        }
    }

    /**
     * Get chat history
     */
    async getChatHistory(
        limit: number = 10,
        offset: number = 0
    ): Promise<ChatHistoryResponse> {
        try {
            const params = new URLSearchParams();
            params.append('limit', String(limit));
            params.append('offset', String(offset));

            const response = await apiClient.get(`/logs/ai/chat/history?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching chat history:', error);
            throw new Error(error.response?.data?.error || 'Failed to fetch chat history');
        }
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete(`/logs/ai/chat/${conversationId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error deleting conversation:', error);

            if (error.response?.status === 404) {
                throw new Error('Conversation not found');
            }

            throw new Error(error.response?.data?.error || 'Failed to delete conversation');
        }
    }
}

export const logQueryChatService = new LogQueryChatService();
export { LogQueryChatService };

