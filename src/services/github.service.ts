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

/** Backend may return `id` / `username`; listConnections normalizes to _id / githubUsername */
export interface GitHubConnection {
    _id: string;
    id?: string;
    userId?: string;
    githubUserId?: number;
    githubUsername?: string;
    username?: string;
    avatarUrl?: string;
    repositories: GitHubRepository[];
    isActive: boolean;
    lastSyncedAt?: Date;
    createdAt?: Date;
}

export interface StartIntegrationRequest {
    connectionId: string;
    repositoryId: number;
    repositoryName: string;
    repositoryFullName: string;
    integrationType: 'npm' | 'cli' | 'python' | 'http-headers';
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
     * @param skipCache - When true, adds cache-busting param for fresh data (e.g. after disconnect)
     */
    async listConnections(skipCache = false): Promise<GitHubConnection[]> {
        const config = skipCache ? { params: { _t: Date.now() } } : {};
        const response = await api.get('/github/connections', config);
        const data = response.data?.data ?? response.data?.connections;
        const raw = Array.isArray(data) ? data : [];
        return raw.map((c: Record<string, unknown>) => {
            const id = String((c as { _id?: string; id?: string })._id ?? (c as { id?: string }).id ?? '');
            const username =
                (c as { githubUsername?: string; username?: string }).githubUsername ??
                (c as { username?: string }).username;
            const repos = (c as { repositories?: GitHubRepository[] }).repositories;
            const isActive = (c as { isActive?: boolean }).isActive;
            return {
                ...c,
                _id: id,
                githubUsername: username,
                repositories: Array.isArray(repos) ? repos : [],
                isActive: isActive !== false,
            } as GitHubConnection;
        });
    }

    /**
     * Get repositories for a connection
     */
    async getRepositories(connectionId: string, refresh: boolean = false): Promise<{
        repositories: GitHubRepository[];
        lastSynced: Date;
    }> {
        const response = await api.get(`/github/connections/${connectionId}/repositories`, {
            params: { refresh: refresh ? 'true' : 'false' }
        });
        const payload = response.data?.data ?? response.data;
        const repositories = Array.isArray(payload?.repositories) ? payload.repositories : [];
        const lastSynced = payload?.lastSynced != null ? payload.lastSynced : new Date();
        return { repositories, lastSynced };
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
     * @param skipCache - When true, adds cache-busting param for fresh data (e.g. after disconnect)
     */
    async listIntegrations(status?: string, limit?: number, skipCache = false): Promise<Integration[]> {
        const params: Record<string, string | number> = {};
        if (status != null) params.status = status;
        if (limit != null) params.limit = limit;
        if (skipCache) params._t = Date.now();
        const response = await api.get('/github/integrations', { params });
        const data = response.data?.data ?? response.data?.integrations;
        return Array.isArray(data) ? data : [];
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

