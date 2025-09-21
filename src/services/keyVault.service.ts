import   { apiClient }  from '../config/api';

export interface ProviderKey {
    _id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'google' | 'cohere' | 'aws-bedrock' | 'deepseek' | 'groq';
    maskedKey: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    lastUsed?: string;
}

export interface ProxyKey {
    _id: string;
    keyId: string;
    name: string;
    description?: string;
    providerKey: {
        name: string;
        provider: string;
        maskedKey: string;
    }[];
    project?: any[];
    userId?: string;
    projectId?: string;
    permissions: ('read' | 'write' | 'admin')[];
    budgetLimit?: number;
    dailyBudgetLimit?: number;
    monthlyBudgetLimit?: number;
    rateLimit?: number;
    allowedIPs?: string[];
    allowedDomains?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    lastUsed?: string;
    expiresAt?: string;
    usageStats: {
        totalRequests: number;
        totalCost: number;
        lastResetDate: string;
        dailyCost: number;
        monthlyCost: number;
    };
}

export interface KeyVaultAnalytics {
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    totalCost: number;
    dailyCost: number;
    monthlyCost: number;
}

export interface KeyVaultDashboard {
    providerKeys: ProviderKey[];
    proxyKeys: ProxyKey[];
    analytics: KeyVaultAnalytics;
}

export interface CreateProviderKeyRequest {
    name: string;
    provider: 'openai' | 'anthropic' | 'google' | 'cohere' | 'aws-bedrock' | 'deepseek' | 'groq';
    apiKey: string;
    description?: string;
}

export interface CreateProxyKeyRequest {
    name: string;
    providerKeyId: string;
    description?: string;
    projectId?: string;
    permissions?: ('read' | 'write' | 'admin')[];
    budgetLimit?: number;
    dailyBudgetLimit?: number;
    monthlyBudgetLimit?: number;
    rateLimit?: number;
    allowedIPs?: string[];
    allowedDomains?: string[];
    expiresAt?: string;
}

export class KeyVaultService {
    /**
     * Get Key Vault dashboard data
     */
    static async getDashboard(): Promise<KeyVaultDashboard> {
        const response = await apiClient.get('/key-vault/dashboard');
        return response.data.data;
    }

    /**
     * Get all provider keys
     */
    static async getProviderKeys(): Promise<ProviderKey[]> {
        const response = await apiClient.get('/key-vault/provider-keys');
        return response.data.data;
    }

    /**
     * Create a new provider key
     */
    static async createProviderKey(data: CreateProviderKeyRequest): Promise<ProviderKey> {
        const response = await apiClient.post('/key-vault/provider-keys', data);
        return response.data.data;
    }

    /**
     * Delete a provider key
     */
    static async deleteProviderKey(providerKeyId: string): Promise<void> {
        await apiClient.delete(`/key-vault/provider-keys/${providerKeyId}`);
    }

    /**
     * Get all proxy keys
     */
    static async getProxyKeys(projectId?: string): Promise<ProxyKey[]> {
        const params = projectId ? { projectId } : {};
        const response = await apiClient.get('/key-vault/proxy-keys', { params });
        return response.data.data;
    }

    /**
     * Create a new proxy key
     */
    static async createProxyKey(data: CreateProxyKeyRequest): Promise<ProxyKey> {
        const response = await apiClient.post('/key-vault/proxy-keys', data);
        return response.data.data;
    }

    /**
     * Delete a proxy key
     */
    static async deleteProxyKey(proxyKeyId: string): Promise<void> {
        await apiClient.delete(`/key-vault/proxy-keys/${proxyKeyId}`);
    }

    /**
     * Update proxy key status (activate/deactivate)
     */
    static async updateProxyKeyStatus(proxyKeyId: string, isActive: boolean): Promise<ProxyKey> {
        const response = await apiClient.patch(`/key-vault/proxy-keys/${proxyKeyId}/status`, { isActive });
        return response.data.data;
    }

    /**
     * Get proxy key analytics
     */
    static async getProxyKeyAnalytics(proxyKeyId?: string): Promise<KeyVaultAnalytics> {
        const params = proxyKeyId ? { proxyKeyId } : {};
        const response = await apiClient.get('/key-vault/analytics', { params });
        return response.data.data;
    }
}