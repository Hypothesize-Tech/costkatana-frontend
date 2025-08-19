import api from "../config/api";

export interface CostDriver {
  driver_type: 'system_prompt' | 'tool_calls' | 'context_window' | 'retries' | 'cache_miss' | 'model_switching' | 'network' | 'database';
  cost_impact: number;
  percentage_of_total: number;
  explanation: string;
  optimization_potential: number;
}

export interface CostAnalysis {
  total_cost: number;
  expected_cost: number;
  deviation_percentage: number;
  deviation_reason: string;
  cost_drivers: CostDriver[];
  cost_story: string;
  optimization_recommendations: Array<{
    type: 'immediate' | 'short_term' | 'long_term';
    description: string;
    potential_savings: number;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  anomaly_score: number;
}

export interface DailyCostReport {
  date: string;
  total_cost: number;
  baseline_cost: number;
  cost_increase: number;
  cost_increase_percentage: number;
  top_cost_drivers: CostDriver[];
  anomalies: Array<{
    type: string;
    description: string;
    cost_impact: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    description: string;
    potential_savings: number;
    effort: 'low' | 'medium' | 'high';
  }>;
  cost_story: string;
}

export interface CostAnomaly {
  type: string;
  description: string;
  cost_impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  optimization_potential: number;
}

export interface CostTrends {
  period: string;
  trends: {
    daily_average: number;
    weekly_growth: number;
    monthly_growth: number;
    cost_drivers_trend: Array<{
      driver: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      rate: number;
    }>;
  };
  predictions: {
    next_week: number;
    next_month: number;
    confidence: number;
  };
}

export class UnexplainedCostService {
  /**
   * Analyze unexplained costs for a specific timeframe
   */
  static async analyzeUnexplainedCosts(
    timeframe: string = '24h',
    workspaceId: string = 'default'
  ): Promise<CostAnalysis> {
    try {
      const response = await api.get('/unexplained-costs/analyze', {
        params: { timeframe, workspaceId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to analyze unexplained costs:', error);
      throw error;
    }
  }

  /**
   * Generate daily cost report with explanations
   */
  static async generateDailyCostReport(
    date?: string,
    workspaceId: string = 'default'
  ): Promise<DailyCostReport> {
    try {
      const response = await api.get('/unexplained-costs/daily-report', {
        params: { date, workspaceId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to generate daily cost report:', error);
      throw error;
    }
  }

  /**
   * Get cost attribution breakdown for a specific trace
   */
  static async getTraceCostAttribution(
    traceId: string,
    workspaceId: string = 'default'
  ): Promise<any> {
    try {
      const response = await api.get(`/unexplained-costs/trace/${traceId}`, {
        params: { workspaceId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get trace cost attribution:', error);
      throw error;
    }
  }

  /**
   * Get cost optimization recommendations
   */
  static async getCostOptimizationRecommendations(
    timeframe: string = '7d',
    workspaceId: string = 'default'
  ): Promise<{
    recommendations: Array<{
      type: 'immediate' | 'short_term' | 'long_term';
      description: string;
      potential_savings: number;
      implementation_effort: 'low' | 'medium' | 'high';
    }>;
    total_potential_savings: number;
    timeframe: string;
    cost_drivers: CostDriver[];
  }> {
    try {
      const response = await api.get('/unexplained-costs/recommendations', {
        params: { timeframe, workspaceId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get cost optimization recommendations:', error);
      throw error;
    }
  }

  /**
   * Get cost anomaly alerts
   */
  static async getCostAnomalies(
    timeframe: string = '24h',
    workspaceId: string = 'default'
  ): Promise<{
    anomalies: CostAnomaly[];
    total_anomaly_score: number;
    timeframe: string;
    total_cost: number;
    expected_cost: number;
    deviation_percentage: number;
  }> {
    try {
      const response = await api.get('/unexplained-costs/anomalies', {
        params: { timeframe, workspaceId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get cost anomalies:', error);
      throw error;
    }
  }

  /**
   * Get historical cost trends and patterns
   */
  static async getCostTrends(
    period: string = '30d',
    workspaceId: string = 'default'
  ): Promise<CostTrends> {
    try {
      const response = await api.get('/unexplained-costs/trends', {
        params: { period, workspaceId }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get cost trends:', error);
      throw error;
    }
  }
}
