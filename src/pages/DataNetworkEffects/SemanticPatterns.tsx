import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  LightBulbIcon,
  UserGroupIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import DataNetworkEffectsService from '../../services/dataNetworkEffects.service';
import MetricCard from '../../components/DataNetworkEffects/MetricCard';
import MetricShimmer from '../../components/DataNetworkEffects/Shimmer/MetricShimmer';

const SemanticPatterns: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState<any[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const clustersData = await DataNetworkEffectsService.getSemanticClusters();
      setClusters(clustersData);

      const savings = clustersData.reduce((sum: number, cluster: any) =>
        sum + (cluster.optimizationOpportunities || []).reduce((s: number, opp: any) => s + (opp.potentialSavingsUSD || 0), 0), 0
      );
      setTotalSavings(savings);
    } catch (error) {
      console.error('Failed to load semantic patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          to="/admin/data-network-effects"
          className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text-primary mb-2">
            Semantic Patterns
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">
            Discover usage patterns through embedding analysis
          </p>
        </div>

        {loading ? (
          <MetricShimmer count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Total Clusters"
              value={clusters.length}
              icon={<UserGroupIcon className="w-5 h-5 text-success-500 dark:text-success-400" />}
            />
            <MetricCard
              label="Total Requests"
              value={clusters.reduce((sum: number, c: any) => sum + (c.totalRequests || 0), 0).toLocaleString()}
              icon={<ChartPieIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
            />
            <MetricCard
              label="Potential Savings"
              value={`$${totalSavings.toFixed(2)}`}
              icon={<LightBulbIcon className="w-5 h-5 text-accent-500 dark:text-accent-400" />}
            />
            <MetricCard
              label="Avg Cache Hit Rate"
              value={clusters.length > 0 ? `${((clusters.reduce((sum: number, c: any) => sum + (c.cacheHitRate || 0), 0) / clusters.length) * 100).toFixed(1)}%` : '0%'}
              icon={<CheckCircleIcon className="w-5 h-5 text-success-500 dark:text-success-400" />}
            />
          </div>
        )}

        {/* Clusters */}
        <div className="space-y-6">
          {clusters.length === 0 && !loading ? (
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-12 text-center">
              <SparklesIcon className="w-12 h-12 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
              <p className="text-light-text-secondary dark:text-dark-text-secondary">No clusters found. Semantic clustering will run periodically to discover patterns.</p>
            </div>
          ) : clusters.map((cluster: any, idx: number) => (
            <div key={cluster.clusterId || idx} className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SparklesIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    <h3 className="text-lg font-display font-semibold gradient-text-primary">
                      Cluster #{idx + 1}
                    </h3>
                  </div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {(cluster.totalRequests || 0).toLocaleString()} requests • ${(cluster.totalCostUSD || 0).toFixed(2)} total cost
                  </p>
                </div>
                <span className="inline-flex px-3 py-1 text-xs font-display font-semibold rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
                  {clusters.length > 0 && clusters.reduce((sum: number, c: any) => sum + (c.totalRequests || 0), 0) > 0
                    ? `${(((cluster.totalRequests || 0) / clusters.reduce((sum: number, c: any) => sum + (c.totalRequests || 0), 0)) * 100).toFixed(1)}% of traffic`
                    : '0% of traffic'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="glass backdrop-blur-sm rounded-lg border border-primary-200/30 p-4 bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CurrencyDollarIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Avg Cost/Request</div>
                  </div>
                  <div className="text-lg font-display font-semibold gradient-text-primary">
                    ${(cluster.avgCostPerRequest || 0).toFixed(4)}
                  </div>
                </div>
                <div className="glass backdrop-blur-sm rounded-lg border border-primary-200/30 p-4 bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30">
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="w-4 h-4 text-highlight-500 dark:text-highlight-400" />
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Avg Latency</div>
                  </div>
                  <div className="text-lg font-display font-semibold gradient-text-primary">
                    {(cluster.avgLatencyMS || 0).toFixed(0)}ms
                  </div>
                </div>
                <div className="glass backdrop-blur-sm rounded-lg border border-primary-200/30 p-4 bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircleIcon className="w-4 h-4 text-success-500 dark:text-success-400" />
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Cache Hit Rate</div>
                  </div>
                  <div className="text-lg font-display font-semibold gradient-text-primary">
                    {((cluster.cacheHitRate || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {cluster.commonPromptPatterns && cluster.commonPromptPatterns.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Common Patterns:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.commonPromptPatterns.slice(0, 5).map((pattern: string, i: number) => (
                      <span key={i} className="inline-flex px-2 py-1 text-xs font-display font-semibold rounded-md glass backdrop-blur-sm border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cluster.optimizationOpportunities && cluster.optimizationOpportunities.length > 0 && (
                <div className="glass backdrop-blur-sm rounded-lg border border-success-200/30 dark:border-success-800/30 bg-gradient-to-br from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-success-500/20 dark:bg-success-500/30 rounded-lg">
                      <LightBulbIcon className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-semibold gradient-text-success mb-2">
                        Optimization Opportunities
                      </div>
                      <div className="space-y-2">
                        {cluster.optimizationOpportunities.map((opp: any, i: number) => (
                          <div key={i} className="text-sm">
                            <div className="text-success-800 dark:text-success-300">
                              {opp.description || opp.message || 'Optimization opportunity'}
                            </div>
                            {(opp.potentialSavingsUSD || 0) > 0 && (
                              <div className="text-success-600 dark:text-success-400 mt-1 flex items-center gap-1">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                Potential savings: ${(opp.potentialSavingsUSD || 0).toFixed(2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemanticPatterns;

