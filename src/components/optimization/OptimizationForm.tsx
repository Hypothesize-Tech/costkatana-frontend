// src/components/optimization/OptimizationForm.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XMarkIcon, SparklesIcon, EyeIcon } from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotifications } from "../../contexts/NotificationContext";
import { optimizationService } from "@/services/optimization.service";
import { getProviders, getModelsForProvider } from "@/utils/cost";
import { formatOptimizationSuggestions, formatSmartNumber } from "@/utils/formatters";
import { AxiosError } from "axios";
import { CortexToggle, CortexConfigPanel, CortexResultsDisplay } from "../cortex";
import { DEFAULT_CORTEX_CONFIG } from "../../types/cortex.types";
import type { CortexConfig } from "../../types/cortex.types";

interface OptimizationFormProps {
  onClose: () => void;
}

const getAIServices = () => {
  return getProviders().map((provider) => ({
    value: provider.toLowerCase().replace(/\s+/g, "-"),
    label: provider,
  }));
};

const getModelsForService = (provider: string) => {
  const normalized = provider
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return getModelsForProvider(normalized).map((model) => model.model);
};

export const OptimizationForm: React.FC<OptimizationFormProps> = ({
  onClose,
}) => {
  const [formData, setFormData] = useState({
    service: "openai",
    model: "gpt-4",
    prompt: "",
  });

  // Cortex state
  const [cortexEnabled, setCortexEnabled] = useState(false);
  const [showCortexAdvanced, setShowCortexAdvanced] = useState(false);
  const [cortexConfig, setCortexConfig] = useState<Partial<CortexConfig>>(DEFAULT_CORTEX_CONFIG);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  // Preview mutation for real-time optimization preview
  const previewMutation = useMutation({
    mutationFn: (data: { prompt: string; model: string; service: string }) =>
      optimizationService.getOptimizationPreview({
        prompt: data.prompt,
        model: data.model,
        service: data.service,
        enableCompression: true,
        enableContextTrimming: true,
        enableRequestFusion: true,
        // Cortex parameters
        enableCortex: cortexEnabled,
        cortexOperation: 'answer', // NEW ARCHITECTURE: Always answer generation,
        cortexStyle: cortexConfig.outputStyle,
        cortexFormat: cortexConfig.outputFormat,
        cortexSemanticCache: cortexConfig.enableSemanticCache,
        cortexStructuredContext: cortexConfig.enableStructuredContext,
        cortexPreserveSemantics: cortexConfig.preserveSemantics,
        cortexIntelligentRouting: cortexConfig.enableIntelligentRouting,
      }),
    onSuccess: (data) => {
      setPreviewData(data);
      setShowPreview(true);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      showNotification(
        error.response?.data?.message || "Failed to generate preview",
        "error",
      );
    },
  });

  // Create optimization mutation
  const createMutation = useMutation({
    mutationFn: (data: { prompt: string; model: string; service: string }) =>
      optimizationService.createOptimization({
        prompt: data.prompt,
        model: data.model,
        service: data.service,
        enableCompression: true,
        enableContextTrimming: true,
        enableRequestFusion: true,
        // Cortex parameters
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
      }),
    onSuccess: () => {
      showNotification("Optimization created successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
      queryClient.invalidateQueries({ queryKey: ["optimization-stats"] });
      onClose();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      showNotification(
        error.response?.data?.message || "Failed to create optimization",
        "error",
      );
    },
  });

  const handlePreview = () => {
    if (!formData.prompt.trim()) {
      showNotification("Please enter a prompt to preview", "error");
      return;
    }
    previewMutation.mutate(formData);
  };

  const handleCreate = () => {
    if (!formData.prompt.trim()) {
      showNotification("Please enter a prompt to optimize", "error");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    if (field === "service") {
      const newService = value as string;
      const newModels = getModelsForService(newService);
      const newModel = newModels[0] || "";
      setFormData((prev) => ({
        ...prev,
        service: newService,
        model: newModel,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Reset preview when form changes
    if (showPreview) {
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-8 border-b border-primary-200/30 bg-gradient-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold gradient-text-primary">
              AI Usage Optimization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="glass rounded-lg p-3 border border-primary-200/30 hover:border-primary-300/50 hover:scale-110 transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-light-text-primary dark:text-dark-text-primary" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-theme(spacing.24))]">
          {/* Form Section */}
          <div
            className={`overflow-y-auto p-8 ${showPreview ? "w-1/2" : "w-full"}`}
          >
            <div className="space-y-8">
              {/* Quick Setup */}
              <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  <h3 className="font-display font-semibold gradient-text-primary text-lg">
                    Quick Start
                  </h3>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Simply paste your AI query below and we'll automatically
                  optimize your AI usage for cost and performance. No API keys or complex
                  configuration required.
                </p>
              </div>

              {/* Provider & Model Selection */}
              <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <h3 className="font-display font-semibold gradient-text-accent text-lg">
                    AI Configuration
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-3 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                      AI Provider
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => handleChange("service", e.target.value)}
                      className="input"
                    >
                      {getAIServices().map((service) => (
                        <option key={service.value} value={service.value}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                      Model
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => handleChange("model", e.target.value)}
                      className="input"
                    >
                      {getModelsForService(formData.service).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  <h3 className="font-display font-semibold gradient-text-success text-lg">
                    Your AI Query
                  </h3>
                </div>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => handleChange("prompt", e.target.value)}
                  rows={12}
                  className="input mb-4"
                  placeholder="Paste your AI query here. We'll analyze your usage patterns and suggest optimizations to reduce costs while maintaining quality..."
                />
                <div className="glass rounded-lg p-4 border border-success-200/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-gradient-success"></div>
                    <span className="font-display font-medium gradient-text-success text-sm">Smart Optimization</span>
                  </div>
                  <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                    Our AI will automatically apply usage optimization, context
                    trimming, and other efficiency techniques.
                  </p>
                </div>
              </div>

              {/* Cortex Configuration */}
              <div className="space-y-4">
                <CortexToggle
                  enabled={cortexEnabled}
                  onChange={setCortexEnabled}
                  disabled={createMutation.isPending || previewMutation.isPending}
                  showAdvancedOptions={showCortexAdvanced}
                  onAdvancedToggle={setShowCortexAdvanced}
                />

                {cortexEnabled && showCortexAdvanced && (
                  <CortexConfigPanel
                    config={cortexConfig}
                    onChange={setCortexConfig}
                    disabled={createMutation.isPending || previewMutation.isPending}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex pt-8 space-x-4 border-t border-primary-200/30">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={
                    previewMutation.isPending || !formData.prompt.trim()
                  }
                  className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {previewMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Preview Optimization
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !formData.prompt.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      Create Optimization
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && previewData && previewData.suggestions && (
            <div className="w-1/2 p-8 bg-gradient-primary/5 border-l border-primary-200/30 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                    <EyeIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold gradient-text-primary">
                    Optimization Preview
                  </h3>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="glass rounded-lg p-2 border border-primary-200/30 hover:border-primary-300/50 hover:scale-110 transition-all duration-200"
                >
                  <XMarkIcon className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" />
                </button>
              </div>

              {/* Savings Summary */}
              <div className="glass rounded-xl p-6 border border-success-200/30 mb-8 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs">💰</span>
                      </div>
                      <p className="font-display font-semibold gradient-text-success">
                        Estimated Savings
                      </p>
                    </div>
                    <p className="text-3xl font-display font-bold gradient-text-success">
                      ${formatSmartNumber(previewData.totalSavings || 0)}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-success flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                {previewData.improvementPercentage && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-success-200/30">
                    <div className="text-center">
                      <div className="font-display font-bold gradient-text text-lg">
                        {formatSmartNumber(previewData.improvementPercentage)}%
                      </div>
                      <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Improvement</div>
                    </div>
                    {previewData.originalTokens && previewData.optimizedTokens && (
                      <div className="text-center">
                        <div className="font-display font-bold gradient-text text-lg">
                          {previewData.originalTokens} → {previewData.optimizedTokens}
                        </div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Tokens</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optimization Techniques */}
              <div className="glass rounded-xl p-6 border border-accent-200/30 mb-8 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">⚙️</span>
                  </div>
                  <h4 className="font-display font-semibold gradient-text-accent">
                    Applied Techniques
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(previewData.techniques || []).map(
                    (technique: string, index: number) => (
                      <div
                        key={index}
                        className="glass rounded-lg p-4 border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-gradient-primary rounded-full shadow-lg"></div>
                          <span className="font-body text-light-text-primary dark:text-dark-text-primary capitalize">
                            {technique.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Cortex Results */}
              {cortexEnabled && previewData?.metadata?.cortex && (
                <div className="mb-6">
                  <CortexResultsDisplay
                    metadata={previewData.metadata}
                    loading={previewMutation.isPending}
                  />
                </div>
              )}

              {/* Suggestions */}
              <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <h4 className="font-display font-semibold gradient-text-secondary">
                    Optimization Suggestions
                  </h4>
                </div>
                {previewData.suggestions &&
                  previewData.suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {formatOptimizationSuggestions(previewData.suggestions).map(
                      (suggestion: any, index: number) => (
                        <div
                          key={index}
                          className="glass rounded-lg p-6 border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-display font-semibold gradient-text capitalize">
                              {suggestion.type || "Optimization"}
                            </h5>
                            <span className={`px-3 py-1 rounded-full text-xs font-display font-medium ${suggestion.estimatedSavings
                              ? "bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30"
                              : suggestion.implemented
                                ? "bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border border-primary-200/30"
                                : "bg-gradient-accent/20 text-accent-700 dark:text-accent-300 border border-accent-200/30"
                              }`}>
                              {suggestion.estimatedSavings
                                ? `$${formatSmartNumber(suggestion.estimatedSavings)} saved`
                                : suggestion.implemented
                                  ? "Applied"
                                  : "Available"}
                            </span>
                          </div>
                          <p className="font-body text-light-text-primary dark:text-dark-text-primary mb-4">
                            {suggestion.description}
                          </p>
                          {suggestion.confidence && (
                            <div className="mb-3">
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
                                  style={{
                                    width: `${suggestion.confidence * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {suggestion.impact && (
                            <div>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-display font-medium ${suggestion.impact === "high"
                                  ? "bg-gradient-danger/20 text-danger-700 dark:text-danger-300 border border-danger-200/30"
                                  : suggestion.impact === "medium"
                                    ? "bg-gradient-warning/20 text-warning-700 dark:text-warning-300 border border-warning-200/30"
                                    : "bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30"
                                  }`}
                              >
                                {suggestion.impact} impact
                              </span>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="glass rounded-lg p-6 border border-warning-200/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-warning flex items-center justify-center">
                        <span className="text-white text-xs">⚠️</span>
                      </div>
                      <span className="font-display font-medium gradient-text-warning">No Specific Suggestions</span>
                    </div>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                      No specific suggestions available, but optimization has
                      been applied to reduce costs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
