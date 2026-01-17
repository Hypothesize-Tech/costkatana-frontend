import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import {
  pricingService,
  ProviderPricing,
  PricingComparison,
  ModelDiscoveryInfo,
} from "../../services/pricing.service";
import { PriceComparisonShimmer } from "../shimmer/PriceComparisonShimmer";

// Icon Components
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8" />
    <path d="M8 10h8" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.58-8.58a1 1 0 0 0 0-1.41L12 2Z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);

const CompareIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const PriceComparison: React.FC = () => {
  const navigate = useNavigate();
  const [allPricing, setAllPricing] = useState<ProviderPricing[]>([]);
  const [comparison, setComparison] = useState<PricingComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discoveryInfo, setDiscoveryInfo] = useState<ModelDiscoveryInfo | null>(null);
  const [triggeringDiscovery, setTriggeringDiscovery] = useState(false);

  // Form state for comparison
  const [task, setTask] = useState("Generate a 500-word article");
  const [estimatedTokens, setEstimatedTokens] = useState(1000);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"cost" | "provider" | "model">("cost");

  // UI state
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(
    new Set(),
  );

  const fallbackTimerRef = useRef<number | null>(null);
  const componentMountedRef = useRef(true);

  useEffect(() => {
    componentMountedRef.current = true;

    // Start with initial data load
    loadInitialData();

    // Set up fallback timer (reload data every 5 minutes)
    fallbackTimerRef.current = setInterval(() => {
      if (componentMountedRef.current) {
        loadInitialData();
      }
    }, 300000); // 5 minutes

    return () => {
      componentMountedRef.current = false;
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      console.log("📊 Loading initial pricing data...");
      const [pricingResult, discoveryResult] = await Promise.all([
        pricingService.getAllPricing(),
        pricingService.getModelDiscoveryInfo()
      ]);

      console.log("📊 API results:", { pricingResult, discoveryResult });

      if (pricingResult.success && pricingResult.data && componentMountedRef.current) {
        console.log(
          "✅ Setting pricing data:",
          pricingResult.data.pricing.length,
          "providers",
        );
        setAllPricing(pricingResult.data.pricing);
        setLastUpdate(new Date(pricingResult.data.lastUpdate));
        setLoading(false);
        setRefreshing(false);
        setError(null);
      } else if (componentMountedRef.current) {
        console.error("❌ API call failed:", pricingResult.error);
        setError(pricingResult.error || "Failed to load pricing data");
        setLoading(false);
        setRefreshing(false);
      }

      if (discoveryResult.success && discoveryResult.data && componentMountedRef.current) {
        setDiscoveryInfo(discoveryResult.data);
      }
    } catch (error) {
      console.error("❌ Exception in loadInitialData:", error);
      if (componentMountedRef.current) {
        setError("Failed to load pricing data");
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleComparePrice = async () => {
    if (!task || estimatedTokens <= 0) {
      setError("Please enter a task description and valid token count");
      return;
    }

    setComparing(true);
    setError(null);

    try {
      const result = await pricingService.comparePricing(task, estimatedTokens);
      if (result.success && result.data) {
        console.log("Comparison data received:", result.data);
        setComparison(result.data);
      } else {
        setError(result.error || "Failed to compare prices");
      }
    } catch (error) {
      console.error("Error comparing prices:", error);
      setError("Failed to compare prices");
    } finally {
      setComparing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await loadInitialData();
  };

  const handleTriggerDiscovery = async () => {
    setTriggeringDiscovery(true);
    setError(null);

    try {
      console.log("🔍 Triggering model discovery...");
      const result = await pricingService.triggerModelDiscovery();

      if (result.success) {
        console.log("✅ Model discovery triggered successfully");
        // Reload data after a delay to allow discovery to complete
        setTimeout(async () => {
          await loadInitialData();
          setTriggeringDiscovery(false);
        }, 5000); // Wait 5 seconds before refreshing
      } else {
        console.error("❌ Failed to trigger discovery:", result.error);
        setError(result.error || "Failed to trigger model discovery");
        setTriggeringDiscovery(false);
      }
    } catch (error) {
      console.error("❌ Error triggering discovery:", error);
      setError("Failed to trigger model discovery");
      setTriggeringDiscovery(false);
    }
  };

  const getFilteredModels = () => {
    return allPricing.flatMap((provider) =>
      provider.models
        .filter(
          (model) =>
            selectedCategory === "all" || model.category === selectedCategory,
        )
        .map((model) => ({ ...model, provider: provider.provider })),
    );
  };

  const getSortedComparison = () => {
    if (!comparison) return [];

    return [...comparison.providers].sort((a, b) => {
      switch (sortBy) {
        case "cost":
          return a.estimatedCost - b.estimatedCost;
        case "provider":
          return a.provider.localeCompare(b.provider);
        case "model":
          return a.model.localeCompare(b.model);
        default:
          return 0;
      }
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0 || price === null || price === undefined) {
      return "$0.000";
    }

    if (price >= 1) {
      return `$${price.toFixed(3)}`;
    } else if (price >= 0.001) {
      return `$${price.toFixed(3)}`;
    } else if (price >= 0.0001) {
      return `$${price.toFixed(4)}`;
    } else {
      // For very small values, show in scientific notation or micro-dollars
      return `$${(price * 1000000).toFixed(1)}μ`;
    }
  };

  const formatModelPrice = (pricePerMToken: number | null) => {
    if (pricePerMToken === null || pricePerMToken === undefined) {
      return "N/A";
    }

    // Price is per million tokens, always show /M
    if (pricePerMToken >= 1000) {
      // Very expensive models - show in K format (e.g., $2.50/M for 2500)
      return `$${(pricePerMToken / 1000).toFixed(2)}/M`;
    } else if (pricePerMToken >= 100) {
      // Expensive models - show with no decimals (e.g., $150/M)
      return `$${pricePerMToken.toFixed(0)}/M`;
    } else if (pricePerMToken >= 10) {
      // Medium pricing - show with 2 decimals (e.g., $15.00/M)
      return `$${pricePerMToken.toFixed(2)}/M`;
    } else if (pricePerMToken >= 1) {
      // Low pricing - show with 2 decimals (e.g., $2.50/M)
      return `$${pricePerMToken.toFixed(2)}/M`;
    } else if (pricePerMToken >= 0.01) {
      // Very low pricing - show with 3 decimals (e.g., $0.075/M)
      return `$${pricePerMToken.toFixed(3)}/M`;
    } else {
      // Extremely low pricing - show with 4 decimals (e.g., $0.0001/M)
      return `$${pricePerMToken.toFixed(4)}/M`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      text: "blue",
      multimodal: "purple",
      embedding: "green",
      code: "orange",
    };
    return colors[category as keyof typeof colors] || "gray";
  };

  const toggleProviderExpansion = (provider: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(provider)) {
      newExpanded.delete(provider);
    } else {
      newExpanded.add(provider);
    }
    setExpandedProviders(newExpanded);
  };

  if (loading) {
    return <PriceComparisonShimmer />;
  }

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Modern Header with Gradient */}
      <div className="p-4 sm:p-6 lg:p-8 mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:gap-6 justify-between items-start md:flex-row md:items-center">
            <div className="flex-1 w-full">
              <h1 className="mb-2 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold font-display gradient-text-primary">
                AI Pricing Dashboard
              </h1>
              <p className="text-base sm:text-lg text-light-text-secondary dark:text-dark-text-secondary">
                Compare costs across leading AI providers in real-time
              </p>
              {discoveryInfo && (
                <div className="mt-2 text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                  <span className="inline-flex items-center gap-1">
                    <CircleIcon className="w-2 h-2 text-green-500" />
                    {discoveryInfo.totalModels} models tracked
                    {discoveryInfo.lastDiscovery && (
                      <span className="ml-2">
                        • Last discovery: {new Date(discoveryInfo.lastDiscovery).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
              {lastUpdate && (
                <div className="px-3 sm:px-4 py-2 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 text-center sm:text-left">
                  <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              )}
              <button
                onClick={() => navigate('/model-comparison')}
                className="flex gap-2 items-center justify-center px-3 sm:px-4 py-2 text-sm sm:text-base rounded-xl btn btn-secondary border border-primary-300 dark:border-primary-600 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 hover:from-primary-100 hover:to-primary-200 dark:hover:from-primary-800/50 dark:hover:to-primary-700/50 text-primary-700 dark:text-primary-300 transition-all"
                title="View Model Comparison Table"
              >
                <ChartBarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Model Comparison</span>
                <span className="sm:hidden">Comparison</span>
              </button>
              {discoveryInfo && discoveryInfo.totalModels === 0 && (
                <button
                  onClick={handleTriggerDiscovery}
                  disabled={triggeringDiscovery}
                  className="flex gap-2 items-center justify-center px-3 sm:px-4 py-2 text-sm sm:text-base rounded-xl btn btn-primary bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white"
                  title="Discover AI models from providers"
                >
                  <RefreshIcon className={`w-4 h-4 ${triggeringDiscovery ? 'animate-spin' : ''}`} />
                  {triggeringDiscovery ? "Discovering..." : "Discover Models"}
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex gap-2 items-center justify-center px-3 sm:px-4 py-2 text-sm sm:text-base rounded-xl btn btn-primary"
                title="Refresh pricing data"
              >
                <RefreshIcon className="w-4 h-4" />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 sm:p-4 mt-4 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-700/30 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex gap-2 sm:gap-3 items-start sm:items-center text-danger-600 dark:text-danger-400">
              <AlertIcon className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-0" />
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Comparison Form */}
      <div className="px-4 sm:px-6 mx-auto mt-4 sm:mt-6 lg:mt-8 mb-6 sm:mb-8 max-w-7xl">
        <div className="p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="mb-6 sm:mb-8 text-center">
            <h2 className="mb-2 sm:mb-4 text-2xl sm:text-3xl font-bold font-display gradient-text-primary">
              Compare Pricing
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-light-text-secondary dark:text-dark-text-secondary">
              Enter your task details to see cost comparisons across providers
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="mb-4 sm:mb-6">
              <label
                htmlFor="task"
                className="flex gap-2 items-center mb-2 sm:mb-3 text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-display"
              >
                <DocumentIcon className="w-4 h-4 flex-shrink-0" />
                Task Description
              </label>
              <input
                type="text"
                id="task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Generate a 500-word article, Summarize documents, Code review"
                className="w-full input text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8 md:grid-cols-2">
              <div>
                <label
                  htmlFor="tokens"
                  className="flex gap-2 items-center mb-2 sm:mb-3 text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-display"
                >
                  <CalculatorIcon className="w-4 h-4 flex-shrink-0" />
                  Estimated Tokens
                </label>
                <input
                  type="number"
                  id="tokens"
                  value={estimatedTokens}
                  onChange={(e) => setEstimatedTokens(Number(e.target.value))}
                  min="1"
                  className="w-full input text-sm sm:text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="flex gap-2 items-center mb-2 sm:mb-3 text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-display"
                >
                  <TagIcon className="w-4 h-4 flex-shrink-0" />
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full input text-sm sm:text-base"
                >
                  <option value="all">All Categories</option>
                  <option value="text">Text Generation</option>
                  <option value="multimodal">Multimodal</option>
                  <option value="embedding">Embeddings</option>
                  <option value="code">Code Generation</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleComparePrice}
              disabled={comparing}
              className="flex gap-2 sm:gap-3 justify-center items-center py-3 sm:py-4 w-full text-base sm:text-lg font-bold rounded-xl shadow-lg btn btn-primary font-display"
            >
              {comparing ? (
                <>
                  <div className="w-5 h-5 rounded-full border-b-2 border-white animate-spin"></div>
                  Comparing...
                </>
              ) : (
                <>
                  <CompareIcon className="w-5 h-5" />
                  Compare Prices
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Beautiful Comparison Results */}
      {comparison && (
        <div className="px-4 sm:px-6 mx-auto mb-6 sm:mb-8 max-w-7xl">
          <div className="p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col gap-4 sm:gap-6 justify-between items-start pb-4 sm:pb-6 mb-6 sm:mb-8 border-b md:flex-row md:items-center border-primary-200/50 dark:border-primary-700/50">
              <div className="w-full md:w-auto">
                <h2 className="mb-2 text-xl sm:text-2xl font-bold font-display gradient-text-primary">
                  Price Comparison Results
                </h2>
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20">
                  {comparison.providers.length} models found
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full md:w-auto">
                <label className="text-xs sm:text-sm font-semibold text-secondary-600 dark:text-secondary-300">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "cost" | "provider" | "model")}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg input"
                >
                  <option value="cost">Best Price</option>
                  <option value="provider">Provider</option>
                  <option value="model">Model Name</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getSortedComparison().map((item, index) => (
                <div
                  key={`${item.provider}-${item.model}`}
                  className={`glass rounded-xl sm:rounded-2xl border backdrop-blur-xl p-4 sm:p-6 transition-all duration-300 relative overflow-hidden ${index === 0
                    ? "border-primary-500 dark:border-primary-400 bg-gradient-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 shadow-xl"
                    : "border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:shadow-lg hover:-translate-y-1"
                    }`}
                >
                  {index === 0 && (
                    <div className="flex absolute top-0 right-0 gap-1 items-center px-2 sm:px-4 py-1 text-xs font-bold tracking-wider text-white uppercase rounded-tr-xl sm:rounded-tr-2xl rounded-bl-xl sm:rounded-bl-2xl shadow-lg bg-gradient-primary">
                      <TrophyIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">Best Price</span>
                      <span className="sm:hidden">Best</span>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className="flex-1 pr-2">
                      <h3 className="mb-1 text-lg sm:text-xl font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                        {item.provider}
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 truncate">
                        {item.model}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-xl sm:text-2xl font-bold gradient-text-primary">
                        {formatPrice(item.estimatedCost)}
                      </span>
                      <span className="text-xs tracking-wider uppercase text-secondary-500 dark:text-secondary-400">
                        total cost
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 mb-4 sm:mb-6 rounded-xl border bg-secondary-50/50 dark:bg-secondary-900/20 border-secondary-200/50 dark:border-secondary-700/50">
                    <div className="text-center">
                      <span className="block mb-1 text-xs tracking-wider uppercase text-secondary-500 dark:text-secondary-400">
                        Input
                      </span>
                      <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                        {formatPrice(item.inputCost)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block mb-1 text-xs tracking-wider uppercase text-secondary-500 dark:text-secondary-400">
                        Output
                      </span>
                      <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                        {formatPrice(item.outputCost)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.features.slice(0, 3).map((feature) => {
                      const color = getCategoryColor(feature);
                      const colorClasses = {
                        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
                        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
                        green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
                        orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
                        gray: "bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700",
                      };
                      return (
                        <span
                          key={feature}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}
                        >
                          {feature}
                        </span>
                      );
                    })}
                    {item.features.length > 3 && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700">
                        +{item.features.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modern Models Overview */}
      <div className="px-4 sm:px-6 mx-auto mb-6 sm:mb-8 max-w-7xl">
        <div className="p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex flex-col gap-4 sm:gap-6 justify-between items-start pb-4 sm:pb-6 mb-6 sm:mb-8 border-b md:flex-row md:items-center border-primary-200/50 dark:border-primary-700/50">
            <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">
              Available Models
            </h2>
            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20">
              {getFilteredModels().length} models across {allPricing.length}{" "}
              providers
            </span>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {allPricing.map((provider) => {
              const filteredModels = provider.models.filter(
                (model) =>
                  selectedCategory === "all" ||
                  model.category === selectedCategory,
              );
              const isExpanded = expandedProviders.has(provider.provider);
              const visibleModels = isExpanded
                ? filteredModels
                : filteredModels.slice(0, 3);

              return (
                <div
                  key={provider.provider}
                  className="overflow-hidden rounded-xl sm:rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 border-secondary-200/50 dark:border-secondary-700/50 hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:shadow-lg hover:-translate-y-1 bg-secondary-50/30 dark:bg-secondary-900/20"
                >
                  <div className="flex flex-col gap-3 sm:gap-4 justify-between items-start p-4 sm:p-6 bg-gradient-to-r border-b from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 md:flex-row md:items-center border-primary-200/30 dark:border-primary-700/30">
                    <div className="flex-1 w-full">
                      <h3 className="mb-1 text-lg sm:text-xl font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                        {provider.provider}
                      </h3>
                      <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                        {filteredModels.length} models • Updated{" "}
                        {new Date(provider.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    {filteredModels.length > 3 && (
                      <button
                        onClick={() => toggleProviderExpansion(provider.provider)}
                        className="flex gap-2 items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl btn btn-primary w-full sm:w-auto"
                      >
                        <span>
                          {isExpanded
                            ? "Show Less"
                            : `Show All ${filteredModels.length}`}
                        </span>
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:gap-6 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-3">
                    {visibleModels.map((model) => {
                      const categoryColor = getCategoryColor(model.category);
                      const categoryColorClasses = {
                        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
                        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
                        green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
                        orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
                        gray: "bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700",
                      };
                      return (
                        <div
                          key={`${provider.provider}-${model.modelId}`}
                          className="p-4 sm:p-6 rounded-xl border backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 hover:border-primary-300/50 dark:hover:border-primary-600/50 hover:shadow-lg hover:-translate-y-1 bg-gradient-light-panel dark:bg-gradient-dark-panel"
                        >
                          <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 items-center mb-2">
                                <span className="text-base sm:text-lg font-bold font-display text-light-text-primary dark:text-dark-text-primary truncate">
                                  {model.modelName}
                                </span>
                                {model.isLatest && (
                                  <span className="bg-gradient-primary text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex-shrink-0">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <span
                                className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${categoryColorClasses[categoryColor as keyof typeof categoryColorClasses] || categoryColorClasses.gray
                                  }`}
                              >
                                {model.category}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 sm:mt-4">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 mb-3 sm:mb-4 rounded-xl border bg-secondary-50/50 dark:bg-secondary-900/20 border-secondary-200/50 dark:border-secondary-700/50">
                              <div className="text-center">
                                <span className="block mb-1 text-xs tracking-wider uppercase text-secondary-500 dark:text-secondary-400">
                                  Input
                                </span>
                                <span className="font-mono text-base font-bold gradient-text-primary">
                                  {formatModelPrice(model.inputPricePerMToken)}
                                </span>
                              </div>
                              <div className="text-center">
                                <span className="block mb-1 text-xs tracking-wider uppercase text-secondary-500 dark:text-secondary-400">
                                  Output
                                </span>
                                <span className="font-mono text-base font-bold gradient-text-primary">
                                  {formatModelPrice(model.outputPricePerMToken)}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-4 justify-between items-center">
                              <div className="flex gap-2 items-center text-sm text-secondary-600 dark:text-secondary-300">
                                <CircleIcon className="w-3 h-3" />
                                <span>
                                  {model.contextWindow !== null &&
                                    model.contextWindow > 0
                                    ? `${(model.contextWindow / 1000).toFixed(0)}K tokens`
                                    : "Variable"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {model.capabilities.slice(0, 2).map((cap) => (
                                  <span
                                    key={cap}
                                    className="px-2 py-1 text-xs font-semibold rounded-lg border bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-700"
                                  >
                                    {cap}
                                  </span>
                                ))}
                                {model.capabilities.length > 2 && (
                                  <span className="px-2 py-1 text-xs font-semibold rounded-lg border bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700">
                                    +{model.capabilities.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
