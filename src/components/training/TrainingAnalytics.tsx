import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  StarIcon,
  DocumentTextIcon,
  TrophyIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  trainingService,
  ScoringAnalytics,
} from "../../services/training.service";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const TrainingAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ScoringAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await trainingService.scoring.getScoringAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load training analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-3 font-body text-light-text-secondary dark:text-dark-text-secondary">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics || analytics.totalScored === 0) {
    return (
      <div className="text-center py-12 glass rounded-xl border border-accent-200/30">
        <ChartBarIcon className="h-12 w-12 text-accent-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-display font-bold gradient-text-accent mb-2">
          No Scoring Data Yet
        </h3>
        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
          Start scoring your AI requests to see training analytics here.
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const maxDistributionValue = Math.max(
    ...Object.values(analytics.scoreDistribution),
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-xl border border-info-200/30 shadow-lg backdrop-blur-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-info flex items-center justify-center glow-info">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Total Scored</p>
              <p className="text-2xl font-display font-bold gradient-text-info">
                {analytics.totalScored.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-warning flex items-center justify-center glow-warning">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Average Score</p>
              <p className="text-2xl font-display font-bold gradient-text-warning">
                {analytics.averageScore.toFixed(1)}★
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center glow-success">
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Training Candidates
              </p>
              <p className="text-2xl font-display font-bold gradient-text-success">
                {analytics.trainingCandidates.toLocaleString()}
              </p>
              <p className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                {(
                  (analytics.trainingCandidates / analytics.totalScored) *
                  100
                ).toFixed(1)}
                % of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quality Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(
                  (analytics.trainingCandidates / analytics.totalScored) *
                  100
                ).toFixed(0)}
                %
              </p>
              <p className="text-xs text-gray-500">4+ star requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Score Distribution
        </h3>

        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map((score) => {
            const count = analytics.scoreDistribution[score] || 0;
            const percentage =
              analytics.totalScored > 0
                ? (count / analytics.totalScored) * 100
                : 0;
            const barWidth =
              maxDistributionValue > 0
                ? (count / maxDistributionValue) * 100
                : 0;

            return (
              <div key={score} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-20">
                  <span className="text-sm font-medium">{score}</span>
                  <StarIcon className={`h-4 w-4 ${getScoreColor(score)}`} />
                </div>

                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className={`${getScoreBarColor(score)} h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2`}
                    style={{ width: `${barWidth}%` }}
                  >
                    {count > 0 && (
                      <span className="text-white text-xs font-medium">
                        {count}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-16 text-right">
                  <span className="text-sm text-gray-600">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Training Candidates:</strong> Requests with 4+ stars are
            automatically marked as suitable for training datasets.
          </p>
        </div>
      </div>

      {/* Top Performing Requests */}
      {analytics.topScoredRequests.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2" />
            Top Performing Requests
          </h3>

          <div className="space-y-3">
            {analytics.topScoredRequests
              .slice(0, 10)
              .map((request: any, index: number) => (
                <div
                  key={request.requestId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index < 3 ? "bg-yellow-500" : "bg-gray-400"
                        }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.title ||
                              `Request ${request.requestId.substring(0, 8)}...`}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {request.provider} • {request.model}
                            </span>
                            {request.totalTokens && (
                              <span className="text-xs text-gray-500">
                                • {request.totalTokens} tokens
                              </span>
                            )}
                            {request.cost && (
                              <span className="text-xs text-gray-500">
                                • ${request.cost.toFixed(4)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-3 w-3 ${i < request.score
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      {request.trainingTags &&
                        request.trainingTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {request.trainingTags.map(
                              (tag: string, tagIndex: number) => (
                                <span
                                  key={tagIndex}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Token Efficiency:</span>
                      <span className="ml-1">
                        {request.tokenEfficiency.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Cost Efficiency:</span>
                      <span className="ml-1">
                        {request.costEfficiency.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {analytics.topScoredRequests.length > 10 && (
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-500">
                +{analytics.topScoredRequests.length - 10} more high-performing
                requests
              </span>
            </div>
          )}
        </div>
      )}

      {/* Training Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
          Training Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Quality Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Excellent (5★):</span>
                <span className="font-medium text-green-600">
                  {analytics.scoreDistribution[5] || 0} requests
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Good (4★):</span>
                <span className="font-medium text-green-600">
                  {analytics.scoreDistribution[4] || 0} requests
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Needs Improvement (≤3★):</span>
                <span className="font-medium text-yellow-600">
                  {(analytics.scoreDistribution[3] || 0) +
                    (analytics.scoreDistribution[2] || 0) +
                    (analytics.scoreDistribution[1] || 0)}{" "}
                  requests
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recommendations</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {analytics.trainingCandidates >= 100 && (
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    You have enough high-quality data to create a training
                    dataset!
                  </span>
                </div>
              )}

              {analytics.averageScore < 3.5 && (
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Consider reviewing your prompts - average quality is below
                    3.5★
                  </span>
                </div>
              )}

              {analytics.totalScored < 50 && (
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Score more requests to get better training insights
                  </span>
                </div>
              )}

              {analytics.trainingCandidates < 20 &&
                analytics.totalScored >= 50 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      Focus on improving request quality to get more training
                      candidates
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
