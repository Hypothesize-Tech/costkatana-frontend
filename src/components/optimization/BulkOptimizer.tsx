import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RocketLaunchIcon, SparklesIcon, DocumentTextIcon, CogIcon } from "@heroicons/react/24/outline";
import { optimizationService } from "../../services/optimization.service";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotification } from "../../contexts/NotificationContext";
import { CortexToggle } from "../cortex";
import { DEFAULT_CORTEX_CONFIG } from "../../types/cortex.types";
import type { CortexConfig } from "../../types/cortex.types";

interface OptimizablePrompt {
  prompt: string;
  count: number;
  promptId: string;
}

interface BulkOptimizerProps {
  onOptimizationsCreated?: (optimizations: any[]) => void;
}

export const BulkOptimizer: React.FC<BulkOptimizerProps> = ({ onOptimizationsCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    service: "",
    minCalls: 5,
    timeframe: "7d",
  });
  const [prompts, setPrompts] = useState<OptimizablePrompt[]>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [cortexEnabled, setCortexEnabled] = useState(false);
  const [cortexConfig, setCortexConfig] = useState<CortexConfig>(DEFAULT_CORTEX_CONFIG);

  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const fetchPromptsMutation = useMutation({
    mutationFn: () =>
      optimizationService.getPromptsForBulkOptimization(filters),
    onSuccess: (result) => {
      if (result.length === 0) {
        showNotification("No prompts found matching the criteria.", "info");
      }
      setPrompts(result);
      setSelectedPrompts(result.map((p: any) => p.promptId)); // auto-select all
    },
    onError: () => {
      showNotification("Failed to fetch prompts for optimization.", "error");
    },
  });

  const bulkOptimizeMutation = useMutation({
    mutationFn: (promptIds: string[]) =>
      optimizationService.bulkOptimize({
        promptIds,
        cortexEnabled,
        cortexConfig: cortexEnabled ? cortexConfig : undefined
      }),
    onSuccess: (result) => {
      showNotification(
        `Successfully optimized ${result.successful} out of ${result.total} prompts.`,
        "success",
      );

      // Call the callback to update the parent component immediately
      if (onOptimizationsCreated && result.optimizations) {
        onOptimizationsCreated(result.optimizations);
      }

      setIsOpen(false);
      setPrompts([]);
      setSelectedPrompts([]);
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
    },
    onError: () => {
      showNotification("Bulk optimization failed", "error");
    },
  });

  const handleFetchPrompts = () => {
    fetchPromptsMutation.mutate();
  };

  const handleOptimize = () => {
    if (selectedPrompts.length === 0) {
      showNotification(
        "Please select at least one prompt to optimize.",
        "warning",
      );
      return;
    }
    bulkOptimizeMutation.mutate(selectedPrompts);
  };

  const handleSelectPrompt = (promptId: string) => {
    setSelectedPrompts((prev) =>
      prev.includes(promptId)
        ? prev.filter((id) => id !== promptId)
        : [...prev, promptId],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPrompts(prompts.map((p) => p.promptId));
    } else {
      setSelectedPrompts([]);
    }
  };

  const handleCortexConfigChange = (config: Partial<CortexConfig>) => {
    setCortexConfig(prev => ({ ...prev, ...config }));
  };

  return (
    <div className="glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel sm:rounded-xl">
      <div className="bg-gradient-primary/10 p-4 rounded-t-lg border-b border-primary-200/30 sm:p-6 md:p-8 sm:rounded-t-xl">
        <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-2 sm:gap-4 sm:mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg sm:w-10 sm:h-10 md:w-12 md:h-12 md:rounded-xl">
                <RocketLaunchIcon className="w-4 h-4 text-white sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary sm:text-2xl md:text-3xl">
                Bulk Optimization
              </h3>
            </div>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base md:text-lg">
              Automatically analyze and optimize your most frequently used prompts
            </p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`btn btn-primary w-full min-h-[44px] sm:w-auto sm:ml-6 [touch-action:manipulation] active:scale-95 ${isOpen ? 'btn-secondary' : ''}`}
          >
            {isOpen ? "Cancel" : "Start Analysis"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl mb-4 sm:p-5 md:p-6 md:rounded-xl md:mb-6">
            <h4 className="font-display font-semibold gradient-text-primary mb-3 flex items-center gap-2 text-sm sm:text-base sm:mb-4">
              <div className="w-5 h-5 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg sm:w-6 sm:h-6">
                <CogIcon className="w-3 h-3 text-white sm:w-4 sm:h-4" />
              </div>
              Analysis Filters
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Service (Optional)
                </label>
                <select
                  value={filters.service}
                  onChange={(e) =>
                    setFilters({ ...filters, service: e.target.value })
                  }
                  className="input"
                >
                  <option value="">All Services</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google AI</option>
                  <option value="aws-bedrock">AWS Bedrock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Minimum Calls
                </label>
                <input
                  type="number"
                  min="1"
                  value={filters.minCalls}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minCalls: parseInt(e.target.value) || 1,
                    })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Timeframe
                </label>
                <select
                  value={filters.timeframe}
                  onChange={(e) =>
                    setFilters({ ...filters, timeframe: e.target.value })
                  }
                  className="input"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cortex Toggle */}
          <div className="glass rounded-lg p-4 border border-secondary-200/30 shadow-lg backdrop-blur-xl mb-4 sm:p-5 md:p-6 md:rounded-xl md:mb-6">
            <CortexToggle
              enabled={cortexEnabled}
              onChange={setCortexEnabled}
              config={cortexConfig}
              onConfigChange={handleCortexConfigChange}
            />
            {cortexEnabled && (
              <div className="mt-3 p-3 glass rounded-lg border border-secondary-200/30 shadow-lg backdrop-blur-xl sm:mt-4 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-secondary flex items-center justify-center shadow-lg sm:w-5 sm:h-5">
                    <SparklesIcon className="w-2.5 h-2.5 text-white sm:w-3 sm:h-3" />
                  </div>
                  <p className="text-xs font-display font-medium gradient-text-secondary sm:text-sm">Cortex Enhancement Active</p>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                  Cortex will generate answers in LISP format for maximum token savings
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleFetchPrompts}
              disabled={fetchPromptsMutation.isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full min-h-[44px] sm:w-auto [touch-action:manipulation] active:scale-95"
            >
              {fetchPromptsMutation.isLoading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Analyzing...
                </>
              ) : (
                "Find Prompts"
              )}
            </button>
          </div>

          {prompts.length > 0 && (
            <div className="glass rounded-lg p-4 border border-success-200/30 shadow-lg backdrop-blur-xl sm:p-5 md:p-6 md:rounded-xl">
              <div className="flex items-center gap-2 mb-4 sm:gap-3 sm:mb-5 md:mb-6">
                <div className="w-6 h-6 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg sm:w-7 sm:h-7 md:w-8 md:h-8">
                  <DocumentTextIcon className="w-4 h-4 text-white sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </div>
                <h4 className="text-base font-display font-bold gradient-text-success sm:text-lg md:text-xl">
                  Select prompts to optimize
                </h4>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="glass rounded-lg p-3 border border-primary-200/30 shadow-lg backdrop-blur-xl sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectedPrompts.length === prompts.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500 focus:ring-2 min-w-[20px] min-h-[20px]"
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-display font-semibold gradient-text-primary cursor-pointer sm:text-base"
                    >
                      Select All ({selectedPrompts.length} / {prompts.length})
                    </label>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 sm:max-h-80 sm:space-y-3 scrollbar-hide">
                  {prompts.map((p) => (
                    <div
                      key={p.promptId}
                      className="glass rounded-lg p-3 border border-primary-200/30 hover:border-primary-300/50 transition-all duration-200 hover:scale-[1.01] sm:p-4"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                        <input
                          type="checkbox"
                          id={p.promptId}
                          checked={selectedPrompts.includes(p.promptId)}
                          onChange={() => handleSelectPrompt(p.promptId)}
                          className="mt-1 w-5 h-5 text-primary-600 rounded border-primary-300 focus:ring-primary-500 focus:ring-2 min-w-[20px] min-h-[20px] flex-shrink-0"
                        />
                        <label
                          htmlFor={p.promptId}
                          className="flex-1 cursor-pointer min-w-0"
                        >
                          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-gradient-accent/20 text-accent-700 dark:text-accent-300 font-display font-medium text-xs sm:px-3 sm:py-1 sm:text-sm">
                              {p.count} calls
                            </span>
                          </div>
                          <p className="text-xs font-body text-light-text-primary dark:text-dark-text-primary line-clamp-2 sm:text-sm">
                            {p.prompt}
                          </p>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-primary-200/30 sm:pt-4">
                  <button
                    onClick={handleOptimize}
                    disabled={
                      bulkOptimizeMutation.isLoading ||
                      selectedPrompts.length === 0
                    }
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full min-h-[44px] sm:w-auto [touch-action:manipulation] active:scale-95"
                  >
                    {bulkOptimizeMutation.isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Optimizing...
                      </>
                    ) : (
                      `Optimize ${selectedPrompts.length} Selected`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
