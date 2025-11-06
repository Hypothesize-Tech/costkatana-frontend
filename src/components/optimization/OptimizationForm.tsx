// src/components/optimization/OptimizationForm.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XMarkIcon, SparklesIcon, EyeIcon, CpuChipIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotifications } from "../../contexts/NotificationContext";
import { optimizationService } from "@/services/optimization.service";
import { getProviders, getModelsForProvider } from "@/utils/cost";
import { formatOptimizationSuggestions } from "@/utils/formatters";
import { AxiosError } from "axios";

interface OptimizationFormProps {
  onClose: () => void;
  onOptimizationCreated?: (optimization: any) => void;
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
  onOptimizationCreated,
}) => {
  const [formData, setFormData] = useState({
    service: "openai",
    model: "gpt-4",
    prompt: "",
    useCortex: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  // Preview mutation for real-time optimization preview
  const previewMutation = useMutation({
    mutationFn: (data: { prompt: string; model: string; service: string; useCortex: boolean }) =>
      optimizationService.getOptimizationPreview({
        prompt: data.prompt,
        model: data.model,
        service: data.service,
        useCortex: data.useCortex,
        enableCompression: true,
        enableContextTrimming: true,
        enableRequestFusion: true,
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
    mutationFn: (data: { prompt: string; model: string; service: string; useCortex: boolean }) =>
      optimizationService.createOptimization({
        prompt: data.prompt,
        model: data.model,
        service: data.service,
        useCortex: data.useCortex,
        enableCompression: true,
        enableContextTrimming: true,
        enableRequestFusion: true,
      }),
    onSuccess: (data) => {
      showNotification("Optimization created successfully!", "success");

      // Call the callback to update the parent component immediately
      if (onOptimizationCreated) {
        onOptimizationCreated(data);
      }

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
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="glass rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex justify-between items-center p-6 border-b border-primary-200/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold gradient-text-primary">
              AI Prompt Optimization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass rounded-lg border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200 hover:scale-105"
          >
            <XMarkIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-theme(spacing.20))]">
          {/* Form Section */}
          <div
            className={`overflow-y-auto p-6 ${showPreview ? "w-1/2" : "w-full"}`}
          >
            <div className="space-y-6">
              {/* Quick Setup */}
              <div className="glass rounded-xl p-5 border border-primary-200/30 backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-sm font-display font-semibold gradient-text-primary">
                    Quick Start
                  </h3>
                </div>
                <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Simply paste your prompt below and we'll automatically
                  optimize it for cost and performance. No API keys or complex
                  configuration required.
                </p>
              </div>

              {/* Provider & Model Selection */}
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

              {/* Cortex Toggle */}
              <div className="glass rounded-xl p-4 border border-secondary-200/30 backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-secondary-100/20 dark:from-secondary-900/10 dark:to-secondary-800/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                      <CpuChipIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-semibold gradient-text-secondary mb-1">
                        Cortex Meta-Language Optimization
                      </h3>
                      <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                        Enable advanced semantic optimization using Cortex to reduce token costs by up to 60%
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.useCortex}
                    onChange={(e) => handleChange("useCortex", e.target.checked)}
                    className="toggle"
                  />
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block mb-3 text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                  Your Prompt
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => handleChange("prompt", e.target.value)}
                  rows={12}
                  className="input resize-none"
                  placeholder="Paste your AI prompt here. We'll analyze it and suggest optimizations to reduce costs while maintaining quality..."
                />
                <p className="mt-3 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Our AI will automatically apply prompt compression, context
                  trimming, and other optimization techniques.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-primary-200/30">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={
                    previewMutation.isPending || !formData.prompt.trim()
                  }
                  className="flex-1 btn btn-secondary"
                >
                  {previewMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-5 h-5 mr-2" />
                      Preview Optimization
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !formData.prompt.trim()}
                  className="flex-1 btn btn-primary"
                >
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      Create Optimization
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && previewData && previewData.suggestions && (
            <div className="w-1/2 p-6 border-l border-primary-200/30 overflow-y-auto bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-display font-bold gradient-text-primary">
                  Optimization Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 glass rounded-lg border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200"
                >
                  <XMarkIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </button>
              </div>

              {/* Savings Summary */}
              <div className="mb-6 glass rounded-xl p-5 border border-success-200/30 backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/20 dark:from-success-900/10 dark:to-success-800/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">
                      Estimated Savings
                    </p>
                    <p className="text-2xl font-display font-bold gradient-text-success">
                      ${(previewData.totalSavings || 0).toFixed(4)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {previewData.improvementPercentage && (
                  <div className="glass rounded-lg p-3 border border-success-200/30">
                    <div className="flex justify-between text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      <span>
                        Improvement:{" "}
                        <span className="font-display font-semibold gradient-text-success">
                          {previewData.improvementPercentage.toFixed(1)}%
                        </span>
                      </span>
                      {previewData.originalTokens &&
                        previewData.optimizedTokens && (
                          <span>
                            Tokens: <span className="font-display font-semibold">{previewData.originalTokens} → {previewData.optimizedTokens}</span>
                          </span>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Optimization Techniques */}
              <div className="mb-6">
                <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                  Applied Techniques
                </h4>
                <div className="space-y-2">
                  {(previewData.techniques || []).map(
                    (technique: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 glass rounded-lg border border-primary-200/30 backdrop-blur-xl"
                      >
                        <div className="w-2 h-2 bg-gradient-primary rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-body text-light-text-primary dark:text-dark-text-primary capitalize">
                          {technique.replace(/_/g, " ")}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                  Optimization Suggestions
                </h4>
                {previewData.suggestions &&
                  previewData.suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {formatOptimizationSuggestions(previewData.suggestions).map(
                      (suggestion: any, index: number) => (
                        <div
                          key={index}
                          className="glass rounded-lg p-4 border border-accent-200/30 backdrop-blur-xl"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-display font-semibold gradient-text-accent capitalize">
                              {suggestion.type || "Optimization"}
                            </h5>
                            <span className="px-2 py-1 rounded-full text-xs font-body bg-success-50/50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border border-success-200/50">
                              {suggestion.estimatedSavings
                                ? `$${suggestion.estimatedSavings.toFixed(4)} saved`
                                : suggestion.implemented
                                  ? "Applied"
                                  : "Available"}
                            </span>
                          </div>
                          <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">
                            {suggestion.description}
                          </p>
                          {suggestion.confidence && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Confidence:
                              </span>
                              <div className="flex-1 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-2">
                                <div
                                  className="bg-gradient-primary h-2 rounded-full"
                                  style={{
                                    width: `${suggestion.confidence * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                {Math.round(suggestion.confidence * 100)}%
                              </span>
                            </div>
                          )}
                          {suggestion.impact && (
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-display font-medium ${suggestion.impact === "high"
                                  ? "bg-danger-50/50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 border border-danger-200/50"
                                  : suggestion.impact === "medium"
                                    ? "bg-warning-50/50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 border border-warning-200/50"
                                    : "bg-success-50/50 dark:bg-success-900/20 text-success-700 dark:text-success-300 border border-success-200/50"
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
                  <div className="glass rounded-lg p-4 border border-warning-200/30 backdrop-blur-xl bg-gradient-to-br from-warning-50/30 to-warning-100/20 dark:from-warning-900/10 dark:to-warning-800/10">
                    <p className="text-sm font-body text-warning-700 dark:text-warning-300">
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
