import { useState, useEffect, useCallback } from 'react';
import DataNetworkEffectsService, { 
  ModelPerformanceFingerprint,
  PerformanceTrend 
} from '../services/dataNetworkEffects.service';

export interface UseModelPerformanceOptions {
  capability?: string;
  maxCostPer1KTokens?: number;
  minQualityScore?: number;
  maxLatencyMs?: number;
  minRoutingWeight?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useModelPerformance(options: UseModelPerformanceOptions = {}) {
  const {  autoFetch = true, ...queryParams } = options;
  
  const [models, setModels] = useState<ModelPerformanceFingerprint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await DataNetworkEffectsService.queryBestModels(queryParams);
      setModels(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(queryParams)]);

  useEffect(() => {
    if (autoFetch) {
      fetchModels();
    }
  }, [autoFetch, fetchModels]);

  return {
    models,
    isLoading,
    error,
    refetch: fetchModels
  };
}

export function useModelTrend(
  modelId: string | null,
  metric: 'latency' | 'cost' | 'failure_rate' | 'quality' = 'cost'
) {
  const [trend, setTrend] = useState<PerformanceTrend | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrend = useCallback(async () => {
    if (!modelId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await DataNetworkEffectsService.getModelPerformanceTrend(modelId, metric);
      setTrend(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trend');
    } finally {
      setIsLoading(false);
    }
  }, [modelId, metric]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  return {
    trend,
    isLoading,
    error,
    refetch: fetchTrend
  };
}


