import { apiClient } from '@/config/api';
import type { LinearTeam, LinearProject } from '../types/integration.types';

export interface LinearIssue {
    id: string;
    title: string;
    description?: string;
    identifier: string;
    url: string;
    state?: {
        id: string;
        name: string;
        type: string;
    };
}

export interface CreateLinearIssueDto {
    title: string;
    description?: string;
    teamId: string;
    projectId?: string;
}

export interface UpdateLinearIssueDto {
    title?: string;
    description?: string;
    stateId?: string;
    priority?: number;
}

class LinearService {
    /**
     * Validate Linear API token and get teams (for manual token entry)
     */
    async validateToken(accessToken: string): Promise<{ user: { id: string; name: string; email?: string; active: boolean }; teams: LinearTeam[] }> {
        const response = await apiClient.post('/integrations/linear/validate-token', {
            accessToken
        });
        return response.data.data;
    }

    /**
     * Get Linear projects for a team using access token directly
     */
    async getProjectsWithToken(accessToken: string, teamId: string): Promise<LinearProject[]> {
        const response = await apiClient.get(`/integrations/linear/projects?accessToken=${accessToken}&teamId=${teamId}`);
        return response.data.data || [];
    }

    /**
     * Get Linear teams for an integration
     */
    async getTeams(integrationId: string): Promise<LinearTeam[]> {
        const response = await apiClient.get(`/integrations/${integrationId}/linear/teams`);
        return response.data.data || [];
    }

    /**
     * Get Linear projects for a team
     */
    async getProjects(integrationId: string, teamId: string): Promise<LinearProject[]> {
        const response = await apiClient.get(
            `/integrations/${integrationId}/linear/teams/${teamId}/projects`
        );
        return response.data.data || [];
    }

    /**
     * Create a Linear issue
     */
    async createIssue(
        integrationId: string,
        issueData: CreateLinearIssueDto
    ): Promise<{ issueId: string; issueUrl: string }> {
        const response = await apiClient.post(
            `/integrations/${integrationId}/linear/issues`,
            issueData
        );
        return response.data.data;
    }

    /**
     * Update a Linear issue
     */
    async updateIssue(
        integrationId: string,
        issueId: string,
        updates: UpdateLinearIssueDto
    ): Promise<void> {
        await apiClient.put(
            `/integrations/${integrationId}/linear/issues/${issueId}`,
            updates
        );
    }
}

export const linearService = new LinearService();

