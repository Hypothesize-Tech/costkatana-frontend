import { apiClient } from "../config/api";

export type WeakestMetricKey =
  | "contextRelevance"
  | "answerFaithfulness"
  | "answerRelevance"
  | "retrievalPrecision"
  | null;

export interface EvalsDashboardSummary {
  totalEvaluated: number;
  averageOverall: number;
  positiveRatio: number;
  positiveCount: number;
  negativeCount: number;
  weakestMetric: WeakestMetricKey;
}

export interface EvalsTimelinePoint {
  date: string;
  count: number;
  overall: number;
  contextRelevance: number;
  answerFaithfulness: number;
  answerRelevance: number;
  retrievalPrecision: number;
}

export interface EvalsByModelRow {
  modelName: string;
  count: number;
  averageOverall: number;
  positiveRatio: number;
}

export interface EvalsByPromptVersionRow {
  promptTemplateId?: string;
  promptVersionId?: string;
  count: number;
  averageOverall: number;
}

export interface EvalsDashboardData {
  summary: EvalsDashboardSummary;
  timeline: EvalsTimelinePoint[];
  byModel: EvalsByModelRow[];
  byPromptVersion: EvalsByPromptVersionRow[];
}

export interface EvalsDashboardFilters {
  from?: string;
  to?: string;
  modelName?: string;
  promptVersionId?: string;
}

export class EvalsService {
  private static cache = new Map<string, { data: EvalsDashboardData; timestamp: number }>();
  private static CACHE_TTL = 60_000;

  static async getDashboard(
    filters: EvalsDashboardFilters = {},
  ): Promise<EvalsDashboardData> {
    const cacheKey = JSON.stringify(filters);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    const response = await apiClient.get("/evals/dashboard", { params: filters });
    const data: EvalsDashboardData =
      response.data.dashboard ?? response.data.data;
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  static clearCache() {
    this.cache.clear();
  }
}
