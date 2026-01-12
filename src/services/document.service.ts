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
    uploadId: string;
    fileName: string;
    status: 'processing' | 'complete';
    documentsCreated?: number;
    duration?: number;
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
            onProgress?: (progress: number, stage: string) => void;
        }
    ): Promise<UploadDocumentResponse> {
        try {
            // Stage 1: Converting to base64 (0-20%)
            if (options?.onProgress) options.onProgress(5, 'Preparing file...');
            
            const base64Data = await this.fileToBase64(file);
            
            if (options?.onProgress) options.onProgress(20, 'Uploading to server...');

            // Stage 2: Upload to server and get uploadId
            const response = await apiClient.post('/ingestion/upload', {
                fileName: file.name,
                fileData: base64Data,
                mimeType: file.type,
                projectId: options?.projectId,
                tags: options?.tags,
                description: options?.description
            }, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && options?.onProgress) {
                        const percentCompleted = Math.round(
                            20 + (progressEvent.loaded / progressEvent.total) * 10
                        );
                        options.onProgress(percentCompleted, 'Uploading to server...');
                    }
                }
            });

            const uploadResult = response.data.data;
            const uploadId = uploadResult.uploadId;

            // Stage 3: Listen to SSE for real-time progress (30-100%)
            return new Promise((resolve, reject) => {
                const token = localStorage.getItem('access_token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                
                console.log('📡 Establishing SSE connection for upload progress:', {
                    uploadId,
                    url: `${apiUrl}/api/ingestion/upload-progress/${uploadId}`
                });

                const eventSource = new EventSource(
                    `${apiUrl}/api/ingestion/upload-progress/${uploadId}?token=${token}`,
                    { withCredentials: true }
                );

                let lastProgressTime = Date.now();
                let connectionEstablished = false;

                eventSource.onopen = () => {
                    console.log('✅ SSE connection opened successfully for uploadId:', uploadId);
                    connectionEstablished = true;
                };

                eventSource.onmessage = (event) => {
                    try {
                        lastProgressTime = Date.now();
                        const progress = JSON.parse(event.data);
                        
                        // Log detailed progress with batch information
                        console.log('📊 Upload progress update:', {
                            uploadId,
                            stage: progress.stage,
                            progress: progress.progress,
                            message: progress.message,
                            batch: progress.currentBatch ? `${progress.currentBatch}/${progress.totalBatches}` : undefined,
                            chunks: progress.totalChunks ? `${progress.processedChunks || 0}/${progress.totalChunks}` : undefined
                        });
                        
                        // Build detailed progress message with batch info
                        let detailedMessage = progress.message;
                        if (progress.currentBatch && progress.totalBatches) {
                            detailedMessage = `Batch ${progress.currentBatch}/${progress.totalBatches}: ${progress.message}`;
                        }
                        
                        // Handle OCR stage specifically
                        if (progress.stage === 'ocr') {
                            detailedMessage = `Extracting text from image... ${progress.message}`;
                        }
                        
                        if (options?.onProgress) {
                            // Pass progress percentage (0-100) and detailed message
                            options.onProgress(progress.progress || 0, detailedMessage);
                        }

                        // Close connection and resolve when complete
                        if (progress.stage === 'complete') {
                            console.log('✅ Upload complete:', {
                                uploadId,
                                totalChunks: progress.totalChunks,
                                processedChunks: progress.processedChunks,
                                totalBatches: progress.totalBatches
                            });
                            
                            eventSource.close();
                            clearTimeout(timeoutId);
                            
                            // Update the result with final chunk count
                            const finalResult = {
                                ...uploadResult,
                                documentsCreated: progress.processedChunks || progress.totalChunks || 0,
                                status: 'complete' as const
                            };
                            resolve(finalResult);
                        } else if (progress.stage === 'error') {
                            console.error('❌ Upload error:', {
                                uploadId,
                                error: progress.error || progress.message,
                                batch: progress.currentBatch,
                                totalBatches: progress.totalBatches
                            });
                            eventSource.close();
                            clearTimeout(timeoutId);
                            reject(new Error(progress.error || progress.message));
                        }
                    } catch (parseError) {
                        console.error('❌ Failed to parse SSE message:', {
                            uploadId,
                            error: parseError,
                            rawData: event.data
                        });
                    }
                };

                eventSource.onerror = (error) => {
                    const errorInfo = {
                        uploadId,
                        connectionEstablished,
                        timeSinceLastProgress: Date.now() - lastProgressTime,
                        readyState: eventSource.readyState,
                        error: error
                    };
                    
                    console.error('❌ SSE connection error:', errorInfo);
                    
                    eventSource.close();
                    
                    // If connection was established and we got some progress, consider it a graceful disconnect
                    if (connectionEstablished && lastProgressTime > 0) {
                        console.warn('⚠️ SSE disconnected after progress received, treating as complete');
                        resolve({ ...uploadResult, documentsCreated: 0, status: 'complete' as const });
                    } else {
                        console.error('❌ SSE failed to establish connection or receive any progress');
                        reject(new Error('Failed to establish progress stream connection'));
                    }
                };

                // Timeout after 5 minutes with better error handling
                const timeoutId = setTimeout(() => {
                    const timeoutInfo = {
                        uploadId,
                        connectionEstablished,
                        timeSinceLastProgress: Date.now() - lastProgressTime
                    };
                    
                    console.warn('⏱️ SSE timeout after 5 minutes:', timeoutInfo);
                    
                    eventSource.close();
                    
                    // If we got some progress, treat as complete
                    if (connectionEstablished && lastProgressTime > 0) {
                        resolve({ ...uploadResult, documentsCreated: 0, status: 'complete' as const });
                    } else {
                        reject(new Error('Upload progress timeout - no response received'));
                    }
                }, 300000);

                // Clean up timeout if connection closes normally
                eventSource.addEventListener('complete', () => {
                    clearTimeout(timeoutId);
                });
            });
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
        // Different max sizes for images vs documents
        const extension = file.name.split('.').pop()?.toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(extension || '');
        const maxSize = isImage ? 25 * 1024 * 1024 : 10 * 1024 * 1024; // 25MB for images, 10MB for others
        
        const allowedExtensions = [
            // Documents
            'pdf', 'txt', 'md', 'doc', 'docx', 'rtf',
            // Data
            'json', 'csv', 'xlsx', 'xls', 'xml',
            // Code
            'ts', 'js', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'scala', 'r', 'sql', 'sh', 'bash',
            // Config
            'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
            // Web
            'html', 'htm',
            // Images (for OCR)
            'png', 'jpg', 'jpeg', 'webp',
            // Presentations
            'pptx', 'ppt',
            // Logs
            'log'
        ];

        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds ${isImage ? 25 : 10}MB limit`
            };
        }

        // Check file extension
        if (!extension || !allowedExtensions.includes(extension)) {
            return {
                valid: false,
                error: `File type not supported. Allowed: documents (pdf, docx, txt, md, rtf), data (csv, json, xlsx), code (js, ts, py, java, etc.), web (html), images (png, jpg, jpeg, webp)`
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

