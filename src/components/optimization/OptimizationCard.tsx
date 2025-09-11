// src/components/optimization/OptimizationCard.tsx
import React, { useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { processFormattedText } from "../../utils/codeFormatter";
import { Optimization } from "../../types";
import { CortexImpactDisplay } from "../cortex";

// Import code block styling
import "../../styles/codeBlocks.css";

interface OptimizationCardProps {
  optimization: Optimization;
  onFeedback: (id: string, helpful: boolean, comment?: string) => void;
}

export const OptimizationCard: React.FC<OptimizationCardProps> = ({
  optimization,
  onFeedback,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");

  const handleFeedback = (helpful: boolean) => {
    onFeedback(optimization._id, helpful, feedbackComment);
    setShowFeedback(false);
    setFeedbackComment("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Answer Generated
              </span>
              {optimization.cortexImpactMetrics && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Cortex Optimized
                </span>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(optimization.createdAt)}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {optimization?.improvementPercentage ? optimization.improvementPercentage.toFixed(1) : '0.0'}% Token Reduction
            </h3>

            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tokens Saved:</span>
                <span className="ml-2 font-medium">
                  {optimization.tokensSaved || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Cost Saved:</span>
                <span className="ml-2 font-medium text-green-600">
                  {formatCurrency(optimization.costSaved || optimization.savings || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Service:</span>
                <span className="ml-2 font-medium">
                  {optimization.service || optimization.parameters?.model?.split('.')[0] || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Model:</span>
                <span className="ml-2 font-medium">
                  {optimization.model || optimization.parameters?.model || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600"
          >
            {expanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-6 space-y-4">
            {/* Original vs Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  User Query
                </h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: processFormattedText(optimization.userQuery || '')
                    }}
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Tokens: {optimization.originalTokens}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Generated Answer
                </h4>
                <div className="p-3 bg-green-50 rounded-md">
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: processFormattedText(optimization.generatedAnswer || '')
                    }}
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Tokens: {optimization.optimizedTokens}
                  </div>
                </div>
              </div>
            </div>

            {/* Cortex Impact Metrics */}
            {optimization.cortexImpactMetrics && (
              <div className="mt-6">
                <CortexImpactDisplay metrics={optimization.cortexImpactMetrics} />
              </div>
            )}

            {/* Suggestions */}
            {optimization.suggestions &&
              optimization.suggestions.length > 0 && (
                <div className={optimization.cortexImpactMetrics ? "mt-6" : ""}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Optimization Techniques
                  </h4>
                  <ul className="space-y-2">
                    {optimization.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {suggestion.type}:
                          </span>{" "}
                          {suggestion.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {/* Apply button removed - answers are automatically generated */}

                {!showFeedback && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Provide Feedback
                  </button>
                )}
              </div>

              {optimization.metadata?.confidence && (
                <div className="text-sm text-gray-500">
                  Confidence:{" "}
                  {((optimization.metadata.confidence || 0) * 100).toFixed(0)}%
                </div>
              )}
            </div>

            {/* Feedback Form */}
            {showFeedback && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Was this optimization helpful?
                </h4>
                <div className="space-y-3">
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Additional comments (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={2}
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <HandThumbUpIcon className="h-4 w-4 mr-1" />
                      Helpful
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <HandThumbDownIcon className="h-4 w-4 mr-1" />
                      Not Helpful
                    </button>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
