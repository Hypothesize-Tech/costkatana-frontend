import { apiClient } from '../config/api';

interface ExtractionStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    extractedAt?: Date;
    extractedBy?: string;
    errorMessage?: string;
    extractionCost?: {
        totalTokens: number;
        totalCost: number;
    };
    usage?: {
        checksPerformed: number;
        totalTokensSaved: number;
        totalCostSaved: number;
        averageConfidence: number;
        lowConfidenceCount: number;
    };
}

interface ExtractedFeatures {
    extractedAt: Date;
    extractedBy: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    errorMessage?: string;
    analysis: {
        visualDescription: string;
        structuredData: any;
        criteriaAnalysis: Array<{
            criterionId: string;
            criterionText: string;
            referenceState: any;
            comparisonInstructions: any;
            confidence: number;
        }>;
    };
    extractionCost: {
        initialCallTokens: { input: number; output: number; cost: number };
        followUpCalls: Array<{ reason: string; input: number; output: number; cost: number }>;
        totalTokens: number;
        totalCost: number;
    };
    usage: {
        checksPerformed: number;
        totalTokensSaved: number;
        totalCostSaved: number;
        averageConfidence: number;
        lowConfidenceCount: number;
        lastUsedAt?: Date;
    };
}

interface CostSavings {
    extractionCost: {
        totalTokens: number;
        totalCost: number;
    };
    usage: {
        checksPerformed: number;
        totalTokensSaved: number;
        totalCostSaved: number;
        averageTokensPerCheck: number;
        averageCostPerCheck: number;
        averageConfidence: number;
        lowConfidenceCount: number;
    };
    savings: {
        netSavings: number;
        breakEven: boolean;
        checksToBreakEven: number;
        roi: number;
    };
}

export class ReferenceImageService {
    private static baseUrl = '/templates';
    private static referenceImageUrl = '/reference-image';

    /**
     * Pre-upload reference image before template creation
     * Returns S3 details to be included in template creation
     */
    static async preUploadReferenceImage(
        imageFile: File
    ): Promise<{
        s3Url: string;
        s3Key: string;
        uploadedAt: Date;
        uploadedBy: string;
        fileName: string;
        fileSize: number;
        fileType: string;
    }> {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await apiClient.post(
            `${this.referenceImageUrl}/pre-upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.data;
    }

    /**
     * Upload reference image for a template
     */
    static async uploadReferenceImage(
        templateId: string,
        file: File
    ): Promise<any> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiClient.post(
            `${this.baseUrl}/${templateId}/reference-image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.data;
    }

    /**
     * Trigger extraction manually
     */
    static async triggerExtraction(
        templateId: string,
        forceRefresh: boolean = false
    ): Promise<{ templateId: string; status: string }> {
        const response = await apiClient.post(
            `${this.baseUrl}/${templateId}/reference-image/extract`,
            { forceRefresh }
        );

        return response.data.data;
    }

    /**
     * Get extraction status
     */
    static async getExtractionStatus(templateId: string): Promise<ExtractionStatus> {
        const response = await apiClient.get(
            `${this.baseUrl}/${templateId}/reference-image/status`
        );

        return response.data.data;
    }

    /**
     * Poll for extraction completion with exponential backoff
     */
    static async pollUntilComplete(
        templateId: string,
        maxWaitTime: number = 120000 // 2 minutes
    ): Promise<ExtractionStatus> {
        const startTime = Date.now();
        let delay = 2000; // Start with 2 seconds
        const maxDelay = 10000; // Max 10 seconds between polls

        while (Date.now() - startTime < maxWaitTime) {
            const status = await this.getExtractionStatus(templateId);

            if (status.status === 'completed' || status.status === 'failed') {
                return status;
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 1.5, maxDelay);
        }

        throw new Error('Extraction timeout: Maximum wait time exceeded');
    }

    /**
     * Get extracted features
     */
    static async getExtractedFeatures(templateId: string): Promise<ExtractedFeatures> {
        const response = await apiClient.get(
            `${this.baseUrl}/${templateId}/reference-image/features`
        );

        return response.data.data;
    }

    /**
     * Get cost savings statistics
     */
    static async getCostSavings(templateId: string): Promise<CostSavings> {
        const response = await apiClient.get(
            `${this.baseUrl}/${templateId}/cost-savings`
        );

        return response.data.data;
    }

    /**
     * Create SSE stream for extraction status updates
     */
    static createExtractionStream(
        templateId: string,
        onMessage: (data: any) => void,
        onError?: (error: any) => void
    ): EventSource {
        const token = localStorage.getItem('access_token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const url = `${API_BASE_URL}/api/templates/${templateId}/reference-image/stream?token=${token}`;

        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                // Failed to parse SSE message
            }
        };

        eventSource.onerror = (error) => {
            if (onError) {
                onError(error);
            }
        };

        return eventSource;
    }

    /**
     * Delete reference image
     */
    static async deleteReferenceImage(templateId: string): Promise<void> {
        await apiClient.delete(
            `${this.baseUrl}/${templateId}/reference-image`
        );
    }
}

