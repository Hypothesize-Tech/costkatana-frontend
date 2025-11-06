import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  SparklesIcon,
  ChartBarIcon,
  AcademicCapIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { optimizationService } from "../services/optimization.service";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { OptimizationCard } from "../components/optimization/OptimizationCard";
import { OptimizationForm } from "../components/optimization/OptimizationForm";
import { BulkOptimizer } from "../components/optimization/BulkOptimizer";
import { QuickOptimize } from "../components/optimization/QuickOptimize";
import { formatCurrency, formatSmartNumber } from "../utils/formatters";
import { useNotifications } from "../contexts/NotificationContext";
import { processFormattedText } from "../utils/codeFormatter";
import "../styles/codeBlocks.css";

export const Optimization: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  // Removed filter - no longer tracking applied/pending status
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { showNotification } = useNotifications();
  const navigate = useNavigate();


  // Direct API calls instead of React Query
  const [optimizations, setOptimizations] = useState<any>(null);
  const [optimizationsLoading, setOptimizationsLoading] = useState(false);

  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Fetch optimizations
  const fetchOptimizations = async () => {


    setOptimizationsLoading(true);

    try {
      const result = await optimizationService.getOptimizations({
        page: currentPage,
        limit: pageSize,
        sort: "createdAt",
        order: "desc",
        // No filter needed - all optimizations are simply completed answers
      });



      setOptimizations(result);
    } catch (error) {
      console.error("Failed to fetch optimizations:", error);
      showNotification("Failed to load optimizations", "error");
    } finally {
      setOptimizationsLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    setSummaryLoading(true);

    try {
      const result = await optimizationService.getOptimizationSummary("all");
      setSummary(result);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      showNotification("Failed to load summary statistics", "error");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch data on mount and when dependencies change
  React.useEffect(() => {
    fetchOptimizations();
  }, [currentPage, pageSize]);

  React.useEffect(() => {
    fetchSummary();
  }, []);



  // Get all optimizations (no filtering needed)
  const getAllOptimizations = () => {
    if (!optimizations?.data) return [];
    return optimizations.data;
  };

  // Use summary data for accurate statistics (includes ALL optimizations, not just current page)
  const calculateStats = () => {
    // Always use summary data as it includes all optimizations across all pages
    if (!summary) return null;

    return {
      total: summary.total,
      applied: summary.applied,
      totalSaved: summary.totalSaved,
      totalTokensSaved: summary.totalTokensSaved,
      avgImprovement: summary.avgImprovement,
      applicationRate: summary.applicationRate,
    };
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculatedStats = calculateStats();

  const feedbackMutation = useMutation(
    ({ id, feedback }: { id: string; feedback: any }) =>
      optimizationService.provideFeedback(id, feedback),
    {
      onSuccess: () => {
        showNotification("Thank you for your feedback!", "success");
      },
    },
  );

  const handleFeedback = (id: string, helpful: boolean, comment?: string) => {
    feedbackMutation.mutate({
      id,
      feedback: { helpful, comment },
    });
  };

  if (optimizationsLoading || summaryLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold font-display gradient-text-primary">
                AI Usage Optimization
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/optimizations/wizard")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl btn-secondary"
                >
                  <AcademicCapIcon className="mr-2 w-5 h-5" />
                  Cost Audit Wizard
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl btn-primary"
                >
                  <PlusIcon className="mr-2 w-5 h-5" />
                  Advanced Optimization
                </button>
              </div>
            </div>
            <p className="text-secondary-600 dark:text-secondary-300">
              AI-powered usage optimization to reduce costs while maintaining
              quality
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {calculatedStats && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Total Saved</p>
                  <p className="text-2xl font-bold font-display text-success-600 dark:text-success-400">
                    {formatCurrency(calculatedStats.totalSaved)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20">
                  <ChartBarIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                    Optimizations
                  </p>
                  <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                    {calculatedStats.total}
                  </p>
                </div>
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl from-primary-500/20 to-secondary-500/20">
                  <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                    Avg Improvement
                  </p>
                  <p className="text-2xl font-bold font-display text-accent-600 dark:text-accent-400">
                    {formatSmartNumber(calculatedStats.avgImprovement)}%
                  </p>
                </div>
                <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show stats even when no optimizations exist */}
        {!calculatedStats && !optimizationsLoading && !summaryLoading && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Total Saved</p>
                  <p className="text-2xl font-bold font-display text-success-600 dark:text-success-400">
                    {formatCurrency(0)}
                  </p>
                </div>
                <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20">
                  <ChartBarIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                    Optimizations
                  </p>
                  <p className="text-2xl font-bold font-display text-secondary-900 dark:text-white">0</p>
                </div>
                <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl from-primary-500/20 to-secondary-500/20">
                  <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Applied</p>
                  <p className="text-2xl font-bold font-display text-highlight-600 dark:text-highlight-400">0</p>
                </div>
                <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20">
                  <CheckCircleIcon className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                    Avg Improvement
                  </p>
                  <p className="text-2xl font-bold font-display text-accent-600 dark:text-accent-400">0.0%</p>
                </div>
                <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Optimize Section */}
        <div className="mb-8">
          <QuickOptimize onOptimizationCreated={(newOptimization: any) => {
            // Add the new optimization to the list
            setOptimizations((prev: any) => {
              if (!prev) return { data: [newOptimization], pagination: { page: 1, limit: 10, total: 1, pages: 1 } };
              return {
                ...prev,
                data: [newOptimization, ...prev.data],
                pagination: {
                  ...prev.pagination,
                  total: prev.pagination.total + 1
                }
              };
            });

            // Update summary if it exists
            if (summary) {
              setSummary((prev: any) => ({
                ...prev,
                total: prev.total + 1,
                totalSaved: prev.totalSaved + (newOptimization.costSaved || 0),
                totalTokensSaved: prev.totalTokensSaved + (newOptimization.tokensSaved || 0),
                avgImprovement: ((prev.avgImprovement * prev.total) + (newOptimization.improvementPercentage || 0)) / (prev.total + 1)
              }));
            }
          }} />
        </div>

        {/* Latest Optimization Preview */}
        {optimizations?.data && optimizations.data.length > 0 && getAllOptimizations().length > 0 && (
          <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold font-display gradient-text-primary">
                Latest Optimization
                {getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex && (
                  <span className="px-2 py-1 ml-2 text-xs font-medium text-white rounded-full border shadow-sm from-accent-500 to-secondary-500 dark:from-accent-400 dark:to-secondary-400 border-accent-300/50 dark:border-accent-500/50">
                    ✨ Cortex Optimized
                  </span>
                )}
              </h3>
              <span className="text-sm font-body text-secondary-600 dark:text-secondary-300">
                {new Date(
                  getAllOptimizations()[0]?.createdAt ||
                  getAllOptimizations()[0]?.updatedAt,
                ).toLocaleDateString()}
              </span>
            </div>

            {/* With/Without Cortex Comparison */}
            {getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex && (
              <div className="p-4 mb-4 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-secondary-50/30 to-accent-50/30 dark:from-secondary-900/20 dark:to-accent-900/20">
                <div className="flex gap-3 items-center mb-4">
                  <div className="flex justify-center items-center w-6 h-6 bg-gradient-to-r rounded-lg shadow-lg from-secondary-500 to-accent-500">
                    <span className="text-xs text-white">✨</span>
                  </div>
                  <h4 className="font-semibold font-display gradient-text-secondary">Cortex Impact Analysis</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br rounded-lg border glass border-danger-200/30 from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="flex gap-2 items-center mb-3">
                      <div className="w-4 h-4 bg-gradient-to-r rounded-full shadow-lg from-danger-500 to-danger-600"></div>
                      <h5 className="font-semibold font-display text-danger-600 dark:text-danger-400">Without Cortex</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-body text-secondary-600 dark:text-secondary-300">Tokens:</span>
                        <span className="font-bold font-display text-secondary-900 dark:text-white">{getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-body text-secondary-600 dark:text-secondary-300">Cost:</span>
                        <span className="font-bold font-display text-secondary-900 dark:text-white">{formatCurrency(getAllOptimizations()[0].cortexImpactMetrics.costImpact.estimatedCostWithoutCortex)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br rounded-lg border glass border-success-200/30 from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                    <div className="flex gap-2 items-center mb-3">
                      <div className="w-4 h-4 bg-gradient-to-r rounded-full shadow-lg from-success-500 to-success-600"></div>
                      <h5 className="font-semibold font-display text-success-600 dark:text-success-400">With Cortex</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-body text-secondary-600 dark:text-secondary-300">Tokens:</span>
                        <span className="font-bold font-display text-success-600 dark:text-success-400">{getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-body text-secondary-600 dark:text-secondary-300">Cost:</span>
                        <span className="font-bold font-display text-success-600 dark:text-success-400">{formatCurrency(getAllOptimizations()[0].cortexImpactMetrics.costImpact.actualCostWithCortex)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 mt-4 bg-gradient-to-r rounded-lg border glass border-primary-200/30 from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-4 bg-gradient-to-r rounded-full shadow-lg from-primary-500 to-secondary-500"></div>
                      <span className="font-semibold font-display gradient-text-primary">Net Savings</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold font-display gradient-text-primary">
                        {formatCurrency(Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.costSavings))}
                        <span className="ml-1 text-sm">
                          ({Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.savingsPercentage).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="p-3 text-center bg-gradient-to-br rounded-lg border glass border-success-200/30 from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                <div className="text-lg font-bold font-display text-success-600 dark:text-success-400">
                  ${formatSmartNumber(
                    (getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                      ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.costSavings)
                      : getAllOptimizations()[0]?.costSaved || getAllOptimizations()[0]?.savings || 0
                  )}
                </div>
                <div className="text-xs font-body text-success-700 dark:text-success-300">Savings</div>
              </div>
              <div className="p-3 text-center bg-gradient-to-br rounded-lg border glass border-danger-200/30 from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                <div className="text-lg font-bold font-display text-danger-600 dark:text-danger-400">
                  ${formatSmartNumber(
                    (getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                      ? getAllOptimizations()[0].cortexImpactMetrics.costImpact.estimatedCostWithoutCortex
                      : getAllOptimizations()[0]?.originalCost || 0
                  )}
                </div>
                <div className="text-xs font-body text-danger-700 dark:text-danger-300">Original Cost</div>
              </div>
              <div className="p-3 text-center bg-gradient-to-br rounded-lg border glass border-primary-200/30 from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                <div className="text-lg font-bold font-display text-primary-600 dark:text-primary-400">
                  {formatSmartNumber(
                    (getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                      ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.percentageSavings)
                      : getAllOptimizations()[0]?.improvementPercentage || 0
                  )}%
                </div>
                <div className="text-xs font-body text-primary-700 dark:text-primary-300">Improvement</div>
              </div>
              <div className="p-3 text-center bg-gradient-to-br rounded-lg border glass border-secondary-200/30 from-secondary-50/50 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20">
                <div className="text-lg font-bold font-display text-secondary-600 dark:text-secondary-400">
                  {(getAllOptimizations()[0]?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                    ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.absoluteSavings).toLocaleString()
                    : getAllOptimizations()[0]?.tokensSaved || 0}
                </div>
                <div className="text-xs font-body text-secondary-700 dark:text-secondary-300">Tokens Saved</div>
              </div>
              <div className="p-3 text-center bg-gradient-to-br rounded-lg border glass border-accent-200/30 from-accent-50/50 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
                <div className="text-lg font-bold font-display text-accent-600 dark:text-accent-400">
                  {(getAllOptimizations()[0]?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                    ? getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()
                    : getAllOptimizations()[0]?.originalTokens || 0}
                </div>
                <div className="text-xs font-body text-accent-700 dark:text-accent-300">Original Tokens</div>
              </div>
              <div className="p-3 text-center bg-gradient-to-br rounded-lg border glass border-highlight-200/30 from-highlight-50/50 to-highlight-100/30 dark:from-highlight-900/20 dark:to-highlight-800/20">
                <div className="text-lg font-bold font-display text-highlight-600 dark:text-highlight-400">
                  {(getAllOptimizations()[0]?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                    ? getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()
                    : getAllOptimizations()[0]?.optimizedTokens || 0}
                </div>
                <div className="text-xs font-body text-highlight-700 dark:text-highlight-300">Optimized Tokens</div>
              </div>
            </div>

            {/* Cortex Model Information */}
            {getAllOptimizations()[0]?.metadata?.cortex?.cortexModel && (
              <div className="p-4 mb-3 bg-gradient-to-br rounded-xl border glass border-purple-200/30 from-purple-50/50 to-indigo-100/30 dark:from-purple-900/20 dark:to-indigo-800/20">
                <div className="flex gap-2 items-center mb-3">
                  <div className="w-5 h-5 bg-gradient-to-r rounded-lg shadow-lg from-purple-500 to-indigo-600 flex items-center justify-center">
                    <CpuChipIcon className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold font-display bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Cortex Models
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-black/20">
                    <div className="text-xs font-body text-secondary-600 dark:text-secondary-300 mb-1">Encoder</div>
                    <div className="text-xs font-medium font-display text-secondary-900 dark:text-white truncate">
                      {getAllOptimizations()[0].metadata.cortex.cortexModel.encoder?.split('.')[1] || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-black/20">
                    <div className="text-xs font-body text-secondary-600 dark:text-secondary-300 mb-1">Processor/Core</div>
                    <div className="text-xs font-medium font-display text-secondary-900 dark:text-white truncate">
                      {(getAllOptimizations()[0].metadata.cortex.cortexModel.core || getAllOptimizations()[0].metadata.cortex.cortexModel.processor)?.split('.')[1] || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-black/20">
                    <div className="text-xs font-body text-secondary-600 dark:text-secondary-300 mb-1">Decoder</div>
                    <div className="text-xs font-medium font-display text-secondary-900 dark:text-white truncate">
                      {getAllOptimizations()[0].metadata.cortex.cortexModel.decoder?.split('.')[1] || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 text-sm font-semibold font-display text-secondary-900 dark:text-white">
                  User Query
                </label>
                <div className="overflow-y-auto p-3 max-h-32 text-sm rounded-lg border glass border-primary-200/30 font-body text-secondary-700 dark:text-secondary-300">
                  {getAllOptimizations()[0]?.userQuery || getAllOptimizations()[0]?.originalPrompt || 'No query available'}
                </div>
              </div>

              <div>
                <label className="mb-1 text-sm font-semibold font-display text-secondary-900 dark:text-white">
                  Generated Answer
                </label>
                <div className="overflow-y-auto p-3 max-h-32 text-sm rounded-lg border glass border-success-200/30 font-body text-secondary-700 dark:text-secondary-300">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: processFormattedText(getAllOptimizations()[0]?.generatedAnswer || getAllOptimizations()[0]?.optimizedPrompt || 'No answer generated')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Optimization Form */}
        {showForm && (
          <div className="mb-8">
            <OptimizationForm
              onClose={() => setShowForm(false)}
              onOptimizationCreated={(newOptimization: any) => {
                // Add the new optimization to the list
                setOptimizations((prev: any) => {
                  if (!prev) return { data: [newOptimization], pagination: { page: 1, limit: 10, total: 1, pages: 1 } };
                  return {
                    ...prev,
                    data: [newOptimization, ...prev.data],
                    pagination: {
                      ...prev.pagination,
                      total: prev.pagination.total + 1
                    }
                  };
                });

                // Update summary if it exists
                if (summary) {
                  setSummary((prev: any) => ({
                    ...prev,
                    total: prev.total + 1,
                    totalSaved: prev.totalSaved + (newOptimization.costSaved || 0),
                    totalTokensSaved: prev.totalTokensSaved + (newOptimization.tokensSaved || 0),
                    avgImprovement: ((prev.avgImprovement * prev.total) + (newOptimization.improvementPercentage || 0)) / (prev.total + 1)
                  }));
                }
              }}
            />
          </div>
        )}

        {/* Bulk Optimizer */}
        <div className="mb-8">
          <BulkOptimizer
            onOptimizationsCreated={(newOptimizations: any[]) => {
              // Add all new optimizations to the list
              setOptimizations((prev: any) => {
                if (!prev) return {
                  data: newOptimizations,
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: newOptimizations.length,
                    pages: Math.ceil(newOptimizations.length / 10)
                  }
                };
                return {
                  ...prev,
                  data: [...newOptimizations, ...prev.data],
                  pagination: {
                    ...prev.pagination,
                    total: prev.pagination.total + newOptimizations.length,
                    pages: Math.ceil((prev.pagination.total + newOptimizations.length) / prev.pagination.limit)
                  }
                };
              });

              // Update summary if it exists
              if (summary && newOptimizations.length > 0) {
                const totalCostSaved = newOptimizations.reduce((sum, opt) => sum + (opt.costSaved || 0), 0);
                const totalTokensSaved = newOptimizations.reduce((sum, opt) => sum + (opt.tokensSaved || 0), 0);
                const avgImprovement = newOptimizations.reduce((sum, opt) => sum + (opt.improvementPercentage || 0), 0) / newOptimizations.length;

                setSummary((prev: any) => ({
                  ...prev,
                  total: prev.total + newOptimizations.length,
                  totalSaved: prev.totalSaved + totalCostSaved,
                  totalTokensSaved: prev.totalTokensSaved + totalTokensSaved,
                  avgImprovement: ((prev.avgImprovement * prev.total) + (avgImprovement * newOptimizations.length)) / (prev.total + newOptimizations.length)
                }));
              }
            }}
          />
        </div>

        {/* No filter tabs needed - all answers are simply generated */}

        {/* Optimizations List */}
        <div className="space-y-4">
          {getAllOptimizations()
            .sort((a: any, b: any) => {
              // Sort by createdAt date in descending order (most recent first)
              const dateA = new Date(a.createdAt || a.updatedAt || 0);
              const dateB = new Date(b.createdAt || b.updatedAt || 0);
              return dateB.getTime() - dateA.getTime();
            })
            .map((optimization: any) => (
              <OptimizationCard
                key={optimization._id}
                optimization={optimization}
                onFeedback={handleFeedback}
              />
            ))}
        </div>

        {/* Pagination Controls */}
        {optimizations?.pagination && optimizations.pagination.pages > 1 && (
          <div className="flex justify-between items-center p-4 mt-8 rounded-xl border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-600 dark:text-secondary-300">
                Showing {((optimizations.pagination.page - 1) * optimizations.pagination.limit) + 1} to{" "}
                {Math.min(optimizations.pagination.page * optimizations.pagination.limit, optimizations.pagination.total)} of{" "}
                {optimizations.pagination.total} results
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-sm font-medium rounded-md border text-secondary-600 dark:text-secondary-300 glass border-primary-200/30 hover:bg-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, optimizations.pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${currentPage === page
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                        : "text-secondary-600 dark:text-secondary-300 glass border border-primary-200/30 hover:bg-primary-500/10"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= optimizations.pagination.pages}
                className="px-3 py-2 text-sm font-medium rounded-md border text-secondary-600 dark:text-secondary-300 glass border-primary-200/30 hover:bg-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {getAllOptimizations().length === 0 && (
          <div className="py-12 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br rounded-xl from-primary-500/20 to-secondary-500/20">
              <SparklesIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="mt-2 text-lg font-semibold font-display text-secondary-900 dark:text-white">
              No answer generations yet
            </h3>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
              Use the Quick Optimize tool above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
