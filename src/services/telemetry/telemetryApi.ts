import { 
  TelemetryQuery, 
  MetricsResponse, 
  TraceResponse, 
  DashboardResponse, 
  DependencyResponse, 
  BackendMetrics,
  TelemetryQueryParams,
  TelemetrySearchResponse
} from '../../types/telemetry';
import { apiClient } from '../../config/api';

const BASE_URL = '/telemetry';

export class TelemetryAPI {
  static async queryTelemetry(params: TelemetryQueryParams): Promise<TelemetrySearchResponse> {
    try {
      const response = await apiClient.get(`${BASE_URL}`, { params });
      return response.data as TelemetrySearchResponse;
    } catch (error: any) {
      console.error('Error querying telemetry:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error);
      throw error;
    }
  }

  // Returns simplified metrics mapped to frontend shape
  static async getMetrics(timeframe: string = '1h'): Promise<MetricsResponse> {
    try {
      const response = await apiClient.get(`${BASE_URL}/metrics`, { 
        params: { timeframe } 
      });
      const raw = response.data.metrics || {};
      const mapped: MetricsResponse = {
        requests_per_minute: Number(raw.requests_per_minute ?? 0),
        error_rate: Number(raw.error_rate ?? 0), // already percentage in backend
        avg_latency_ms: Number(raw.avg_duration_ms ?? raw.avg_latency_ms ?? 0),
        p95_latency_ms: Number(raw.p95_duration_ms ?? raw.p95_latency_ms ?? 0)
      };
      return mapped;
    } catch (error: any) {
      console.error('Error fetching metrics:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error);
      throw error;
    }
  }

  // Returns full backend metrics object (includes cost_by_model, top_operations, etc.)
  static async getMetricsDetail(timeframe: string = '1h'): Promise<BackendMetrics> {
    try {
      const response = await apiClient.get(`${BASE_URL}/metrics`, { params: { timeframe } });
      return response.data.metrics as BackendMetrics;
    } catch (error: any) {
      console.error('Error fetching detailed metrics:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error);
      throw error;
    }
  }

  static async getTraceDetails(traceId: string): Promise<TraceResponse> {
    try {
      const response = await apiClient.get(`${BASE_URL}/traces/${traceId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching trace details:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error);
      throw error;
    }
  }

  static async getDashboard(): Promise<DashboardResponse> {
    try {
      const response = await apiClient.get(`${BASE_URL}/dashboard`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard data:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error);
      throw error;
    }
  }

  static async getServiceDependencies(): Promise<DependencyResponse> {
    try {
      const response = await apiClient.get(`${BASE_URL}/dependencies`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching service dependencies:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error);
      throw error;
    }
  }

  static async checkTelemetryHealth() {
    try {
      const response = await apiClient.get(`${BASE_URL}/health`);
      return response.data;
    } catch (error: any) {
      console.error('Telemetry system health check failed:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error);
      return { status: 'error', message: 'Telemetry service unavailable' };
    }
  }
}
