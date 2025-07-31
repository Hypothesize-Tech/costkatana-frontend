import React, { useState, useEffect } from 'react';
import { GatewayService, GatewayAnalytics, GatewayStats } from '../../services/gateway.service';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gateway Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadGatewayData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gateway Analytics</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {health?.status === 'healthy' ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.summary.totalRequests?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">via Gateway</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${analytics?.summary.totalCost?.toFixed(4) || '0.0000'}
            </div>
            <p className="text-sm text-green-600 mt-1">
              ${analytics?.summary.cost_savings?.toFixed(4) || '0'} saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.summary.cacheHitRate?.toFixed(1) || 0}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {analytics?.cacheMetrics.totalHits || 0} hits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.summary.averageLatency?.toFixed(0) || 0}ms
            </div>
            <p className="text-sm text-gray-600 mt-1">Gateway overhead</p>
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Uptime</h4>
                <p className="text-lg font-semibold">{formatUptime(stats.uptime)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Memory Usage</h4>
                <p className="text-lg font-semibold">{formatBytes(stats.memoryUsage.heapUsed)}</p>
                <p className="text-sm text-gray-500">of {formatBytes(stats.memoryUsage.heapTotal)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Cache Size</h4>
                <p className="text-lg font-semibold">{stats.cacheSize} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Breakdown */}
      {analytics?.providerBreakdown && analytics.providerBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.providerBreakdown.map((provider, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{provider.provider}</span>
                      <span className="text-sm text-gray-600">{provider.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${provider.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{provider.requests} requests</span>
                      <span>${provider.cost.toFixed(4)}</span>
                      <span>{provider.averageLatency > 0 ? `${provider.averageLatency.toFixed(0)}ms avg` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Utilization */}
      {analytics?.budgetUtilization && analytics.budgetUtilization.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.budgetUtilization.map((budget, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{budget.budgetName}</span>
                      <span className="text-sm text-gray-600">{budget.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${budget.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>${budget.utilized.toFixed(4)} used</span>
                      <span>${budget.total.toFixed(4)} total</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Usage */}
      {analytics?.featuresUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Features Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.featuresUsage.map((feature, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{feature.feature}</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{feature.count}</p>
                  <p className="text-sm text-gray-600">{feature.percentage.toFixed(1)}% usage</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Properties */}
      {analytics?.topProperties && analytics.topProperties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Used Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProperties.slice(0, 5).map((prop, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="font-medium text-gray-900">{prop.property}:</span>
                    <span className="text-gray-600 ml-1">{prop.value}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{prop.count} requests</div>
                    <div className="text-xs text-gray-500">${prop.cost.toFixed(4)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GatewayDashboard;