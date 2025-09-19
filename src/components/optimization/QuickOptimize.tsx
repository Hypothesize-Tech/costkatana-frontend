import React, { useState } from "react";
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { optimizationService } from "../../services/optimization.service";
import { useNotifications } from "../../contexts/NotificationContext";
import { renderFormattedContent, formatSmartNumber } from "../../utils/formatters";
import { processFormattedText } from "../../utils/codeFormatter";
import "../../styles/codeBlocks.css";
import { CortexToggle, CortexResultsDisplay, CortexConfigPanel } from "../cortex";
import { DEFAULT_CORTEX_CONFIG } from "../../types/cortex.types";
import type { CortexConfig } from "../../types/cortex.types";
import type { Optimization } from "../../types/optimization.types";

interface QuickOptimizeProps {
  className?: string;
  onOptimizationCreated?: (optimization: Optimization) => void;
}

export const QuickOptimize: React.FC<QuickOptimizeProps> = ({
  className = "",
  onOptimizationCreated,
}) => {
  const [prompt, setPrompt] = useState("");
  const [optimizationResult, setOptimizationResult] = useState<Optimization | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { showNotification } = useNotifications();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  const [cortexEnabled, setCortexEnabled] = useState(false);
  const [showCortexAdvanced, setShowCortexAdvanced] = useState(false);
  const [cortexConfig, setCortexConfig] = useState<Partial<CortexConfig>>(DEFAULT_CORTEX_CONFIG);

  const createOptimization = async () => {
    console.log("🚀 QUICK OPTIMIZE: Starting direct API call", {
      prompt: prompt.substring(0, 100) + "...",
      cortexEnabled,
      timestamp: new Date().toISOString()
    });

    setIsOptimizing(true);
    setOptimizationError(null);

    try {
      const result = await optimizationService.createOptimization({
        prompt,
        service: "openai",
        model: "gpt-4",
        enableCompression: true,
        enableContextTrimming: true,
        enableRequestFusion: true,
        // Cortex parameters (using configurable settings)
        enableCortex: cortexEnabled,
        cortexOperation: 'answer', // NEW ARCHITECTURE: Always answer generation,
        cortexEncodingModel: cortexConfig.encodingModel,
        cortexCoreModel: cortexConfig.coreProcessingModel,
        cortexDecodingModel: cortexConfig.decodingModel,
        cortexStyle: cortexConfig.outputStyle,
        cortexFormat: cortexConfig.outputFormat,
        cortexSemanticCache: cortexConfig.enableSemanticCache,
        cortexStructuredContext: cortexConfig.enableStructuredContext,
        cortexPreserveSemantics: cortexConfig.preserveSemantics,
        cortexIntelligentRouting: cortexConfig.enableIntelligentRouting,
      });

      console.log("✅ QUICK OPTIMIZE: Success", {
        hasResult: !!result,
        cortexData: result.metadata?.cortex,
        tokensSaved: result.tokensSaved,
        timestamp: new Date().toISOString(),
        resultType: typeof result,
        resultKeys: Object.keys(result || {}),
        suggestionsType: typeof result?.suggestions,
        suggestionsLength: Array.isArray(result?.suggestions) ? result.suggestions.length : 'not array'
      });

      // Ensure result has proper structure before setting
      const safeResult = {
        ...result,
        suggestions: Array.isArray(result?.suggestions) ? result.suggestions : [],
        metadata: result?.metadata || {},
        costSaved: typeof result?.costSaved === 'number' ? result.costSaved : 0,
        tokensSaved: typeof result?.tokensSaved === 'number' ? result.tokensSaved : 0,
        improvementPercentage: typeof result?.improvementPercentage === 'number' ? result.improvementPercentage : 0,
        generatedAnswer: result?.generatedAnswer || ''
      };

      setOptimizationResult(safeResult);
      setShowResult(true);
      showNotification("Prompt optimized successfully!", "success");

      // Call the callback to update the parent component
      if (onOptimizationCreated) {
        onOptimizationCreated(safeResult);
      }
    } catch (error) {
      console.error("❌ QUICK OPTIMIZE: Error", error);
      setOptimizationError(error instanceof Error ? error.message : 'Optimization failed');
      showNotification("Failed to optimize prompt", "error");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimize = () => {
    if (!prompt.trim()) {
      showNotification("Please enter a prompt to optimize", "error");
      return;
    }
    createOptimization();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification("Copied to clipboard!", "success");
    } catch {
      showNotification("Failed to copy to clipboard", "error");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setOptimizationResult(null);
    setShowResult(false);
    setOptimizationError(null);
    setCortexEnabled(false);
    setShowCortexAdvanced(false);
    setCortexConfig(DEFAULT_CORTEX_CONFIG);
  };


  return (
    <div
      className={`glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel ${className}`}
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text-primary">
              Quick Optimize
            </h3>
          </div>
          {cortexEnabled && (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border border-secondary-200/30 font-display font-medium">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Cortex Enhanced
            </span>
          )}
        </div>

        {!showResult ? (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">📝</span>
                </div>
                <label className="font-display font-semibold gradient-text-success text-lg">
                  Enter your AI query
                </label>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="input"
                placeholder="Paste your AI query here for instant usage optimization..."
              />
            </div>

            {/* Cortex Toggle for Quick Optimize */}
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
              <CortexToggle
                enabled={cortexEnabled}
                onChange={setCortexEnabled}
                disabled={isOptimizing}
                showAdvancedOptions={showCortexAdvanced}
                onAdvancedToggle={setShowCortexAdvanced}
              />
            </div>

            {/* Cortex Advanced Configuration */}
            {cortexEnabled && showCortexAdvanced && (
              <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <CortexConfigPanel
                  config={cortexConfig}
                  onChange={setCortexConfig}
                  disabled={isOptimizing}
                />
              </div>
            )}

            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !prompt.trim()}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Optimizing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Optimize Now
                </>
              )}
            </button>

            {/* Show error if optimization fails */}
            {optimizationError && (
              <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">⚠️</span>
                  </div>
                  <span className="font-display font-semibold gradient-text-danger">Optimization Error</span>
                </div>
                <p className="font-body text-light-text-primary dark:text-dark-text-primary">
                  {optimizationError}
                </p>
              </div>
            )}

            <div className="glass rounded-lg p-4 border border-primary-200/30 text-center">
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                ✨ AI-powered optimization • {cortexEnabled ? (showCortexAdvanced ? 'Cortex configured' : 'Cortex with defaults') : 'Standard optimization'} • Instant results
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Header */}
            <div className={`glass rounded-xl p-6 border shadow-lg backdrop-blur-xl ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
              ? 'border-secondary-200/30'
              : 'border-success-200/30'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                    ? 'bg-gradient-secondary'
                    : 'bg-gradient-success'
                    }`}>
                    <CheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-display font-bold ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                      ? 'gradient-text-secondary'
                      : 'gradient-text-success'
                      }`}>
                      {cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                        ? 'Cortex Optimization Complete!'
                        : 'Optimization Complete!'}
                    </span>
                    {cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex && (
                      <SparklesIcon className="w-5 h-5 text-secondary-500" />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-display font-bold ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                    ? 'gradient-text-secondary'
                    : 'gradient-text-success'
                    }`}>
                    ${formatSmartNumber(optimizationResult?.costSaved || 0)}
                  </div>
                  <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">saved</div>
                </div>
              </div>
            </div>

            {/* Prompt Comparison */}
            <div className="space-y-6">
              {/* Original vs Optimized Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Query */}
                <div className="glass rounded-xl p-6 border border-primary-200/30">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <span className="text-white text-xs">📝</span>
                      </div>
                      <label className="font-display font-semibold gradient-text">
                        User Query
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-full bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border border-primary-200/30 font-display font-medium text-xs">
                        {(() => {
                          const originalTokens = optimizationResult?.originalTokens
                            || Math.ceil(prompt.split(/\s+/).length * 1.3);
                          return `${Math.round(originalTokens)} tokens`;
                        })()}
                      </span>
                      <button
                        onClick={() => handleCopy(prompt)}
                        className="btn-secondary text-xs"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-primary-200/30 max-h-48 overflow-y-auto">
                    <div
                      className="font-body text-light-text-primary dark:text-dark-text-primary"
                      dangerouslySetInnerHTML={{
                        __html: processFormattedText(prompt)
                      }}
                    />
                  </div>
                </div>

                {/* Generated Answer */}
                <div className={`glass rounded-xl p-6 border ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                  ? 'border-secondary-200/30'
                  : 'border-success-200/30'
                  }`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                        ? 'bg-gradient-secondary'
                        : 'bg-gradient-success'
                        }`}>
                        <span className="text-white text-xs">✨</span>
                      </div>
                      <label className={`font-display font-semibold ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                        ? 'gradient-text-secondary'
                        : 'gradient-text-success'
                        }`}>
                        Generated Answer
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full border font-display font-medium text-xs ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                        ? 'bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border-secondary-200/30'
                        : 'bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30'
                        }`}>
                        {(() => {
                          const optimizedTokens = optimizationResult?.optimizedTokens
                            || Math.ceil((optimizationResult?.generatedAnswer?.split(/\s+/).length || 0) * 1.3);
                          return `${Math.round(optimizedTokens)} tokens`;
                        })()}
                      </span>
                      <button
                        onClick={() => handleCopy(optimizationResult?.generatedAnswer || "")}
                        className="btn-secondary text-xs"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className={`glass rounded-lg p-4 border max-h-48 overflow-y-auto ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                    ? 'border-secondary-200/30'
                    : 'border-success-200/30'
                    }`}>
                    <div
                      className="font-body text-light-text-primary dark:text-dark-text-primary"
                      dangerouslySetInnerHTML={{
                        __html: processFormattedText(optimizationResult?.generatedAnswer || '')
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Token Comparison Stats */}
              <div className={`glass rounded-xl p-6 border shadow-lg ${cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex
                ? 'border-secondary-200/30'
                : 'border-primary-200/30'
                }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold gradient-text mb-1">
                      {optimizationResult ? formatSmartNumber(optimizationResult.tokensSaved) : '0'}
                    </div>
                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                      Tokens Saved
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold gradient-text mb-1">
                      {optimizationResult ? `${optimizationResult.improvementPercentage.toFixed(1)}%` : '0%'}
                    </div>
                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                      Improvement
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold gradient-text-success mb-1">
                      {optimizationResult ? `$${optimizationResult.costSaved.toFixed(6)}` : '$0'}
                    </div>
                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                      Cost Saved
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Stats */}
            {(() => {
              // Only show Cortex UI if explicitly enabled AND not lightweight cortex
              // If cortexEnabled = false, it means user disabled Cortex, so we used lightweight cortex instead
              // In that case, we should show normal optimization UI (no Cortex branding)
              const hasCortex = cortexEnabled && optimizationResult?.metadata?.cortex && !optimizationResult?.metadata?.cortex?.lightweightCortex;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`glass rounded-xl p-6 border shadow-lg backdrop-blur-xl text-center hover:scale-105 transition-transform duration-300 ${hasCortex
                      ? 'border-secondary-200/30'
                      : 'border-primary-200/30'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg ${hasCortex
                        ? 'bg-gradient-secondary'
                        : 'bg-gradient-primary'
                        }`}>
                        <span className="text-white text-lg">📈</span>
                      </div>
                      <div className={`text-2xl font-display font-bold mb-1 ${hasCortex
                        ? 'gradient-text-secondary'
                        : 'gradient-text'
                        }`}>
                        {optimizationResult ? `${optimizationResult.improvementPercentage.toFixed(1)}%` : '0%'}
                      </div>
                      <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                        {hasCortex ? 'Token Reduction' : 'Improvement'}
                      </div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl text-center hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-white text-lg">🎯</span>
                      </div>
                      <div className="text-2xl font-display font-bold gradient-text-success mb-1">
                        {optimizationResult ? formatSmartNumber(optimizationResult.tokensSaved) : '0'}
                      </div>
                      <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Tokens Saved</div>
                    </div>
                    <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl text-center hover:scale-105 transition-transform duration-300">
                      <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-white text-lg">{hasCortex ? '🔍' : '⚙️'}</span>
                      </div>
                      <div className="text-2xl font-display font-bold gradient-text-accent mb-1">
                        {hasCortex
                          ? `${Math.round((optimizationResult?.metadata?.cortex?.semanticIntegrity || 0) * 100)}%`
                          : (optimizationResult?.suggestions?.length || 0)
                        }
                      </div>
                      <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                        {hasCortex ? 'Integrity' : 'Techniques'}
                      </div>
                    </div>
                  </div>

                  {/* Cortex Results Display */}
                  {hasCortex && (
                    <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                      <CortexResultsDisplay
                        metadata={optimizationResult?.metadata}
                        loading={false}
                      />
                    </div>
                  )}

                </div>
              );
            })()}

            {/* Optimization Details */}
            {optimizationResult?.suggestions &&
              Array.isArray(optimizationResult.suggestions) &&
              optimizationResult.suggestions.length > 0 && (
                <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">⚙️</span>
                    </div>
                    <h4 className="font-display font-semibold gradient-text-accent text-lg">
                      Applied Techniques
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {optimizationResult.suggestions.map(
                      (suggestion: { type?: string; implemented?: boolean; description?: string; explanation?: string }, index: number) => {
                        // Safe access to suggestion properties with fallbacks
                        const suggestionType = suggestion?.type || 'optimization';
                        const isImplemented = suggestion?.implemented || false;
                        const description = suggestion?.description ||
                          suggestion?.explanation ||
                          'Optimization technique applied';

                        return (
                          <div
                            key={`suggestion-${index}`}
                            className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl hover:border-primary-300/50 transition-all duration-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-5 h-5 bg-gradient-primary rounded-full mt-1 flex-shrink-0 shadow-lg flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-display font-semibold gradient-text-primary capitalize">
                                    {suggestionType.replace(/_/g, " ")}
                                  </span>
                                  {isImplemented && (
                                    <span className="px-3 py-1 rounded-full bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30 font-display font-medium text-xs">
                                      Applied
                                    </span>
                                  )}
                                </div>
                                <p className="font-body text-light-text-primary dark:text-dark-text-primary">
                                  {renderFormattedContent(description)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-primary-200/30">
              <button
                onClick={handleReset}
                className="btn-secondary flex-1"
              >
                Optimize Another
              </button>
              <button
                onClick={() => handleCopy(optimizationResult?.generatedAnswer || "")}
                className="btn-primary flex-1"
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
