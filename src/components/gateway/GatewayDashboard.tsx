import React, { useState, useEffect } from 'react';
import { GatewayService, GatewayAnalytics, GatewayStats } from '../../services/gateway.service';

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
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 glass rounded-xl border border-primary-200/30"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 glass rounded-xl border border-primary-200/30"></div>
            <div className="h-64 glass rounded-xl border border-primary-200/30"></div>
            <div className="h-64 glass rounded-xl border border-primary-200/30"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gradient-danger/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-display font-bold gradient-text-danger mb-3">Gateway Error</h3>
        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">{error}</p>
        <button
          onClick={loadGatewayData}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🌐</span>
          </div>
          <h2 className="text-3xl font-display font-bold gradient-text-primary">Gateway Analytics</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${health?.status === 'healthy' ? 'bg-gradient-success' : 'bg-gradient-danger'}`}></div>
          <span className={`px-3 py-1 rounded-full font-display font-medium ${health?.status === 'healthy'
            ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
            : 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
            }`}>
            {health?.status === 'healthy' ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl border border-primary-200/30 text-center shadow-lg backdrop-blur-xl hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-display font-bold gradient-text-primary mb-2">
            {analytics?.summary.totalRequests?.toLocaleString() || 0}
          </div>
          <p className="font-display font-semibold text-primary-700 dark:text-primary-300">Total Requests</p>
          <p className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">via Gateway</p>
        </div>

        <div className="glass p-6 rounded-xl border border-success-200/30 text-center shadow-lg backdrop-blur-xl hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-success/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-display font-bold gradient-text-success mb-2">
            ${analytics?.summary.totalCost?.toFixed(4) || '0.0000'}
          </div>
          <p className="font-display font-semibold text-success-700 dark:text-success-300">Total Cost</p>
          <p className="font-body text-sm text-success-600 dark:text-success-400 mt-1">
            ${analytics?.summary.cost_savings?.toFixed(4) || '0'} saved
          </p>
        </div>

        <div className="glass p-6 rounded-xl border border-warning-200/30 text-center shadow-lg backdrop-blur-xl hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-warning/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-display font-bold gradient-text-warning mb-2">
            {analytics?.summary.cacheHitRate?.toFixed(1) || 0}%
          </div>
          <p className="font-display font-semibold text-warning-700 dark:text-warning-300">Cache Hit Rate</p>
          <p className="font-body text-sm text-warning-600 dark:text-warning-400 mt-1">
            {analytics?.cacheMetrics.totalHits || 0} hits
          </p>
        </div>

        <div className="glass p-6 rounded-xl border border-accent-200/30 text-center shadow-lg backdrop-blur-xl hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-accent/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-3xl font-display font-bold gradient-text-accent mb-2">
            {analytics?.summary.averageLatency?.toFixed(0) || 0}ms
          </div>
          <p className="font-display font-semibold text-accent-700 dark:text-accent-300">Avg Latency</p>
          <p className="font-body text-sm text-accent-600 dark:text-accent-400 mt-1">Gateway overhead</p>
        </div>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">💻</span>
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">System Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-4 rounded-lg border border-success-200/30 shadow-lg backdrop-blur-xl text-center">
              <h4 className="font-display font-semibold text-success-700 dark:text-success-300 mb-2">Uptime</h4>
              <p className="text-2xl font-display font-bold gradient-text-success">{formatUptime(stats.uptime)}</p>
            </div>
            <div className="glass p-4 rounded-lg border border-warning-200/30 shadow-lg backdrop-blur-xl text-center">
              <h4 className="font-display font-semibold text-warning-700 dark:text-warning-300 mb-2">Memory Usage</h4>
              <p className="text-2xl font-display font-bold gradient-text-warning">{formatBytes(stats.memoryUsage.heapUsed)}</p>
              <p className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">of {formatBytes(stats.memoryUsage.heapTotal)}</p>
            </div>
            <div className="glass p-4 rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl text-center">
              <h4 className="font-display font-semibold text-accent-700 dark:text-accent-300 mb-2">Cache Size</h4>
              <p className="text-2xl font-display font-bold gradient-text-accent">{stats.cacheSize} items</p>
            </div>
          </div>
        </div>
      )}

      {/* Provider Breakdown */}
      {analytics?.providerBreakdown && analytics.providerBreakdown.length > 0 && (
        <div className="glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🎯</span>
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">Provider Usage</h3>
          </div>
          <div className="space-y-6">
            {analytics.providerBreakdown.map((provider, index) => (
              <div key={index} className="glass p-4 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-semibold gradient-text-primary">{provider.provider}</span>
                  <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium text-sm">
                    {provider.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gradient-secondary/20 rounded-full h-3 mb-3">
                  <div
                    className="bg-gradient-primary h-3 rounded-full"
                    style={{ width: `${provider.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="px-2 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-medium text-xs">
                    {provider.requests} requests
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gradient-warning/20 text-warning-700 dark:text-warning-300 font-display font-medium text-xs">
                    ${provider.cost.toFixed(4)}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display font-medium text-xs">
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
        <div className="glass p-6 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">💰</span>
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-success">Budget Utilization</h3>
          </div>
          <div className="space-y-6">
            {analytics.budgetUtilization.map((budget, index) => (
              <div key={index} className="glass p-4 rounded-lg border border-success-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-semibold gradient-text-primary">{budget.budgetName}</span>
                  <span className="px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-medium text-sm">
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gradient-secondary/20 rounded-full h-3 mb-3">
                  <div
                    className="bg-gradient-success h-3 rounded-full"
                    style={{ width: `${budget.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="px-2 py-1 rounded-full bg-gradient-warning/20 text-warning-700 dark:text-warning-300 font-display font-medium text-xs">
                    ${budget.utilized.toFixed(4)} used
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium text-xs">
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
        <div className="glass p-6 rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">⚙️</span>
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-accent">Features Usage</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analytics.featuresUsage.map((feature, index) => (
              <div key={index} className="glass p-6 rounded-lg border border-accent-200/30 shadow-lg backdrop-blur-xl text-center">
                <h4 className="font-display font-semibold gradient-text-primary mb-3">{feature.feature}</h4>
                <p className="text-3xl font-display font-bold gradient-text-accent mb-2">{feature.count}</p>
                <p className="font-body text-sm text-accent-600 dark:text-accent-400">{feature.percentage.toFixed(1)}% usage</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Properties */}
      {analytics?.topProperties && analytics.topProperties.length > 0 && (
        <div className="glass p-6 rounded-xl border border-secondary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🏷️</span>
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary">Most Used Properties</h3>
          </div>
          <div className="space-y-4">
            {analytics.topProperties.slice(0, 5).map((prop, index) => (
              <div key={index} className="glass p-4 rounded-lg border border-secondary-200/30 shadow-lg backdrop-blur-xl flex items-center justify-between">
                <div className="flex-1">
                  <span className="font-display font-semibold gradient-text-primary">{prop.property}:</span>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary ml-2">{prop.value}</span>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium text-sm mb-1">
                    {prop.count} requests
                  </div>
                  <div className="px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-medium text-xs">
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