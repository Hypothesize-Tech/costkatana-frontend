import { useState, useEffect, useCallback } from 'react';
import DataNetworkEffectsService from '../services/dataNetworkEffects.service';

export interface UseDataNetworkEffectsOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // milliseconds
}

export function useDataNetworkEffects(options: UseDataNetworkEffectsOptions = {}) {
  const { autoFetch = true, refreshInterval } = options;
  
  const [health, setHealth] = useState<{ healthy: boolean; checks: Record<string, boolean> } | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsHealthLoading(true);
    setHealthError(null);
    
    try {
      const result = await DataNetworkEffectsService.checkHealth();
      setHealth(result);
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : 'Failed to check health');
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      checkHealth();
    }
    
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(checkHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoFetch, refreshInterval, checkHealth]);

  return {
    health,
    isHealthLoading,
    healthError,
    checkHealth
  };
}

export default useDataNetworkEffects;


