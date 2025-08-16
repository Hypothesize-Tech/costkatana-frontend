import { apiClient } from '../config/api';

export interface NotebookCell {
  id: string;
  type: 'markdown' | 'query' | 'visualization' | 'insight';
  content: string;
  output?: any;
  metadata?: Record<string, any>;
}

export interface Notebook {
  id: string;
  title: string;
  description: string;
  cells: NotebookCell[];
  created_at: string;
  updated_at: string;
  tags: string[];
  template_type?: 'cost_spike' | 'model_performance' | 'usage_patterns' | 'custom';
}

export interface NotebookExecution {
  notebook_id: string;
  execution_id: string;
  status: 'running' | 'completed' | 'failed';
  results: Record<string, any>;
  execution_time_ms: number;
  error?: string;
}

export interface NotebookTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  cells_count: number;
  estimated_time: string;
}

export interface AnomalyDetection {
  id: string;
  type: 'cost_spike' | 'performance_degradation' | 'error_surge' | 'usage_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: string;
  affected_operations: string[];
  metrics: {
    current_value: number;
    expected_value: number;
    deviation_percentage: number;
  };
  recommendations: string[];
}

export interface CostOptimization {
  id: string;
  category: 'model_selection' | 'caching' | 'batching' | 'routing' | 'scaling';
  title: string;
  description: string;
  potential_savings: {
    amount_usd: number;
    percentage: number;
  };
  implementation_effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  steps: string[];
  affected_operations: string[];
}

export interface PredictiveForecast {
  id: string;
  forecast_type: 'cost' | 'usage' | 'performance';
  timeframe: '24h' | '7d' | '30d';
  predictions: Array<{
    timestamp: string;
    predicted_value: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
  }>;
  trends: {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate_of_change: number;
    seasonal_patterns: string[];
  };
  recommendations: string[];
}

export interface AIInsightsSummary {
  anomalies: AnomalyDetection[];
  optimizations: CostOptimization[];
  forecasts: PredictiveForecast[];
  overall_health_score: number;
  key_insights: string[];
  priority_actions: string[];
}

export class NotebookService {
  /**
   * Get all notebooks
   */
  static async getNotebooks(): Promise<Notebook[]> {
    const response = await apiClient.get('/notebooks/notebooks');
    return response.data.notebooks;
  }

  /**
   * Get notebook by ID
   */
  static async getNotebook(id: string): Promise<Notebook> {
    const response = await apiClient.get(`/notebooks/notebooks/${id}`);
    return response.data.notebook;
  }

  /**
   * Create new notebook
   */
  static async createNotebook(title: string, description: string, template_type?: string): Promise<Notebook> {
    const response = await apiClient.post('/notebooks/notebooks', {
      title,
      description,
      template_type
    });
    return response.data.notebook;
  }

  /**
   * Update notebook
   */
  static async updateNotebook(id: string, updates: Partial<Notebook>): Promise<Notebook> {
    const response = await apiClient.put(`/notebooks/notebooks/${id}`, updates);
    return response.data.notebook;
  }

  /**
   * Delete notebook
   */
  static async deleteNotebook(id: string): Promise<void> {
    await apiClient.delete(`/notebooks/notebooks/${id}`);
  }

  /**
   * Execute notebook
   */
  static async executeNotebook(id: string): Promise<NotebookExecution> {
    const response = await apiClient.post(`/notebooks/notebooks/${id}/execute`);
    return response.data.execution;
  }

  /**
   * Get execution results
   */
  static async getExecution(executionId: string): Promise<NotebookExecution> {
    const response = await apiClient.get(`/notebooks/executions/${executionId}`);
    return response.data.execution;
  }

  /**
   * Get notebook templates
   */
  static async getTemplates(): Promise<NotebookTemplate[]> {
    const response = await apiClient.get('/notebooks/notebooks/templates');
    return response.data.templates;
  }

  /**
   * Get AI insights
   */
  static async getAIInsights(timeframe: string = '24h'): Promise<AIInsightsSummary> {
    const response = await apiClient.get('/notebooks/insights', {
      params: { timeframe }
    });
    return response.data.insights;
  }

  /**
   * Get anomaly detection results
   */
  static async getAnomalies(timeframe: string = '24h'): Promise<AnomalyDetection[]> {
    const response = await apiClient.get('/notebooks/insights/anomalies', {
      params: { timeframe }
    });
    return response.data.anomalies;
  }

  /**
   * Get cost optimization recommendations
   */
  static async getOptimizations(timeframe: string = '24h'): Promise<CostOptimization[]> {
    const response = await apiClient.get('/notebooks/insights/optimizations', {
      params: { timeframe }
    });
    return response.data.optimizations;
  }

  /**
   * Get predictive forecasts
   */
  static async getForecasts(timeframe: string = '24h'): Promise<PredictiveForecast[]> {
    const response = await apiClient.get('/notebooks/insights/forecasts', {
      params: { timeframe }
    });
    return response.data.forecasts;
  }
}

export default NotebookService;

