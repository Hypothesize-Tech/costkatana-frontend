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
      className={`glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold gradient-text-primary">
            Quick Optimize
          </h3>
        </div>

        {!showResult ? (
          <div className="space-y-6">
            <div>
              <label className="block mb-3 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                Enter your prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="input resize-none"
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
              className="btn btn-primary w-full"
            >
              {optimizeMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Optimizing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-2 w-5 h-5" />
                  Optimize Now
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
              <SparklesIcon className="w-4 h-4" />
              <span>AI-powered optimization • No configuration needed • Instant results</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="glass rounded-xl p-4 border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-display font-semibold gradient-text-success">
                    Optimization Complete!
                  </span>
                </div>
                <span className="text-lg font-display font-bold gradient-text-success">
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="glass rounded-xl p-4 border border-primary-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200">
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className={`text-lg font-display font-bold ${optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0
                  ? 'text-danger-600 dark:text-danger-400'
                  : 'gradient-text-primary'
                  }`}>
                  {Math.abs(optimizationResult.improvementPercentage || 0).toFixed(1)}%
                </div>
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                  {optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0 ? 'Token Increase' : 'Improvement'}
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-secondary-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200">
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <CpuChipIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className={`text-lg font-display font-bold ${optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0
                  ? 'text-danger-600 dark:text-danger-400'
                  : 'gradient-text-secondary'
                  }`}>
                  {optimizationResult.tokensSaved || 0}
                </div>
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                  {optimizationResult.improvementPercentage && optimizationResult.improvementPercentage < 0 ? 'Token Increase' : 'Tokens Saved'}
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-success-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200">
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-lg font-display font-bold gradient-text-success">
                  {optimizationResult.originalTokens || 0}
                </div>
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Original Tokens</div>
              </div>
              <div className="glass rounded-xl p-4 border border-accent-200/30 backdrop-blur-xl text-center hover:scale-105 transition-transform duration-200">
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-lg font-display font-bold gradient-text-accent">
                  {optimizationResult.optimizedTokens || 0}
                </div>
                <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Optimized Tokens</div>
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
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 btn btn-secondary"
              >
                Optimize Another
              </button>
              <button
                onClick={() => handleCopy(optimizationResult.generatedAnswer || optimizationResult.optimizedPrompt || '')}
                className="flex-1 btn btn-primary"
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
