import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  FunnelIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useModelPerformance } from '../../hooks/useModelPerformance';
import MetricCard from '../../components/DataNetworkEffects/MetricCard';
import TrendIndicator from '../../components/DataNetworkEffects/TrendIndicator';
import MetricShimmer from '../../components/DataNetworkEffects/Shimmer/MetricShimmer';
import TableShimmer from '../../components/DataNetworkEffects/Shimmer/TableShimmer';
import { sanitizeModelId, sanitizeProvider } from '../../utils/modelIdSanitizer';

const ModelPerformance: React.FC = () => {
  const [filters, setFilters] = useState({
    capability: '',
    maxCostPer1KTokens: undefined as number | undefined,
    minQualityScore: undefined as number | undefined,
    maxLatencyMs: undefined as number | undefined
  });
  const [showFilters, setShowFilters] = useState(false);

  const { models, isLoading, error, refetch } = useModelPerformance({
    ...filters,
    autoFetch: true
  });

  const topPerformers = models.slice(0, 3);

  return (
    <div className="min-h-screen relative bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/data-network-effects"
            className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text-primary mb-2">
                Model Performance
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">
                Real-time performance fingerprints across all AI models
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 glass backdrop-blur-xl border border-primary-200/30 rounded-lg hover:bg-primary-500/20 dark:hover:bg-primary-900/20 transition-all text-light-text-primary dark:text-dark-text-primary font-display font-semibold"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 mb-6">
            <h3 className="text-lg font-display font-semibold gradient-text-primary mb-4">
              Filter Models
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Capability
                </label>
                <select
                  value={filters.capability}
                  onChange={(e) => setFilters({ ...filters, capability: e.target.value })}
                  className="select w-full"
                >
                  <option value="">All</option>
                  <option value="text_generation">Text Generation</option>
                  <option value="image_generation">Image Generation</option>
                  <option value="embedding">Embedding</option>
                  <option value="code_generation">Code Generation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Max Cost (per 1K tokens)
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="e.g., 0.01"
                  value={filters.maxCostPer1KTokens || ''}
                  onChange={(e) => setFilters({ ...filters, maxCostPer1KTokens: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 glass backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-dark-text-primary text-light-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Min Quality Score
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  placeholder="0.0 - 1.0"
                  value={filters.minQualityScore || ''}
                  onChange={(e) => setFilters({ ...filters, minQualityScore: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 glass backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-dark-text-primary text-light-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Max Latency (ms)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={filters.maxLatencyMs || ''}
                  onChange={(e) => setFilters({ ...filters, maxLatencyMs: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 glass backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-dark-text-primary text-light-text-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => refetch()}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setFilters({ capability: '', maxCostPer1KTokens: undefined, minQualityScore: undefined, maxLatencyMs: undefined });
                  refetch();
                }}
                className="btn btn-secondary"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {isLoading ? (
          <div className="mb-8">
            <MetricShimmer count={3} />
          </div>
        ) : topPerformers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-semibold gradient-text-primary mb-4">
              Top Performers (24h)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topPerformers.map((model, idx) => (
                <MetricCard
                  key={model.modelId}
                  label={`${sanitizeProvider(model.provider)} - ${sanitizeModelId(model.modelName || model.modelId)}`}
                  value={`${((model.routingWeight || 0) * 100).toFixed(0)}%`}
                  icon={
                    <div className="p-2 bg-gradient-to-br from-accent-500/20 to-accent-600/20 dark:from-accent-500/30 dark:to-accent-600/30 rounded-lg">
                      <TrophyIcon className={`w-6 h-6 ${idx === 0 ? 'text-accent-500 dark:text-accent-400' : idx === 1 ? 'text-secondary-500 dark:text-secondary-400' : 'text-highlight-500 dark:text-highlight-400'}`} />
                    </div>
                  }
                  change={{
                    value: 0,
                    type: 'neutral'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Models Table */}
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden">
          <div className="p-6 border-b border-primary-200/30">
            <h2 className="text-xl font-display font-semibold gradient-text-primary">
              All Models
            </h2>
          </div>

          {error && (
            <div className="p-6 text-center">
              <p className="text-danger-500 dark:text-danger-400 font-display font-semibold">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="p-6">
              <TableShimmer rows={10} columns={7} />
            </div>
          ) : models.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-light-text-secondary dark:text-dark-text-secondary">No models found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-500/10 dark:bg-primary-900/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Latency (p50)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Cost/1K
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Routing Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-200/30 dark:divide-primary-900/30">
                  {models.map((model) => {
                    const successRate = 1 - (model.window24h?.failureRate || 0);

                    // Calculate real trend by comparing current routing weight with a previous estimate
                    // We calculate what the routing weight would be based on window7d and window30d data
                    // (as a proxy for "previous period" before the latest 24h window)
                    // This matches the backend's routing weight calculation formula
                    const calculatePreviousRoutingWeight = (window7d: typeof model.window7d, window30d: typeof model.window30d): number => {
                      if (!window7d || !window30d) return model.routingWeight ?? 0;

                      // Use the same formula as backend: weighted scoring based on latency, cost, failure rate, cache hit
                      // But use window7d and window30d instead of window24h and window7d
                      const latency7d = window7d.latency?.p50 || 0;
                      const latency30d = window30d.latency?.p50 || 0;
                      const avgLatencyP50 = (latency7d + latency30d) / 2;
                      const latencyScore = 1 - Math.min(1, avgLatencyP50 / 10000);

                      const cost7d = window7d.costPer1KTokens || 0;
                      const cost30d = window30d.costPer1KTokens || 0;
                      const avgCostPer1KTokens = (cost7d + cost30d) / 2;
                      const costScore = 1 - Math.min(1, avgCostPer1KTokens / 0.01);

                      const failureRate7d = window7d.failureRate || 0;
                      const failureRate30d = window30d.failureRate || 0;
                      const avgFailureRate = (failureRate7d + failureRate30d) / 2;
                      const reliabilityScore = 1 - avgFailureRate;

                      const cacheHitRate7d = window7d.cacheHitRate || 0;
                      const cacheHitRate30d = window30d.cacheHitRate || 0;
                      const avgCacheHitRate = (cacheHitRate7d + cacheHitRate30d) / 2;
                      const cacheScore = avgCacheHitRate;

                      const weight = (
                        latencyScore * 0.25 +
                        costScore * 0.25 +
                        reliabilityScore * 0.30 +
                        cacheScore * 0.20
                      );

                      return Math.max(0, Math.min(1, weight));
                    };

                    const currentRoutingWeight = model.routingWeight ?? 0;
                    const previousRoutingWeight = calculatePreviousRoutingWeight(model.window7d, model.window30d);
                    const diff = currentRoutingWeight - previousRoutingWeight;

                    // Determine trend direction with a threshold to avoid noise
                    // Threshold of 0.5% change to consider it significant
                    // For routing weight: higher is better, so 'up' = improving, 'down' = degrading
                    const threshold = 0.005;
                    let trendDirection: 'improving' | 'degrading' | 'stable' = 'stable';
                    if (diff > threshold) {
                      trendDirection = 'improving'; // Routing weight increased = performance improved
                    } else if (diff < -threshold) {
                      trendDirection = 'degrading'; // Routing weight decreased = performance degraded
                    } else {
                      trendDirection = 'stable';
                    }

                    // Calculate percentage change for display
                    const percentageChange = previousRoutingWeight > 0
                      ? (diff / previousRoutingWeight) * 100
                      : 0;

                    return (
                      <tr key={model.modelId} className="hover:bg-primary-500/5 dark:hover:bg-primary-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {sanitizeModelId(model.modelName || model.modelId)}
                          </div>
                          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            {model.capabilities && model.capabilities[0]?.capability}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {sanitizeProvider(model.provider)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {model.window24h?.latency?.p50?.toFixed(0) || '0'}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          ${model.window24h?.costPer1KTokens?.toFixed(4) || '0.0000'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-display font-semibold ${successRate >= 0.95
                            ? 'text-success-500 dark:text-success-400'
                            : successRate >= 0.90
                              ? 'text-accent-500 dark:text-accent-400'
                              : 'text-danger-500 dark:text-danger-400'
                            }`}>
                            {(successRate * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-primary-200/30 dark:bg-primary-900/30 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full glow-primary/50"
                                style={{ width: `${(model.routingWeight || 0) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-display font-semibold">
                              {((model.routingWeight || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TrendIndicator
                            direction={trendDirection}
                            value={Number(Math.abs(percentageChange).toFixed(1))}
                            size="sm"
                            showLabel={false}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;

