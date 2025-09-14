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
    <div className="glass rounded-xl shadow-lg border border-primary-200/30 overflow-hidden backdrop-blur-xl hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.01]">
      <div className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-display font-medium bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30">
                Answer Generated
              </span>
              {optimization.cortexImpactMetrics && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-display font-medium bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border border-secondary-200/30">
                  <span className="mr-1">✨</span>
                  Cortex Optimized
                </span>
              )}
              <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                {formatDate(optimization.createdAt)}
              </span>
            </div>

            <h3 className="text-2xl font-display font-bold gradient-text mb-6">
              {optimization.improvementPercentage.toFixed(1)}% Token Reduction
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-lg p-4 border border-primary-200/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded bg-gradient-primary"></div>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Tokens Saved</span>
                </div>
                <span className="font-display font-bold gradient-text text-lg">
                  {optimization.tokensSaved.toLocaleString()}
                </span>
              </div>
              <div className="glass rounded-lg p-4 border border-success-200/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded bg-gradient-success"></div>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Cost Saved</span>
                </div>
                <span className="font-display font-bold gradient-text-success text-lg">
                  {formatCurrency(optimization.costSaved)}
                </span>
              </div>
              <div className="glass rounded-lg p-4 border border-accent-200/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded bg-gradient-accent"></div>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Service</span>
                </div>
                <span className="font-display font-bold gradient-text text-lg">
                  {optimization.service || optimization.parameters?.model?.split('.')[0] || 'Unknown'}
                </span>
              </div>
              <div className="glass rounded-lg p-4 border border-secondary-200/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded bg-gradient-secondary"></div>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Model</span>
                </div>
                <span className="font-display font-bold gradient-text text-lg">
                  {optimization.model || optimization.parameters?.model || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="glass rounded-lg p-3 border border-primary-200/30 hover:border-primary-300/50 hover:scale-110 transition-all duration-200"
          >
            {expanded ? (
              <ChevronUpIcon className="h-5 w-5 text-light-text-primary dark:text-dark-text-primary" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-light-text-primary dark:text-dark-text-primary" />
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-8 space-y-6">
            {/* Original vs Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6 border border-primary-200/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  <h4 className="font-display font-semibold gradient-text">
                    User Query
                  </h4>
                </div>
                <div className="glass rounded-lg p-4 border border-primary-200/30 mb-3">
                  <div
                    className="font-body text-light-text-primary dark:text-dark-text-primary"
                    dangerouslySetInnerHTML={{
                      __html: processFormattedText(optimization.userQuery || '')
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-medium text-xs">
                    {optimization.originalTokens.toLocaleString()} tokens
                  </span>
                </div>
              </div>

              <div className="glass rounded-xl p-6 border border-success-200/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center glow-success">
                    <span className="text-white text-xs">✨</span>
                  </div>
                  <h4 className="font-display font-semibold gradient-text-success">
                    Generated Answer
                  </h4>
                </div>
                <div className="glass rounded-lg p-4 border border-success-200/30 mb-3">
                  <div
                    className="font-body text-light-text-primary dark:text-dark-text-primary"
                    dangerouslySetInnerHTML={{
                      __html: processFormattedText(optimization.generatedAnswer || '')
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-medium text-xs">
                    {optimization.optimizedTokens.toLocaleString()} tokens
                  </span>
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
                <div className={`glass rounded-xl p-6 border border-accent-200/30 ${optimization.cortexImpactMetrics ? "mt-6" : ""}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center glow-accent">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-display font-semibold gradient-text-accent">
                      Optimization Techniques
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {optimization.suggestions.map((suggestion, index) => (
                      <li key={index} className="glass rounded-lg p-4 border border-primary-200/30">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-gradient-success flex items-center justify-center mt-0.5 flex-shrink-0 glow-success">
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <span className="font-display font-semibold gradient-text">
                              {suggestion.type}:
                            </span>
                            <p className="font-body text-light-text-primary dark:text-dark-text-primary mt-1">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-primary-200/30">
              <div className="flex items-center space-x-4">
                {!showFeedback && (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="btn-secondary"
                  >
                    Provide Feedback
                  </button>
                )}
              </div>

              {optimization.metadata?.confidence && (
                <div className="glass rounded-lg px-4 py-2 border border-primary-200/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-primary"></div>
                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                      Confidence:
                    </span>
                    <span className="font-display font-bold gradient-text">
                      {((optimization.metadata.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Form */}
            {showFeedback && (
              <div className="glass rounded-xl p-6 border border-primary-200/30 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <span className="text-white text-xs">💬</span>
                  </div>
                  <h4 className="font-display font-semibold gradient-text">
                    Was this optimization helpful?
                  </h4>
                </div>
                <div className="space-y-4">
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Additional comments (optional)"
                    className="input"
                    rows={3}
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-success text-white font-display font-medium hover:scale-105 transition-transform duration-200 glow-success"
                    >
                      <HandThumbUpIcon className="h-4 w-4 mr-2" />
                      Helpful
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-danger text-white font-display font-medium hover:scale-105 transition-transform duration-200 glow-danger"
                    >
                      <HandThumbDownIcon className="h-4 w-4 mr-2" />
                      Not Helpful
                    </button>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="btn-secondary"
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
