// src/services/optimization.service.ts
import api from '../config/api';
import { Optimization, OptimizationRequest, PaginatedResponse } from '../types';

class OptimizationService {
    async createOptimization(request: OptimizationRequest): Promise<{
        success: boolean;
        data: Optimization;
    }> {
        const response = await api.post('/optimizations', request);
        return response.data;
    }

    async getOptimizations(params?: {
        page?: number;
        limit?: number;
        applied?: boolean;
        service?: string;
        model?: string;
        category?: string;
        minSavings?: number;
        startDate?: string;
        endDate?: string;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Optimization>> {
        const response = await api.get('/optimizations', { params });
        return response.data;
    }

    async getOptimization(id: string): Promise<{
        success: boolean;
        data: Optimization;
    }> {
        const response = await api.get(`/optimizations/${id}`);
        return response.data;
    }

    async applyOptimization(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            updatedPrompt: string;
            actualSavings: number;
        };
    }> {
        const response = await api.post(`/optimizations/${id}/apply`);
        return response.data;
    }

    async provideFeedback(id: string, feedback: {
        helpful: boolean;
        comment?: string;
        actualSavings?: number;
    }): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.post(`/optimizations/${id}/feedback`, feedback);
        return response.data;
    }

    async getPromptsForBulkOptimization(params: {
        service?: string;
        minCalls?: number;
        timeframe?: string;
    }): Promise<{
        success: boolean; data: { prompt: string; count: number; promptId: string }[]
    }> {
        const response = await api.get('/optimizations/bulk-prompts', { params });
        return response.data;
    }

    async analyzeOptimizationOpportunities(params?: {
        minUsage?: number;
        lookbackDays?: number;
        service?: string;
    }): Promise<{
        success: boolean;
        data: {
            opportunities: Array<{
                prompt: string;
                currentCost: number;
                estimatedSavings: number;
                usageCount: number;
                avgTokens: number;
                confidence: number;
                service: string;
                model: string;
            }>;
            totalPotentialSavings: number;
            topPrompts: string[];
        };
    }> {
        const response = await api.get('/optimizations/opportunities', { params });
        return response.data;
    }

    async bulkOptimize(params?: {
        service?: string;
        minCalls?: number;
        timeframe?: string;
        limit?: number;
        promptIds?: string[];
    }): Promise<{
        success: boolean;
        data: {
            total: number;
            successful: number;
            failed: number;
            totalSavings: number;
            results: Array<{
                promptId: string;
                status: 'success' | 'failed';
                savings?: number;
                error?: string;
            }>;
        };
    }> {
        const response = await api.post('/optimizations/bulk', params);
        return response.data;
    }

    async getOptimizationSummary(timeframe?: '7d' | '30d' | 'all'): Promise<{
        success: boolean;
        data: {
            total: number;
            applied: number;
            totalSaved: number;
            totalTokensSaved: number;
            avgImprovement: number;
            applicationRate: number;
            topCategories: Array<{
                category: string;
                count: number;
                avgSavings: number;
            }>;
            recentOptimizations: Optimization[];
        };
    }> {
        const response = await api.get('/optimizations/summary', {
            params: { timeframe },
        });
        return response.data;
    }

    async testOptimization(request: {
        prompt: string;
        service: string;
        model: string;
        context?: string;
    }): Promise<{
        success: boolean;
        data: {
            original: {
                tokens: number;
                cost: number;
            };
            optimized: {
                prompt: string;
                tokens: number;
                cost: number;
            };
            savings: {
                tokens: number;
                cost: number;
                percentage: number;
            };
            techniques: string[];
        };
    }> {
        const response = await api.post('/optimizations/test', request);
        return response.data;
    }

    async getOptimizationHistory(promptHash: string): Promise<{
        success: boolean;
        data: {
            history: Array<{
                id: string;
                version: number;
                prompt: string;
                tokens: number;
                cost: number;
                createdAt: string;
                appliedAt?: string;
            }>;
            currentVersion: number;
        };
    }> {
        const response = await api.get(`/optimizations/history/${promptHash}`);
        return response.data;
    }

    async revertOptimization(id: string, version: number): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await api.post(`/optimizations/${id}/revert`, { version });
        return response.data;
    }

    async getOptimizationTemplates(category?: string): Promise<{
        success: boolean;
        data: Array<{
            id: string;
            name: string;
            category: string;
            description: string;
            examples: Array<{
                before: string;
                after: string;
                savings: number;
            }>;
            techniques: string[];
            avgImprovement: number;
        }>;
    }> {
        const response = await api.get('/optimizations/templates', {
            params: { category },
        });
        return response.data;
    }
}

export const optimizationService = new OptimizationService();