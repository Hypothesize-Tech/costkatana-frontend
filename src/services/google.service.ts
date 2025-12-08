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

    /**
     * Send email via Gmail
     */
    async sendEmail(connectionId: string, to: string | string[], subject: string, body: string, isHtml?: boolean): Promise<{ messageId: string; success: boolean }> {
        const response = await api.post(`/google/connections/${connectionId}/gmail/send`, {
            to,
            subject,
            body,
            isHtml
        });
        return response.data.data;
    }

    /**
     * Search Gmail messages
     */
    async searchEmails(connectionId: string, query: string, maxResults?: number): Promise<any[]> {
        const params = new URLSearchParams();
        params.append('query', query);
        if (maxResults) params.append('maxResults', maxResults.toString());

        const response = await api.get(`/google/connections/${connectionId}/gmail/search?${params.toString()}`);
        return response.data.data.messages;
    }

    /**
     * List Calendar events
     */
    async listCalendarEvents(connectionId: string, startDate?: Date, endDate?: Date, maxResults?: number): Promise<any[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
        if (maxResults) params.append('maxResults', maxResults.toString());

        const response = await api.get(`/google/connections/${connectionId}/calendar/events?${params.toString()}`);
        return response.data.data.events;
    }

    /**
     * Create Calendar event
     */
    async createCalendarEvent(
        connectionId: string,
        summary: string,
        start: Date,
        end: Date,
        description?: string,
        attendees?: string[]
    ): Promise<{ eventId: string; eventLink: string }> {
        const response = await api.post(`/google/connections/${connectionId}/calendar/budget-review`, {
            summary,
            start,
            end,
            description,
            attendees
        });
        return response.data.data;
    }

    /**
     * Update Calendar event
     */
    async updateCalendarEvent(connectionId: string, eventId: string, updates: any): Promise<{ eventId: string; success: boolean }> {
        const response = await api.patch(`/google/connections/${connectionId}/calendar/events/${eventId}`, updates);
        return response.data.data;
    }

    /**
     * Delete Calendar event
     */
    async deleteCalendarEvent(connectionId: string, eventId: string): Promise<{ success: boolean }> {
        const response = await api.delete(`/google/connections/${connectionId}/calendar/events/${eventId}`);
        return response.data.data;
    }

    /**
     * Upload file to Drive
     */
    async uploadFileToDrive(
        connectionId: string,
        fileName: string,
        mimeType: string,
        fileContent: string,
        folderId?: string
    ): Promise<{ fileId: string; fileUrl: string }> {
        const response = await api.post(`/google/connections/${connectionId}/drive/upload`, {
            fileName,
            mimeType,
            fileContent,
            folderId
        });
        return response.data.data;
    }

    /**
     * Share Drive file
     */
    async shareDriveFile(
        connectionId: string,
        fileId: string,
        emailAddress: string,
        role?: 'reader' | 'writer' | 'commenter'
    ): Promise<{ success: boolean; permissionId: string }> {
        const response = await api.post(`/google/connections/${connectionId}/drive/share/${fileId}`, {
            emailAddress,
            role
        });
        return response.data.data;
    }

    /**
     * Create Drive folder
     */
    async createDriveFolder(connectionId: string, folderName: string, parentFolderId?: string): Promise<{ folderId: string; folderUrl: string }> {
        const response = await api.post(`/google/connections/${connectionId}/drive/folder`, {
            folderName,
            parentFolderId
        });
        return response.data.data;
    }

    /**
     * Add question to form
     */
    async addFormQuestion(
        connectionId: string,
        formId: string,
        questionText: string,
        questionType?: 'TEXT' | 'PARAGRAPH_TEXT' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DROPDOWN',
        options?: string[]
    ): Promise<{ success: boolean; questionId: string }> {
        const response = await api.post(`/google/connections/${connectionId}/forms/${formId}/question`, {
            questionText,
            questionType,
            options
        });
        return response.data.data;
    }

    /**
     * Export presentation to PDF
     */
    async exportPresentationToPDF(connectionId: string, presentationId: string): Promise<{ pdfUrl: string; fileId: string }> {
        const response = await api.post(`/google/connections/${connectionId}/slides/${presentationId}/export`);
        return response.data.data;
    }
}

export const googleService = new GoogleService();
export default googleService;

