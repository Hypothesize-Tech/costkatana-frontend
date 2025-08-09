import api from '../config/api';

export interface CacheStats {
  redis: {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: number;
    avgResponseTime: number;
    costSaved: number;
    tokensSaved: number;
    deduplicationCount: number;
    semanticMatches: number;
    cacheSize: number;
    topModels: { model: string; hits: number }[];
    topUsers: { userId: string; hits: number }[];
    provider: string;
    features: {
      semanticCaching: boolean;
      deduplication: boolean;
      userScoped: boolean;
      modelSpecific: boolean;
    };
  };

  combined: {
    totalHits: number;
    totalMisses: number;
    totalRequests: number;
    overallHitRate: number;
    totalCostSaved: number;
    totalTokensSaved: number;
  };
}

export interface CacheCheckRequest {
  prompt: string;
  model?: string;
  provider?: string;
  includeFallbacks?: boolean;
  includeCacheDetails?: boolean;
}

export interface CacheCheckResponse {
  cacheStatus: 'HIT' | 'MISS';
  cacheDetails?: {
    key: string;
    age: string;
    size: string;
    ttl: number;
  };
  suggestions: Array<{
    type: string;
    action: string;
    reason: string;
    confidence: number;
  }>;
  fallbackRoutes: Array<{
    provider: string;
    model: string;
    priority: number;
    status: 'available' | 'unavailable';
    estimatedCost: number;
    reason?: string;
  }>;
  performance: {
    responseTime: number;
    hitRate: number;
    costSavings: number;
    bandwidthSaved: number;
  };
}

class CacheService {
  async checkCache(request: CacheCheckRequest): Promise<CacheCheckResponse> {
    try {
      const response = await api.post('/cache/check', request);
      return response.data.data;
    } catch (error) {
      console.error('Failed to check cache:', error);
      throw error;
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    try {
      const response = await api.get('/cache/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      throw error;
    }
  }

  async clearCache(model?: string, provider?: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (model) params.append('model', model);
      if (provider) params.append('provider', provider);
      
      await api.delete(`/cache/clear?${params.toString()}`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  async exportCache(): Promise<any> {
    try {
      const response = await api.get('/cache/export');
      return response.data.data;
    } catch (error) {
      console.error('Failed to export cache:', error);
      throw error;
    }
  }

  async importCache(entries: any[]): Promise<void> {
    try {
      await api.post('/cache/import', { entries });
    } catch (error) {
      console.error('Failed to import cache:', error);
      throw error;
    }
  }

  async warmupCache(queries: { prompt: string; response: any; metadata?: any }[]): Promise<void> {
    try {
      await api.post('/cache/warmup', { queries });
    } catch (error) {
      console.error('Failed to warmup cache:', error);
      throw error;
    }
  }

  // Gateway cache stats (from gateway endpoint)
  async getGatewayCacheStats(): Promise<any> {
    try {
      const response = await api.get('/gateway/cache/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get gateway cache stats:', error);
      throw error;
    }
  }

  // Clear gateway cache
  async clearGatewayCache(userId?: string, all?: boolean): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (all) params.append('all', 'true');
      
      await api.delete(`/gateway/cache/clear?${params.toString()}`);
    } catch (error) {
      console.error('Failed to clear gateway cache:', error);
      throw error;
    }
  }
}

export const cacheService = new CacheService();
