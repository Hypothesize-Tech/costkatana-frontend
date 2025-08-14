// ============================================
// TYPES
// ============================================

import { apiClient } from "@/config/api";

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
  version: string;
  parentDatasetId?: string;
  versionNotes?: string;
  targetUseCase: string;
  targetModel: string;
  requestIds: string[];
  minScore: number;
  maxTokens?: number;
  maxCost?: number;
  items: Array<{
    requestId: string;
    input: string;
    expectedOutput?: string;
    criteria?: string[];
    tags?: string[];
    piiFlags?: {
      hasPII: boolean;
      piiTypes: string[];
      confidence: number;
    };
    metadata?: Record<string, any>;
    split?: 'train' | 'dev' | 'test';
  }>;
  splits: {
    train: { percentage: number; count: number; itemIds: string[] };
    dev: { percentage: number; count: number; itemIds: string[] };
    test: { percentage: number; count: number; itemIds: string[] };
  };
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
    piiStats: {
      totalWithPII: number;
      piiTypeBreakdown: Record<string, number>;
    };
  };
  lastExportedAt?: string;
  exportFormat:
    | "openai-jsonl"
    | "anthropic-jsonl"
    | "huggingface-jsonl"
    | "custom";
  exportCount: number;
  status: "draft" | "ready" | "exported" | "training" | "completed";
  lineage: {
    createdFrom?: {
      type: 'dataset' | 'experiment' | 'evaluation';
      id: string;
      version?: string;
    };
    derivedDatasets: string[];
    relatedFineTuneJobs: string[];
  };
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
  version?: string;
  parentDatasetId?: string;
  versionNotes?: string;
  filters?: TrainingDataset["filters"];
  splitConfig?: {
    trainPercentage?: number;
    devPercentage?: number;
    testPercentage?: number;
  };
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
  format: "openai-jsonl" | "anthropic-jsonl" | "huggingface-jsonl" | "custom";
  includeMetadata?: boolean;
  customTemplate?: string;
  splitType?: 'train' | 'dev' | 'test' | 'all';
  sanitizePII?: boolean;
}

