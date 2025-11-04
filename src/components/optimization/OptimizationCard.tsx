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
import { Optimization } from "../../types";

interface OptimizationCardProps {
  optimization: Optimization;
  onApply?: (id: string) => void;
  onFeedback: (id: string, helpful: boolean, comment?: string) => void;
}

export const OptimizationCard: React.FC<OptimizationCardProps> = ({
  optimization,
  onApply,
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
    <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(optimization.applied || optimization.status === "applied" || optimization.status === "completed")
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {(optimization.applied || optimization.status === "applied" || optimization.status === "completed") ? "Applied" : "Pending"}
              </span>
              {optimization.metadata?.cortexOptimized && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  🧠 Cortex Enhanced
                </span>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(optimization.createdAt)}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {optimization?.improvementPercentage ? optimization.improvementPercentage.toFixed(1) : '0.0'}% Token Reduction
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-2 text-sm md:grid-cols-4">
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
            className="p-2 ml-4 text-gray-400 hover:text-gray-600"
          >
            {expanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-6 space-y-4">
            {/* Original vs Optimized */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Original Prompt
                </h4>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {optimization.originalPrompt}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Tokens: {optimization.originalTokens}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Optimized Prompt
                </h4>
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {optimization.optimizedPrompt}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Tokens: {optimization.optimizedTokens}
                  </div>
                </div>
              </div>
            </div>

            {/* Cortex Metrics */}
            {optimization.metadata?.cortexMetrics && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="mb-3 text-sm font-medium text-purple-900">
                  🧠 Cortex Meta-Language Metrics
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  {optimization.metadata.cortexMetrics.encodingReduction && (
                    <div>
                      <span className="text-purple-700">Encoding Reduction:</span>
                      <span className="ml-1 font-medium text-purple-900">
                        {optimization.metadata.cortexMetrics.encodingReduction}%
                      </span>
                    </div>
                  )}
                  {optimization.metadata.cortexMetrics.semanticCompression && (
                    <div>
                      <span className="text-purple-700">Semantic Compression:</span>
                      <span className="ml-1 font-medium text-purple-900">
                        {optimization.metadata.cortexMetrics.semanticCompression}%
                      </span>
                    </div>
                  )}
                  {optimization.metadata.cortexMetrics.processingTime && (
                    <div>
                      <span className="text-purple-700">Processing Time:</span>
                      <span className="ml-1 font-medium text-purple-900">
                        {optimization.metadata.cortexMetrics.processingTime}ms
                      </span>
                    </div>
                  )}
                  {optimization.metadata.cortexMetrics.cacheUtilization && (
                    <div>
                      <span className="text-purple-700">Cache Hit:</span>
                      <span className="ml-1 font-medium text-purple-900">
                        {optimization.metadata.cortexMetrics.cacheUtilization}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {optimization.suggestions &&
              optimization.suggestions.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
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
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {!(optimization.applied || optimization.status === "applied" || optimization.status === "completed") && onApply && (
                  <button
                    onClick={() => onApply(optimization._id)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply Optimization
                  </button>
                )}

                {(optimization.applied || optimization.status === "applied" || optimization.status === "completed") && !showFeedback && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Was this optimization helpful?
                </h4>
                <div className="space-y-3">
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Additional comments (optional)"
                    className="px-3 py-2 w-full text-sm rounded-md border border-gray-300"
                    rows={2}
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <HandThumbUpIcon className="mr-1 w-4 h-4" />
                      Helpful
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <HandThumbDownIcon className="mr-1 w-4 h-4" />
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
