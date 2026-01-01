import api from '../config/api';

// Vercel project interface
export interface VercelProject {
    id: string;
    name: string;
    framework?: string;
    latestDeployment?: {
        id: string;
        url: string;
        state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
        createdAt: Date;
    };
    targets?: {
        production?: {
            url: string;
        };
    };
    createdAt?: Date;
    updatedAt?: Date;
}

// Vercel team interface
export interface VercelTeam {
    id: string;
    slug: string;
    name: string;
    avatar?: string;
}

// Vercel connection interface
export interface VercelConnection {
    _id: string;
    userId: string;
    vercelUserId: string;
    vercelUsername: string;
    vercelEmail?: string;
    avatarUrl?: string;
    teamId?: string;
    teamSlug?: string;
    team?: VercelTeam;
    projects: VercelProject[];
    isActive: boolean;
    lastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Vercel deployment interface
export interface VercelDeployment {
    uid: string;
    name: string;
    url: string;
    state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
    readyState?: string;
    createdAt: number;
    buildingAt?: number;
    ready?: number;
    meta?: {
        githubCommitRef?: string;
        githubCommitSha?: string;
        githubCommitMessage?: string;
    };
    target?: 'production' | 'preview';
    creator?: {
        uid: string;
        username: string;
    };
}

// Vercel domain interface
export interface VercelDomain {
    name: string;
    apexName: string;
    projectId: string;
    verified: boolean;
    verification?: Array<{
        type: string;
        domain: string;
        value: string;
    }>;
    createdAt: number;
    updatedAt: number;
}

// Vercel environment variable interface
export interface VercelEnvVar {
    id: string;
    key: string;
    value?: string;
    type: 'plain' | 'secret' | 'encrypted' | 'system';
    target: Array<'production' | 'preview' | 'development'>;
    createdAt: number;
    updatedAt: number;
}

// Deployment options
export interface DeploymentOptions {
    target?: 'production' | 'preview';
    gitSource?: {
        ref?: string;
        repoId?: string;
        type?: 'github' | 'gitlab' | 'bitbucket';
    };
}

class VercelService {
    /**
     * Initiate OAuth flow
     */
    async initiateOAuth(): Promise<{ authUrl: string }> {
        const response = await api.get('/vercel/auth');
        return response.data.data;
    }

    /**
     * List user's Vercel connections
     */
    async listConnections(): Promise<VercelConnection[]> {
        const response = await api.get('/vercel/connections');
        return response.data.data;
    }

    /**
     * Disconnect Vercel connection
     */
    async disconnectConnection(connectionId: string): Promise<void> {
        await api.delete(`/vercel/connections/${connectionId}`);
    }

    /**
     * Get projects for a connection
     */
    async getProjects(connectionId: string, refresh: boolean = false): Promise<VercelProject[]> {
        const response = await api.get(`/vercel/connections/${connectionId}/projects`, {
            params: { refresh }
        });
        return response.data.data;
    }

    /**
     * Get project details
     */
    async getProject(connectionId: string, projectId: string): Promise<VercelProject> {
        const response = await api.get(`/vercel/connections/${connectionId}/projects/${projectId}`);
        return response.data.data;
    }

    /**
     * Get deployments for a project
     */
    async getDeployments(connectionId: string, projectId: string, limit: number = 20): Promise<VercelDeployment[]> {
        const response = await api.get(`/vercel/connections/${connectionId}/projects/${projectId}/deployments`, {
            params: { limit }
        });
        return response.data.data;
    }

    /**
     * Trigger a new deployment
     */
    async triggerDeployment(connectionId: string, projectId: string, options?: DeploymentOptions): Promise<VercelDeployment> {
        const response = await api.post(`/vercel/connections/${connectionId}/projects/${projectId}/deploy`, options);
        return response.data.data;
    }

    /**
     * Get deployment logs
     */
    async getDeploymentLogs(connectionId: string, deploymentId: string): Promise<string[]> {
        const response = await api.get(`/vercel/connections/${connectionId}/deployments/${deploymentId}/logs`);
        return response.data.data;
    }

    /**
     * Rollback to a previous deployment
     */
    async rollbackDeployment(connectionId: string, deploymentId: string, projectId: string): Promise<VercelDeployment> {
        const response = await api.post(`/vercel/connections/${connectionId}/deployments/${deploymentId}/rollback`, {
            projectId
        });
        return response.data.data;
    }

