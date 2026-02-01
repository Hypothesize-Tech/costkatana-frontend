/**
 * RAG Evaluation Service
 * Calls backend batch-eval API (RAGAS-aligned metrics)
 */

import { apiClient } from '../config/api';

export type RAGPatternType = 'naive' | 'adaptive' | 'iterative' | 'recursive';

export interface RAGEvalDatasetItem {
  question: string;
  groundTruth?: string;
}

export interface RAGEvalRequest {
  dataset: RAGEvalDatasetItem[];
  pattern?: RAGPatternType;
  config?: Record<string, unknown>;
}

export interface EvaluationMetrics {
  contextRelevance: number;
  answerFaithfulness: number;
  answerRelevance: number;
  retrievalPrecision: number;
  retrievalRecall: number;
  overall: number;
}

export interface RAGEvalResultItem {
  question: string;
  answer: string;
  metrics: EvaluationMetrics;
  success: boolean;
}

export interface RAGEvalAggregate {
  mean: EvaluationMetrics;
  std: EvaluationMetrics;
  min: EvaluationMetrics;
  max: EvaluationMetrics;
}

export interface RAGEvalResponse {
  results: RAGEvalResultItem[];
  aggregate: RAGEvalAggregate;
  totalSamples: number;
  failedSamples: number;
}

export const ragEvalService = {
  /**
   * Run batch RAG evaluation on a dataset (admin only).
   */
  async evaluate(request: RAGEvalRequest): Promise<RAGEvalResponse> {
    const response = await apiClient.post<RAGEvalResponse>('/rag/evaluate', request);
    return response.data;
  },
};
