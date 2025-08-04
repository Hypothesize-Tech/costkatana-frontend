import apiClient from "@/config/api";

export interface MemoryInsight {
    type: 'preference' | 'pattern' | 'security' | 'context';
    content: string;
    confidence: number;
    timestamp: string;
    source: string;
}

export interface UserPreference {
    preferredModel?: string;
    preferredChatMode?: 'fastest' | 'cheapest' | 'balanced';
    preferredStyle?: string;
    responseLength?: 'concise' | 'detailed' | 'comprehensive';
    technicalLevel?: 'beginner' | 'intermediate' | 'expert';
    commonTopics?: string[];
    costPreference?: 'cheap' | 'balanced' | 'premium';
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        sms: boolean;
        weeklyDigest: boolean;
        costAlerts: boolean;
        newFeatures: boolean;
    };
    privacySettings?: {
        shareData: boolean;
        trackUsage: boolean;
        personalizedRecommendations: boolean;
        retainConversations: boolean;
        allowModelTraining: boolean;
    };
}

export interface ConversationMemory {
    _id: string;
    userId: string;
    conversationId: string;
    query: string;
    response: string;
    metadata: {
        timestamp: string;
        modelUsed?: string;
        chatMode?: string;
        cost?: number;
        responseTime?: number;
        queryLength: number;
        responseLength: number;
        topics?: string[];
        sentiment?: string;
        userSatisfaction?: number;
    };
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SimilarConversation {
    conversationId: string;
    query: string;
    response: string;
    similarity: number;
    timestamp: string;
    metadata?: any;
}

export interface MemoryStats {
    userId: string;
    conversationCount: number;
    memoryCount: number;
    hasPreferences: boolean;
    vectorStorage: {
        totalVectors: number;
        totalUsers: number;
        memoryUsage: string;
        cacheSize: number;
    };
    lastUpdated: string;
}

export class MemoryService {
    private static baseUrl = '/memory';

    /**
     * Get user memory insights
     */
    static async getMemoryInsights(userId: string): Promise<MemoryInsight[]> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/${userId}/insights`);
            return response.data.data.insights;
        } catch (error: any) {
            console.error('Error getting memory insights:', error);
            throw new Error(error.response?.data?.message || 'Failed to get memory insights');
        }
    }

    /**
     * Get user preferences
     */
    static async getUserPreferences(userId: string): Promise<{ preferences: UserPreference; summary: string; hasPreferences: boolean }> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/${userId}/preferences`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting user preferences:', error);
            throw new Error(error.response?.data?.message || 'Failed to get user preferences');
        }
    }

    /**
     * Update user preferences
     */
    static async updateUserPreferences(userId: string, preferences: Partial<UserPreference>): Promise<UserPreference> {
        try {
            const response = await apiClient.put(`${this.baseUrl}/${userId}/preferences`, preferences);
            return response.data.data;
        } catch (error: any) {
            console.error('Error updating user preferences:', error);
            throw new Error(error.response?.data?.message || 'Failed to update user preferences');
        }
    }

    /**
     * Get conversation history with memory context
     */
    static async getConversationHistory(
        userId: string, 
        options?: {
            limit?: number;
            page?: number;
            includeArchived?: boolean;
        }
    ): Promise<{
        conversations: ConversationMemory[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        try {
            const params = new URLSearchParams();
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.page) params.append('page', options.page.toString());
            if (options?.includeArchived) params.append('includeArchived', options.includeArchived.toString());

            const response = await apiClient.get(`${this.baseUrl}/${userId}/conversations?${params.toString()}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting conversation history:', error);
            throw new Error(error.response?.data?.message || 'Failed to get conversation history');
        }
    }

    /**
     * Get similar conversations
     */
    static async getSimilarConversations(
        userId: string, 
        query: string, 
        limit: number = 5
    ): Promise<SimilarConversation[]> {
        try {
            const params = new URLSearchParams({
                query,
                limit: limit.toString()
            });

            const response = await apiClient.get(`${this.baseUrl}/${userId}/similar?${params.toString()}`);
            return response.data.data.similarConversations;
        } catch (error: any) {
            console.error('Error getting similar conversations:', error);
            throw new Error(error.response?.data?.message || 'Failed to get similar conversations');
        }
    }

    /**
     * Get personalized recommendations
     */
    static async getPersonalizedRecommendations(
        userId: string, 
        query: string
    ): Promise<string[]> {
        try {
            const params = new URLSearchParams({ query });
            const response = await apiClient.get(`${this.baseUrl}/${userId}/recommendations?${params.toString()}`);
            return response.data.data.recommendations;
        } catch (error: any) {
            console.error('Error getting personalized recommendations:', error);
            throw new Error(error.response?.data?.message || 'Failed to get personalized recommendations');
        }
    }

    /**
     * Archive conversation
     */
    static async archiveConversation(conversationId: string, userId: string): Promise<void> {
        try {
            await apiClient.put(`${this.baseUrl}/conversations/${conversationId}/archive`, { userId });
        } catch (error: any) {
            console.error('Error archiving conversation:', error);
            throw new Error(error.response?.data?.message || 'Failed to archive conversation');
        }
    }

    /**
     * Delete conversation
     */
    static async deleteConversation(conversationId: string, userId: string): Promise<void> {
        try {
            await apiClient.delete(`${this.baseUrl}/conversations/${conversationId}`, { 
                data: { userId } 
            });
        } catch (error: any) {
            console.error('Error deleting conversation:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete conversation');
        }
    }

    /**
     * Reset user preferences
     */
    static async resetPreferences(userId: string): Promise<void> {
        try {
            await apiClient.delete(`${this.baseUrl}/${userId}/preferences`);
        } catch (error: any) {
            console.error('Error resetting preferences:', error);
            throw new Error(error.response?.data?.message || 'Failed to reset preferences');
        }
    }

    /**
     * Clear all user memory (GDPR compliance)
     */
    static async clearUserMemory(userId: string): Promise<void> {
        try {
            await apiClient.delete(`${this.baseUrl}/${userId}/clear`);
        } catch (error: any) {
            console.error('Error clearing user memory:', error);
            throw new Error(error.response?.data?.message || 'Failed to clear user memory');
        }
    }

    /**
     * Export user memory data (GDPR compliance)
     */
    static async exportUserData(userId: string): Promise<any> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/${userId}/export`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error exporting user data:', error);
            throw new Error(error.response?.data?.message || 'Failed to export user data');
        }
    }

    /**
     * Get memory storage statistics
     */
    static async getStorageStats(userId: string): Promise<MemoryStats> {
        try {
            const response = await apiClient.get(`${this.baseUrl}/${userId}/stats`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting storage stats:', error);
            throw new Error(error.response?.data?.message || 'Failed to get storage statistics');
        }
    }
}