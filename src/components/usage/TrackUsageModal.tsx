import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { UsageService } from "@/services/usage.service";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  calculateCost,
  getProviders,
  getModelsForProvider,
  estimateTokens,
} from "@/utils/cost";
import { AxiosError } from "axios";
import { OptimizationWidget } from "../optimization";

interface TrackUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

// Get AI services from pricing data
const getAIServices = () => {
  return getProviders().map((provider) => ({
    value: provider.toLowerCase().replace(/\s+/g, "-"),
    label: provider,
  }));
};

// Get models for a specific provider from pricing data
const getModelsForService = (provider: string) => {
  const normalizedProvider = provider
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return getModelsForProvider(normalizedProvider).map((model) => model.model);
};

const calculateUsageFromText = (
  provider: string,
  model: string,
  prompt: string,
  response: string,
) => {
  const normalizedProvider = provider
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const inputTokens = estimateTokens(prompt, normalizedProvider);
  const outputTokens = estimateTokens(response, normalizedProvider);
  const totalTokens = inputTokens + outputTokens;
  const totalCost = calculateCost(
    inputTokens,
    outputTokens,
    normalizedProvider,
    model,
  );

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    totalCost,
  };
};

export const TrackUsageModal: React.FC<TrackUsageModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  // Get initial services and models from pricing data
  const aiServices = getAIServices();
  const defaultService = aiServices[0]?.value || "openai";
  const defaultModels = getModelsForService(defaultService);

  const [formData, setFormData] = useState({
    provider: defaultService,
    model: defaultModels[0] || "",
    prompt: "",
    response: "",
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCost: 0,
    responseTime: 0,
    metadata: {
      project: "",
      tags: "",
    },
    userEmail: "",
    customerEmail: "",
    projectId: projectId && projectId !== "all" ? projectId : undefined,
  });
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [showOptimizationWidget, setShowOptimizationWidget] = useState(false);

  // Function to manually trigger calculation
  const triggerCalculation = () => {
    if (formData.prompt || formData.response) {
      try {
        const usage = calculateUsageFromText(
          formData.provider,
          formData.model,
          formData.prompt,
          formData.response,
        );
        setFormData((prev) => ({
          ...prev,
          promptTokens: usage.inputTokens,
          completionTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          estimatedCost: usage.totalCost,
        }));
        showNotification("Tokens and cost calculated successfully", "success");
      } catch (error) {
        console.error("Failed to calculate cost:", error);
        showNotification("Failed to calculate tokens and cost", "error");
      }
    } else {
      showNotification("Please enter prompt text first", "error");
    }
  };

  // Update form data when projectId changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      projectId: projectId && projectId !== "all" ? projectId : undefined,
    }));
  }, [projectId]);

  const trackUsageMutation = useMutation({
    mutationFn: (data: any) => UsageService.trackUsage(data),
    onSuccess: () => {
      showNotification("Usage tracked successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["usage"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      showNotification(
        error.response?.data?.message || "Failed to track usage",
        "error",
      );
    },
  });

  const handleChange = (field: string, value: string | number) => {
    let newFormData = { ...formData, [field]: value };

    if (field === "provider") {
      const newProvider = value as string;
      const newModels = getModelsForService(newProvider);
      const firstModel = newModels[0] || "";
      newFormData = { ...newFormData, model: firstModel };
    }

    if (
      autoCalculate &&
      (field === "prompt" ||
        field === "response" ||
        field === "provider" ||
        field === "model")
    ) {
      const { provider, model, prompt, response } = newFormData;
      if (prompt || response) {
        try {
          const usage = calculateUsageFromText(
            provider,
            model,
            prompt,
            response,
          );
          newFormData = {
            ...newFormData,
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            estimatedCost: usage.totalCost,
          };
        } catch (error) {
          console.error("Failed to calculate cost:", error);
        }
      }
    }

    // Update totalTokens when promptTokens or completionTokens change
    if (field === "promptTokens" || field === "completionTokens") {
      const promptTokens =
        field === "promptTokens" ? (value as number) : newFormData.promptTokens;
      const completionTokens =
        field === "completionTokens"
          ? (value as number)
          : newFormData.completionTokens;
      newFormData = {
        ...newFormData,
        totalTokens: promptTokens + completionTokens,
      };
    }

    setFormData(newFormData);
  };

  const handleOptimizationApply = (
    optimizedPrompt: string,
    _optimization: any,
  ) => {
    setFormData({ ...formData, prompt: optimizedPrompt });
    setShowOptimizationWidget(false);
    showNotification("Prompt optimized successfully", "success");
  };

  const handleMetadataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { response, ...dataToSubmit } = formData;

    // Normalize provider name for submission
    const normalizedProvider = formData.provider
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // Ensure projectId is included in the submission
    let submissionData = {
      ...dataToSubmit,
      provider: normalizedProvider,
      projectId: projectId && projectId !== "all" ? projectId : undefined,
    };

    if (!dataToSubmit.prompt) {
      showNotification("Please enter a prompt", "error");
      return;
    }

    // If auto-calculate is enabled and we have prompt/response text but no tokens, calculate them now
    if (
      autoCalculate &&
      dataToSubmit.totalTokens === 0 &&
      dataToSubmit.prompt
    ) {
      try {
        const usage = calculateUsageFromText(
          dataToSubmit.provider,
          dataToSubmit.model,
          dataToSubmit.prompt,
          formData.response || "",
        );
        submissionData = {
          ...submissionData,
          promptTokens: usage.inputTokens,
          completionTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          estimatedCost: usage.totalCost,
        };
      } catch (error) {
        console.error("Failed to calculate cost during submission:", error);
      }
    }

    // Check if we still have no tokens after calculation attempt
    if (
      submissionData.totalTokens === 0 &&
      (!autoCalculate || !submissionData.prompt)
    ) {
      showNotification(
        "Please enter token counts or enable auto-calculation with valid prompt text",
        "error",
      );
      return;
    }

    trackUsageMutation.mutate(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="overflow-y-auto fixed inset-0 z-50">
      <div className="flex justify-center items-center p-4 min-h-screen">
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/50"
          onClick={onClose}
        />

        <div className="relative glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="sticky top-0 px-4 sm:px-6 py-4 rounded-t-2xl border-b border-primary-200/30 dark:border-primary-500/20 glass bg-gradient-light-panel dark:bg-gradient-dark-panel z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40">
                  <PlusIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">
                  Track API Usage
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors duration-300 [touch-action:manipulation] active:scale-95"
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Service and Model Selection */}
            <div className="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  AI Service
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => handleChange("provider", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  required
                >
                  {aiServices.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  required
                >
                  {getModelsForService(formData.provider).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prompt and Response */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1.5 sm:mb-2">
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white">
                  Prompt
                </label>
                {formData.prompt && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowOptimizationWidget(!showOptimizationWidget)
                    }
                    className="text-xs sm:text-sm font-medium font-display text-[#06ec9e] dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors duration-300 [touch-action:manipulation] active:scale-95"
                  >
                    {showOptimizationWidget ? "Hide" : "Optimize"} Prompt
                  </button>
                )}
              </div>
              <textarea
                value={formData.prompt}
                onChange={(e) => handleChange("prompt", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Enter the prompt you sent to the AI..."
                required
              />
            </div>

            {/* Optimization Widget */}
            {showOptimizationWidget && formData.prompt && (
              <div className="p-3 sm:p-4 mt-3 sm:mt-4 bg-gradient-to-br rounded-xl border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl glass from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
                <OptimizationWidget
                  prompt={formData.prompt}
                  model={formData.model}
                  service={formData.provider}
                  onApplyOptimization={handleOptimizationApply}
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                Response (Optional)
              </label>
              <textarea
                value={formData.response}
                onChange={(e) => handleChange("response", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Enter the AI's response..."
              />
            </div>

            {/* Auto-calculate Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCalculate"
                  checked={autoCalculate}
                  onChange={(e) => {
                    setAutoCalculate(e.target.checked);
                    // If turning on auto-calculate, trigger calculation immediately
                    if (
                      e.target.checked &&
                      (formData.prompt || formData.response)
                    ) {
                      setTimeout(triggerCalculation, 100);
                    }
                  }}
                  className="w-4 h-4 rounded text-[#06ec9e] border-primary-300 dark:border-primary-700 focus:ring-[#06ec9e] [touch-action:manipulation]"
                />
                <label
                  htmlFor="autoCalculate"
                  className="ml-2 text-xs sm:text-sm font-body text-secondary-900 dark:text-white"
                >
                  Auto-calculate tokens and cost
                </label>
              </div>
              {!autoCalculate && (
                <button
                  type="button"
                  onClick={triggerCalculation}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[36px] [touch-action:manipulation] active:scale-95"
                >
                  Calculate Now
                </button>
              )}
            </div>

            {/* Token Counts */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Prompt Tokens
                </label>
                <input
                  type="number"
                  value={formData.promptTokens}
                  onChange={(e) =>
                    handleChange("promptTokens", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 disabled:opacity-50 min-h-[44px] [touch-action:manipulation]"
                  disabled={autoCalculate}
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Completion Tokens
                </label>
                <input
                  type="number"
                  value={formData.completionTokens}
                  onChange={(e) =>
                    handleChange(
                      "completionTokens",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 disabled:opacity-50 min-h-[44px] [touch-action:manipulation]"
                  disabled={autoCalculate}
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Total Tokens
                </label>
                <input
                  type="number"
                  value={formData.totalTokens}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 disabled:opacity-50 min-h-[44px]"
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Cost ($)
                </label>
                <input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    handleChange(
                      "estimatedCost",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  step="0.0001"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 disabled:opacity-50 min-h-[44px] [touch-action:manipulation]"
                  disabled={autoCalculate}
                  required
                />
              </div>
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-xs sm:text-sm font-medium font-display text-light-text-primary dark:text-dark-text-primary mb-1.5 sm:mb-2">
                Response Time (ms)
              </label>
              <input
                type="number"
                value={formData.responseTime}
                onChange={(e) =>
                  handleChange("responseTime", parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                placeholder="Optional: Time taken for the API call"
              />
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Project (Optional)
                </label>
                <input
                  type="text"
                  value={formData.metadata.project}
                  onChange={(e) =>
                    handleMetadataChange("project", e.target.value)
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  placeholder="e.g., Customer Support Bot"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={formData.metadata.tags}
                  onChange={(e) => handleMetadataChange("tags", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  placeholder="e.g., support, production"
                />
              </div>
            </div>

            {/* Email Fields */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  User Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => handleChange("userEmail", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  placeholder="developer@company.com"
                />
                <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                  Email of the developer/integrator
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium font-display text-secondary-900 dark:text-white mb-1.5 sm:mb-2">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleChange("customerEmail", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                  placeholder="client@client.com"
                />
                <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                  Email of the end customer/client
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-primary-200/30 dark:border-primary-700/30">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={trackUsageMutation.isLoading}
                className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[44px] [touch-action:manipulation]"
              >
                {trackUsageMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    Track Usage
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
