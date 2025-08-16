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
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
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
      case 'high': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
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
    if (score >= 80) return 'text-green-700 bg-green-100';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100';
    if (score >= 40) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Generating AI insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error Loading Insights</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={loadInsights}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No insights available</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={loadInsights}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Health Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${getHealthScoreColor(insights.overall_health_score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{insights.overall_health_score}</div>
              <div className="text-sm font-medium">Health Score</div>
            </div>
            <Target className="w-8 h-8 opacity-60" />
          </div>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-700">{insights.anomalies.length}</div>
              <div className="text-sm font-medium text-red-600">Anomalies</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">{insights.optimizations.length}</div>
              <div className="text-sm font-medium text-green-600">Optimizations</div>
            </div>
            <Zap className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{insights.forecasts.length}</div>
              <div className="text-sm font-medium text-blue-600">Forecasts</div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {insights.key_insights.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Key Insights
          </h3>
          <div className="space-y-2">
            {insights.key_insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Actions */}
      {insights.priority_actions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-600" />
            Priority Actions
          </h3>
          <div className="space-y-2">
            {insights.priority_actions.map((action, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-yellow-800">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {insights.anomalies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Anomaly Detection
          </h3>
          <div className="space-y-4">
            {insights.anomalies.map((anomaly) => {
              const SeverityIcon = getSeverityIcon(anomaly.severity);
              return (
                <div key={anomaly.id} className={`p-4 border rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <SeverityIcon className="w-5 h-5 mt-0.5" />
                      <div>
                        <div className="font-medium">{anomaly.description}</div>
                        <div className="text-sm mt-1">
                          Type: {anomaly.type.replace('_', ' ')} • 
                          Detected: {new Date(anomaly.detected_at).toLocaleString()}
                        </div>
                        <div className="text-sm mt-1">
                          Current: {anomaly.metrics.current_value.toFixed(2)} • 
                          Expected: {anomaly.metrics.expected_value.toFixed(2)} • 
                          Deviation: {anomaly.metrics.deviation_percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  {anomaly.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <div className="text-sm font-medium mb-1">Recommendations:</div>
                      <div className="space-y-1">
                        {anomaly.recommendations.slice(0, 2).map((rec, index) => (
                          <div key={index} className="text-sm">• {rec}</div>
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            Cost Optimization Opportunities
          </h3>
          <div className="space-y-4">
            {insights.optimizations.map((optimization) => (
              <div key={optimization.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{optimization.title}</div>
                    <div className="text-gray-600 text-sm mt-1">{optimization.description}</div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          ${optimization.potential_savings.amount_usd.toFixed(2)} 
                          ({optimization.potential_savings.percentage}%)
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(optimization.impact)}`}>
                        {optimization.impact} impact
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(optimization.implementation_effort)}`}>
                        {optimization.implementation_effort} effort
                      </span>
                    </div>
                  </div>
                </div>
                {optimization.steps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-900 mb-2">Implementation Steps:</div>
                    <div className="space-y-1">
                      {optimization.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {index + 1}. {step}
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Predictive Forecasts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.forecasts.map((forecast) => (
              <div key={forecast.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 capitalize">
                    {forecast.forecast_type} Forecast
                  </div>
                  <span className="text-2xl">{getTrendIcon(forecast.trends.direction)}</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Trend: {forecast.trends.direction} • {forecast.timeframe}
                </div>
                <div className="space-y-1">
                  {forecast.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="text-sm text-gray-700">• {rec}</div>
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

