import api from '../config/api';

export interface GitHubRepository {
    id: number;
    name: string;
    fullName: string;
    private: boolean;
    defaultBranch: string;
    description?: string;
    language?: string;
    url: string;
}

export interface GitHubConnection {
    _id: string;
    userId: string;
    githubUserId?: number;
    githubUsername?: string;
    avatarUrl?: string;
    repositories: GitHubRepository[];
    isActive: boolean;
    lastSyncedAt?: Date;
    createdAt: Date;
}

export interface StartIntegrationRequest {
    connectionId: string;
    repositoryId: number;
    repositoryName: string;
    repositoryFullName: string;
    integrationType: 'npm' | 'cli' | 'python';
    selectedFeatures: { name: string; enabled: boolean; config?: any }[];
    conversationId?: string;
}

export interface IntegrationProgress {
    integrationId: string;
    status: string;
    progress: number;
    currentStep: string;
    analysis?: any;
    prUrl?: string;
    errorMessage?: string;
}

export interface Integration {
    _id: string;
    userId: string;
    repositoryName: string;
    repositoryFullName: string;
    branchName: string;
    prNumber?: number;
    prUrl?: string;
    status: string;
    integrationType: string;
    selectedFeatures: any[];
    createdAt: Date;
    updatedAt: Date;
}

class GitHubService {
    /**
     * Initiate OAuth flow
     */
    async initiateOAuth(): Promise<{ authUrl: string; state: string }> {
        const response = await api.get('/github/auth');
        return response.data.data;
    }

    /**
     * List user's GitHub connections
     */
    async listConnections(): Promise<GitHubConnection[]> {
        const response = await api.get('/github/connections');
        return response.data.data;
    }

    /**
     * Get repositories for a connection
     */
    async getRepositories(connectionId: string, refresh: boolean = false): Promise<{
        repositories: GitHubRepository[];
        lastSynced: Date;
    }> {
        const response = await api.get(`/github/connections/${connectionId}/repositories`, {
            params: { refresh }
        });
        return response.data.data;
    }

    /**
     * Start integration
     */
    async startIntegration(data: StartIntegrationRequest): Promise<{
        integrationId: string;
        status: string;
        repositoryName: string;
        branchName: string;
    }> {
        const response = await api.post('/github/integrations', data);
        return response.data.data;
    }

    /**
     * Get integration status
     */
    async getIntegrationStatus(integrationId: string): Promise<IntegrationProgress> {
        const response = await api.get(`/github/integrations/${integrationId}`);
        return response.data.data;
    }

    /**
     * List user's integrations
     */
    async listIntegrations(status?: string, limit?: number): Promise<Integration[]> {
        const response = await api.get('/github/integrations', {
            params: { status, limit }
        });
        return response.data.data;
    }

    /**
     * Update integration
     */
    async updateIntegration(integrationId: string, changes: string): Promise<void> {
        await api.post(`/github/integrations/${integrationId}/update`, { changes });
    }

    /**
     * Disconnect GitHub connection
     */
    async disconnectConnection(connectionId: string): Promise<void> {
        await api.delete(`/github/connections/${connectionId}`);
    }

    /**
     * Open GitHub OAuth window
     */
    openOAuthWindow(): Promise<{ connectionId: string } | null> {
        return new Promise((resolve) => {
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            this.initiateOAuth().then(({ authUrl }) => {
                const popup = window.open(
                    authUrl,
                    'GitHub OAuth',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Listen for OAuth callback
                const messageHandler = (event: MessageEvent) => {
                    if (event.data.type === 'github-oauth-success') {
                        window.removeEventListener('message', messageHandler);
                        if (popup) popup.close();
                        resolve({ connectionId: event.data.connectionId });
                    } else if (event.data.type === 'github-oauth-error') {
                        window.removeEventListener('message', messageHandler);
                        if (popup) popup.close();
                        resolve(null);
                    }
                };

                window.addEventListener('message', messageHandler);

                // Check if popup was blocked
                if (!popup || popup.closed) {
                    window.removeEventListener('message', messageHandler);
                    resolve(null);
                }
            });
        });
    }
}

export default new GitHubService();

