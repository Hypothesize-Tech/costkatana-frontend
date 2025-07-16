import { apiClient } from '../config/api';

export interface ModelComparisonRequest {
    prompt: string;
    models: Array<{
        provider: string;
        model: string;
        temperature?: number;
        maxTokens?: number;
    }>;
    evaluationCriteria: string[];
    iterations?: number;
}

export interface ModelComparisonResult {
    id: string;
    provider: string;
    model: string;
    response: string;
    metrics: {
        cost: number;
        latency: number;
        tokenCount: number;
        qualityScore: number;
        errorRate: number;
    };
    performance: {
        responseTime: number;
        throughput: number;
        reliability: number;
    };
    costBreakdown: {
        inputTokens: number;
        outputTokens: number;
        inputCost: number;
        outputCost: number;
        totalCost: number;
    };
    qualityMetrics: {
        accuracy: number;
        relevance: number;
        completeness: number;
        coherence: number;
    };
    timestamp: string;
}

export interface WhatIfScenario {
    name: string;
    description: string;
    changes: Array<{
        type: 'model_switch' | 'volume_change' | 'feature_addition' | 'optimization_applied';
        currentValue: any;
        proposedValue: any;
        affectedMetrics: string[];
        description: string;
    }>;
    timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
    baselineData: {
        cost: number;
        volume: number;
        performance: number;
    };
}

export interface WhatIfResult {
    scenario: WhatIfScenario;
    projectedImpact: {
        costChange: number;
        costChangePercentage: number;
        performanceChange: number;
        performanceChangePercentage: number;
        riskLevel: 'low' | 'medium' | 'high';
        confidence: number;
    };
    breakdown: {
        currentCosts: Record<string, number>;
        projectedCosts: Record<string, number>;
        savingsOpportunities: Array<{
            category: string;
            savings: number;
            effort: 'low' | 'medium' | 'high';
        }>;
    };
    recommendations: string[];
    warnings: string[];
}

export interface FineTuningProject {
    id: string;
    name: string;
    baseModel: string;
    status: 'planning' | 'training' | 'completed' | 'failed';
    trainingData: {
        size: number;
        quality: 'low' | 'medium' | 'high';
        preprocessingCost: number;
    };
    infrastructure: {
        computeType: string;
        estimatedTrainingTime: number;
        parallelization: boolean;
    };
    costs: {
        training: number;
        hosting: number;
        inference: number;
        storage: number;
        total: number;
    };
    performance: {
        accuracy: number;
        f1Score: number;
        latency: number;
        throughput: number;
    };
}

export interface FineTuningAnalysis {
    project: FineTuningProject;
    costBreakdown: {
        development: {
            dataPreparation: number;
            modelTraining: number;
            validation: number;
            testing: number;
        };
        deployment: {
            infrastructure: number;
            monitoring: number;
            maintenance: number;
        };
        operations: {
            inference: number;
            storage: number;
            bandwidth: number;
        };
    };
    roi: {
        initialInvestment: number;
        operationalCosts: number;
        expectedSavings: number;
        paybackPeriod: number;
        netPresentValue: number;
    };
    comparison: {
        vsGenericModel: {
            costDifference: number;
            performanceDifference: number;
            recommendation: string;
        };
        vsAlternatives: Array<{
            alternative: string;
            costComparison: number;
            performanceComparison: number;
            pros: string[];
            cons: string[];
        }>;
    };
}

export interface ExperimentResult {
    id: string;
    name: string;
    type: 'model_comparison' | 'what_if' | 'fine_tuning';
    status: 'running' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    results: any;
    metadata: {
        duration: number;
        iterations: number;
        confidence: number;
    };
}

export class ExperimentationService {

    /**
     * Model Comparison Methods
     */
    static async runModelComparison(request: ModelComparisonRequest): Promise<ExperimentResult> {
        const response = await apiClient.post('/experimentation/model-comparison', request);
        return response.data;
    }

    static async getModelComparisonResults(experimentId: string): Promise<ModelComparisonResult[]> {
        const response = await apiClient.get(`/experimentation/model-comparison/${experimentId}/results`);
        return response.data;
    }

