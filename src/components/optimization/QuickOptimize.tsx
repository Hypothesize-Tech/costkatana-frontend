// src/components/optimization/QuickOptimize.tsx
import React, { useState } from "react";
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { optimizationService } from "@/services/optimization.service";
import { useNotifications } from "../../contexts/NotificationContext";
import { renderFormattedContent, formatSmartNumber, formatCurrency } from "@/utils/formatters";
import { OptimizedPromptDisplay } from "../common/FormattedContent";
import { CortexToggle, CortexResultsDisplay, CortexConfigPanel } from "../cortex";
import { DEFAULT_CORTEX_CONFIG } from "../../types/cortex.types";
import type { CortexConfig } from "../../types/cortex.types";
import type { Optimization } from "../../types/optimization.types";

interface QuickOptimizeProps {
  className?: string;
}

export const QuickOptimize: React.FC<QuickOptimizeProps> = ({
  className = "",
}) => {
  const [prompt, setPrompt] = useState("");
  const [optimizationResult, setOptimizationResult] = useState<Optimization | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { showNotification } = useNotifications();

  // Direct API call state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  // Cortex state
  const [cortexEnabled, setCortexEnabled] = useState(false);
  const [showCortexAdvanced, setShowCortexAdvanced] = useState(false);
  const [cortexConfig, setCortexConfig] = useState<Partial<CortexConfig>>(DEFAULT_CORTEX_CONFIG);

  // Direct API call for optimization
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
        cortexOperation: cortexConfig.processingOperation,
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
        optimizedPrompt: result?.optimizedPrompt || ''
      };

      setOptimizationResult(safeResult);
      setShowResult(true);
      showNotification("Prompt optimized successfully!", "success");
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
    } catch (error) {
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
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SparklesIcon className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Optimize
            </h3>
          </div>
          {cortexEnabled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <SparklesIcon className="w-3 h-3 mr-1" />
              Cortex Enhanced
            </span>
          )}
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste your AI prompt here for instant optimization..."
              />
            </div>

            {/* Cortex Toggle for Quick Optimize */}
            <div className="border-t border-gray-100 pt-4">
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
              <div className="mt-4">
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
              className="w-full flex items-center justify-center px-4 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isOptimizing ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Optimizing...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Optimize Now
                </>
              )}
            </button>

            {/* Show error if optimization fails */}
            {optimizationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {optimizationError}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              ✨ AI-powered optimization • {cortexEnabled ? (showCortexAdvanced ? 'Cortex configured' : 'Cortex with defaults') : 'Standard optimization'} • Instant results
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success Header */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${cortexEnabled && optimizationResult?.metadata?.cortex
              ? 'bg-purple-50 border-purple-200'
              : 'bg-green-50 border-green-200'
              }`}>
              <div className="flex items-center">
                <CheckIcon className={`w-5 h-5 mr-2 ${cortexEnabled && optimizationResult?.metadata?.cortex
                  ? 'text-purple-600'
                  : 'text-green-600'
                  }`} />
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${cortexEnabled && optimizationResult?.metadata?.cortex
                    ? 'text-purple-900'
                    : 'text-green-900'
                    }`}>
                    {cortexEnabled && optimizationResult?.metadata?.cortex
                      ? 'Cortex Optimization Complete!'
                      : 'Optimization Complete!'}
                  </span>
                  {cortexEnabled && optimizationResult?.metadata?.cortex && (
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                  )}
                </div>
              </div>
              <span className={`text-lg font-bold ${cortexEnabled && optimizationResult?.metadata?.cortex
                ? 'text-purple-600'
                : 'text-green-600'
                }`}>
                ${formatSmartNumber(optimizationResult?.costSaved || 0)} saved
              </span>
            </div>

            {/* Prompt Comparison */}
            <div className="space-y-4">
              {/* Original vs Optimized Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Prompt */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Original Prompt
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {(() => {
                          const originalTokens = optimizationResult?.metadata?.cortexTokenReduction?.originalTokens
                            || optimizationResult?.originalTokens
                            || Math.ceil(prompt.split(/\s+/).length * 1.3);
                          return `${Math.round(originalTokens)} tokens`;
                        })()}
                      </span>
                      <button
                        onClick={() => handleCopy(prompt)}
                        className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {prompt}
                    </div>
                  </div>
                </div>

                {/* Optimized Prompt */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`text-sm font-medium ${cortexEnabled && optimizationResult?.metadata?.cortex
                      ? 'text-purple-700'
                      : 'text-gray-700'
                      }`}>
                      Optimized Prompt
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${cortexEnabled && optimizationResult?.metadata?.cortex
                        ? 'text-purple-600 bg-purple-100'
                        : 'text-green-600 bg-green-100'
                        }`}>
                        {(() => {
                          const optimizedTokens = optimizationResult?.metadata?.cortexTokenReduction?.cortexTokens
                            || optimizationResult?.optimizedTokens
                            || Math.ceil((optimizationResult?.optimizedPrompt?.split(/\s+/).length || 0) * 1.3);
                          return `${Math.round(optimizedTokens)} tokens`;
                        })()}
                      </span>
                      <button
                        onClick={() => handleCopy(optimizationResult?.optimizedPrompt || "")}
                        className={`flex items-center px-2 py-1 text-xs font-medium ${cortexEnabled && optimizationResult?.metadata?.cortex
                          ? 'text-purple-600 hover:text-purple-800'
                          : 'text-indigo-600 hover:text-indigo-800'
                          }`}>
                        <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 max-h-48 overflow-y-auto ${cortexEnabled && optimizationResult?.metadata?.cortex
                    ? 'bg-purple-50 border border-purple-200'
                    : 'bg-green-50 border border-green-200'
                    }`}>
                    <OptimizedPromptDisplay
                      content={optimizationResult?.optimizedPrompt || ""}
                      maxHeight=""
                    />
                  </div>
                </div>
              </div>

              {/* Token Comparison Stats */}
              <div className={`p-3 rounded-lg border ${cortexEnabled && optimizationResult?.metadata?.cortex
                ? 'bg-purple-50 border-purple-200'
                : 'bg-blue-50 border-blue-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Token Reduction:</span>
                      <span className={`ml-2 font-semibold ${cortexEnabled && optimizationResult?.metadata?.cortex
                        ? 'text-purple-700'
                        : 'text-blue-700'
                        }`}>
                        {optimizationResult?.tokensSaved || 0} tokens
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Improvement:</span>
                      <span className={`ml-2 font-semibold ${cortexEnabled && optimizationResult?.metadata?.cortex
                        ? 'text-purple-700'
                        : 'text-blue-700'
                        }`}>
                        {formatSmartNumber(optimizationResult?.improvementPercentage || 0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Cost Saved:</span>
                    <span className="ml-2 font-semibold text-green-700">
                      ${formatSmartNumber(optimizationResult?.costSaved || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Stats */}
            {(() => {
              const hasCortex = optimizationResult?.metadata?.cortex;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className={`p-3 rounded border ${cortexEnabled && hasCortex
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-blue-50 border-blue-200'
                      }`}>
                      <div className={`text-lg font-bold ${cortexEnabled && hasCortex
                        ? 'text-purple-600'
                        : 'text-blue-600'
                        }`}>
                        {cortexEnabled && hasCortex
                          ? `${Math.round(optimizationResult?.metadata?.cortex?.reductionPercentage || 0)}%`
                          : `${formatSmartNumber(optimizationResult?.improvementPercentage || 0)}%`
                        }
                      </div>
                      <div className={`text-xs ${cortexEnabled && hasCortex
                        ? 'text-purple-700'
                        : 'text-blue-700'
                        }`}>
                        {cortexEnabled && hasCortex ? 'Token Reduction' : 'Improvement'}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="text-lg font-bold text-green-600">
                        {cortexEnabled && hasCortex
                          ? (optimizationResult?.metadata?.cortex?.tokensSaved || 0)
                          : (optimizationResult?.tokensSaved || 0)
                        }
                      </div>
                      <div className="text-xs text-green-700">Tokens Saved</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded border border-orange-200">
                      <div className="text-lg font-bold text-orange-600">
                        {cortexEnabled && hasCortex
                          ? `${Math.round((optimizationResult?.metadata?.cortex?.semanticIntegrity || 0) * 100)}%`
                          : (optimizationResult?.suggestions?.length || 0)
                        }
                      </div>
                      <div className="text-xs text-orange-700">
                        {cortexEnabled && hasCortex ? 'Integrity' : 'Techniques'}
                      </div>
                    </div>
                  </div>

                  {/* Cortex Results Display */}
                  {cortexEnabled && hasCortex && (
                    <div className="mt-4">
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
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Applied Techniques
                  </h4>
                  <div className="space-y-2">
                    {optimizationResult.suggestions.map(
                      (suggestion: any, index: number) => {
                        // Safe access to suggestion properties with fallbacks
                        const suggestionType = suggestion?.type || 'optimization';
                        const isImplemented = suggestion?.implemented || false;
                        const description = suggestion?.description ||
                          suggestion?.explanation ||
                          'Optimization technique applied';

                        return (
                          <div
                            key={`suggestion-${index}`}
                            className="flex items-start p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                  {suggestionType.replace(/_/g, " ")}
                                </span>
                                {isImplemented && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Applied
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {renderFormattedContent(description)}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Optimize Another
              </button>
              <button
                onClick={() => handleCopy(optimizationResult?.optimizedPrompt || "")}
                className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
