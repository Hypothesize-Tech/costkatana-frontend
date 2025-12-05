// src/components/optimization/QuickOptimize.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { optimizationService } from "@/services/optimization.service";
import { useNotifications } from "../../contexts/NotificationContext";
import { renderFormattedContent } from "@/utils/formatters";
import { OptimizedPromptDisplay } from "../common/FormattedContent";
import { CortexToggle } from "../cortex/CortexToggle";
import { CortexConfigPanel } from "../cortex/CortexConfigPanel";
import type { CortexConfig } from "../../types/cortex.types";

interface QuickOptimizeProps {
  className?: string;
  onOptimizationCreated?: (optimization: any) => void;
}

export const QuickOptimize: React.FC<QuickOptimizeProps> = ({
  className = "",
  onOptimizationCreated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [useCortex, setUseCortex] = useState(false);
  const [cortexConfig, setCortexConfig] = useState<CortexConfig | undefined>(undefined);
  const [showCortexConfig, setShowCortexConfig] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  const optimizeMutation = useMutation({
    mutationFn: () =>
      optimizationService.createOptimization({
        prompt,
        service: "openai",
        model: "gpt-4",
        useCortex,
        cortexConfig,
        enableCompression: true,
        enableContextTrimming: true,
        enableRequestFusion: true,
      }),
    onSuccess: (data) => {
      setOptimizationResult(data);
      setShowResult(true);
      showNotification("Prompt optimized successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
      queryClient.invalidateQueries({ queryKey: ["optimization-stats"] });
      // Call the callback to update the parent component
      if (onOptimizationCreated) {
        onOptimizationCreated(data);
      }
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification("Copied to clipboard!", "success");
    } catch (error) {
      showNotification("Failed to copy to clipboard", "error");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setUseCortex(false);
    setOptimizationResult(null);
    setShowResult(false);
  };

  return (
    <div
      className={`glass rounded-lg border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel sm:rounded-xl ${className}`}
    >
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 sm:gap-3 sm:mb-5 md:mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg sm:w-9 sm:h-9 md:w-10 md:h-10 md:rounded-xl">
            <SparklesIcon className="w-4 h-4 text-white sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
          </div>
          <h3 className="text-lg font-display font-bold gradient-text-primary sm:text-xl">
            Quick Optimize
          </h3>
        </div>

        {!showResult ? (
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div>
              <label className="block mb-2 text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary sm:mb-3 sm:text-sm">
                Enter your prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="input resize-none text-sm"
                placeholder="Paste your AI prompt here for instant optimization..."
              />
            </div>

            {/* Cortex Toggle */}
            <CortexToggle
              enabled={useCortex}
              onChange={(enabled) => {
                setUseCortex(enabled);
                if (enabled && !showCortexConfig) {
                  setShowCortexConfig(true);
                }
              }}
              config={cortexConfig}
            />

            {/* Cortex Configuration Panel */}
            {useCortex && showCortexConfig && (
              <CortexConfigPanel
                config={cortexConfig || {}}
                onChange={(config) => setCortexConfig(config as CortexConfig)}
                disabled={optimizeMutation.isPending}
              />
            )}

            <button
              onClick={handleOptimize}
              disabled={optimizeMutation.isPending || !prompt.trim()}
              className="btn btn-primary w-full min-h-[44px] [touch-action:manipulation] active:scale-95"
            >
              {optimizeMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Optimizing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Optimize Now
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:gap-2 sm:text-xs">
              <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-center">AI-powered optimization • No configuration needed • Instant results</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Success Header */}
            <div className="glass rounded-lg p-3 border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 sm:p-4 md:rounded-xl">
              <div className="flex flex-col gap-2 justify-between items-start sm:flex-row sm:items-center sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg sm:w-7 sm:h-7 md:w-8 md:h-8">
                    <CheckIcon className="w-4 h-4 text-white sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs font-display font-semibold gradient-text-success sm:text-sm">
                    Optimization Complete!
                  </span>
                </div>
                <span className="text-base font-display font-bold gradient-text-success sm:text-lg break-words">
                  ${optimizationResult.costSaved?.toFixed(4) || "0.0000"} saved
                </span>
              </div>
            </div>

            {/* Generated Answer */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Generated Answer
                </label>
                <button
                  onClick={() => handleCopy(optimizationResult.generatedAnswer || optimizationResult.optimizedPrompt || '')}
                  className="flex btn items-center gap-2 px-3 py-1.5 rounded-lg glass border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200 hover:scale-105"
                >
                  <ClipboardDocumentIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-body text-light-text-primary dark:text-dark-text-primary">Copy</span>
                </button>
              </div>
              <OptimizedPromptDisplay
                content={optimizationResult.generatedAnswer || optimizationResult.optimizedPrompt || ''}
                maxHeight="max-h-48"
              />
            </div>

            {/* Optimization Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-4">
              <div className="glass rounded-lg p-2 border border-primary-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200 sm:p-3 md:p-4 md:rounded-xl">
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg sm:w-7 sm:h-7 md:w-8 md:h-8">
                    <ChartBarIcon className="w-3 h-3 text-white sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>
                <div className={`text-sm font-display font-bold sm:text-base md:text-lg ${optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0
                  ? 'text-danger-600 dark:text-danger-400'
                  : 'gradient-text-primary'
                  }`}>
                  {Math.abs(optimizationResult.improvementPercentage || 0).toFixed(1)}%
                </div>
                <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                  {optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0 ? 'Token Increase' : 'Improvement'}
                </div>
              </div>
              <div className="glass rounded-lg p-2 border border-secondary-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200 sm:p-3 md:p-4 md:rounded-xl">
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg sm:w-7 sm:h-7 md:w-8 md:h-8">
                    <CpuChipIcon className="w-3 h-3 text-white sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>
                <div className={`text-sm font-display font-bold sm:text-base md:text-lg ${optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0
                  ? 'text-danger-600 dark:text-danger-400'
                  : 'gradient-text-secondary'
                  }`}>
                  {optimizationResult.tokensSaved || 0}
                </div>
                <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">
                  {optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0 ? 'Token Increase' : 'Tokens Saved'}
                </div>
              </div>
              <div className="glass rounded-lg p-2 border border-success-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200 sm:p-3 md:p-4 md:rounded-xl">
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg sm:w-7 sm:h-7 md:w-8 md:h-8">
                    <CurrencyDollarIcon className="w-3 h-3 text-white sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>
                <div className="text-sm font-display font-bold gradient-text-success sm:text-base md:text-lg">
                  {optimizationResult.originalTokens || 0}
                </div>
                <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">Original Tokens</div>
              </div>
              <div className="glass rounded-lg p-2 border border-accent-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200 sm:p-3 md:p-4 md:rounded-xl">
                <div className="flex justify-center mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg sm:w-7 sm:h-7 md:w-8 md:h-8">
                    <CurrencyDollarIcon className="w-3 h-3 text-white sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>
                <div className="text-sm font-display font-bold gradient-text-accent sm:text-base md:text-lg">
                  {optimizationResult.optimizedTokens || 0}
                </div>
                <div className="text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-xs">Optimized Tokens</div>
              </div>
            </div>

            {/* Cortex Information */}
            {optimizationResult.metadata?.cortex && (
              <div className="glass rounded-xl p-5 border border-purple-200/30 backdrop-blur-xl bg-gradient-to-br from-purple-50/50 to-indigo-100/30 dark:from-purple-900/20 dark:to-indigo-800/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <CpuChipIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-display font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Cortex Performance
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {optimizationResult.metadata.cortex.cortexModel && (
                    <>
                      <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Encoder</div>
                        <div className="text-xs font-medium font-display text-light-text-primary dark:text-dark-text-primary truncate">
                          {optimizationResult.metadata.cortex.cortexModel.encoder?.split('.')[1] || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Core/Processor</div>
                        <div className="text-xs font-medium font-display text-light-text-primary dark:text-dark-text-primary truncate">
                          {(optimizationResult.metadata.cortex.cortexModel.core || optimizationResult.metadata.cortex.cortexModel.processor)?.split('.')[1] || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Decoder</div>
                        <div className="text-xs font-medium font-display text-light-text-primary dark:text-dark-text-primary truncate">
                          {optimizationResult.metadata.cortex.cortexModel.decoder?.split('.')[1] || 'N/A'}
                        </div>
                      </div>
                    </>
                  )}

                  {optimizationResult.metadata.cortex.processingTime && (
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                      <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Processing Time</div>
                      <div className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                        {(optimizationResult.metadata.cortex.processingTime / 1000).toFixed(2)}s
                      </div>
                    </div>
                  )}

                  {optimizationResult.metadata.cortex.semanticIntegrity !== undefined && (
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                      <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Semantic Integrity</div>
                      <div className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                        {(optimizationResult.metadata.cortex.semanticIntegrity * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {optimizationResult.metadata.cortex.totalCost !== undefined && (
                    <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                      <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">Cortex Cost</div>
                      <div className="text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary">
                        ${optimizationResult.metadata.cortex.totalCost.toFixed(5)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optimization Details */}
            {optimizationResult.suggestions &&
              optimizationResult.suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                      <LightBulbIcon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-display font-semibold gradient-text-accent">
                      Applied Techniques
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {optimizationResult.suggestions.map(
                      (suggestion: any, index: number) => (
                        <div
                          key={index}
                          className="glass rounded-lg p-4 border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full bg-gradient-primary"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary capitalize">
                                  {suggestion.type?.replace(/_/g, " ") ||
                                    "Optimization"}
                                </span>
                                {suggestion.implemented && (
                                  <span className="px-2 py-1 text-xs font-body rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30">
                                    Applied
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                {renderFormattedContent(
                                  suggestion.description ||
                                  suggestion.explanation ||
                                  "",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <button
                onClick={handleReset}
                className="flex-1 btn btn-secondary min-h-[44px] [touch-action:manipulation] active:scale-95"
              >
                Optimize Another
              </button>
              <button
                onClick={() => handleCopy(optimizationResult.generatedAnswer || optimizationResult.optimizedPrompt || '')}
                className="flex-1 btn btn-primary min-h-[44px] [touch-action:manipulation] active:scale-95"
              >
                Copy Result
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
