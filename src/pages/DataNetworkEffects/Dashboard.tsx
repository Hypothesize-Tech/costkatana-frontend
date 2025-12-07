import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CpuChipIcon,
  LightBulbIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import MetricCard from '../../components/DataNetworkEffects/MetricCard';
import MetricShimmer from '../../components/DataNetworkEffects/Shimmer/MetricShimmer';
import DataNetworkEffectsService from '../../services/dataNetworkEffects.service';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [globalBenchmark, setGlobalBenchmark] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [healthData, benchmark] = await Promise.all([
        DataNetworkEffectsService.checkHealth(),
        DataNetworkEffectsService.getLatestGlobalBenchmark()
      ]);
      setHealth(healthData);
      setGlobalBenchmark(benchmark);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text-primary mb-2">
            Data Network Effects
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">
            Self-improving AI cost optimization through continuous learning and pattern discovery
          </p>
        </div>

        {/* System Health Status */}
        {loading ? (
          <div className="mb-8">
            <MetricShimmer count={5} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard
              label="Model Performance"
              value={health?.checks?.modelPerformance ? 'Active' : 'Inactive'}
              icon={health?.checks?.modelPerformance ? (
                <CheckCircleIcon className="w-6 h-6 text-success-500 dark:text-success-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-danger-500 dark:text-danger-400" />
              )}
            />
            <MetricCard
              label="Learning Loop"
              value={health?.checks?.learningLoop ? 'Active' : 'Inactive'}
              icon={health?.checks?.learningLoop ? (
                <LightBulbIcon className="w-6 h-6 text-accent-500 dark:text-accent-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-danger-500 dark:text-danger-400" />
              )}
            />
            <MetricCard
              label="Agent Analytics"
              value={health?.checks?.agentAnalytics ? 'Active' : 'Inactive'}
              icon={health?.checks?.agentAnalytics ? (
                <CpuChipIcon className="w-6 h-6 text-highlight-500 dark:text-highlight-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-danger-500 dark:text-danger-400" />
              )}
            />
            <MetricCard
              label="Semantic Clustering"
              value={health?.checks?.semanticClustering ? 'Active' : 'Inactive'}
              icon={health?.checks?.semanticClustering ? (
                <UserGroupIcon className="w-6 h-6 text-success-500 dark:text-success-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-danger-500 dark:text-danger-400" />
              )}
            />
            <MetricCard
              label="Global Benchmarks"
              value={health?.checks?.globalBenchmarks ? 'Active' : 'Inactive'}
              icon={health?.checks?.globalBenchmarks ? (
                <BeakerIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-danger-500 dark:text-danger-400" />
              )}
            />
          </div>
        )}

        {/* Global Metrics */}
        {globalBenchmark && !loading && globalBenchmark.metrics && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-semibold gradient-text-primary mb-4">
              Global Performance Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Requests"
                value={(globalBenchmark.metrics?.totalRequests || 0).toLocaleString()}
                icon={<ChartPieIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
              />
              <MetricCard
                label="Avg Latency (p50)"
                value={`${(globalBenchmark.metrics?.p50Latency || 0).toFixed(0)}ms`}
                icon={<ClockIcon className="w-5 h-5 text-highlight-500 dark:text-highlight-400" />}
              />
              <MetricCard
                label="Avg Cost/Request"
                value={`$${(globalBenchmark.metrics?.avgCostPerRequest || 0).toFixed(4)}`}
                icon={<CurrencyDollarIcon className="w-5 h-5 text-success-500 dark:text-success-400" />}
              />
              <MetricCard
                label="Success Rate"
                value={`${((globalBenchmark.metrics?.successRate || 0) * 100).toFixed(1)}%`}
                icon={<CheckCircleIcon className="w-5 h-5 text-success-500 dark:text-success-400" />}
                change={globalBenchmark.metrics?.totalRequests > 0 ? {
                  value: 2.3,
                  type: 'positive'
                } : undefined}
              />
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Model Performance */}
          <Link to="/data-network-effects/models" className="block group">
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/20 dark:from-primary-500/30 dark:to-primary-600/30 rounded-lg glow-primary/50">
                  <ChartBarIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Model Performance
                </h3>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                Real-time model performance fingerprints with rolling window metrics (24h, 7d, 30d)
              </p>
              <div className="flex items-center text-primary-500 dark:text-primary-400 text-sm font-display font-semibold group-hover:gap-2 transition-all">
                View Models <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          {/* Learning Loop */}
          <Link to="/data-network-effects/learning-loop" className="block group">
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-accent-500/20 to-accent-600/20 dark:from-accent-500/30 dark:to-accent-600/30 rounded-lg glow-accent/50">
                  <LightBulbIcon className="w-6 h-6 text-accent-500 dark:text-accent-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Learning Loop
                </h3>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                Recommendation outcomes and automatic weight updates for continuous improvement
              </p>
              <div className="flex items-center text-accent-500 dark:text-accent-400 text-sm font-display font-semibold group-hover:gap-2 transition-all">
                View Statistics <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          {/* Agent Analytics */}
          <Link to="/data-network-effects/agents" className="block group">
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-highlight-500/20 to-highlight-600/20 dark:from-highlight-500/30 dark:to-highlight-600/30 rounded-lg glow-highlight/50">
                  <CpuChipIcon className="w-6 h-6 text-highlight-500 dark:text-highlight-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Agent Analytics
                </h3>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                Monitor agent behavior, detect patterns, and identify optimization opportunities
              </p>
              <div className="flex items-center text-highlight-500 dark:text-highlight-400 text-sm font-display font-semibold group-hover:gap-2 transition-all">
                View Analytics <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          {/* Semantic Patterns */}
          <Link to="/data-network-effects/patterns" className="block group">
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-success-500/20 to-success-600/20 dark:from-success-500/30 dark:to-success-600/30 rounded-lg glow-success/50">
                  <UserGroupIcon className="w-6 h-6 text-success-500 dark:text-success-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Semantic Patterns
                </h3>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                Discover usage patterns through embedding analysis and clustering
              </p>
              <div className="flex items-center text-success-500 dark:text-success-400 text-sm font-display font-semibold group-hover:gap-2 transition-all">
                View Patterns <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          {/* Global Benchmarks */}
          <Link to="/data-network-effects/benchmarks" className="block group">
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-primary-500/20 to-primary-600/20 dark:from-primary-500/30 dark:to-primary-600/30 rounded-lg glow-primary/50">
                  <BeakerIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Global Benchmarks
                </h3>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                Privacy-preserving cross-tenant performance comparisons and best practices
              </p>
              <div className="flex items-center text-primary-500 dark:text-primary-400 text-sm font-display font-semibold group-hover:gap-2 transition-all">
                View Benchmarks <span className="ml-1">→</span>
              </div>
            </div>
          </Link>

          {/* Documentation */}
          <a
            href="https://docs.costkatana.com/data-network-effects"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-400/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 dark:from-secondary-500/30 dark:to-secondary-600/30 rounded-lg">
                  <svg className="w-6 h-6 text-secondary-500 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Documentation
                </h3>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                Learn how Data Network Effects work and how to leverage them for optimization
              </p>
              <div className="flex items-center text-secondary-500 dark:text-secondary-400 text-sm font-display font-semibold group-hover:gap-2 transition-all">
                Read Docs <span className="ml-1">→</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


