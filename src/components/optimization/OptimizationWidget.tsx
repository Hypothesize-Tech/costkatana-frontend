import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  SparklesIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  CogIcon,
  LightBulbIcon,
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
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={optimizeMutation.isPending || !prompt.trim()}
        className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] [touch-action:manipulation] active:scale-95"
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
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Savings Summary */}
          <div className="glass rounded-lg p-3 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
            <div className="flex flex-col gap-2 items-start justify-between mb-2 sm:flex-row sm:items-center sm:mb-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg sm:w-7 sm:h-7 md:w-8 md:h-8">
                  <CurrencyDollarIcon className="w-4 h-4 text-white sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </div>
                <span className="text-xs font-display font-semibold gradient-text-success sm:text-sm">
                  Estimated Savings
                </span>
              </div>
              <span className="text-lg font-display font-bold gradient-text-success sm:text-xl md:text-2xl break-words">
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
          <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                <LightBulbIcon className="w-5 h-5 text-white" />
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
                      <h5 className="font-display font-semibold gradient-text-primary capitalize">
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
                            <div className="w-4 h-4 rounded bg-gradient-success shadow-lg"></div>
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
                            className="bg-gradient-primary h-2 rounded-full shadow-lg transition-all duration-300"
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
              <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <CogIcon className="w-5 h-5 text-white" />
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
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="font-display font-semibold gradient-text-primary mb-2">Ready to Optimize</h3>
          <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Click "Optimize Prompt" to get started with AI-powered optimization</p>
        </div>
      )}
    </div>
  );
};

export default OptimizationWidget;
