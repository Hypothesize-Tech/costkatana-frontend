import { apiClient } from "@/config/api";

export interface FeedbackOptions {
    rating: boolean; // true = positive, false = negative
    comment?: string;
    implicitSignals?: ImplicitSignals;
}

export interface ImplicitSignals {
    copied?: boolean;
    conversationContinued?: boolean;
    immediateRephrase?: boolean;
    sessionDuration?: number; // in milliseconds
    codeAccepted?: boolean;
}

export interface FeedbackSubmissionResult {
    success: boolean;
    message: string;
}

class FeedbackService {
    /**
     * Submit feedback for a specific request
     */
    async submitFeedback(requestId: string, feedback: FeedbackOptions): Promise<FeedbackSubmissionResult> {
        try {
            const response = await apiClient.post(`/v1/request/${requestId}/feedback`, feedback);
            
            return {
                success: true,
                message: response.data.message || 'Feedback submitted successfully'
            };
        } catch (error: any) {
            console.error('Failed to submit feedback:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Failed to submit feedback'
            };
        }
    }

    /**
     * Update implicit signals for a request
     */
    async updateImplicitSignals(requestId: string, signals: ImplicitSignals): Promise<FeedbackSubmissionResult> {
        try {
            const response = await apiClient.put(`/v1/request/${requestId}/implicit-signals`, signals);
            
            return {
                success: true,
                message: response.data.message || 'Implicit signals updated successfully'
            };
        } catch (error: any) {
            console.error('Failed to update implicit signals:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Failed to update implicit signals'
            };
        }
    }

    /**
     * Get feedback for a specific request
     */
    async getFeedback(requestId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/v1/request/${requestId}/feedback`);
            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No feedback found
            }
            throw error;
        }
    }

    /**
     * Get user feedback analytics (Return on AI Spend)
     */
    async getFeedbackAnalytics(): Promise<any> {
        try {
            const response = await apiClient.get('/v1/feedback/analytics');
            return response.data.data;
        } catch (error: any) {
            console.error('Failed to get feedback analytics:', error);
            throw new Error(`Failed to get feedback analytics: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get enhanced feedback analytics with insights
     */
    async getEnhancedFeedbackAnalytics(): Promise<any> {
        try {
            const response = await apiClient.get('/analytics/feedback');
            return response.data.data;
        } catch (error: any) {
            console.error('Failed to get enhanced feedback analytics:', error);
            throw new Error(`Failed to get enhanced feedback analytics: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get global feedback analytics (admin only)
     */
    async getGlobalFeedbackAnalytics(): Promise<any> {
        try {
            const response = await apiClient.get('/v1/feedback/analytics/global');
            return response.data.data;
        } catch (error: any) {
            console.error('Failed to get global feedback analytics:', error);
            throw new Error(`Failed to get global feedback analytics: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Track implicit behavior automatically
     * This can be called when user performs actions like copying text, continuing conversation, etc.
     */
    async trackImplicitBehavior(requestId: string, behavior: keyof ImplicitSignals, value: boolean | number): Promise<void> {
        try {
            const signals: ImplicitSignals = {
                [behavior]: value
            };
            
            await this.updateImplicitSignals(requestId, signals);
        } catch (error) {
            // Silently fail for implicit tracking to not disrupt user experience
            console.warn('Failed to track implicit behavior:', error);
        }
    }

    /**
     * Helper method to track copy behavior
     */
    async trackCopyBehavior(requestId: string): Promise<void> {
        await this.trackImplicitBehavior(requestId, 'copied', true);
    }

    /**
     * Helper method to track conversation continuation
     */
    async trackConversationContinuation(requestId: string): Promise<void> {
        await this.trackImplicitBehavior(requestId, 'conversationContinued', true);
    }

    /**
     * Helper method to track immediate rephrase
     */
    async trackImmediateRephrase(requestId: string): Promise<void> {
        await this.trackImplicitBehavior(requestId, 'immediateRephrase', true);
    }

    /**
     * Helper method to track session duration
     */
    async trackSessionDuration(requestId: string, duration: number): Promise<void> {
        await this.trackImplicitBehavior(requestId, 'sessionDuration', duration);
    }

    /**
     * Helper method to track code acceptance
     */
    async trackCodeAcceptance(requestId: string, accepted: boolean): Promise<void> {
        await this.trackImplicitBehavior(requestId, 'codeAccepted', accepted);
    }
}

export const feedbackService = new FeedbackService();
export default feedbackService;