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
        cortexOperation: cortexConfig.processingOperation,
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
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Prompt Optimization
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-theme(spacing.20))]">
          {/* Form Section */}
          <div
            className={`overflow-y-auto p-6 ${showPreview ? "w-1/2" : "w-full"}`}
          >
            <div className="space-y-6">
              {/* Quick Setup */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Quick Start
                </h3>
                <p className="text-sm text-blue-700">
                  Simply paste your prompt below and we'll automatically
                  optimize it for cost and performance. No API keys or complex
                  configuration required.
                </p>
              </div>

              {/* Provider & Model Selection */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    AI Provider
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => handleChange("service", e.target.value)}
                    className="block py-2 pr-10 pl-3 mt-1 w-full text-base rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {getAIServices().map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <select
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    className="block py-2 pr-10 pl-3 mt-1 w-full text-base rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {getModelsForService(formData.service).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Your Prompt
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => handleChange("prompt", e.target.value)}
                  rows={12}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Paste your AI prompt here. We'll analyze it and suggest optimizations to reduce costs while maintaining quality..."
                />
                <p className="mt-2 text-sm text-gray-500">
                  Our AI will automatically apply prompt compression, context
                  trimming, and other optimization techniques.
                </p>
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
              <div className="flex pt-6 space-x-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={
                    previewMutation.isPending || !formData.prompt.trim()
                  }
                  className="flex-1 flex items-center justify-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="w-1/2 p-6 bg-gray-50 border-l border-gray-200 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Optimization Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Savings Summary */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Estimated Savings
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ${formatSmartNumber(previewData.totalSavings || 0)}
                    </p>
                  </div>
                  <SparklesIcon className="w-8 h-8 text-green-600" />
                </div>
                {previewData.improvementPercentage && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>
                      Improvement:{" "}
                      {formatSmartNumber(previewData.improvementPercentage)}%
                    </span>
                    {previewData.originalTokens &&
                      previewData.optimizedTokens && (
                        <span>
                          Tokens: {previewData.originalTokens} →{" "}
                          {previewData.optimizedTokens}
                        </span>
                      )}
                  </div>
                )}
              </div>

              {/* Optimization Techniques */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Applied Techniques
                </h4>
                <div className="space-y-2">
                  {(previewData.techniques || []).map(
                    (technique: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-white rounded border"
                      >
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 capitalize">
                          {technique.replace(/_/g, " ")}
                        </span>
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
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Optimization Suggestions
                </h4>
                {previewData.suggestions &&
                  previewData.suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {formatOptimizationSuggestions(previewData.suggestions).map(
                      (suggestion: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-lg border"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-gray-900 capitalize">
                              {suggestion.type || "Optimization"}
                            </h5>
                            <span className="text-xs text-green-600 font-medium">
                              {suggestion.estimatedSavings
                                ? `$${formatSmartNumber(suggestion.estimatedSavings)} saved`
                                : suggestion.implemented
                                  ? "Applied"
                                  : "Available"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {suggestion.description}
                          </p>
                          {suggestion.confidence && (
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">
                                Confidence:
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full"
                                  style={{
                                    width: `${suggestion.confidence * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 ml-2">
                                {Math.round(suggestion.confidence * 100)}%
                              </span>
                            </div>
                          )}
                          {suggestion.impact && (
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${suggestion.impact === "high"
                                  ? "bg-red-100 text-red-800"
                                  : suggestion.impact === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
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
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
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