    static async getModelComparisonHistory(filters?: {
        startDate?: string;
        endDate?: string;
        models?: string[];
        limit?: number;
    }): Promise<ExperimentResult[]> {
        const response = await apiClient.get('/experimentation/model-comparison/history', {
            params: filters
        });
        return response.data;
    }

    /**
     * What-If Scenario Methods
     */
    static async createWhatIfScenario(scenario: WhatIfScenario): Promise<string> {
        const response = await apiClient.post('/experimentation/what-if-scenario', scenario);
        return response.data.id;
    }

    static async runWhatIfAnalysis(scenarioId: string): Promise<WhatIfResult> {
        const response = await apiClient.post(`/experimentation/what-if-scenario/${scenarioId}/analyze`);
        return response.data;
    }

    static async getWhatIfScenarios(): Promise<WhatIfScenario[]> {
        const response = await apiClient.get('/experimentation/what-if-scenarios');
        return response.data;
    }

    static async getWhatIfResults(scenarioId: string): Promise<WhatIfResult> {
        const response = await apiClient.get(`/experimentation/what-if-scenario/${scenarioId}/results`);
        return response.data;
    }

    static async deleteWhatIfScenario(scenarioId: string): Promise<void> {
        await apiClient.delete(`/experimentation/what-if-scenario/${scenarioId}`);
    }

    /**
     * Fine-Tuning Analysis Methods
     */
    static async createFineTuningProject(project: Omit<FineTuningProject, 'id'>): Promise<string> {
        const response = await apiClient.post('/experimentation/fine-tuning-project', project);
        return response.data.id;
    }

    static async getFineTuningProjects(): Promise<FineTuningProject[]> {
        const response = await apiClient.get('/experimentation/fine-tuning-projects');
        return response.data;
    }

    static async getFineTuningAnalysis(projectId: string): Promise<FineTuningAnalysis> {
        const response = await apiClient.get(`/experimentation/fine-tuning-project/${projectId}/analysis`);
        return response.data;
    }

    static async updateFineTuningProject(projectId: string, updates: Partial<FineTuningProject>): Promise<void> {
        await apiClient.put(`/experimentation/fine-tuning-project/${projectId}`, updates);
    }

    static async deleteFineTuningProject(projectId: string): Promise<void> {
        await apiClient.delete(`/experimentation/fine-tuning-project/${projectId}`);
    }

    /**
     * General Experiment Methods
     */
    static async getExperimentHistory(filters?: {
        type?: 'model_comparison' | 'what_if' | 'fine_tuning';
        status?: 'running' | 'completed' | 'failed';
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<ExperimentResult[]> {
        const response = await apiClient.get('/experimentation/history', {
            params: filters
        });
        return response.data;
    }

    static async getExperimentById(experimentId: string): Promise<ExperimentResult> {
        const response = await apiClient.get(`/experimentation/${experimentId}`);
        return response.data;
    }

    static async deleteExperiment(experimentId: string): Promise<void> {
        await apiClient.delete(`/experimentation/${experimentId}`);
    }

    static async exportExperimentResults(experimentId: string, format: 'csv' | 'json' | 'pdf' = 'json'): Promise<Blob> {
        const response = await apiClient.get(`/experimentation/${experimentId}/export`, {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Utility Methods
     */
    static async getAvailableModels(): Promise<Array<{
        provider: string;
        model: string;
        pricing: {
            input: number;
            output: number;
            unit: string;
        };
        capabilities: string[];
        contextWindow: number;
    }>> {
        const response = await apiClient.get('/experimentation/available-models');
        return response.data;
    }

    static async estimateExperimentCost(request: {
        type: 'model_comparison' | 'what_if' | 'fine_tuning';
        parameters: any;
    }): Promise<{
        estimatedCost: number;
        breakdown: Record<string, number>;
        duration: number;
    }> {
        const response = await apiClient.post('/experimentation/estimate-cost', request);
        return response.data;
    }

    static async getExperimentRecommendations(userId: string): Promise<Array<{
        type: 'model_comparison' | 'what_if' | 'fine_tuning';
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        potentialSavings: number;
        effort: 'low' | 'medium' | 'high';
        actions: string[];
    }>> {
        const response = await apiClient.get(`/experimentation/recommendations/${userId}`);
        return response.data;
    }
}

export default ExperimentationService; 