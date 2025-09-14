// src/components/optimization/OptimizationWidget.tsx
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  SparklesIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { optimizationService } from "@/services/optimization.service";
import { useNotifications } from "../../contexts/NotificationContext";
import { formatSmartNumber } from "@/utils/formatters";

interface OptimizationWidgetProps {
  prompt: string;
  service?: string;
  model?: string;
  onApplyOptimization?: (optimizedPrompt: string, optimization: any) => void;
}

const OptimizationWidget: React.FC<OptimizationWidgetProps> = ({
  prompt,
  service = "openai",
  model = "gpt-4",
  onApplyOptimization,
}) => {
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { showNotification } = useNotifications();

  const optimizeMutation = useMutation({
    mutationFn: () =>
      optimizationService.getOptimizationPreview({
        prompt,
        service,
        model,
        enableCompression: true,
        enableContextTrimming: true,
        enableRequestFusion: true,
      }),
    onSuccess: (data) => {
      setOptimizationResult(data);
    },
    onError: () => {
      showNotification("Failed to optimize prompt", "error");
    },
  });

  const handleOptimize = () => {
    if (!prompt.trim()) {
      showNotification("Please enter a prompt to optimize", "error");
      return;
    }
    optimizeMutation.mutate();
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      showNotification("Copied to clipboard!", "success");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      showNotification("Failed to copy to clipboard", "error");
    }
  };

  const handleApply = (optimizedPrompt: string, suggestion: any) => {
    if (onApplyOptimization) {
      onApplyOptimization(optimizedPrompt, suggestion);
      showNotification("Optimization applied!", "success");
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={optimizeMutation.isPending || !prompt.trim()}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {optimizeMutation.isPending ? (
          <>
            <LoadingSpinner size="small" />
            <span className="ml-2">Optimizing...</span>
          </>
        ) : (
          <>
            <SparklesIcon className="w-4 h-4 mr-2" />
            Optimize Prompt
          </>
        )}
      </button>

      {/* Results */}
      {optimizationResult && (
        <div className="space-y-6">
          {/* Savings Summary */}
          <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center glow-success">
                  <span className="text-white text-sm">💰</span>
                </div>
                <span className="font-display font-semibold gradient-text-success">
                  Estimated Savings
                </span>
              </div>
              <span className="text-2xl font-display font-bold gradient-text-success">
                ${formatSmartNumber(optimizationResult.totalSavings)}
              </span>
            </div>
            {optimizationResult.improvementPercentage && (
              <div className="glass rounded-lg p-3 border border-success-200/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-success"></div>
                  <span className="font-body text-light-text-primary dark:text-dark-text-primary text-sm">
                    {formatSmartNumber(optimizationResult.improvementPercentage)}% improvement
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Optimization Suggestions */}
          <div className="glass rounded-xl p-6 border border-accent-200/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center glow-accent">
                <span className="text-white text-sm">💡</span>
              </div>
              <h4 className="font-display font-semibold gradient-text-accent text-lg">
                Optimization Suggestions
              </h4>
            </div>
            <div className="space-y-4">
              {optimizationResult.suggestions.map(
                (suggestion: any, index: number) => (
                  <div
                    key={index}
                    className="glass rounded-lg p-4 border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-display font-semibold gradient-text capitalize">
                        {suggestion.type.replace(/_/g, " ")}
                      </h5>
                      <span className="px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30 font-display font-medium text-xs">
                        ${formatSmartNumber(suggestion.estimatedSavings)}
                      </span>
                    </div>

                    <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-3">
                      {suggestion.explanation}
                    </p>

                    {suggestion.optimizedPrompt && (
                      <div className="glass rounded-lg p-4 border border-success-200/30">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gradient-success"></div>
                            <span className="font-display font-medium gradient-text-success text-sm">
                              Optimized Version:
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleCopy(suggestion.optimizedPrompt, index)
                              }
                              className="glass rounded-lg p-2 border border-primary-200/30 hover:border-primary-300/50 hover:scale-110 transition-all duration-200"
                              title="Copy to clipboard"
                            >
                              {copiedIndex === index ? (
                                <CheckIcon className="w-4 h-4 text-success-500" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4 text-light-text-primary dark:text-dark-text-primary" />
                              )}
                            </button>
                            {onApplyOptimization && (
                              <button
                                onClick={() =>
                                  handleApply(
                                    suggestion.optimizedPrompt,
                                    suggestion,
                                  )
                                }
                                className="btn-secondary text-xs"
                                title="Apply this optimization"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="glass rounded-lg p-3 border border-primary-200/30 max-h-24 overflow-y-auto">
                          <code className="font-mono text-sm text-light-text-primary dark:text-dark-text-primary">
                            {suggestion.optimizedPrompt}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Confidence Bar */}
                    {suggestion.confidence && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                            Confidence:
                          </span>
                          <span className="font-display font-bold gradient-text text-sm">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-primary h-2 rounded-full glow-primary transition-all duration-300"
                            style={{ width: `${suggestion.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Applied Techniques */}
          {optimizationResult.techniques &&
            optimizationResult.techniques.length > 0 && (
              <div className="glass rounded-xl p-6 border border-secondary-200/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center glow-secondary">
                    <span className="text-white text-sm">⚙️</span>
                  </div>
                  <h4 className="font-display font-semibold gradient-text-secondary text-lg">
                    Applied Techniques
                  </h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {optimizationResult.techniques.map(
                    (technique: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-2 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border border-primary-200/30 font-display font-medium text-sm hover:scale-105 transition-transform duration-200"
                      >
                        {technique.replace(/_/g, " ")}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Empty State */}
      {!optimizationResult && !optimizeMutation.isPending && (
        <div className="glass rounded-xl p-8 border border-primary-200/30 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="font-display font-semibold gradient-text mb-2">Ready to Optimize</h3>
          <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Click "Optimize Prompt" to get started with AI-powered optimization</p>
        </div>
      )}
    </div>
  );
};

export default OptimizationWidget;
