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
    <div className="space-y-4">
      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={optimizeMutation.isPending || !prompt.trim()}
        className="w-full flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="space-y-4">
          {/* Savings Summary */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900">
                Estimated Savings
              </span>
              <span className="text-lg font-bold text-green-600">
                ${formatSmartNumber(optimizationResult.totalSavings)}
              </span>
            </div>
            {optimizationResult.improvementPercentage && (
              <div className="mt-1 text-xs text-green-700">
                {formatSmartNumber(optimizationResult.improvementPercentage)}%
                improvement
              </div>
            )}
          </div>

          {/* Optimization Suggestions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">
              Optimization Suggestions
            </h4>
            {optimizationResult.suggestions.map(
              (suggestion: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-sm font-medium text-gray-900 capitalize">
                      {suggestion.type.replace(/_/g, " ")}
                    </h5>
                    <span className="text-xs text-green-600 font-medium">
                      ${formatSmartNumber(suggestion.estimatedSavings)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-2">
                    {suggestion.explanation}
                  </p>

                  {suggestion.optimizedPrompt && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          Optimized Version:
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() =>
                              handleCopy(suggestion.optimizedPrompt, index)
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === index ? (
                              <CheckIcon className="w-3 h-3 text-green-500" />
                            ) : (
                              <ClipboardDocumentIcon className="w-3 h-3" />
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
                              className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                              title="Apply this optimization"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-20 overflow-y-auto">
                        {suggestion.optimizedPrompt}
                      </div>
                    </div>
                  )}

                  {/* Confidence Bar */}
                  {suggestion.confidence && (
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 mr-2">
                        Confidence:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-indigo-500 h-1 rounded-full"
                          style={{ width: `${suggestion.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>

          {/* Applied Techniques */}
          {optimizationResult.techniques &&
            optimizationResult.techniques.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Applied Techniques
                </h4>
                <div className="flex flex-wrap gap-2">
                  {optimizationResult.techniques.map(
                    (technique: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
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
        <div className="text-center py-6 text-gray-500">
          <SparklesIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Click "Optimize Prompt" to get started</p>
        </div>
      )}
    </div>
  );
};

export default OptimizationWidget;
