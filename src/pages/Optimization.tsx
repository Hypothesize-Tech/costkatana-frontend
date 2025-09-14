// src/pages/Optimization.tsx
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

  // Debug logging
  console.log("🔄 OPTIMIZATION PAGE: Component render", {
    currentPage,
    pageSize,
    timestamp: new Date().toISOString()
  });

  // Direct API calls instead of React Query
  const [optimizations, setOptimizations] = useState<any>(null);
  const [optimizationsLoading, setOptimizationsLoading] = useState(false);
  const [optimizationsError, setOptimizationsError] = useState<any>(null);

  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<any>(null);

  // Fetch optimizations
  const fetchOptimizations = async () => {
    console.log("🚀 DIRECT API CALL: Starting optimizations fetch", {
      page: currentPage,
      limit: pageSize,
      timestamp: new Date().toISOString()
    });

    setOptimizationsLoading(true);
    setOptimizationsError(null);

    try {
      const result = await optimizationService.getOptimizations({
        page: currentPage,
        limit: pageSize,
        sort: "createdAt",
        order: "desc",
        // No filter needed - all optimizations are simply completed answers
      });

      console.log("✅ DIRECT API CALL: Optimizations success", {
        totalResults: result.data?.length || 0,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });

      setOptimizations(result);
    } catch (error) {
      console.error("❌ DIRECT API CALL: Optimizations error", error);
      setOptimizationsError(error);
    } finally {
      setOptimizationsLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    console.log("📊 DIRECT API CALL: Starting summary fetch", new Date().toISOString());

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const result = await optimizationService.getOptimizationSummary("all");

      console.log("✅ DIRECT API CALL: Summary success", result);

      setSummary(result);
    } catch (error) {
      console.error("❌ DIRECT API CALL: Summary error", error);
      setSummaryError(error);
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

  // Check auth status and API call status
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log("🔐 AUTH CHECK:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.slice(0, 20)}...` : 'no token',
      timestamp: new Date().toISOString()
    });

    // Debug API call status
    console.log("🔍 DIRECT API DEBUG:", {
      optimizationsLoading,
      summaryLoading,
      optimizationsError: optimizationsError?.message || 'none',
      summaryError: summaryError?.message || 'none',
      hasOptimizations: !!optimizations,
      hasSummary: !!summary,
      optimizationsCount: optimizations?.data?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [optimizationsLoading, summaryLoading, optimizationsError, summaryError, optimizations, summary]);

  // Removed filter count - no longer needed

  // Get all optimizations (no filtering needed)
  const getAllOptimizations = () => {
    if (!optimizations?.data) return [];
    return optimizations.data;
  };

  // Use summary data for accurate statistics
  const calculateStats = () => {
    // Calculate from actual optimizations if available (more accurate with cortex metrics)
    if (optimizations?.data && optimizations.data.length > 0) {
      const allOpts = getAllOptimizations();

      const totalSaved = allOpts.reduce((total: number, opt: any) => {
        const saved = opt.cortexImpactMetrics
          ? Math.abs(opt.cortexImpactMetrics.costImpact.costSavings)
          : opt.costSaved || opt.savings || 0;
        return total + saved;
      }, 0);

      const totalTokensSaved = allOpts.reduce((total: number, opt: any) => {
        const tokensSaved = opt.cortexImpactMetrics
          ? Math.abs(opt.cortexImpactMetrics.tokenReduction.absoluteSavings)
          : opt.tokensSaved || 0;
        return total + tokensSaved;
      }, 0);

      const avgImprovement = allOpts.length > 0
        ? allOpts.reduce((sum: number, opt: any) => {
          const improvement = opt.cortexImpactMetrics
            ? Math.abs(opt.cortexImpactMetrics.tokenReduction.percentageSavings)
            : opt.improvementPercentage || 0;
          return sum + improvement;
        }, 0) / allOpts.length
        : 0;

      return {
        total: allOpts.length,
        applied: summary?.applied || 0,
        totalSaved,
        totalTokensSaved,
        avgImprovement,
        applicationRate: summary?.applicationRate || 0,
      };
    }

    // Fallback to summary if no optimizations
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
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-display font-bold gradient-text-primary">
                AI Usage Optimization
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/optimizations/wizard")}
                  className="btn-secondary inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl"
                >
                  <AcademicCapIcon className="mr-2 w-5 h-5" />
                  Cost Audit Wizard
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl"
                >
                  <PlusIcon className="mr-2 w-5 h-5" />
                  Advanced Optimization
                </button>
              </div>
            </div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              AI-powered usage optimization to reduce costs while maintaining
              quality
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {calculatedStats && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/30 p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Total Saved</p>
                  <p className="text-2xl font-display font-bold text-success-600 dark:text-success-400">
                    {formatCurrency(calculatedStats.totalSaved)}
                  </p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-success-600 dark:text-success-400 opacity-20 flex-shrink-0" />
              </div>
            </div>

            <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30 p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Optimizations
                  </p>
                  <p className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                    {calculatedStats.total}
                  </p>
                </div>
                <SparklesIcon className="w-12 h-12 text-primary-600 dark:text-primary-400 opacity-20 flex-shrink-0" />
              </div>
            </div>

            <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-accent-50/30 to-accent-100/30 p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Avg Improvement
                  </p>
                  <p className="text-2xl font-display font-bold text-accent-600 dark:text-accent-400">
                    {formatSmartNumber(calculatedStats.avgImprovement)}%
                  </p>
                </div>
                <ArrowTrendingUpIcon className="w-12 h-12 text-accent-600 dark:text-accent-400 opacity-20 flex-shrink-0" />
              </div>
            </div>
          </div>
        )}

        {/* Show stats even when no optimizations exist */}
        {!calculatedStats && !optimizationsLoading && !summaryLoading && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(0)}
                  </p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Optimizations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <SparklesIcon className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applied</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <CheckCircleIcon className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Improvement
                  </p>
                  <p className="text-2xl font-bold text-purple-600">0.0%</p>
                </div>
                <ArrowTrendingUpIcon className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Optimize Section */}
        <div className="mb-8">
          <QuickOptimize onOptimizationCreated={(newOptimization) => {
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
          <div className="mb-8 p-6 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-surface/80 to-light-surface-secondary/60 dark:from-dark-surface/80 dark:to-dark-surface-secondary/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-semibold gradient-text">
                Latest Optimization
                {getAllOptimizations()[0]?.cortexImpactMetrics && (
                  <span className="ml-2 px-2 py-1 text-xs  from-accent-500 to-secondary-500 dark:from-accent-400 dark:to-secondary-400 text-white dark:text-white rounded-full border border-accent-300/50 dark:border-accent-500/50 shadow-sm font-medium">
                    ✨ Cortex Optimized
                  </span>
                )}
              </h3>
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                {new Date(
                  getAllOptimizations()[0]?.createdAt ||
                  getAllOptimizations()[0]?.updatedAt,
                ).toLocaleDateString()}
              </span>
            </div>

            {/* With/Without Cortex Comparison */}
            {getAllOptimizations()[0]?.cortexImpactMetrics && (
              <div className="mb-4 p-4 glass rounded-xl border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-secondary-50/80 to-accent-50/60 dark:from-secondary-900/20 dark:to-accent-900/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-gradient-secondary flex items-center justify-center glow-secondary">
                    <span className="text-white text-xs">✨</span>
                  </div>
                  <h4 className="font-display font-semibold gradient-text-secondary">Cortex Impact Analysis</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-lg p-4 border border-danger-200/30 bg-gradient-to-br from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-danger glow-danger"></div>
                      <h5 className="font-display font-semibold gradient-text-danger">Without Cortex</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Tokens:</span>
                        <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Cost:</span>
                        <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(getAllOptimizations()[0].cortexImpactMetrics.costImpact.estimatedCostWithoutCortex)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-success-200/30 bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-success glow-success"></div>
                      <h5 className="font-display font-semibold gradient-text-success">With Cortex</h5>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Tokens:</span>
                        <span className="font-display font-bold gradient-text-success">{getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Cost:</span>
                        <span className="font-display font-bold gradient-text-success">{formatCurrency(getAllOptimizations()[0].cortexImpactMetrics.costImpact.actualCostWithCortex)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 glass rounded-lg border border-primary-200/30 bg-gradient-to-r from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-primary glow-primary"></div>
                      <span className="font-display font-semibold gradient-text">Net Savings</span>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold gradient-text text-lg">
                        {formatCurrency(Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.costSavings))}
                        <span className="text-sm ml-1">
                          ({Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.savingsPercentage).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="p-3 glass rounded-lg border border-success-200/30 bg-gradient-to-br from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 text-center">
                <div className="text-lg font-display font-bold gradient-text-success">
                  ${formatSmartNumber(
                    getAllOptimizations()[0]?.cortexImpactMetrics
                      ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.costSavings)
                      : getAllOptimizations()[0]?.costSaved || getAllOptimizations()[0]?.savings || 0
                  )}
                </div>
                <div className="text-xs font-body text-success-700 dark:text-success-300">Savings</div>
              </div>
              <div className="p-3 glass rounded-lg border border-danger-200/30 bg-gradient-to-br from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 text-center">
                <div className="text-lg font-display font-bold gradient-text-danger">
                  ${formatSmartNumber(
                    getAllOptimizations()[0]?.cortexImpactMetrics
                      ? getAllOptimizations()[0].cortexImpactMetrics.costImpact.estimatedCostWithoutCortex
                      : getAllOptimizations()[0]?.originalCost || 0
                  )}
                </div>
                <div className="text-xs font-body text-danger-700 dark:text-danger-300">Original Cost</div>
              </div>
              <div className="p-3 glass rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 text-center">
                <div className="text-lg font-display font-bold gradient-text">
                  {formatSmartNumber(
                    getAllOptimizations()[0]?.cortexImpactMetrics
                      ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.percentageSavings)
                      : getAllOptimizations()[0]?.improvementPercentage || 0
                  )}%
                </div>
                <div className="text-xs font-body text-primary-700 dark:text-primary-300">Improvement</div>
              </div>
              <div className="p-3 glass rounded-lg border border-secondary-200/30 bg-gradient-to-br from-secondary-50/50 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20 text-center">
                <div className="text-lg font-display font-bold gradient-text-secondary">
                  {getAllOptimizations()[0]?.cortexImpactMetrics
                    ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.absoluteSavings).toLocaleString()
                    : getAllOptimizations()[0]?.tokensSaved || 0}
                </div>
                <div className="text-xs font-body text-secondary-700 dark:text-secondary-300">Tokens Saved</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                  User Query
                </label>
                <div className="p-3 glass rounded-lg border border-primary-200/30 text-sm font-body text-light-text-primary dark:text-dark-text-primary max-h-32 overflow-y-auto">
                  {getAllOptimizations()[0]?.userQuery || getAllOptimizations()[0]?.originalPrompt || 'No query available'}
                </div>
              </div>

              <div>
                <label className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                  Generated Answer
                </label>
                <div className="p-3 glass rounded-lg border border-success-200/30 text-sm font-body text-light-text-primary dark:text-dark-text-primary max-h-32 overflow-y-auto">
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
            <OptimizationForm onClose={() => setShowForm(false)} />
          </div>
        )}

        {/* Bulk Optimizer */}
        <div className="mb-8">
          <BulkOptimizer />
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
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((optimizations.pagination.page - 1) * optimizations.pagination.limit) + 1} to{" "}
                {Math.min(optimizations.pagination.page * optimizations.pagination.limit, optimizations.pagination.total)} of{" "}
                {optimizations.pagination.total} results
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
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
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {getAllOptimizations().length === 0 && (
          <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 py-12 text-center">
            <SparklesIcon className="mx-auto w-12 h-12 text-primary-400 dark:text-primary-500" />
            <h3 className="mt-2 text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
              No answer generations yet
            </h3>
            <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Use the Quick Optimize tool above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
