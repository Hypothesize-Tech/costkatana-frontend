import { apiClient } from '@/config/api';

export interface DocumentMetadata {
    documentId: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    chunksCount: number;
    s3Key?: string;
    tags?: string[];
    description?: string;
}

export interface DocumentPreview {
    documentId: string;
    fileName: string;
    fileType: string;
    preview: string;
    totalChunks: number;
    previewChunks: number;
}

export interface UploadDocumentResponse {
    documentId: string;
    fileName: string;
    documentsCreated: number;
    duration: number;
    s3Key: string;
    s3Url: string;
}

class DocumentService {
    /**
     * Upload a document for RAG
     */
    async uploadDocument(
        file: File,
        options?: {
            projectId?: string;
            tags?: string;
            description?: string;
        }
    ): Promise<UploadDocumentResponse> {
        try {
            // Convert file to base64
            const base64Data = await this.fileToBase64(file);

            const response = await apiClient.post('/ingestion/upload', {
                fileName: file.name,
                fileData: base64Data,
                mimeType: file.type,
                projectId: options?.projectId,
                tags: options?.tags,
                description: options?.description
            });

            return response.data.data;
        } catch (error: any) {
            console.error('Document upload failed:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to upload document'
            );
        }
    }

    /**
     * Get user's uploaded documents
     */
    async getUserDocuments(): Promise<DocumentMetadata[]> {
        try {
            const response = await apiClient.get('/ingestion/user-documents');
            return response.data.data;
        } catch (error: any) {
            console.error('Failed to fetch user documents:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to fetch documents'
            );
        }
    }

    /**
     * Get document preview
     */
    async getDocumentPreview(documentId: string): Promise<DocumentPreview> {
        try {
            const response = await apiClient.get(
                `/ingestion/documents/${documentId}/preview`
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Failed to fetch document preview:', error);
            throw new Error(
                error.response?.data?.message || 'Failed to fetch preview'
            );
        }
    }

    /**
     * Convert file to base64
     */
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g., "data:application/pdf;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    }

    /**
     * Validate file before upload
     */
    validateFile(file: File): { valid: boolean; error?: string } {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedExtensions = [
            'pdf', 'txt', 'md', 'json', 'csv',
            'doc', 'docx', 'ts', 'js', 'py',
            'java', 'cpp', 'go', 'rs', 'rb'
        ];

        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'File size exceeds 10MB limit'
            };
        }

        // Check file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedExtensions.includes(extension)) {
            return {
                valid: false,
                error: `File type not supported. Allowed: ${allowedExtensions.join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}

export const documentService = new DocumentService();

