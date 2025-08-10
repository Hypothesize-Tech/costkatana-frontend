// Telemetry Data Types

export interface TelemetryQuery {
  timeframe?: string;
  filters?: Record<string, any>;
}

export interface MetricsResponse {
  requests_per_minute: number;
  error_rate: number; // percentage value (0-100)
  avg_latency_ms: number;
  p95_latency_ms: number;
}

// Backend metrics full shape
export interface BackendMetrics {
  timeframe: string;
  start_time: string;
  end_time: string;
  total_requests: number;
  total_errors: number;
  error_rate: number; // percentage value (0-100)
  avg_duration_ms: number;
  p50_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
  total_cost_usd: number;
  avg_cost_usd: number;
  total_tokens: number;
  avg_tokens: number;
  requests_per_minute: number;
  top_operations: Array<{
    name: string;
    count: number;
    avg_duration_ms: number;
    error_rate: number;
  }>;
  top_errors: Array<{
    type: string;
    count: number;
    latest_occurrence: string;
  }>;
  cost_by_model: Array<{
    model: string;
    total_cost: number;
    request_count: number;
  }>;
}

export interface ErrorSpan {
  trace_id: string;
  error_message: string;
  route: string;
  timestamp: string;
}

export interface CostlySpan {
  operation_name: string;
  cost_usd: number;
  model: string;
}

export interface ModelCost {
  model_name: string;
  total_cost_usd: number;
  request_count: number;
}

export interface DashboardResponse {
  dashboard: {
    current: MetricsResponse;
    trends: {
      last_5_minutes: any;
      last_hour: any;
      last_24_hours: any;
    };
    service_map?: any;
    recent_errors: ErrorSpan[];
    high_cost_operations: any[];
    top_operations: any[];
    cost_by_model: ModelCost[];
  };
}

export interface TraceResponse {
  summary: {
    trace_id: string;
    total_spans: number;
    total_duration_ms: number;
    total_cost_usd: number;
    error_count: number;
  };
  spans: Array<{
    span_id: string;
    parent_span_id?: string;
    operation_name: string;
    duration_ms: number;
    status: 'success' | 'error';
    attributes: Record<string, any>;
    children?: any[];
  }>;
}

export interface DependencyResponse {
  services: Array<{
    id: string;
    name: string;
  }>;
  dependencies: Array<{
    source: string;
    target: string;
    call_count: number;
    error_rate: number;
  }>;
}

// Search/query shapes matching backend
export interface TelemetryQueryParams {
  tenant_id?: string;
  workspace_id?: string;
  user_id?: string;
  trace_id?: string;
  request_id?: string;
  service_name?: string;
  operation_name?: string;
  status?: 'success' | 'error' | 'unset';
  start_time?: string; // ISO
  end_time?: string;   // ISO
  min_duration?: number;
  max_duration?: number;
  min_cost?: number;
  max_cost?: number;
  http_route?: string;
  http_method?: string;
  http_status_code?: number;
  gen_ai_model?: string;
  error_type?: string;
  limit?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TelemetryRecord {
  _id?: string;
  timestamp?: string;
  start_time?: string;
  end_time?: string;
  duration_ms?: number;
  service_name?: string;
  operation_name?: string;
  span_kind?: string;
  status?: 'success' | 'error' | 'unset';
  status_message?: string;
  http_route?: string;
  http_method?: string;
  http_status_code?: number;
  gen_ai_system?: string;
  gen_ai_model?: string;
  gen_ai_operation?: string;
  cost_usd?: number;
  total_tokens?: number;
  trace_id?: string;
  span_id?: string;
}

export interface TelemetrySearchResponse {
  data: TelemetryRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
