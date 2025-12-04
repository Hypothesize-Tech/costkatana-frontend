import React, { useState, useEffect } from 'react';
import {
  Globe,
  BarChart3,
  DollarSign,
  Zap,
  Clock,
  Monitor,
  Target,
  Settings,
  Tag,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { GatewayService, GatewayAnalytics, GatewayStats } from '../../services/gateway.service';
import { GatewayShimmer } from '../shimmer/GatewayShimmer';

interface GatewayDashboardProps {
  projectId?: string;
}

export const GatewayDashboard: React.FC<GatewayDashboardProps> = ({ projectId }) => {
  const [analytics, setAnalytics] = useState<GatewayAnalytics | null>(null);
  const [stats, setStats] = useState<GatewayStats | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGatewayData();
  }, [projectId]);

  const loadGatewayData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, statsData, healthData] = await Promise.allSettled([
        GatewayService.getAnalytics({ projectId }),
        GatewayService.getStats(),
        GatewayService.getHealth()
      ]);

      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value.data || statsData.value);
      }

      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value);
      }

    } catch (err) {
      setError('Failed to load gateway data');
      console.error('Gateway data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <GatewayShimmer />;
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
        <div className="flex gap-4 items-center p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
          <div className="flex justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-danger">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-bold font-display text-danger-900 dark:text-danger-100">Gateway Error</h2>
            <p className="mb-4 font-body text-danger-700 dark:text-danger-300">{error}</p>
            <button
              onClick={loadGatewayData}
              className="inline-flex gap-2 items-center px-4 py-2 font-semibold text-white rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 btn btn-primary glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-danger hover:bg-gradient-danger/90 font-display"
            >
              <RotateCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <header className="mb-6">
        <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center mb-2">
              <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-primary">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold font-display gradient-text-primary">Gateway Analytics</h1>
            </div>
            <div className="flex gap-3 items-center">
              <div className={`w-4 h-4 rounded-full ${health?.status === 'healthy' ? 'bg-gradient-success' : 'bg-gradient-danger'}`}></div>
              <span className={`px-3 py-1 rounded-full font-display font-medium ${health?.status === 'healthy'
                ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                : 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                }`}>
                {health?.status === 'healthy' ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={loadGatewayData}
                disabled={loading}
                className="inline-flex gap-2 items-center px-6 py-3 font-semibold text-white rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 btn btn-primary glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-display"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          <p className="font-body text-secondary-600 dark:text-secondary-300">Real-time gateway performance metrics and analytics</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium font-display text-secondary-600 dark:text-secondary-300">Total Requests</p>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {analytics?.summary.totalRequests?.toLocaleString() || 0}
              </p>
              <p className="mt-1 text-xs font-body text-secondary-500 dark:text-secondary-400">via Gateway</p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gradient-primary/20">
              <BarChart3 className="w-5 h-5 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium font-display text-success-700 dark:text-success-300">Total Cost</p>
              <p className="text-2xl font-bold font-display text-success-600 dark:text-success-400">
                ${analytics?.summary.totalCost?.toFixed(4) || '0.0000'}
              </p>
              <p className="mt-1 text-xs font-body text-secondary-500 dark:text-secondary-400">
                ${analytics?.summary.cost_savings?.toFixed(4) || '0'} saved
              </p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gradient-success/20">
              <DollarSign className="w-5 h-5 text-success-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-warning-200/30 from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium font-display text-warning-700 dark:text-warning-300">Cache Hit Rate</p>
              <p className="text-2xl font-bold font-display text-warning-600 dark:text-warning-400">
                {analytics?.summary.cacheHitRate?.toFixed(1) || 0}%
              </p>
              <p className="mt-1 text-xs font-body text-secondary-500 dark:text-secondary-400">
                {analytics?.cacheMetrics.totalHits || 0} hits
              </p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gradient-warning/20">
              <Zap className="w-5 h-5 text-warning-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-accent-200/30 from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium font-display text-accent-700 dark:text-accent-300">Avg Latency</p>
              <p className="text-2xl font-bold font-display text-accent-600 dark:text-accent-400">
                {analytics?.summary.averageLatency?.toFixed(0) || 0}ms
              </p>
              <p className="mt-1 text-xs font-body text-secondary-500 dark:text-secondary-400">Gateway overhead</p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gradient-accent/20">
              <Clock className="w-5 h-5 text-accent-500" />
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="p-6 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-secondary">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display text-secondary-900 dark:text-white">System Status</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h4 className="mb-2 font-semibold font-display text-success-700 dark:text-success-300">Uptime</h4>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">{formatUptime(stats.uptime)}</p>
            </div>
            <div className="p-4 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-warning-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h4 className="mb-2 font-semibold font-display text-warning-700 dark:text-warning-300">Memory Usage</h4>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">{formatBytes(stats.memoryUsage.heapUsed)}</p>
              <p className="text-sm font-body text-secondary-500 dark:text-secondary-400">of {formatBytes(stats.memoryUsage.heapTotal)}</p>
            </div>
            <div className="p-4 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-accent-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h4 className="mb-2 font-semibold font-display text-accent-700 dark:text-accent-300">Cache Size</h4>
              <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">{stats.cacheSize} items</p>
            </div>
          </div>
        </div>
      )}

      {/* Provider Breakdown */}
      {analytics?.providerBreakdown && analytics.providerBreakdown.length > 0 && (
        <div className="p-6 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-primary">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Provider Usage</h3>
          </div>
          <div className="space-y-4">
            {analytics.providerBreakdown.map((provider, index) => (
              <div key={index} className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold font-display text-secondary-900 dark:text-white">{provider.provider}</span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border-primary-200/30 dark:border-primary-500/20 font-display">
                    {provider.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="mb-3 w-full h-3 rounded-full bg-secondary-200/50 dark:bg-secondary-700/50">
                  <div
                    className="h-3 rounded-full transition-all duration-300 bg-gradient-primary"
                    style={{ width: `${provider.percentage}%` }}
                  ></div>
                </div>
                <div className="flex flex-wrap gap-2 justify-between">
                  <span className="px-2 py-1 text-xs font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30 dark:border-success-500/20 font-display">
                    {provider.requests} requests
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-warning/20 text-warning-700 dark:text-warning-300 border-warning-200/30 dark:border-warning-500/20 font-display">
                    ${provider.cost.toFixed(4)}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-accent/20 text-accent-700 dark:text-accent-300 border-accent-200/30 dark:border-accent-500/20 font-display">
                    {provider.averageLatency > 0 ? `${provider.averageLatency.toFixed(0)}ms avg` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Utilization */}
      {analytics?.budgetUtilization && analytics.budgetUtilization.length > 0 && (
        <div className="p-6 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 dark:border-success-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-success">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Budget Utilization</h3>
          </div>
          <div className="space-y-4">
            {analytics.budgetUtilization.map((budget, index) => (
              <div key={index} className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold font-display text-secondary-900 dark:text-white">{budget.budgetName}</span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30 dark:border-success-500/20 font-display">
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="mb-3 w-full h-3 rounded-full bg-secondary-200/50 dark:bg-secondary-700/50">
                  <div
                    className="h-3 rounded-full transition-all duration-300 bg-gradient-success"
                    style={{ width: `${budget.percentage}%` }}
                  ></div>
                </div>
                <div className="flex flex-wrap gap-2 justify-between">
                  <span className="px-2 py-1 text-xs font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-warning/20 text-warning-700 dark:text-warning-300 border-warning-200/30 dark:border-warning-500/20 font-display">
                    ${budget.utilized.toFixed(4)} used
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border-primary-200/30 dark:border-primary-500/20 font-display">
                    ${budget.total.toFixed(4)} total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Usage */}
      {analytics?.featuresUsage && (
        <div className="p-6 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-accent">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Features Usage</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {analytics.featuresUsage.map((feature, index) => (
              <div key={index} className="p-6 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-accent-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <h4 className="mb-3 font-semibold font-display text-secondary-900 dark:text-white">{feature.feature}</h4>
                <p className="mb-2 text-3xl font-bold font-display text-secondary-900 dark:text-white">{feature.count}</p>
                <p className="text-sm font-body text-secondary-500 dark:text-secondary-400">{feature.percentage.toFixed(1)}% usage</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Properties */}
      {analytics?.topProperties && analytics.topProperties.length > 0 && (
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-secondary-200/30 dark:border-secondary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-secondary">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display text-secondary-900 dark:text-white">Most Used Properties</h3>
          </div>
          <div className="space-y-4">
            {analytics.topProperties.slice(0, 5).map((prop, index) => (
              <div key={index} className="flex justify-between items-center p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-secondary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex-1">
                  <span className="font-semibold font-display text-secondary-900 dark:text-white">{prop.property}:</span>
                  <span className="ml-2 font-body text-secondary-600 dark:text-secondary-400">{prop.value}</span>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <div className="px-3 py-1 text-sm font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border-primary-200/30 dark:border-primary-500/20 font-display">
                    {prop.count} requests
                  </div>
                  <div className="px-3 py-1 text-xs font-medium rounded-full border shadow-lg backdrop-blur-xl glass bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30 dark:border-success-500/20 font-display">
                    ${prop.cost.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayDashboard;