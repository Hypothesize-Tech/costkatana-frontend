import { apiClient } from "@/config/api";
import type {
  CreateIntegrationDto,
  UpdateIntegrationDto,
  IntegrationResponse,
  IntegrationsListResponse,
  TestIntegrationResponse,
  DeliveryLogsResponse,
  IntegrationStatsResponse,
  SlackChannel,
  DiscordGuild,
  DiscordChannel,
} from "../types/integration.types";

class IntegrationService {
  /**
   * Create a new integration
   */
  async createIntegration(
    dto: CreateIntegrationDto
  ): Promise<IntegrationResponse> {
    const response = await apiClient.post("/integrations", dto);
    return response.data;
  }

  /**
   * Get all integrations for the user
   */
  async getIntegrations(filters?: {
    type?: string;
    status?: string;
  }): Promise<IntegrationsListResponse> {
    const response = await apiClient.get("/integrations", {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get a specific integration
   */
  async getIntegration(id: string): Promise<IntegrationResponse> {
    const response = await apiClient.get(`/integrations/${id}`);
    return response.data;
  }

  /**
   * Update an integration
   */
  async updateIntegration(
    id: string,
    updates: UpdateIntegrationDto
  ): Promise<IntegrationResponse> {
    const response = await apiClient.put(`/integrations/${id}`, updates);
    return response.data;
  }

  /**
   * Delete an integration
   */
  async deleteIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/integrations/${id}`);
    return response.data;
  }

  /**
   * Test an integration
   */
  async testIntegration(id: string): Promise<TestIntegrationResponse> {
    const response = await apiClient.post(`/integrations/${id}/test`);
    return response.data;
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(id: string): Promise<IntegrationStatsResponse> {
    const response = await apiClient.get(`/integrations/${id}/stats`);
    return response.data;
  }

  /**
   * Get delivery logs for an integration
   */
  async getDeliveryLogs(
    id: string,
    filters?: {
      status?: string;
      alertType?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<DeliveryLogsResponse> {
    const response = await apiClient.get(`/integrations/${id}/logs`, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get all delivery logs
   */
  async getAllDeliveryLogs(filters?: {
    status?: string;
    alertType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<DeliveryLogsResponse> {
    const response = await apiClient.get("/integrations/logs/all", {
      params: filters,
    });
    return response.data;
  }

  /**
   * Retry failed deliveries for an alert
   */
  async retryFailedDeliveries(
    alertId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(
      `/integrations/alerts/${alertId}/retry`
    );
    return response.data;
  }

  /**
   * Get Slack channels for OAuth integration
   */
  async getSlackChannels(integrationId: string): Promise<SlackChannel[]> {
    const response = await apiClient.get(
      `/integrations/${integrationId}/slack/channels`
    );
    return response.data.data;
  }

  /**
   * Get Discord guilds for bot integration
   */
  async getDiscordGuilds(integrationId: string): Promise<DiscordGuild[]> {
    const response = await apiClient.get(
      `/integrations/${integrationId}/discord/guilds`
    );
    return response.data.data;
  }

  /**
   * Get Discord channels for a specific guild
   */
  async getDiscordChannels(
    integrationId: string,
    guildId: string
  ): Promise<DiscordChannel[]> {
    const response = await apiClient.get(
      `/integrations/${integrationId}/discord/guilds/${guildId}/channels`
    );
    return response.data.data;
  }

  /**
   * Get autocomplete suggestions for @ mentions
   */
  async getAutocompleteSuggestions(params?: {
    query?: string;
    integration?: string;
    entityType?: string;
    entityId?: string;
  }): Promise<Array<{
    id: string;
    label: string;
    type: 'integration' | 'entity' | 'subentity';
    integration?: string;
    entityType?: string;
    entityId?: string;
  }>> {
    const response = await apiClient.get('/chat/integrations/autocomplete', {
      params
    });
    return response.data.data || [];
  }

  /**
   * List entities for an integration type
   */
  async listEntities(
    type: string,
    entityType?: string
  ): Promise<Array<{ id: string; name: string }>> {
    const response = await apiClient.get(`/chat/integrations/${type}/entities`, {
      params: entityType ? { entityType } : {}
    });
    return response.data.data || [];
  }

  /**
   * Get sub-entities for a parent entity
   */
  async getSubEntities(
    type: string,
    entityId: string,
    subEntityType?: string
  ): Promise<Array<{ id: string; name: string }>> {
    const response = await apiClient.get(
      `/chat/integrations/${type}/${entityId}/subentities`,
      {
        params: subEntityType ? { subEntityType } : {}
      }
    );
    return response.data.data || [];
  }
}

export const integrationService = new IntegrationService();

