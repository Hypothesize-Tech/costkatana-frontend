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
import api from '../../config/api';

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

      const response = await api.get('/analytics/feedback');
      setAnalytics(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <InformationCircleIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">
            Please log in to view your Return on AI Spend analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="flex items-center text-red-600">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          <span>Error loading feedback analytics: {error}</span>
        </div>
        <button
          onClick={fetchFeedbackAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || analytics.totalRequests === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Data</h3>
          <p className="text-gray-600">
            Start collecting user feedback to see Return on AI Spend analytics here.
          </p>
        </div>
      </div>
    );
  }

  const wastedPercentage = analytics.totalCost > 0 ?
    (analytics.negativeCost / analytics.totalCost * 100) : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Return on AI Spend Analytics</h2>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {analytics.totalRequests}
            </div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {(analytics.averageRating * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              ${analytics.totalCost.toFixed(4)}
            </div>
            <div className="text-sm text-gray-600">Total Spend</div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${wastedPercentage > 20 ? 'text-red-600' : wastedPercentage > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
              {wastedPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Wasted Spend</div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
          Cost vs Value Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <HandThumbUpIcon className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="font-medium text-green-900">Positive Responses</div>
                <div className="text-sm text-green-700">{analytics.positiveRatings} responses</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-900">
                ${analytics.positiveCost.toFixed(4)}
              </div>
              <div className="text-sm text-green-700">
                ${analytics.costPerPositiveRating.toFixed(4)} avg
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <HandThumbDownIcon className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <div className="font-medium text-red-900">Negative Responses</div>
                <div className="text-sm text-red-700">{analytics.negativeRatings} responses</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-red-900">
                ${analytics.negativeCost.toFixed(4)}
              </div>
              <div className="text-sm text-red-700">
                ${analytics.costPerNegativeRating.toFixed(4)} avg
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      {analytics.insights && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 AI-Powered Insights & Recommendations
          </h3>

          <div className="space-y-4">
            {analytics.insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Performance */}
      {Object.keys(analytics.ratingsByFeature).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Performance</h3>

          <div className="space-y-4">
            {Object.entries(analytics.ratingsByFeature).map(([feature, stats]) => {
              const total = stats.positive + stats.negative;
              const satisfaction = total > 0 ? (stats.positive / total * 100) : 0;
              const avgCost = total > 0 ? (stats.cost / total) : 0;

              return (
                <div key={feature} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {feature.replace(/-/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.positive} positive, {stats.negative} negative
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${satisfaction >= 80 ? 'text-green-600' : satisfaction >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {satisfaction.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      ${avgCost.toFixed(4)} avg cost
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Behavioral Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Behavior Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {(analytics.implicitSignalsAnalysis.copyRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Copy Rate</div>
            <div className="text-xs text-gray-500 mt-1">High value indicator</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {(analytics.implicitSignalsAnalysis.continuationRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Continuation Rate</div>
            <div className="text-xs text-gray-500 mt-1">Engagement indicator</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {(analytics.implicitSignalsAnalysis.rephraseRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Rephrase Rate</div>
            <div className="text-xs text-gray-500 mt-1">Confusion indicator</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {(analytics.implicitSignalsAnalysis.averageSessionDuration / 1000).toFixed(1)}s
            </div>
            <div className="text-sm text-gray-600">Avg Session</div>
            <div className="text-xs text-gray-500 mt-1">Engagement time</div>
          </div>
        </div>
      </div>
    </div>
  );
};