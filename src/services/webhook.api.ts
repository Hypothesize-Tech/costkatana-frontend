import { apiClient } from '../config/api';
import {  WebhookEvent, WebhookFormData, WebhookQueueStats } from '../types/webhook.types';

export const webhookApi = {
    // Get all webhooks
    async getWebhooks(filters?: { active?: boolean; events?: string[] }) {
        const params = new URLSearchParams();
        if (filters?.active !== undefined) {
            params.append('active', filters.active.toString());
        }
        if (filters?.events) {
            filters.events.forEach(event => params.append('events', event));
        }
        
        const response = await apiClient.get(`/webhooks${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    // Get a single webhook
    async getWebhook(webhookId: string) {
        const response = await apiClient.get(`/webhooks/${webhookId}`);
        return response.data;
    },

    // Create a new webhook
    async createWebhook(data: WebhookFormData) {
        const response = await apiClient.post('/webhooks', data);
        return response.data;
    },

    // Update a webhook
    async updateWebhook(webhookId: string, updates: Partial<WebhookFormData>) {
        const response = await apiClient.put(`/webhooks/${webhookId}`, updates);
        return response.data;
    },

    // Delete a webhook
    async deleteWebhook(webhookId: string) {
        const response = await apiClient.delete(`/webhooks/${webhookId}`);
        return response.data;
    },

    // Test a webhook
    async testWebhook(webhookId: string, testData?: { eventType?: string; customData?: any }) {
        const response = await apiClient.post(`/webhooks/${webhookId}/test`, testData || {});
        return response.data;
    },

    // Get webhook deliveries
    async getDeliveries(
        webhookId: string, 
        filters?: { 
            status?: string; 
            eventType?: string; 
            limit?: number; 
            offset?: number; 
        }
    ) {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.eventType) params.append('eventType', filters.eventType);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const response = await apiClient.get(`/webhooks/${webhookId}/deliveries${params.toString() ? `?${params}` : ''}`);
        return response.data;
    },

    // Get a single delivery
    async getDelivery(deliveryId: string) {
        const response = await apiClient.get(`/webhooks/deliveries/${deliveryId}`);
        return response.data;
    },

    // Replay a delivery
    async replayDelivery(deliveryId: string) {
        const response = await apiClient.post(`/webhooks/deliveries/${deliveryId}/replay`);
        return response.data;
    },

    // Get webhook statistics
    async getWebhookStats(webhookId: string) {
        const response = await apiClient.get(`/webhooks/${webhookId}/stats`);
        return response.data;
    },

    // Get available webhook events
    async getAvailableEvents(): Promise<{ events: WebhookEvent[]; categories: string[]; total: number }> {
        const response = await apiClient.get('/webhooks/events');
        return response.data;
    },

    // Get queue statistics
    async getQueueStats(): Promise<{ queue: WebhookQueueStats }> {
        const response = await apiClient.get('/webhooks/queue/stats');
        return response.data;
    }
};
