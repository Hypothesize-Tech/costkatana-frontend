import api from '../config/api';

// ============================================
// TYPES
// ============================================

export interface RequestScore {
    _id: string;
    requestId: string;
    userId: string;
    score: number;
    notes?: string;
    trainingTags: string[];
    isTrainingCandidate: boolean;
    tokenEfficiency: number;
    costEfficiency: number;
    scoredAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ScoreRequestData {
    requestId: string;
    score: number;
    notes?: string;
    trainingTags?: string[];
}

export interface TrainingCandidate {
    requestScore: RequestScore;
    usageData: {
        _id: string;
        requestId: string;
        prompt: string;
        completion: string;
        model: string;
        service: string;
        totalTokens: number;
        cost: number;
        createdAt: string;
        metadata?: Record<string, any>;
    };
}

export interface TrainingDataset {
    _id: string;
    name: string;
    description?: string;
    userId: string;
    targetUseCase: string;
    targetModel: string;
    requestIds: string[];
    minScore: number;
    maxTokens?: number;
    maxCost?: number;
    filters: {
        dateRange?: { start: string; end: string };
        providers?: string[];
        models?: string[];
        features?: string[];
        costRange?: { min: number; max: number };
        tokenRange?: { min: number; max: number };
    };
    stats: {
        totalRequests: number;
        averageScore: number;
        totalTokens: number;
        totalCost: number;
        averageTokensPerRequest: number;
        averageCostPerRequest: number;
        providerBreakdown: Record<string, number>;
        modelBreakdown: Record<string, number>;
    };
    lastExportedAt?: string;
    exportFormat: 'openai-jsonl' | 'anthropic-jsonl' | 'huggingface-jsonl' | 'custom';
    exportCount: number;
    status: 'draft' | 'ready' | 'exported' | 'training' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface CreateDatasetData {
    name: string;
    description?: string;
    targetUseCase: string;
    targetModel: string;
    minScore?: number;
    maxTokens?: number;
    maxCost?: number;
    filters?: TrainingDataset['filters'];
}

export interface ScoringAnalytics {
    totalScored: number;
    averageScore: number;
    scoreDistribution: Record<number, number>;
    trainingCandidates: number;
    topScoredRequests: Array<{
        requestId: string;
        title: string;
        model: string;
        provider: string;
        score: number;
        tokenEfficiency: number;
        costEfficiency: number;
        totalTokens?: number;
        cost?: number;
        createdAt?: string;
        trainingTags?: string[];
        notes?: string;
    }>;
}

export interface ExportFormat {
    format: 'openai-jsonl' | 'anthropic-jsonl' | 'huggingface-jsonl' | 'custom';
    includeMetadata?: boolean;
    customTemplate?: string;
}

// ============================================
// REQUEST SCORING SERVICE
// ============================================

export const requestScoringService = {
    /**
     * Score a request for training quality
     */
    async scoreRequest(scoreData: ScoreRequestData): Promise<RequestScore> {
        const response = await api.post('/training/score', scoreData);
        return response.data.data;
    },

    /**
     * Get score for a specific request
     */
    async getRequestScore(requestId: string): Promise<RequestScore | null> {
        try {
            const response = await api.get(`/training/score/${requestId}`);
            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Get all scores for the authenticated user
     */
    async getUserScores(filters?: {
        minScore?: number;
        maxScore?: number;
        isTrainingCandidate?: boolean;
        trainingTags?: string[];
        limit?: number;
        offset?: number;
    }): Promise<{ scores: RequestScore[]; pagination: any }> {
        const params = new URLSearchParams();
        
        if (filters?.minScore !== undefined) params.append('minScore', filters.minScore.toString());
        if (filters?.maxScore !== undefined) params.append('maxScore', filters.maxScore.toString());
        if (filters?.isTrainingCandidate !== undefined) params.append('isTrainingCandidate', filters.isTrainingCandidate.toString());
        if (filters?.trainingTags) params.append('trainingTags', filters.trainingTags.join(','));
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const response = await api.get(`/training/scores?${params.toString()}`);
        return {
            scores: response.data.data,
            pagination: response.data.pagination
        };
    },

    /**
     * Get training candidates (high-scoring requests)
     */
    async getTrainingCandidates(filters?: {
        minScore?: number;
        maxTokens?: number;
        maxCost?: number;
        providers?: string[];
        models?: string[];
        features?: string[];
        limit?: number;
    }): Promise<TrainingCandidate[]> {
        const params = new URLSearchParams();
        
        if (filters?.minScore !== undefined) params.append('minScore', filters.minScore.toString());
        if (filters?.maxTokens !== undefined) params.append('maxTokens', filters.maxTokens.toString());
        if (filters?.maxCost !== undefined) params.append('maxCost', filters.maxCost.toString());
        if (filters?.providers) params.append('providers', filters.providers.join(','));
        if (filters?.models) params.append('models', filters.models.join(','));
        if (filters?.features) params.append('features', filters.features.join(','));
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get(`/training/candidates?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get scoring analytics
     */
    async getScoringAnalytics(): Promise<ScoringAnalytics> {
        const response = await api.get('/training/analytics');
        return response.data.data;
    },

    /**
     * Bulk score multiple requests
     */
    async bulkScoreRequests(scores: ScoreRequestData[]): Promise<RequestScore[]> {
        const response = await api.post('/training/score/bulk', { scores });
        return response.data.data;
    },

    /**
     * Delete a request score
     */
    async deleteScore(requestId: string): Promise<void> {
        await api.delete(`/training/score/${requestId}`);
    }
};

// ============================================
// TRAINING DATASET SERVICE
// ============================================

export const trainingDatasetService = {
    /**
     * Create a new training dataset
     */
    async createDataset(datasetData: CreateDatasetData): Promise<TrainingDataset> {
        const response = await api.post('/training/datasets', datasetData);
        return response.data.data;
    },

    /**
     * Get all datasets for the authenticated user
     */
    async getUserDatasets(): Promise<TrainingDataset[]> {
        const response = await api.get('/training/datasets');
        return response.data.data;
    },

    /**
     * Get a specific dataset
     */
    async getDataset(datasetId: string): Promise<TrainingDataset> {
        const response = await api.get(`/training/datasets/${datasetId}`);
        return response.data.data;
    },

    /**
     * Update dataset configuration
     */
    async updateDataset(datasetId: string, updates: Partial<CreateDatasetData>): Promise<TrainingDataset> {
        const response = await api.put(`/training/datasets/${datasetId}`, updates);
        return response.data.data;
    },

    /**
     * Auto-populate dataset with high-scoring requests
     */
    async populateDataset(datasetId: string): Promise<TrainingDataset> {
        const response = await api.post(`/training/datasets/${datasetId}/populate`);
        return response.data.data;
    },

    /**
     * Add requests to dataset manually
     */
    async addRequestsToDataset(datasetId: string, requestIds: string[]): Promise<TrainingDataset> {
        const response = await api.post(`/training/datasets/${datasetId}/requests`, { requestIds });
        return response.data.data;
    },

    /**
     * Remove requests from dataset
     */
    async removeRequestsFromDataset(datasetId: string, requestIds: string[]): Promise<TrainingDataset> {
        const response = await api.delete(`/training/datasets/${datasetId}/requests`, { data: { requestIds } });
        return response.data.data;
    },

    /**
     * Get dataset export preview
     */
    async previewDataset(datasetId: string, format: string = 'openai-jsonl'): Promise<{
        format: string;
        totalRecords: number;
        previewRecords: number;
        preview: any[];
    }> {
        const response = await api.get(`/training/datasets/${datasetId}/preview?format=${format}`);
        return response.data.data;
    },

    /**
     * Export dataset in specified format
     */
    async exportDataset(datasetId: string, exportFormat: ExportFormat): Promise<Blob> {
        const response = await api.post(`/training/datasets/${datasetId}/export`, exportFormat, {
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Delete a dataset
     */
    async deleteDataset(datasetId: string): Promise<void> {
        await api.delete(`/training/datasets/${datasetId}`);
    }
};

// ============================================
// COMBINED TRAINING SERVICE
// ============================================

export const trainingService = {
    scoring: requestScoringService,
    datasets: trainingDatasetService
};