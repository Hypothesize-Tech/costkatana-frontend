import { apiClient } from '../config/api';

export interface LogFilters {
    projectId?: string;
    service?: string | string[];
    aiModel?: string | string[];
    operation?: string;
    status?: 'success' | 'error' | 'all';
    startDate?: string;
    endDate?: string;
    minLatency?: number;
    maxLatency?: number;
    minCost?: number;
    maxCost?: number;
    search?: string;
    workflowId?: string;
    experimentId?: string;
    sessionId?: string;
    cortexEnabled?: boolean;
    cacheHit?: boolean;
    logLevel?: string | string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface LogQueryResponse {
    success: boolean;
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: any;
}

export interface LogStatsResponse {
    success: boolean;
    summary: {
        totalCalls: number;
        totalCost: number;
        totalTokens: number;
        errors: number;
        errorRate: number;
        avgCostPerCall: number;
    };
    breakdown: any[];
    groupBy: string;
}

class LogsService {
    /**
     * Fetch AI logs with filters and pagination
     */
    async fetchAILogs(filters: LogFilters = {}): Promise<LogQueryResponse> {
        try {
            const params = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(key, String(v)));
                    } else {
                        params.append(key, String(value));
                    }
                }
            });
            
            const response = await apiClient.get(`/logs/ai?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching AI logs:', error);
            throw error;
        }
    }

    /**
     * Fetch AI log statistics
     */
    async fetchAILogStats(filters: Partial<LogFilters> & { groupBy?: string } = {}): Promise<LogStatsResponse> {
        try {
            const params = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value));
                }
            });
            
            const response = await apiClient.get(`/logs/ai/stats?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching AI log stats:', error);
            throw error;
        }
    }

    /**
     * Fetch single log by ID
     */
    async fetchAILogById(logId: string) {
        try {
            const response = await apiClient.get(`/logs/ai/${logId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching AI log by ID:', error);
            throw error;
        }
    }

    /**
     * Export logs in various formats
     */
    async exportAILogs(
        filters: Partial<LogFilters> = {},
        format: 'json' | 'csv' | 'jsonl' = 'json'
    ): Promise<Blob> {
        try {
            const params = new URLSearchParams();
            params.append('format', format);
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value));
                }
            });
            
            const response = await apiClient.get(`/logs/ai/export?${params.toString()}`, {
                responseType: 'blob'
            });
            
            return response.data;
        } catch (error) {
            console.error('Error exporting AI logs:', error);
            throw error;
        }
    }

    /**
     * Create EventSource for real-time log streaming
     * Note: EventSource doesn't support custom headers, so we pass the token as a query parameter
     */
    createLogStream(
        filters: Partial<LogFilters> = {},
        onMessage: (log: any) => void,
        onError?: (error: any) => void
    ): EventSource {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });
        
        // Get token and construct URL
        const token = localStorage.getItem('access_token');
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
        // Remove /api suffix if present in baseURL, we'll add it explicitly
        const cleanBaseURL = baseURL.replace(/\/api\/?$/, '');
        const url = `${cleanBaseURL}/api/logs/ai/stream?${params.toString()}${token ? `&token=${token}` : ''}`;
        
        const eventSource = new EventSource(url);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'log') {
                    onMessage(data.data);
                } else if (data.type === 'error' && onError) {
                    onError(new Error(data.message));
                }
            } catch (error) {
                console.error('Failed to parse SSE message:', error);
            }
        };
        
        eventSource.onerror = (error) => {
            if (onError) {
                onError(error);
            }
        };
        
        return eventSource;
    }
}

export const logsService = new LogsService();
export { LogsService };