export interface PIIDetectionResult {
  hasPII: boolean;
  confidence: number;
  piiTypes: string[];
  detectedEntities: Array<{
    type: string;
    text: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
  }>;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface PIIDetectionBatch {
  results: PIIDetectionResult[];
  totalProcessed: number;
  totalWithPII: number;
  overallRiskAssessment: 'low' | 'medium' | 'high';
  summary: {
    piiTypeBreakdown: Record<string, number>;
    highRiskItems: number;
    recommendedActions: string[];
  };
}

export interface FineTuneJob {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  datasetId: string;
  datasetVersion: string;
  baseModel: string;
  provider: 'openai' | 'anthropic' | 'aws-bedrock' | 'azure' | 'cohere' | 'huggingface';
  hyperparameters: {
    learningRate?: number;
    batchSize?: number;
    epochs?: number;
    temperature?: number;
    maxTokens?: number;
    validationSplit?: number;
    earlyStoppingPatience?: number;
    customParameters?: Record<string, any>;
  };
  providerConfig: {
    region?: string;
    roleArn?: string;
    s3BucketName?: string;
    modelName?: string;
    suffix?: string;
    customizations?: Record<string, any>;
  };
  status: 'queued' | 'validating' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  progress: {
    percentage: number;
    currentEpoch?: number;
    totalEpochs?: number;
    currentStep?: number;
    totalSteps?: number;
    lastUpdated: string;
  };
  providerJobId?: string;
  providerJobArn?: string;
  metrics: {
    trainingLoss?: number[];
    validationLoss?: number[];
    accuracy?: number[];
    perplexity?: number[];
    bleuScore?: number;
    rougeScore?: Record<string, number>;
    customMetrics?: Record<string, any>;
  };
  cost: {
    estimated: number;
    actual?: number;
    currency: string;
    breakdown?: {
      trainingCost?: number;
      storageCost?: number;
      computeCost?: number;
      dataCost?: number;
    };
  };
  timing: {
    queuedAt: string;
    startedAt?: string;
    completedAt?: string;
    estimatedDuration?: number;
    actualDuration?: number;
  };
  results: {
    modelId?: string;
    modelArn?: string;
    endpointUrl?: string;
    downloadUrl?: string;
    evaluationResults?: {
      testLoss: number;
      testAccuracy: number;
      benchmarkScores?: Record<string, number>;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
  evaluationIds: string[];
  lineage: {
    parentJobId?: string;
    childJobIds: string[];
    experimentId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFineTuneJobData {
  name: string;
  description?: string;
  datasetId: string;
  datasetVersion?: string;
  baseModel: string;
  provider: 'openai' | 'anthropic' | 'aws-bedrock' | 'azure' | 'cohere' | 'huggingface';
  hyperparameters?: {
    learningRate?: number;
    batchSize?: number;
    epochs?: number;
    temperature?: number;
    maxTokens?: number;
    validationSplit?: number;
    earlyStoppingPatience?: number;
    customParameters?: Record<string, any>;
  };
  providerConfig?: {
    region?: string;
    roleArn?: string;
    s3BucketName?: string;
    modelName?: string;
    suffix?: string;
    customizations?: Record<string, any>;
  };
}

// ============================================
// REQUEST SCORING SERVICE
// ============================================

export const requestScoringService = {
  /**
   * Score a request for training quality
   */
  async scoreRequest(scoreData: ScoreRequestData): Promise<RequestScore> {
    const response = await apiClient.post("/training/score", scoreData);
    return response.data.data;
  },

  /**
   * Get score for a specific request
   */
  async getRequestScore(requestId: string): Promise<RequestScore | null> {
    try {
      const response = await apiClient.get(`/training/score/${requestId}`);
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

    if (filters?.minScore !== undefined)
      params.append("minScore", filters.minScore.toString());
    if (filters?.maxScore !== undefined)
      params.append("maxScore", filters.maxScore.toString());
    if (filters?.isTrainingCandidate !== undefined)
      params.append(
        "isTrainingCandidate",
        filters.isTrainingCandidate.toString(),
      );
    if (filters?.trainingTags)
      params.append("trainingTags", filters.trainingTags.join(","));
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const response = await apiClient.get(`/training/scores?${params.toString()}`);
    return {
      scores: response.data.data,
      pagination: response.data.pagination,
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

    if (filters?.minScore !== undefined)
      params.append("minScore", filters.minScore.toString());
    if (filters?.maxTokens !== undefined)
      params.append("maxTokens", filters.maxTokens.toString());
    if (filters?.maxCost !== undefined)
      params.append("maxCost", filters.maxCost.toString());
    if (filters?.providers)
      params.append("providers", filters.providers.join(","));
    if (filters?.models) params.append("models", filters.models.join(","));
    if (filters?.features)
      params.append("features", filters.features.join(","));
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await apiClient.get(`/training/candidates?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get scoring analytics
   */
  async getScoringAnalytics(): Promise<ScoringAnalytics> {
    const response = await apiClient.get("/training/analytics");
    return response.data.data;
  },

  /**
   * Bulk score multiple requests
   */
  async bulkScoreRequests(scores: ScoreRequestData[]): Promise<RequestScore[]> {
    const response = await apiClient.post("/training/score/bulk", { scores });
    return response.data.data;
  },

  /**
   * Delete a request score
   */
  async deleteScore(requestId: string): Promise<void> {
    await apiClient.delete(`/training/score/${requestId}`);
  },
};

// ============================================
// TRAINING DATASET SERVICE
// ============================================

export const trainingDatasetService = {
  /**
   * Create a new training dataset
   */
  async createDataset(
    datasetData: CreateDatasetData,
  ): Promise<TrainingDataset> {
    const response = await apiClient.post("/training/datasets", datasetData);
    return response.data.data;
  },

  /**
   * Get all datasets for the authenticated user
   */
  async getUserDatasets(): Promise<TrainingDataset[]> {
    const response = await apiClient.get("/training/datasets");
    return response.data.data;
  },

  /**
   * Get a specific dataset
   */
  async getDataset(datasetId: string): Promise<TrainingDataset> {
    const response = await apiClient.get(`/training/datasets/${datasetId}`);
    return response.data.data;
  },

  /**
   * Update dataset configuration
   */
  async updateDataset(
    datasetId: string,
    updates: Partial<CreateDatasetData>,
  ): Promise<TrainingDataset> {
    const response = await apiClient.put(`/training/datasets/${datasetId}`, updates);
    return response.data.data;
  },

  /**
   * Auto-populate dataset with high-scoring requests
   */
  async populateDataset(datasetId: string): Promise<TrainingDataset> {
    const response = await apiClient.post(`/training/datasets/${datasetId}/populate`);
    return response.data.data;
  },

  /**
   * Add requests to dataset manually
   */
  async addRequestsToDataset(
    datasetId: string,
    requestIds: string[],
  ): Promise<TrainingDataset> {
    const response = await apiClient.post(
      `/training/datasets/${datasetId}/requests`,
      { requestIds },
    );
    return response.data.data;
  },

  /**
   * Remove requests from dataset
   */
  async removeRequestsFromDataset(
    datasetId: string,
    requestIds: string[],
  ): Promise<TrainingDataset> {
    const response = await apiClient.delete(
      `/training/datasets/${datasetId}/requests`,
      { data: { requestIds } },
    );
    return response.data.data;
  },

  /**
   * Get dataset export preview
   */
  async previewDataset(
    datasetId: string,
    format: string = "openai-jsonl",
  ): Promise<{
    format: string;
    totalRecords: number;
    previewRecords: number;
    preview: any[];
  }> {
    const response = await apiClient.get(
      `/training/datasets/${datasetId}/preview?format=${format}`,
    );
    return response.data.data;
  },

  /**
   * Export dataset in specified format
   */
  async exportDataset(
    datasetId: string,
    exportFormat: ExportFormat,
  ): Promise<Blob> {
    const response = await apiClient.post(
      `/training/datasets/${datasetId}/export`,
      exportFormat,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },

  /**
   * Delete a dataset
   */
  async deleteDataset(datasetId: string): Promise<void> {
    await apiClient.delete(`/training/datasets/${datasetId}`);
  },

  /**
   * Create a new version of an existing dataset
   */
  async createDatasetVersion(
    parentDatasetId: string,
    versionData: {
      version: string;
      versionNotes?: string;
      description?: string;
    }
  ): Promise<TrainingDataset> {
    const response = await apiClient.post(
      `/training/datasets/${parentDatasetId}/versions`,
      versionData
    );
    return response.data.data;
  },

  /**
   * Add items to dataset with ground truth labels
   */
  async addDatasetItems(
    datasetId: string,
    items: Array<{
      requestId: string;
      input: string;
      expectedOutput?: string;
      criteria?: string[];
      tags?: string[];
    }>
  ): Promise<TrainingDataset> {
    const response = await apiClient.post(
      `/training/datasets/${datasetId}/items`,
      { items }
    );
    return response.data.data;
  },

  /**
   * Analyze PII in dataset
   */
  async analyzePII(datasetId: string): Promise<PIIDetectionBatch> {
    const response = await apiClient.post(
      `/training/datasets/${datasetId}/analyze-pii`
    );
    return response.data.data;
  },

  /**
   * Sanitize PII in dataset
   */
  async sanitizePII(
    datasetId: string,
    action: 'mask' | 'remove' | 'replace'
  ): Promise<TrainingDataset> {
    const response = await apiClient.post(
      `/training/datasets/${datasetId}/sanitize-pii`,
      { action }
    );
    return response.data.data;
  },

  /**
   * Update dataset splits
   */
  async updateSplits(
    datasetId: string,
    splits: {
      trainPercentage: number;
      devPercentage: number;
      testPercentage: number;
    }
  ): Promise<TrainingDataset> {
    const response = await apiClient.post(
      `/training/datasets/${datasetId}/split`,
      splits
    );
    return response.data.data;
  },

  /**
   * Get split data
   */
  async getSplitData(
    datasetId: string,
    splitType: 'train' | 'dev' | 'test'
  ): Promise<{
    splitType: string;
    count: number;
    percentage: number;
    items: any[];
  }> {
    const response = await apiClient.get(
      `/training/datasets/${datasetId}/splits/${splitType}`
    );
    return response.data.data;
  },

  /**
   * Get dataset lineage
   */
  async getDatasetLineage(datasetId: string): Promise<{
    current: { id: string; name: string; version: string };
    parent?: { id: string; name: string; version: string };
    children: Array<{ id: string; name: string; version: string }>;
    lineage: TrainingDataset['lineage'];
  }> {
    const response = await apiClient.get(
      `/training/datasets/${datasetId}/lineage`
    );
    return response.data.data;
  },

  /**
   * Get dataset versions
   */
  async getDatasetVersions(datasetId: string): Promise<Array<{
    id: string;
    name: string;
    version: string;
    versionNotes?: string;
    createdAt: string;
    status: string;
    itemCount: number;
  }>> {
    const response = await apiClient.get(
      `/training/datasets/${datasetId}/versions`
    );
    return response.data.data;
  },

  /**
   * Validate dataset for training readiness
   */
  async validateDataset(datasetId: string): Promise<{
    isValid: boolean;
    issues: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const response = await apiClient.post(
      `/training/datasets/${datasetId}/validate`
    );
    return response.data.data;
  },
};

// ============================================
// FINE-TUNE JOB SERVICE
// ============================================

export const fineTuneJobService = {
  /**
   * Create a new fine-tune job
   */
  async createFineTuneJob(jobData: CreateFineTuneJobData): Promise<FineTuneJob> {
    const response = await apiClient.post("/fine-tune/jobs", jobData);
    return response.data.data;
  },

  /**
   * Get all fine-tune jobs for the authenticated user
   */
  async getUserFineTuneJobs(): Promise<FineTuneJob[]> {
    const response = await apiClient.get("/fine-tune/jobs");
    return response.data.data;
  },

  /**
   * Get a specific fine-tune job
   */
  async getFineTuneJob(jobId: string): Promise<FineTuneJob> {
    const response = await apiClient.get(`/fine-tune/jobs/${jobId}`);
    return response.data.data;
  },

  /**
   * Cancel a fine-tune job
   */
  async cancelFineTuneJob(jobId: string): Promise<FineTuneJob> {
    const response = await apiClient.post(`/fine-tune/jobs/${jobId}/cancel`);
    return response.data.data;
  },

  /**
   * Get job status and progress
   */
  async getJobStatus(jobId: string): Promise<{
    status: FineTuneJob['status'];
    progress: FineTuneJob['progress'];
    cost: FineTuneJob['cost'];
    timing: FineTuneJob['timing'];
    error?: FineTuneJob['error'];
    results: FineTuneJob['results'];
    providerJobId?: string;
  }> {
    const response = await apiClient.get(`/fine-tune/jobs/${jobId}/status`);
    return response.data.data;
  },

  /**
   * Get job metrics and training progress
   */
  async getJobMetrics(jobId: string): Promise<{
    metrics: FineTuneJob['metrics'];
    progress: FineTuneJob['progress'];
    hyperparameters: FineTuneJob['hyperparameters'];
    timing: FineTuneJob['timing'];
    cost: FineTuneJob['cost'];
  }> {
    const response = await apiClient.get(`/fine-tune/jobs/${jobId}/metrics`);
    return response.data.data;
  },

  /**
   * Delete a fine-tune job
   */
  async deleteFineTuneJob(jobId: string): Promise<void> {
    await apiClient.delete(`/fine-tune/jobs/${jobId}`);
  },

  /**
   * Get supported providers and models
   */
  async getSupportedProviders(): Promise<Record<string, {
    name: string;
    models: Array<{ id: string; name: string; baseModel: boolean }>;
    hyperparameters: string[];
    costEstimate: string;
    requirements?: string[];
    status?: string;
  }>> {
    const response = await apiClient.get("/fine-tune/providers");
    return response.data.data;
  },

  /**
   * Estimate fine-tuning cost
   */
  async estimateCost(
    provider: string,
    baseModel: string,
    datasetId: string
  ): Promise<{
    provider: string;
    baseModel: string;
    itemCount: number;
    totalTokens: number;
    estimatedCost: number;
    estimatedDuration: number;
    currency: string;
    breakdown: {
      trainingCost: number;
      storageCost: number;
      computeCost: number;
    };
    recommendations: string[];
  }> {
    const response = await apiClient.post("/fine-tune/estimate-cost", {
      provider,
      baseModel,
      datasetId,
    });
    return response.data.data;
  },
};

// ============================================
// EVALUATION SERVICE
// ============================================

export interface EvaluationJob {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  fineTuneJobId?: string;
  modelId: string;
  datasetId: string;
  datasetVersion: string;
  evaluationType: 'accuracy' | 'quality' | 'cost-effectiveness' | 'comprehensive';
  metrics: string[];
  benchmarks?: string[];
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    percentage: number;
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
    lastUpdated: string;
  };
  results: {
    overallScore: number;
    metrics: Record<string, number>;
    costAnalysis: {
      averageCostPerRequest: number;
      totalEvaluationCost: number;
      costEfficiencyScore: number;
    };
    qualityAnalysis: {
      humanLikenessScore: number;
      coherenceScore: number;
      relevanceScore: number;
      safetyScore: number;
    };
    recommendations: string[];
  };
  timing: {
    queuedAt: string;
    startedAt?: string;
    completedAt?: string;
    estimatedDuration?: number;
    actualDuration?: number;
  };
  cost: {
    estimated: number;
    actual?: number;
    currency: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
  integration: {
    triggeredBy?: 'manual' | 'fine-tune-completion' | 'scheduled';
    parentJobId?: string;
    childEvaluations: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvaluationJobData {
  name: string;
  description?: string;
  fineTuneJobId?: string;
  modelId: string;
  datasetId: string;
  datasetVersion?: string;
  evaluationType?: 'accuracy' | 'quality' | 'cost-effectiveness' | 'comprehensive';
  metrics?: string[];
  benchmarks?: string[];
}

export const evaluationJobService = {
  /**
   * Create a new evaluation job
   */
  async createEvaluationJob(jobData: CreateEvaluationJobData): Promise<EvaluationJob> {
    const response = await apiClient.post("/evaluations/jobs", jobData);
    return response.data.data;
  },

  /**
   * Get all evaluation jobs for the authenticated user
   */
  async getUserEvaluationJobs(): Promise<EvaluationJob[]> {
    const response = await apiClient.get("/evaluations/jobs");
    return response.data.data;
  },

  /**
   * Get evaluation jobs for a specific fine-tune job
   */
  async getEvaluationsByFineTuneJob(fineTuneJobId: string): Promise<EvaluationJob[]> {
    const response = await apiClient.get(`/evaluations/jobs/fine-tune/${fineTuneJobId}`);
    return response.data.data;
  },

  /**
   * Get a specific evaluation job
   */
  async getEvaluationJob(jobId: string): Promise<EvaluationJob> {
    const response = await apiClient.get(`/evaluations/jobs/${jobId}`);
    return response.data.data;
  },

  /**
   * Delete an evaluation job
   */
  async deleteEvaluationJob(jobId: string): Promise<void> {
    await apiClient.delete(`/evaluations/jobs/${jobId}`);
  },
};

// ============================================
// COMBINED TRAINING SERVICE
// ============================================

export const trainingService = {
  scoring: requestScoringService,
  datasets: trainingDatasetService,
  fineTune: fineTuneJobService,
  evaluations: evaluationJobService,
};
