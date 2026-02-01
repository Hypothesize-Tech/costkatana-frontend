import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import DataNetworkEffectsService from '../../services/dataNetworkEffects.service';
import MetricCard from '../../components/DataNetworkEffects/MetricCard';
import MetricShimmer from '../../components/DataNetworkEffects/Shimmer/MetricShimmer';

const AgentAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, patternsData] = await Promise.all([
        DataNetworkEffectsService.getAgentAnalytics(),
        DataNetworkEffectsService.detectBadAgentPatterns()
      ]);
      setAnalytics(analyticsData);
      setPatterns(patternsData);
    } catch (error) {
      console.error('Failed to load agent analytics:', error);
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
            Agent Analytics
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">
            Monitor agent behavior and identify optimization opportunities
          </p>
        </div>

        {loading ? (
          <MetricShimmer count={4} />
        ) : analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Total Agent Actions"
              value={analytics.totalActions?.toLocaleString() || '0'}
              icon={<CpuChipIcon className="w-5 h-5 text-highlight-500 dark:text-highlight-400" />}
            />
            <MetricCard
              label="Success Rate"
              value={`${((analytics.successRate || 0) * 100).toFixed(1)}%`}
              icon={<CheckCircleIcon className="w-5 h-5 text-success-500 dark:text-success-400" />}
              change={{
                value: 3.5,
                type: 'positive'
              }}
            />
            <MetricCard
              label="Avg Cost/Action"
              value={`$${(analytics.avgCostPerAction || 0).toFixed(4)}`}
              icon={<CurrencyDollarIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
            />
            <MetricCard
              label="Patterns Detected"
              value={patterns.length}
              icon={<FireIcon className="w-5 h-5 text-accent-500 dark:text-accent-400" />}
              change={{
                value: -12.5,
                type: 'positive'
              }}
            />
          </div>
        )}

        {/* Bad Patterns Alert */}
        {patterns.length > 0 && (
          <div className="glass backdrop-blur-xl rounded-xl border border-accent-200/30 dark:border-accent-800/30 shadow-xl bg-gradient-to-br from-accent-50/50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-800/20 p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-500/20 dark:bg-accent-500/30 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-accent-600 dark:text-accent-400 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold gradient-text-accent mb-2">
                  {patterns.length} Inefficiency Pattern{patterns.length > 1 ? 's' : ''} Detected
                </h3>
                <div className="space-y-3">
                  {patterns.map((pattern, idx) => (
                    <div key={idx} className="glass backdrop-blur-sm rounded-lg border border-primary-200/30 dark:border-primary-800/30 p-4 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                            {pattern.type || pattern.patternType || 'Unknown Pattern'}
                          </div>
                          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {pattern.description || pattern.message || 'No description available'}
                          </div>
                          {pattern.agentId && (
                            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 flex items-center gap-1">
                              <CpuChipIcon className="w-3 h-3" />
                              Agent: {pattern.agentId}
                            </div>
                          )}
                        </div>
                        <span className="inline-flex px-2 py-1 text-xs font-display font-semibold rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-400">
                          {pattern.severity || 'Medium'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Performance by Type */}
        {analytics?.byAgentType && (
          <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden">
            <div className="p-6 border-b border-primary-200/30">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                <h2 className="text-xl font-display font-semibold gradient-text-primary">
                  Performance by Agent Type
                </h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-500/10 dark:bg-primary-900/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Agent Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Avg Latency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                      Total Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-200/30 dark:divide-primary-900/30">
                  {Object.entries(analytics.byAgentType).map(([type, data]: [string, any]) => (
                    <tr key={type} className="hover:bg-primary-500/5 dark:hover:bg-primary-900/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                        <div className="flex items-center gap-2">
                          <CpuChipIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                          {type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {(data.totalActions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-display font-semibold ${(data.successRate || 0) >= 0.95
                          ? 'text-success-500 dark:text-success-400'
                          : 'text-accent-500 dark:text-accent-400'
                          }`}>
                          {((data.successRate || 0) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-highlight-500 dark:text-highlight-400" />
                          {(data.avgLatency || 0).toFixed(0)}ms
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-4 h-4 text-success-500 dark:text-success-400" />
                          ${(data.totalCost || 0).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentAnalytics;


