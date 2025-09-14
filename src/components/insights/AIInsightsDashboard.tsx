import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Brain, Target, Clock, DollarSign, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import NotebookService, { AIInsightsSummary, AnomalyDetection, CostOptimization, PredictiveForecast } from '../../services/notebook.service';

interface AIInsightsDashboardProps {
  timeframe?: string;
  className?: string;
}

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  timeframe = '24h',
  className = ''
}) => {
  const [insights, setInsights] = useState<AIInsightsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    loadInsights();
  }, [selectedTimeframe]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await NotebookService.getAIInsights(selectedTimeframe);
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'gradient-text-danger bg-gradient-to-br from-danger-50/50 to-danger-100/50 border-danger-200/30';
      case 'high': return 'gradient-text-warning bg-gradient-to-br from-warning-50/50 to-warning-100/50 border-warning-200/30';
      case 'medium': return 'gradient-text-accent bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30';
      case 'low': return 'gradient-text bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30';
      default: return 'text-light-text-primary dark:text-dark-text-primary bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertCircle;
      case 'medium': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'gradient-text-success bg-gradient-success/10 border border-success-200/30';
      case 'medium': return 'gradient-text-warning bg-gradient-warning/10 border border-warning-200/30';
      case 'low': return 'text-light-text-secondary dark:text-dark-text-secondary bg-gradient-secondary/10 border border-secondary-200/30';
      default: return 'text-light-text-secondary dark:text-dark-text-secondary bg-gradient-secondary/10 border border-secondary-200/30';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'gradient-text-success bg-gradient-success/10 border border-success-200/30';
      case 'medium': return 'gradient-text-warning bg-gradient-warning/10 border border-warning-200/30';
      case 'high': return 'gradient-text-danger bg-gradient-danger/10 border border-danger-200/30';
      default: return 'text-light-text-secondary dark:text-dark-text-secondary bg-gradient-secondary/10 border border-secondary-200/30';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'gradient-text-success bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30';
    if (score >= 60) return 'gradient-text-warning bg-gradient-to-br from-warning-50/50 to-warning-100/50 border-warning-200/30';
    if (score >= 40) return 'gradient-text-accent bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30';
    return 'gradient-text-danger bg-gradient-to-br from-danger-50/50 to-danger-100/50 border-danger-200/30';
  };

  if (loading) {
    return (
      <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner-lg text-primary-500 mb-4"></div>
            <div className="text-lg font-display font-semibold gradient-text">🧠 Generating AI insights...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 bg-gradient-danger/10 border border-danger-200/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center shadow-lg">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold gradient-text-danger">Error Loading Insights</span>
        </div>
        <p className="font-body text-danger-700 dark:text-danger-300 mb-6">{error}</p>
        <button
          onClick={loadInsights}
          className="btn-danger px-6 py-3 font-display font-semibold transition-all duration-300 hover:scale-105"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 shadow-2xl glow-secondary animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="text-lg font-display font-bold gradient-text mb-2">No Insights Available</div>
            <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Start using AI services to generate insights</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold gradient-text">🧠 AI-Powered Insights</h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="input px-4 py-2 font-display font-semibold"
            >
              <option value="1h">⏰ Last Hour</option>
              <option value="24h">📅 Last 24 Hours</option>
              <option value="7d">📊 Last 7 Days</option>
              <option value="30d">📈 Last 30 Days</option>
            </select>
            <button
              onClick={loadInsights}
              className="btn-primary px-6 py-2 font-display font-semibold transition-all duration-300 hover:scale-105"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Health Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`card card-hover p-6 border ${getHealthScoreColor(insights.overall_health_score)} text-center`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-display font-bold">{insights.overall_health_score}</div>
          </div>
          <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">🎯 Health Score</div>
        </div>
        <div className="card card-hover p-6 bg-gradient-to-br from-danger-50/50 to-danger-100/50 border-danger-200/30 text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-display font-bold gradient-text-danger">{insights.anomalies.length}</div>
          </div>
          <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">⚠️ Anomalies</div>
        </div>
        <div className="card card-hover p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30 text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-display font-bold gradient-text-success">{insights.optimizations.length}</div>
          </div>
          <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">⚡ Optimizations</div>
        </div>
        <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30 text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-display font-bold gradient-text">{insights.forecasts.length}</div>
          </div>
          <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">📈 Forecasts</div>
        </div>
      </div>

      {/* Key Insights */}
      {insights.key_insights.length > 0 && (
        <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text">💡 Key Insights</h3>
          </div>
          <div className="space-y-4">
            {insights.key_insights.map((insight, index) => (
              <div key={index} className="glass p-4 rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-primary rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <p className="font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Actions */}
      {insights.priority_actions.length > 0 && (
        <div className="card p-8 bg-gradient-warning/10 border border-warning-200/30 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center mr-4 shadow-lg glow-warning">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text-warning">🎯 Priority Actions</h3>
          </div>
          <div className="space-y-4">
            {insights.priority_actions.map((action, index) => (
              <div key={index} className="glass p-4 rounded-xl border border-warning-200/30 hover:bg-warning-500/5 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-warning text-white rounded-xl flex items-center justify-center text-sm font-display font-bold flex-shrink-0 shadow-lg">
                    {index + 1}
                  </div>
                  <p className="font-body text-warning-800 dark:text-warning-200 leading-relaxed">{action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {insights.anomalies.length > 0 && (
        <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center mr-4 shadow-lg glow-danger">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text">⚠️ Anomaly Detection</h3>
          </div>
          <div className="space-y-6">
            {insights.anomalies.map((anomaly) => {
              const SeverityIcon = getSeverityIcon(anomaly.severity);
              return (
                <div key={anomaly.id} className={`card card-hover p-6 border ${getSeverityColor(anomaly.severity)} transition-all duration-300 hover:scale-105`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                        <SeverityIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-display font-bold text-lg text-light-text-primary dark:text-dark-text-primary mb-2">{anomaly.description}</div>
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-2">
                          📊 Type: {anomaly.type.replace('_', ' ')} •
                          🕒 Detected: {new Date(anomaly.detected_at).toLocaleString()}
                        </div>
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          📈 Current: {anomaly.metrics.current_value.toFixed(2)} •
                          🎯 Expected: {anomaly.metrics.expected_value.toFixed(2)} •
                          📊 Deviation: {anomaly.metrics.deviation_percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-display font-bold ${getSeverityColor(anomaly.severity)} shadow-lg`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  {anomaly.recommendations.length > 0 && (
                    <div className="glass p-4 rounded-xl border border-primary-200/30 mt-4">
                      <div className="text-sm font-display font-bold gradient-text mb-3">💡 Recommendations:</div>
                      <div className="space-y-2">
                        {anomaly.recommendations.slice(0, 2).map((rec, index) => (
                          <div key={index} className="text-sm font-body text-light-text-primary dark:text-dark-text-primary flex items-start">
                            <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3 mt-2 flex-shrink-0 shadow-lg"></div>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cost Optimizations */}
      {insights.optimizations.length > 0 && (
        <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg glow-success">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text">⚡ Cost Optimization Opportunities</h3>
          </div>
          <div className="space-y-6">
            {insights.optimizations.map((optimization) => (
              <div key={optimization.id} className="card card-hover p-6 border border-primary-200/30 transition-all duration-300 hover:scale-105">
                <div className="mb-4">
                  <div className="font-display font-bold text-xl text-light-text-primary dark:text-dark-text-primary mb-2">{optimization.title}</div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">{optimization.description}</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 glass p-3 rounded-xl border border-success-200/30">
                      <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                        <DollarSign className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-display font-bold gradient-text-success">
                        ${optimization.potential_savings.amount_usd.toFixed(2)}
                        ({optimization.potential_savings.percentage}%)
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-display font-bold ${getImpactColor(optimization.impact)} shadow-lg`}>
                      {optimization.impact} impact
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-display font-bold ${getEffortColor(optimization.implementation_effort)} shadow-lg`}>
                      {optimization.implementation_effort} effort
                    </span>
                  </div>
                </div>
                {optimization.steps.length > 0 && (
                  <div className="glass p-4 rounded-xl border border-primary-200/30 mt-4">
                    <div className="text-sm font-display font-bold gradient-text mb-3">🛠️ Implementation Steps:</div>
                    <div className="space-y-2">
                      {optimization.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="text-sm font-body text-light-text-primary dark:text-dark-text-primary flex items-start">
                          <div className="w-6 h-6 bg-gradient-primary text-white rounded-lg flex items-center justify-center text-xs font-display font-bold mr-3 mt-0.5 flex-shrink-0 shadow-lg">
                            {index + 1}
                          </div>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictive Forecasts */}
      {insights.forecasts.length > 0 && (
        <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text">📈 Predictive Forecasts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.forecasts.map((forecast) => (
              <div key={forecast.id} className="card card-hover p-6 border border-primary-200/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display font-bold text-lg gradient-text capitalize">
                    {forecast.forecast_type} Forecast
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                    <span className="text-xl">{getTrendIcon(forecast.trends.direction)}</span>
                  </div>
                </div>
                <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-4 glass p-3 rounded-xl border border-primary-200/30">
                  📊 Trend: {forecast.trends.direction} • ⏰ {forecast.timeframe}
                </div>
                <div className="space-y-2">
                  {forecast.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="text-sm font-body text-light-text-primary dark:text-dark-text-primary flex items-start">
                      <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3 mt-2 flex-shrink-0 shadow-lg"></div>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsDashboard;

