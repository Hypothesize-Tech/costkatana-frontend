// src/components/optimization/OptimizationCard.tsx
import React, { useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  SparklesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
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
  const [showCortexComparison, setShowCortexComparison] = useState(false);


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
              {optimization.cortexImpactMetrics
                ? `${Math.abs(optimization.cortexImpactMetrics.tokenReduction.percentageSavings).toFixed(1)}% Token ${optimization.cortexImpactMetrics.tokenReduction.percentageSavings >= 0 ? 'Reduction' : 'Increase'}`
                : `${optimization.improvementPercentage.toFixed(1)}% Token Reduction`}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-lg p-4 border border-primary-200/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded bg-gradient-primary"></div>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Tokens Saved</span>
                </div>
                <span className="font-display font-bold gradient-text text-lg">
                  {optimization.cortexImpactMetrics
                    ? Math.abs(optimization.cortexImpactMetrics.tokenReduction.absoluteSavings).toLocaleString()
                    : optimization.tokensSaved.toLocaleString()}
                </span>
              </div>
              <div className="glass rounded-lg p-4 border border-success-200/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded bg-gradient-success"></div>
                  <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Cost Saved</span>
                </div>
                <span className="font-display font-bold gradient-text-success text-lg">
                  {formatCurrency(optimization.cortexImpactMetrics
                    ? Math.abs(optimization.cortexImpactMetrics.costImpact.costSavings)
                    : optimization.costSaved)}
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
                    {optimization.cortexImpactMetrics
                      ? optimization.cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()
                      : optimization.originalTokens.toLocaleString()} tokens
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
                    {optimization.cortexImpactMetrics
                      ? optimization.cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()
                      : optimization.optimizedTokens.toLocaleString()} tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Cortex Impact Display - Full Component */}
            {optimization.cortexImpactMetrics && (
              <div className="mt-6">
                <CortexImpactDisplay metrics={optimization.cortexImpactMetrics} />
              </div>
            )}

            {/* Cortex Impact Comparison Accordion - Additional Details */}
            {optimization.cortexImpactMetrics && (
              <div className="mt-6">
                <div
                  className="glass rounded-xl border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-secondary-50/80 to-accent-50/60 dark:from-secondary-900/20 dark:to-accent-900/20 overflow-hidden"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => setShowCortexComparison(!showCortexComparison)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-50/30 dark:hover:bg-secondary-900/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 text-white">
                        <SparklesIcon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-display font-semibold gradient-text-secondary">
                          Detailed Cost & Token Comparison
                        </h4>
                        <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          View with/without Cortex breakdown
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30">
                        {Math.abs(optimization.cortexImpactMetrics.tokenReduction.absoluteSavings).toLocaleString()} tokens saved
                      </span>
                      {showCortexComparison ? (
                        <ChevronUpIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {showCortexComparison && (
                    <div className="px-6 pb-6 border-t border-secondary-200/30 dark:border-secondary-700/30">
                      {/* With/Without Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Without Cortex */}
                        <div className="glass rounded-lg p-4 border border-danger-200/30 bg-gradient-to-br from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-full bg-gradient-danger flex items-center justify-center">
                              <span className="text-white text-xs font-bold">×</span>
                            </div>
                            <h5 className="font-display font-semibold gradient-text-danger">
                              Without Cortex
                            </h5>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <ChartBarIcon className="h-4 w-4 text-danger-500 dark:text-danger-400" />
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                  Tokens:
                                </span>
                              </div>
                              <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                {optimization.cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="h-4 w-4 text-danger-500 dark:text-danger-400" />
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                  Cost:
                                </span>
                              </div>
                              <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                {formatCurrency(optimization.cortexImpactMetrics.costImpact.estimatedCostWithoutCortex)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* With Cortex */}
                        <div className="glass rounded-lg p-4 border border-success-200/30 bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-full bg-gradient-success flex items-center justify-center">
                              <CheckCircleIcon className="h-3 w-3 text-white" />
                            </div>
                            <h5 className="font-display font-semibold gradient-text-success">
                              With Cortex
                            </h5>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <ChartBarIcon className="h-4 w-4 text-success-500 dark:text-success-400" />
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                  Tokens:
                                </span>
                              </div>
                              <span className="font-display font-bold gradient-text-success">
                                {optimization.cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="h-4 w-4 text-success-500 dark:text-success-400" />
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                  Cost:
                                </span>
                              </div>
                              <span className="font-display font-bold gradient-text-success">
                                {formatCurrency(optimization.cortexImpactMetrics.costImpact.actualCostWithCortex)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Savings Summary */}
                      <div className="mt-4 p-4 glass rounded-lg border border-primary-200/30 bg-gradient-to-r from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
                              <ChevronRightIcon className="h-3 w-3 text-white" />
                            </div>
                            <span className="font-display font-semibold gradient-text">
                              Net Savings with Cortex
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-display font-bold gradient-text text-lg">
                              {formatCurrency(Math.abs(optimization.cortexImpactMetrics.costImpact.costSavings))}
                              <span className="text-sm ml-2 font-body text-light-text-secondary dark:text-dark-text-secondary">
                                ({Math.abs(optimization.cortexImpactMetrics.costImpact.savingsPercentage).toFixed(1)}% reduction)
                              </span>
                            </div>
                            <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                              {Math.abs(optimization.cortexImpactMetrics.tokenReduction.absoluteSavings).toLocaleString()} tokens saved
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
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
