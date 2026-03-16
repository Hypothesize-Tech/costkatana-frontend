import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  BarChart3,
  DollarSign,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  RotateCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
} from 'lucide-react';
import { CostChart } from '../dashboard/CostChart';
import { StatsCard } from '../dashboard/StatsCard';
import { GatewayService, GatewayAnalytics, GatewayStats } from '../../services/gateway.service';
import { GatewayShimmer } from '../shimmer/GatewayShimmer';

interface GatewayDashboardProps {
  projectId?: string;
}

type GatewayTab = 'overview' | 'providers' | 'projects' | 'budget';

export const GatewayDashboard: React.FC<GatewayDashboardProps> = ({ projectId }) => {
  const [analytics, setAnalytics] = useState<GatewayAnalytics | null>(null);
  const [stats, setStats] = useState<GatewayStats | null>(null);
  const [health, setHealth] = useState<{ status: string; service?: string; timestamp?: string; version?: string; cacheSize?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<GatewayTab>('overview');

  const loadGatewayData = useCallback(async () => {
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
  }, [projectId]);

  useEffect(() => {
    loadGatewayData();
  }, [loadGatewayData]);

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

  const getUtilizationColor = (percentage: number): string => {
    if (percentage < 70) return 'bg-gradient-success';
    if (percentage < 90) return 'bg-gradient-warning';
    return 'bg-gradient-danger';
  };

  if (loading) {
    return <GatewayShimmer />;
  }

  if (error) {
    return (
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-danger shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="mb-1.5 sm:mb-2 text-lg sm:text-xl font-bold font-display text-danger-900 dark:text-danger-100">Gateway Error</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base font-body text-danger-700 dark:text-danger-300">{error}</p>
            <button
              onClick={loadGatewayData}
              className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 btn btn-primary glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-danger hover:bg-gradient-danger/90 font-display"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: GatewayTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'providers', label: 'Providers', icon: Globe },
    { key: 'projects', label: 'Projects', icon: Target },
    { key: 'budget', label: 'Budget', icon: DollarSign },
  ];

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <header className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
        <div className="p-3 sm:p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-primary shrink-0">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display gradient-text-primary">Gateway Analytics</h1>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full lg:w-auto">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0 ${health?.status === 'healthy' ? 'bg-gradient-success' : 'bg-gradient-danger'}`} />
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full font-display font-medium ${health?.status === 'healthy'
                ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
                : 'bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                }`}>
                {health?.status === 'healthy' ? 'Online' : 'Offline'}
              </span>
              {stats && (
                <>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-mono font-medium rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-primary-50/30 dark:bg-primary-900/20 text-secondary-700 dark:text-secondary-300">
                    Uptime: {formatUptime(stats.uptime)}
                  </span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-mono font-medium rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-primary-50/30 dark:bg-primary-900/20 text-secondary-700 dark:text-secondary-300">
                    RAM: {formatBytes(stats.memoryUsage.heapUsed)}
                  </span>
                </>
              )}
              <button
                onClick={loadGatewayData}
                disabled={loading}
                className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-lg backdrop-blur-xl transition-all duration-200 border border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-display"
              >
                <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
          <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">Real-time gateway performance metrics and analytics</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Requests"
          value={analytics?.summary.totalRequests ?? 0}
          format="number"
          icon={BarChart3}
        />
        <StatsCard
          title="Total Cost"
          value={analytics?.summary.totalCost ?? 0}
          format="currency"
          icon={DollarSign}
        />
        <StatsCard
          title="Total Tokens"
          value={analytics?.summary.totalTokens ?? 0}
          format="number"
          icon={Zap}
        />
        <StatsCard
          title="Cache Hit Rate"
          value={analytics?.summary.cacheHitRate ?? 0}
          format="percentage"
          icon={Zap}
        />
        <StatsCard
          title="Avg Latency (ms)"
          value={analytics?.summary.averageLatency ?? 0}
          format="number"
          icon={Clock}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-semibold text-xs transition-all duration-300 shrink-0 ${activeTab === key
              ? 'bg-gradient-primary text-white shadow-xl scale-105'
              : 'glass hover:bg-primary-500/10 dark:hover:bg-primary-500/10 text-secondary-600 dark:text-secondary-300 border border-primary-200/30 dark:border-primary-500/20 hover:text-secondary-900 dark:hover:text-white'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${activeTab === key ? 'text-white' : ''}`} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-3 sm:space-y-4">
          {analytics?.timeline && analytics.timeline.length > 0 && (
            <div className="p-3 sm:p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white mb-3 sm:mb-4">Usage Over Time</h3>
              <CostChart
                data={analytics.timeline.map((t) => ({
                  date: t.date,
                  cost: t.cost,
                  tokens: t.tokens ?? 0,
                  calls: t.requests ?? 0,
                }))}
              />
            </div>
          )}
          {analytics?.trends && (analytics.trends.costTrend !== 'stable' || analytics.trends.tokenTrend !== 'stable' || (analytics.trends.insights?.length ?? 0) > 0) && (
            <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-to-br from-accent-50/20 to-accent-100/20 dark:from-accent-900/10 dark:to-accent-800/10">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-lg border border-primary-200/30 dark:border-primary-500/20 font-display">
                  {analytics.trends.costTrend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-success-500" /> : analytics.trends.costTrend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-warning-500" /> : <Minus className="w-3.5 h-3.5 text-secondary-500" />}
                  Cost: {analytics.trends.costTrend}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-lg border border-primary-200/30 dark:border-primary-500/20 font-display">
                  {analytics.trends.tokenTrend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-success-500" /> : analytics.trends.tokenTrend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-warning-500" /> : <Minus className="w-3.5 h-3.5 text-secondary-500" />}
                  Tokens: {analytics.trends.tokenTrend}
                </span>
              </div>
              {analytics.trends.insights && analytics.trends.insights.length > 0 && (
                <div className="space-y-2">
                  {analytics.trends.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-2 p-3 rounded-lg border border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                      <Lightbulb className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                      <p className="text-sm font-body text-secondary-700 dark:text-secondary-300">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                <h4 className="text-xs font-semibold font-display text-secondary-600 dark:text-secondary-400 mb-1">Uptime</h4>
                <p className="text-sm font-mono font-bold text-secondary-900 dark:text-white">{formatUptime(stats.uptime)}</p>
              </div>
              <div className="p-3 rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                <h4 className="text-xs font-semibold font-display text-secondary-600 dark:text-secondary-400 mb-1">Memory</h4>
                <p className="text-sm font-mono font-bold text-secondary-900 dark:text-white">{formatBytes(stats.memoryUsage.heapUsed)}</p>
              </div>
              <div className="p-3 rounded-lg border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                <h4 className="text-xs font-semibold font-display text-secondary-600 dark:text-secondary-400 mb-1">Cache</h4>
                <p className="text-sm font-mono font-bold text-secondary-900 dark:text-white">{stats.cacheSize} items</p>
              </div>
            </div>
          )}
          {analytics?.topProperties && analytics.topProperties.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-secondary-200/30 dark:border-secondary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white mb-3">Most Used Properties</h3>
              <div className="divide-y divide-secondary-200/50 dark:divide-secondary-700/50">
                {analytics.topProperties.slice(0, 5).map((prop, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <span className="text-sm font-semibold font-display text-secondary-900 dark:text-white">{prop.property}: </span>
                      <span className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400 truncate">{prop.value}</span>
                    </div>
                    <div className="flex gap-2 text-xs font-mono">
                      <span className="text-primary-600 dark:text-primary-400">{prop.count} req</span>
                      <span className="text-success-600 dark:text-success-400">${prop.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="space-y-3 sm:space-y-4">
          {analytics?.providerBreakdown && analytics.providerBreakdown.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white mb-3 sm:mb-4">Provider Usage</h3>
              <div className="divide-y divide-secondary-200/50 dark:divide-secondary-700/50">
                {analytics.providerBreakdown.map((provider, index) => (
                  <div key={index} className="py-3 first:pt-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold font-display text-secondary-900 dark:text-white truncate">{provider.provider}</span>
                      <span className="text-xs font-mono text-secondary-600 dark:text-secondary-400 shrink-0 ml-2">{provider.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="mb-2 w-full h-2 rounded-full bg-secondary-200/50 dark:bg-secondary-700/50 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(provider.percentage)}`}
                        style={{ width: `${Math.min(provider.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <span className="text-primary-600 dark:text-primary-400">{provider.requests} req</span>
                      <span className="text-success-600 dark:text-success-400">${provider.cost.toFixed(4)}</span>
                      {provider.averageLatency > 0 && (
                        <span className="text-accent-600 dark:text-accent-400">{provider.averageLatency.toFixed(0)}ms avg</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {analytics?.modelBreakdown && analytics.modelBreakdown.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white mb-3">Model Usage</h3>
              <div className="divide-y divide-secondary-200/50 dark:divide-secondary-700/50">
                {analytics.modelBreakdown.map((model, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-semibold font-display text-secondary-900 dark:text-white truncate">{model.model}</span>
                    <div className="flex gap-3 text-xs font-mono">
                      <span className="text-success-600 dark:text-success-400">${model.totalCost?.toFixed(4) || '0.0000'}</span>
                      <span className="text-primary-600 dark:text-primary-400">{model.totalRequests || 0} req</span>
                      <span className="text-secondary-500 dark:text-secondary-400">{(model.totalTokens || 0).toLocaleString()} tok</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(!analytics?.providerBreakdown || analytics.providerBreakdown.length === 0) &&
            (!analytics?.modelBreakdown || analytics.modelBreakdown.length === 0) && (
            <div className="p-6 sm:p-8 rounded-xl border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
              <Globe className="w-12 h-12 mx-auto mb-3 text-secondary-400" />
              <p className="text-sm font-body text-secondary-600 dark:text-secondary-400">No provider or model data available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-3 sm:space-y-4">
          {analytics?.projectBreakdown && analytics.projectBreakdown.length > 0 ? (
            <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white mb-3">Project Breakdown</h3>
              <div className="divide-y divide-secondary-200/50 dark:divide-secondary-700/50">
                {analytics.projectBreakdown.map((project, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-semibold font-display text-secondary-900 dark:text-white truncate">{project.projectName}</span>
                    <div className="flex gap-3 text-xs font-mono">
                      <span className="text-success-600 dark:text-success-400">${project.totalCost?.toFixed(4) || '0.0000'}</span>
                      <span className="text-primary-600 dark:text-primary-400">{project.totalRequests || 0} req</span>
                      <span className="text-secondary-500 dark:text-secondary-400">{(project.totalTokens || 0).toLocaleString()} tok</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-xl border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
              <Target className="w-12 h-12 mx-auto mb-3 text-secondary-400" />
              <p className="text-sm font-body text-secondary-600 dark:text-secondary-400">No project breakdown data available yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-3 sm:space-y-4">
          {analytics?.budgetUtilization && analytics.budgetUtilization.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white mb-3 sm:mb-4">Budget Utilization</h3>
              <div className="divide-y divide-secondary-200/50 dark:divide-secondary-700/50">
                {analytics.budgetUtilization.map((budget, index) => (
                  <div key={index} className="py-3 first:pt-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold font-display text-secondary-900 dark:text-white truncate">{budget.budgetName}</span>
                      <span className="text-xs font-mono shrink-0 ml-2">{budget.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="mb-2 w-full h-2 rounded-full bg-secondary-200/50 dark:bg-secondary-700/50 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(budget.percentage)}`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <span className="text-secondary-600 dark:text-secondary-400">${budget.utilized.toFixed(4)} used</span>
                      <span className="text-secondary-500 dark:text-secondary-400">${budget.total.toFixed(4)} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {analytics?.featuresUsage && analytics.featuresUsage.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white mb-3">Features Usage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {analytics.featuresUsage.map((feature, index) => (
                  <div key={index} className="p-3 rounded-lg border border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                    <h4 className="text-xs font-semibold font-display text-secondary-900 dark:text-white truncate mb-1">{feature.feature}</h4>
                    <p className="text-lg font-bold font-display text-secondary-900 dark:text-white">{feature.count}</p>
                    <p className="text-xs font-body text-secondary-500 dark:text-secondary-400">{feature.percentage.toFixed(1)}% usage</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(!analytics?.budgetUtilization || analytics.budgetUtilization.length === 0) &&
            (!analytics?.featuresUsage || analytics.featuresUsage.length === 0) && (
            <div className="p-6 sm:p-8 rounded-xl border border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-secondary-400" />
              <p className="text-sm font-body text-secondary-600 dark:text-secondary-400">No budget or features data available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GatewayDashboard;