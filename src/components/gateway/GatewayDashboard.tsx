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
} from 'lucide-react';
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
        <div className="space-y-6 animate-pulse">
          <div className="h-32 rounded-xl border glass border-primary-200/30"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-64 rounded-xl border glass border-primary-200/30"></div>
            <div className="h-64 rounded-xl border glass border-primary-200/30"></div>
            <div className="h-64 rounded-xl border glass border-primary-200/30"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-danger/20">
          <AlertTriangle className="w-8 h-8 text-danger-600 dark:text-danger-400" />
        </div>
        <h3 className="mb-3 text-xl font-bold font-display gradient-text-danger">Gateway Error</h3>
        <p className="mb-6 font-body text-light-text-secondary dark:text-dark-text-secondary">{error}</p>
        <button
          onClick={loadGatewayData}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="flex justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-primary">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-display gradient-text-primary">Gateway Analytics</h2>
        </div>
        <div className="flex gap-3 items-center">
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 text-center rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-primary-200/30 hover:scale-105">
          <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl shadow-lg bg-gradient-primary/20">
            <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="mb-2 text-3xl font-bold font-display gradient-text-primary">
            {analytics?.summary.totalRequests?.toLocaleString() || 0}
          </div>
          <p className="font-semibold font-display text-primary-700 dark:text-primary-300">Total Requests</p>
          <p className="mt-1 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">via Gateway</p>
        </div>

        <div className="p-6 text-center rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-success-200/30 hover:scale-105">
          <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl shadow-lg bg-gradient-success/20">
            <DollarSign className="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
          <div className="mb-2 text-3xl font-bold font-display gradient-text-success">
            ${analytics?.summary.totalCost?.toFixed(4) || '0.0000'}
          </div>
          <p className="font-semibold font-display text-success-700 dark:text-success-300">Total Cost</p>
          <p className="mt-1 text-sm font-body text-success-600 dark:text-success-400">
            ${analytics?.summary.cost_savings?.toFixed(4) || '0'} saved
          </p>
        </div>

        <div className="p-6 text-center rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-warning-200/30 hover:scale-105">
          <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl shadow-lg bg-gradient-warning/20">
            <Zap className="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>
          <div className="mb-2 text-3xl font-bold font-display gradient-text-warning">
            {analytics?.summary.cacheHitRate?.toFixed(1) || 0}%
          </div>
          <p className="font-semibold font-display text-warning-700 dark:text-warning-300">Cache Hit Rate</p>
          <p className="mt-1 text-sm font-body text-warning-600 dark:text-warning-400">
            {analytics?.cacheMetrics.totalHits || 0} hits
          </p>
        </div>

        <div className="p-6 text-center rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-accent-200/30 hover:scale-105">
          <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl shadow-lg bg-gradient-accent/20">
            <Clock className="w-6 h-6 text-accent-600 dark:text-accent-400" />
          </div>
          <div className="mb-2 text-3xl font-bold font-display gradient-text-accent">
            {analytics?.summary.averageLatency?.toFixed(0) || 0}ms
          </div>
          <p className="font-semibold font-display text-accent-700 dark:text-accent-300">Avg Latency</p>
          <p className="mt-1 text-sm font-body text-accent-600 dark:text-accent-400">Gateway overhead</p>
        </div>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-secondary">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display gradient-text-primary">System Status</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-success-200/30">
              <h4 className="mb-2 font-semibold font-display text-success-700 dark:text-success-300">Uptime</h4>
              <p className="text-2xl font-bold font-display gradient-text-success">{formatUptime(stats.uptime)}</p>
            </div>
            <div className="p-4 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-warning-200/30">
              <h4 className="mb-2 font-semibold font-display text-warning-700 dark:text-warning-300">Memory Usage</h4>
              <p className="text-2xl font-bold font-display gradient-text-warning">{formatBytes(stats.memoryUsage.heapUsed)}</p>
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">of {formatBytes(stats.memoryUsage.heapTotal)}</p>
            </div>
            <div className="p-4 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-accent-200/30">
              <h4 className="mb-2 font-semibold font-display text-accent-700 dark:text-accent-300">Cache Size</h4>
              <p className="text-2xl font-bold font-display gradient-text-accent">{stats.cacheSize} items</p>
            </div>
          </div>
        </div>
      )}

      {/* Provider Breakdown */}
      {analytics?.providerBreakdown && analytics.providerBreakdown.length > 0 && (
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-primary">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display gradient-text-primary">Provider Usage</h3>
          </div>
          <div className="space-y-6">
            {analytics.providerBreakdown.map((provider, index) => (
              <div key={index} className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold font-display gradient-text-primary">{provider.provider}</span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display">
                    {provider.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="mb-3 w-full h-3 rounded-full bg-gradient-secondary/20">
                  <div
                    className="h-3 rounded-full bg-gradient-primary"
                    style={{ width: `${provider.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display">
                    {provider.requests} requests
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-warning/20 text-warning-700 dark:text-warning-300 font-display">
                    ${provider.cost.toFixed(4)}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display">
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
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-success">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display gradient-text-success">Budget Utilization</h3>
          </div>
          <div className="space-y-6">
            {analytics.budgetUtilization.map((budget, index) => (
              <div key={index} className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-success-200/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold font-display gradient-text-primary">{budget.budgetName}</span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display">
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="mb-3 w-full h-3 rounded-full bg-gradient-secondary/20">
                  <div
                    className="h-3 rounded-full bg-gradient-success"
                    style={{ width: `${budget.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-warning/20 text-warning-700 dark:text-warning-300 font-display">
                    ${budget.utilized.toFixed(4)} used
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display">
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
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-accent-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-accent">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display gradient-text-accent">Features Usage</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {analytics.featuresUsage.map((feature, index) => (
              <div key={index} className="p-6 text-center rounded-lg border shadow-lg backdrop-blur-xl glass border-accent-200/30">
                <h4 className="mb-3 font-semibold font-display gradient-text-primary">{feature.feature}</h4>
                <p className="mb-2 text-3xl font-bold font-display gradient-text-accent">{feature.count}</p>
                <p className="text-sm font-body text-accent-600 dark:text-accent-400">{feature.percentage.toFixed(1)}% usage</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Properties */}
      {analytics?.topProperties && analytics.topProperties.length > 0 && (
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-secondary-200/30">
          <div className="flex gap-3 items-center mb-6">
            <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-secondary">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold font-display gradient-text-primary">Most Used Properties</h3>
          </div>
          <div className="space-y-4">
            {analytics.topProperties.slice(0, 5).map((prop, index) => (
              <div key={index} className="flex justify-between items-center p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-secondary-200/30">
                <div className="flex-1">
                  <span className="font-semibold font-display gradient-text-primary">{prop.property}:</span>
                  <span className="ml-2 font-body text-light-text-secondary dark:text-dark-text-secondary">{prop.value}</span>
                </div>
                <div className="text-right">
                  <div className="px-3 py-1 mb-1 text-sm font-medium rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display">
                    {prop.count} requests
                  </div>
                  <div className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display">
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