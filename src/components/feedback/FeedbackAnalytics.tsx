import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks';
import { apiClient } from '../../config/api';
import { FeedbackAnalyticsShimmer } from '../shimmer/FeedbackAnalyticsShimmer';

interface FeedbackAnalyticsProps {
  className?: string;
}

interface FeedbackAnalytics {
  totalRequests: number;
  ratedRequests: number;
  positiveRatings: number;
  negativeRatings: number;
  totalCost: number;
  positiveCost: number;
  negativeCost: number;
  averageRating: number;
  costPerPositiveRating: number;
  costPerNegativeRating: number;
  ratingsByProvider: Record<string, ProviderRatings>;
  ratingsByModel: Record<string, ModelRatings>;
  ratingsByFeature: Record<string, FeatureRatings>;
  implicitSignalsAnalysis: ImplicitSignalsAnalysis;
  insights?: FeedbackInsights;
}

interface ProviderRatings {
  positive: number;
  negative: number;
  cost: number;
}

interface ModelRatings {
  positive: number;
  negative: number;
  cost: number;
}

interface FeatureRatings {
  positive: number;
  negative: number;
  cost: number;
}

interface ImplicitSignalsAnalysis {
  copyRate: number;
  continuationRate: number;
  rephraseRate: number;
  codeAcceptanceRate: number;
  averageSessionDuration: number;
}

interface FeedbackInsights {
  wastedSpendPercentage: number;
  returnOnAISpend: number;
  costEfficiencyScore: number;
  recommendations: string[];
}

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ className = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFeedbackAnalytics();
    }
  }, [isAuthenticated, user]);

  const fetchFeedbackAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/analytics/feedback');
      setAnalytics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 ${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <InformationCircleIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-display font-bold gradient-text-primary mb-4">Authentication Required</h3>
          <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
            Please log in to view your Return on AI Spend analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <FeedbackAnalyticsShimmer className={className} />;
  }

  if (error) {
    return (
      <div className={`glass rounded-xl border border-danger-200/30 shadow-2xl backdrop-blur-xl bg-gradient-danger/10 p-8 ${className}`}>
        <div className="flex items-center text-danger-600 dark:text-danger-400 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center mr-4 shadow-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-semibold">Error loading feedback analytics: {error}</span>
        </div>
        <button
          onClick={fetchFeedbackAnalytics}
          className="btn-danger px-6 py-3 font-display font-semibold transition-all duration-300 hover:scale-105"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!analytics || analytics.totalRequests === 0) {
    return (
      <div className={`glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 ${className}`}>
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <InformationCircleIcon className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-display font-bold gradient-text-primary mb-4">No Feedback Data</h3>
          <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
            Start collecting user feedback to see Return on AI Spend analytics here.
          </p>
        </div>
      </div>
    );
  }

  const wastedPercentage = analytics.totalCost > 0 ?
    (analytics.negativeCost / analytics.totalCost * 100) : 0;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg">
            <ChartBarIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold gradient-text-primary">Return on AI Spend Analytics</h2>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-display font-bold gradient-text-primary mb-2">
              {analytics.totalRequests}
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total Requests</div>
          </div>

          <div className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-display font-bold gradient-text-success mb-2">
              {(analytics.averageRating * 100).toFixed(1)}%
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Satisfaction Rate</div>
          </div>

          <div className="glass rounded-xl border border-secondary-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-display font-bold gradient-text-secondary mb-2">
              ${analytics.totalCost.toFixed(4)}
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Total Spend</div>
          </div>

          <div className="glass rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className={`text-4xl font-display font-bold mb-2 ${wastedPercentage > 20 ? 'gradient-text-danger' : wastedPercentage > 10 ? 'gradient-text-warning' : 'gradient-text-success'}`}>
              {wastedPercentage.toFixed(1)}%
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Wasted Spend</div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg">
            <CurrencyDollarIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-2xl font-display font-bold gradient-text-primary">
            Cost vs Value Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg">
                  <HandThumbUpIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-success-700 dark:text-success-300 text-lg">Positive Responses</div>
                  <div className="text-sm font-medium text-success-600 dark:text-success-400">{analytics.positiveRatings} responses</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-bold gradient-text-success">
                  ${analytics.positiveCost.toFixed(4)}
                </div>
                <div className="text-sm font-medium text-success-600 dark:text-success-400">
                  ${analytics.costPerPositiveRating.toFixed(4)} avg
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl border border-danger-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-danger-50/50 to-danger-100/50 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-danger flex items-center justify-center mr-4 shadow-lg">
                  <HandThumbDownIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-danger-700 dark:text-danger-300 text-lg">Negative Responses</div>
                  <div className="text-sm font-medium text-danger-600 dark:text-danger-400">{analytics.negativeRatings} responses</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-bold gradient-text-danger">
                  ${analytics.negativeCost.toFixed(4)}
                </div>
                <div className="text-sm font-medium text-danger-600 dark:text-danger-400">
                  ${analytics.costPerNegativeRating.toFixed(4)} avg
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      {analytics.insights && (
        <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text-primary">
              AI-Powered Insights & Recommendations
            </h3>
          </div>

          <div className="space-y-4">
            {analytics.insights.recommendations.map((recommendation, index) => (
              <div key={index} className="glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl hover:bg-primary-500/5 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0 mt-1">
                    <InformationCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <p className="font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Performance */}
      {Object.keys(analytics.ratingsByFeature).length > 0 && (
        <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text-primary">Feature Performance</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(analytics.ratingsByFeature).map(([feature, stats]) => {
              const total = stats.positive + stats.negative;
              const satisfaction = total > 0 ? (stats.positive / total * 100) : 0;
              const avgCost = total > 0 ? (stats.cost / total) : 0;

              return (
                <div key={feature} className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6 hover:bg-primary-500/5 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-light-text-primary dark:text-dark-text-primary text-lg capitalize">
                        {feature.replace(/-/g, ' ')}
                      </div>
                      <div className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        {stats.positive} positive, {stats.negative} negative
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-display font-bold ${satisfaction >= 80 ? 'gradient-text-success' : satisfaction >= 60 ? 'gradient-text-warning' : 'gradient-text-danger'}`}>
                        {satisfaction.toFixed(1)}%
                      </div>
                      <div className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        ${avgCost.toFixed(4)} avg cost
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Behavioral Insights */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-display font-bold gradient-text-primary">User Behavior Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-display font-bold gradient-text-success mb-2">
              {(analytics.implicitSignalsAnalysis.copyRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Copy Rate</div>
            <div className="text-xs font-body text-success-600 dark:text-success-400 mt-1">High value indicator</div>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-display font-bold gradient-text-primary mb-2">
              {(analytics.implicitSignalsAnalysis.continuationRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Continuation Rate</div>
            <div className="text-xs font-body text-primary-600 dark:text-primary-400 mt-1">Engagement indicator</div>
          </div>

          <div className="glass rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-warning-50/50 to-warning-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-display font-bold gradient-text-warning mb-2">
              {(analytics.implicitSignalsAnalysis.rephraseRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Rephrase Rate</div>
            <div className="text-xs font-body text-warning-600 dark:text-warning-400 mt-1">Confusion indicator</div>
          </div>

          <div className="glass rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-display font-bold gradient-text-accent mb-2">
              {(analytics.implicitSignalsAnalysis.averageSessionDuration / 1000).toFixed(1)}s
            </div>
            <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">Avg Session</div>
            <div className="text-xs font-body text-accent-600 dark:text-accent-400 mt-1">Engagement time</div>
          </div>
        </div>
      </div>
    </div>
  );
};