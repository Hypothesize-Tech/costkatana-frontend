import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  BeakerIcon,
  ChartPieIcon,
  ClockIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import DataNetworkEffectsService from '../../services/dataNetworkEffects.service';
import MetricCard from '../../components/DataNetworkEffects/MetricCard';
import MetricShimmer from '../../components/DataNetworkEffects/Shimmer/MetricShimmer';
import TableShimmer from '../../components/DataNetworkEffects/Shimmer/TableShimmer';
import { sanitizeModelId, extractProviderFromModelId, sanitizeProvider } from '../../utils/modelIdSanitizer';

const GlobalBenchmarks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [bestPractices, setBestPractices] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [benchmarksData, practicesData, comparisonData] = await Promise.all([
        DataNetworkEffectsService.getGlobalBenchmarks(),
        DataNetworkEffectsService.getBestPractices(),
        DataNetworkEffectsService.compareModels()
      ]);

      // Ensure bestPractices is always an array
      setBestPractices(Array.isArray(practicesData) ? practicesData : []);

      // Set comparison data
      setComparison(comparisonData || null);

      // Use comparisons from the compare endpoint as benchmarks (they have the model data we need)
      // Fall back to benchmarksData if comparisons are not available
      if (comparisonData?.comparisons && Array.isArray(comparisonData.comparisons) && comparisonData.comparisons.length > 0) {
        setBenchmarks(comparisonData.comparisons);
      } else if (Array.isArray(benchmarksData) && benchmarksData.length > 0) {
        setBenchmarks(benchmarksData);
      } else {
        setBenchmarks([]);
      }
    } catch (error) {
      console.error('Failed to load global benchmarks:', error);
      // Set defaults on error
      setBenchmarks([]);
      setBestPractices([]);
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          to="/data-network-effects"
          className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text-primary mb-2">
            Global Benchmarks
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">
            Privacy-preserving cross-tenant performance comparisons
          </p>
        </div>

        {loading ? (
          <MetricShimmer count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Tracked Models"
              value={benchmarks.length}
              icon={<BeakerIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
            />
            <MetricCard
              label="Global Requests"
              value={comparison?.totalRequests?.toLocaleString() || comparison?.metrics?.totalRequests?.toLocaleString() || '0'}
              icon={<ChartPieIcon className="w-5 h-5 text-highlight-500 dark:text-highlight-400" />}
            />
            <MetricCard
              label="Avg Global Latency"
              value={`${(comparison?.avgLatency ?? comparison?.metrics?.p50Latency ?? 0).toFixed(0)}ms`}
              icon={<ClockIcon className="w-5 h-5 text-accent-500 dark:text-accent-400" />}
            />
            <MetricCard
              label="Best Practices"
              value={bestPractices.length}
              icon={<LightBulbIcon className="w-5 h-5 text-success-500 dark:text-success-400" />}
            />
          </div>
        )}

        {/* Best Practices */}
        {bestPractices.length > 0 && (
          <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <LightBulbIcon className="w-6 h-6 text-accent-500 dark:text-accent-400" />
              <h2 className="text-xl font-display font-semibold gradient-text-primary">
                Recommended Best Practices
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestPractices.map((practice: any, idx: number) => (
                <div key={idx} className="glass backdrop-blur-sm rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-500/20 dark:bg-primary-500/30 rounded-lg">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-semibold gradient-text-primary mb-1">
                        {(practice.practiceType || '').replace('_', ' ')}
                      </div>
                      <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        {practice.description || 'Best practice recommendation'}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-primary-700 dark:text-primary-400 font-display font-semibold">
                          Adoption: {((practice.adoptionRate || 0) * 100).toFixed(0)}%
                        </span>
                        <span className="text-success-700 dark:text-success-400 font-display font-semibold">
                          Avg Savings: ${(practice.avgCostSavings || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmarks Table */}
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden">
          <div className="p-6 border-b border-primary-200/30">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-display font-semibold gradient-text-primary">
                Model Benchmarks (Anonymized)
              </h2>
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary ml-9">
              Aggregated performance data across all tenants (k-anonymity: k≥3)
            </p>
          </div>

          {loading ? (
            <div className="p-6">
              <TableShimmer rows={8} columns={6} />
            </div>
          ) : !Array.isArray(benchmarks) || benchmarks.length === 0 ? (
            <div className="p-12 text-center">
              <BeakerIcon className="w-12 h-12 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
              <p className="text-light-text-secondary dark:text-dark-text-secondary">No benchmark data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-500/10 dark:bg-primary-900/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Global Latency (p90)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Avg Cost/1K
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Error Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Cache Hit Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-200/30 dark:divide-primary-900/30">
                  {Array.isArray(benchmarks) && benchmarks.length > 0 ? benchmarks.map((benchmark: any, idx: number) => {
                    // Handle both comparison format (from compareModels) and benchmark format (from getGlobalBenchmarks)
                    // Comparison format has: modelId, latency, costPer1KTokens, modelSuccessRate
                    // Benchmark format has: model, modelId, provider, p90LatencyMS, avgCostPer1KTokensInput, etc.

                    // Sanitize model ID to remove ARNs and account IDs
                    const rawModelId = benchmark.model || benchmark.modelId || benchmark.scopeValue || 'Unknown';
                    const modelName = sanitizeModelId(rawModelId);

                    // Sanitize provider - remove ARNs and extract clean provider name
                    const rawProvider = benchmark.provider || extractProviderFromModelId(rawModelId) || 'N/A';
                    const provider = sanitizeProvider(rawProvider);

                    const latency = benchmark.latency ?? benchmark.p90LatencyMS ?? benchmark.metrics?.p90Latency ?? 0;
                    const cost = benchmark.costPer1KTokens ?? benchmark.avgCostPer1KTokensInput ?? benchmark.metrics?.avgCostPer1KTokens ?? 0;
                    // Error rate: if modelSuccessRate exists, use 1 - modelSuccessRate, otherwise use errorRate field
                    const errorRate = benchmark.globalErrorRate ?? benchmark.metrics?.errorRate ?? (benchmark.modelSuccessRate !== undefined ? 1 - benchmark.modelSuccessRate : 0);
                    const cacheHitRate = benchmark.globalCacheHitRate ?? benchmark.metrics?.avgCacheHitRate ?? 0;

                    return (
                      <tr key={benchmark.modelId || benchmark.model || `benchmark-${idx}`} className="hover:bg-primary-500/5 dark:hover:bg-primary-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {modelName}
                          </div>
                          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            {benchmark.capability || benchmark.scope || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {provider}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4 text-highlight-500 dark:text-highlight-400" />
                            {typeof latency === 'number' && !isNaN(latency) ? latency.toFixed(0) : '0'}ms
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          ${typeof cost === 'number' && !isNaN(cost) ? cost.toFixed(4) : '0.0000'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-display font-semibold ${(errorRate || 0) < 0.05
                            ? 'text-success-500 dark:text-success-400'
                            : 'text-accent-500 dark:text-accent-400'
                            }`}>
                            {((errorRate || 0) * 100).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {((cacheHitRate || 0) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  }) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 glass backdrop-blur-xl rounded-lg border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-500/20 dark:bg-primary-500/30 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-display font-semibold gradient-text-primary mb-1">
                Privacy Guarantee
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                All benchmark data is anonymized and aggregated across multiple tenants (k-anonymity with k≥3).
                Individual tenant data is never exposed. Differential privacy techniques ensure statistical noise prevents re-identification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBenchmarks;


