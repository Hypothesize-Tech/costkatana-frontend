import { apiClient } from '../config/api';

export interface CKQLQueryRequest {
  query: string;
  tenant_id?: string;
  workspace_id?: string;
  timeframe?: string;
  limit?: number;
  offset?: number;
}

export interface CKQLQueryResult {
  success: boolean;
  query: string;
  explanation: string;
  results: any[];
  total_count: number;
  execution_time_ms: number;
  insights: string[];
  suggested_filters?: string[];
}

export interface VectorizationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  startTime: string;
  endTime?: string;
  error?: string;
}

export interface VectorizationStats {
  total_records: number;
  vectorized_records: number;
  vectorization_rate: number;
  avg_embedding_dimensions: number;
  last_vectorized: string | null;
}

export interface QuerySuggestion {
  category: string;
  queries: string[];
}

export class CKQLService {
  /**
   * Execute a natural language query
   */
  static async executeQuery(request: CKQLQueryRequest): Promise<CKQLQueryResult> {
    const response = await apiClient.post('/ckql/query', request);
    return response.data;
  }

  /**
   * Get query suggestions based on partial input
   */
  static async getSuggestions(partialQuery: string): Promise<string[]> {
    const response = await apiClient.get('/ckql/suggestions', {
      params: { partial_query: partialQuery }
    });
    return response.data.suggestions;
  }

  /**
   * Get example queries organized by category
   */
  static async getExampleQueries(): Promise<QuerySuggestion[]> {
    const response = await apiClient.get('/ckql/examples');
    return response.data.examples;
  }

  /**
   * Start vectorization of telemetry data
   */
  static async startVectorization(options?: {
    timeframe?: string;
    tenant_id?: string;
    workspace_id?: string;
    force_reprocess?: boolean;
  }): Promise<VectorizationJob> {
    const response = await apiClient.post('/ckql/vectorization/start', options);
    return response.data.job;
  }

  /**
   * Get vectorization status and statistics
   */
  static async getVectorizationStatus(): Promise<{
    current_job: VectorizationJob | null;
    statistics: VectorizationStats;
  }> {
    const response = await apiClient.get('/ckql/vectorization/status');
    return response.data;
  }

  /**
   * Cancel current vectorization job
   */
  static async cancelVectorization(): Promise<boolean> {
    const response = await apiClient.post('/ckql/vectorization/cancel');
    return response.data.cancelled;
  }

  /**
   * Get cost narratives for specific records
   */
  static async getCostNarratives(recordIds: string[]): Promise<Array<{
    record_id: string;
    narrative: string;
    generated_at: string;
  }>> {
    const response = await apiClient.post('/ckql/narratives', {
      record_ids: recordIds
    });
    return response.data.narratives;
  }
}

export default CKQLService;

