import { apiClient } from '@/config/api';
import type { JiraProject, JiraIssueType, JiraPriority } from '../types/integration.types';

export interface CreateJiraIssueDto {
    title: string;
    description?: string;
    projectKey: string;
    issueTypeId: string;
    priorityId?: string;
    labels?: string[];
    components?: Array<{ id: string }>;
}

export interface UpdateJiraIssueDto {
    summary?: string;
    description?: string;
    priorityId?: string;
    labels?: string[];
}

class JiraService {
    /**
     * Validate JIRA API token and get projects (for manual token entry)
     */
    async validateToken(accessToken: string, siteUrl: string): Promise<{ user: { accountId: string; displayName: string; emailAddress?: string; active: boolean }; projects: JiraProject[] }> {
        const response = await apiClient.post('/integrations/jira/validate-token', {
            accessToken,
            siteUrl
        });
        return response.data.data;
    }

    /**
     * Get JIRA projects for an integration
     */
    async getProjects(integrationId: string): Promise<JiraProject[]> {
        const response = await apiClient.get(`/integrations/${integrationId}/jira/projects`);
        return response.data.data || [];
    }

    /**
     * Get JIRA issue types for a project
     */
    async getIssueTypes(integrationId: string, projectKey: string): Promise<JiraIssueType[]> {
        const response = await apiClient.get(
            `/integrations/${integrationId}/jira/projects/${projectKey}/issue-types`
        );
        return response.data.data || [];
    }

    /**
     * Get JIRA priorities
     */
    async getPriorities(integrationId: string): Promise<JiraPriority[]> {
        const response = await apiClient.get(`/integrations/${integrationId}/jira/priorities`);
        return response.data.data || [];
    }

    /**
     * Create a JIRA issue
     */
    async createIssue(
        integrationId: string,
        issueData: CreateJiraIssueDto
    ): Promise<{ issueKey: string; issueUrl: string }> {
        const response = await apiClient.post(
            `/integrations/${integrationId}/jira/issues`,
            issueData
        );
        return response.data.data;
    }

    /**
     * Update a JIRA issue
     */
    async updateIssue(
        integrationId: string,
        issueKey: string,
        updates: UpdateJiraIssueDto
    ): Promise<void> {
        await apiClient.put(
            `/integrations/${integrationId}/jira/issues/${issueKey}`,
            updates
        );
    }
}

export const jiraService = new JiraService();