    /**
     * Promote deployment to production
     */
    async promoteDeployment(connectionId: string, deploymentId: string): Promise<VercelDeployment> {
        const response = await api.post(`/vercel/connections/${connectionId}/deployments/${deploymentId}/promote`);
        return response.data.data;
    }

    /**
     * Get domains for a project
     */
    async getDomains(connectionId: string, projectId: string): Promise<VercelDomain[]> {
        const response = await api.get(`/vercel/connections/${connectionId}/projects/${projectId}/domains`);
        return response.data.data;
    }

    /**
     * Add domain to a project
     */
    async addDomain(connectionId: string, projectId: string, domain: string): Promise<VercelDomain> {
        const response = await api.post(`/vercel/connections/${connectionId}/projects/${projectId}/domains`, {
            domain
        });
        return response.data.data;
    }

    /**
     * Remove domain from a project
     */
    async removeDomain(connectionId: string, projectId: string, domain: string): Promise<void> {
        await api.delete(`/vercel/connections/${connectionId}/projects/${projectId}/domains/${domain}`);
    }

    /**
     * Get environment variables for a project
     */
    async getEnvVars(connectionId: string, projectId: string): Promise<VercelEnvVar[]> {
        const response = await api.get(`/vercel/connections/${connectionId}/projects/${projectId}/env`);
        return response.data.data;
    }

    /**
     * Set environment variable
     */
    async setEnvVar(
        connectionId: string,
        projectId: string,
        key: string,
        value: string,
        target: Array<'production' | 'preview' | 'development'> = ['production', 'preview', 'development'],
        type: 'plain' | 'secret' | 'encrypted' = 'encrypted'
    ): Promise<VercelEnvVar> {
        const response = await api.post(`/vercel/connections/${connectionId}/projects/${projectId}/env`, {
            key,
            value,
            target,
            type
        });
        return response.data.data;
    }

    /**
     * Delete environment variable
     */
    async deleteEnvVar(connectionId: string, projectId: string, envVarId: string): Promise<void> {
        await api.delete(`/vercel/connections/${connectionId}/projects/${projectId}/env/${envVarId}`);
    }

    /**
     * Get analytics for a project
     */
    async getAnalytics(connectionId: string, projectId: string, from?: Date, to?: Date): Promise<any> {
        const response = await api.get(`/vercel/connections/${connectionId}/projects/${projectId}/analytics`, {
            params: {
                from: from?.toISOString(),
                to: to?.toISOString()
            }
        });
        return response.data.data;
    }

    /**
     * Open Vercel OAuth window
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
                    'Vercel OAuth',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                if (!popup) {
                    resolve(null);
                    return;
                }

                // Poll for popup closure
                const checkPopup = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(checkPopup);
                        // Check for new connection
                        this.listConnections().then(connections => {
                            if (connections.length > 0) {
                                resolve({ connectionId: connections[0]._id });
                            } else {
                                resolve(null);
                            }
                        }).catch(() => {
                            resolve(null);
                        });
                    }
                }, 500);

                // Timeout after 5 minutes
                setTimeout(() => {
                    clearInterval(checkPopup);
                    if (!popup.closed) {
                        popup.close();
                    }
                    resolve(null);
                }, 5 * 60 * 1000);
            }).catch(() => {
                resolve(null);
            });
        });
    }

    /**
     * Get deployment status color
     */
    getDeploymentStatusColor(state: string): string {
        switch (state) {
            case 'READY':
                return 'text-success-500';
            case 'BUILDING':
            case 'INITIALIZING':
            case 'QUEUED':
                return 'text-warning-500';
            case 'ERROR':
            case 'CANCELED':
                return 'text-danger-500';
            default:
                return 'text-secondary-500';
        }
    }

    /**
     * Get deployment status badge class
     */
    getDeploymentStatusBadge(state: string): string {
        switch (state) {
            case 'READY':
                return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400';
            case 'BUILDING':
            case 'INITIALIZING':
            case 'QUEUED':
                return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400';
            default:
                return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400';
        }
    }

    /**
     * Format deployment date
     */
    formatDeploymentDate(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

export const vercelService = new VercelService();
export default vercelService;
