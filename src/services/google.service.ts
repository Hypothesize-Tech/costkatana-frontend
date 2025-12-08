import api from "@/config/api";


export interface GoogleConnection {
    _id: string;
    userId: string;
    googleEmail: string;
    googleName?: string;
    googleAvatar?: string;
    googleDomain?: string;
    isActive: boolean;
    healthStatus: 'healthy' | 'needs_reconnect' | 'error';
    lastSyncedAt?: string;
    driveFiles: GoogleDriveFile[];
    createdAt: string;
    updatedAt: string;
}

export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
    iconLink?: string;
    createdTime?: string;
    modifiedTime?: string;
    size?: number;
    parents?: string[];
}

export interface ExportCostDataOptions {
    connectionId: string;
    startDate?: Date | string;
    endDate?: Date | string;
    projectId?: string;
    redactionOptions?: {
        maskEmails?: boolean;
        removePrompts?: boolean;
        aggregateByTeam?: boolean;
    };
}

export interface CreateCostReportOptions {
    connectionId: string;
    startDate?: Date | string;
    endDate?: Date | string;
    projectId?: string;
    includeTopModels?: boolean;
    includeRecommendations?: boolean;
}

export interface GoogleExportAudit {
    _id: string;
    userId: string;
    connectionId: string;
    exportType: 'sheets' | 'docs' | 'slides' | 'drive';
    datasetType: 'cost_data' | 'analytics' | 'report' | 'budget' | 'usage' | 'custom';
    fileId: string;
    fileName: string;
    fileLink: string;
    scope: string;
    recordCount?: number;
    metadata?: any;
    exportedAt: string;
    createdAt: string;
}

class GoogleService {
    /**
     * Initiate OAuth flow using unified OAuth controller
     */
    async initiateOAuth(): Promise<{ authUrl: string; scopes: string[] }> {
        const response = await api.post('/auth/oauth/google/link');
        return response.data.data;
    }

    /**
     * List user's Google connections
     */
    async listConnections(): Promise<GoogleConnection[]> {
        const response = await api.get('/google/connections');
        return response.data.data;
    }

    /**
     * Get connection details
     */
    async getConnection(connectionId: string): Promise<GoogleConnection> {
        const response = await api.get(`/google/connections/${connectionId}`);
        return response.data.data;
    }

    /**
     * Disconnect Google account
     */
    async disconnectConnection(connectionId: string): Promise<void> {
        await api.delete(`/google/connections/${connectionId}`);
    }

    /**
     * Check connection health
     */
    async checkConnectionHealth(connectionId: string): Promise<{
        healthy: boolean;
        status: 'healthy' | 'needs_reconnect' | 'error';
        message: string;
    }> {
        const response = await api.get(`/google/connections/${connectionId}/health`);
        return response.data.data;
    }

    /**
     * List Drive files
     */
    async listDriveFiles(connectionId: string, options?: {
        pageSize?: number;
        pageToken?: string;
        query?: string;
        orderBy?: string;
    }): Promise<{ files: GoogleDriveFile[]; nextPageToken?: string }> {
        const params = new URLSearchParams();
        if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
        if (options?.pageToken) params.append('pageToken', options.pageToken);
        if (options?.query) params.append('query', options.query);
        if (options?.orderBy) params.append('orderBy', options.orderBy);

        const response = await api.get(`/google/connections/${connectionId}/drive?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Get Drive file details
     */
    async getDriveFile(connectionId: string, fileId: string): Promise<GoogleDriveFile> {
        const response = await api.get(`/google/connections/${connectionId}/drive/${fileId}`);
        return response.data.data;
    }

    /**
     * Export cost data to Google Sheets
     */
    async exportCostData(options: ExportCostDataOptions): Promise<{
        spreadsheetId: string;
        spreadsheetUrl: string;
        auditId: string;
    }> {
        const response = await api.post('/google/export/cost-data', options);
        return response.data.data;
    }

    /**
     * Create cost report in Google Docs
     */
    async createCostReport(options: CreateCostReportOptions): Promise<{
        documentId: string;
        documentUrl: string;
        auditId: string;
    }> {
        const response = await api.post('/google/export/report', options);
        return response.data.data;
    }

    /**
     * Get export audits
     */
    async getExportAudits(filters?: {
        limit?: number;
        exportType?: string;
        datasetType?: string;
    }): Promise<GoogleExportAudit[]> {
        const params = new URLSearchParams();
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.exportType) params.append('exportType', filters.exportType);
        if (filters?.datasetType) params.append('datasetType', filters.datasetType);

        const response = await api.get(`/google/export/audits?${params.toString()}`);
        return response.data.data;
    }
}

export const googleService = new GoogleService();
export default googleService;

