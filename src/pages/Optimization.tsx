// src/pages/Optimization.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { OptimizedPromptDisplay } from "../components/common/FormattedContent";
import { formatCurrency } from "../utils/formatters";
import { useNotifications } from "../contexts/NotificationContext";

export const Optimization: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "applied" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: optimizations, isLoading: optimizationsLoading } = useQuery(
    ["optimizations", currentPage, pageSize, filter],
    () =>
      optimizationService.getOptimizations({
        page: currentPage,
        limit: pageSize,
        sort: "createdAt",
        order: "desc",
        applied: filter === "applied" ? true : filter === "pending" ? false : undefined,
      }),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );

  // Get optimization summary for accurate totals
  const { data: summary, isLoading: summaryLoading } = useQuery(
    ["optimization-summary"],
    () => optimizationService.getOptimizationSummary("all"),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );

  // Get counts for each filter
  const getFilterCount = (filterType: "all" | "pending" | "applied") => {
    if (!summary) return 0;

    switch (filterType) {
      case "all":
        return summary.total;
      case "applied":
        return summary.applied;
      case "pending":
        return summary.total - summary.applied;
      default:
        return 0;
    }
  };

  // Use summary data for accurate statistics
  const calculateStats = () => {
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

  // Get filtered optimizations for display (now handled by backend)
  const getFilteredOptimizations = () => {
    if (!optimizations?.data) return [];
    return optimizations.data;
  };

  // Handle filter change
  const handleFilterChange = (newFilter: "all" | "applied" | "pending") => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculatedStats = calculateStats();

  const applyMutation = useMutation(
    (id: string) => optimizationService.applyOptimization(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["optimizations"]);
        showNotification("Optimization applied successfully!", "success");
      },
      onError: () => {
        showNotification("Failed to apply optimization", "error");
      },
    },
  );

  const feedbackMutation = useMutation(
    ({ id, feedback }: { id: string; feedback: any }) =>
      optimizationService.provideFeedback(id, feedback),
    {
      onSuccess: () => {
        showNotification("Thank you for your feedback!", "success");
      },
    },
  );

  const handleApply = (id: string) => {
    applyMutation.mutate(id);
  };

  const handleFeedback = (id: string, helpful: boolean, comment?: string) => {
    feedbackMutation.mutate({
      id,
      feedback: { helpful, comment },
    });
  };

  if (optimizationsLoading || summaryLoading) return <LoadingSpinner />;

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Prompt Optimization
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/optimizations/wizard")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AcademicCapIcon className="mr-2 w-5 h-5" />
              Cost Audit Wizard
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="mr-2 w-5 h-5" />
              Advanced Optimization
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          AI-powered prompt optimization to reduce costs while maintaining
          quality
        </p>
      </div>

      {/* Stats Cards */}
      {calculatedStats && (
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculatedStats.totalSaved)}
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
                <p className="text-2xl font-bold text-gray-900">
                  {calculatedStats.total}
                </p>
              </div>
              <SparklesIcon className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calculatedStats.applied}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {calculatedStats.avgImprovement.toFixed(1)}%
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-12 h-12 text-purple-600 opacity-20" />
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
        <QuickOptimize />
      </div>

      {/* Latest Optimization Preview */}
      {optimizations?.data && optimizations.data.length > 0 && getFilteredOptimizations().length > 0 && (
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Latest Optimization
            </h3>
            <span className="text-sm text-gray-500">
              {new Date(
                getFilteredOptimizations()[0]?.createdAt ||
                getFilteredOptimizations()[0]?.updatedAt,
              ).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(getFilteredOptimizations()[0]?.costSaved || getFilteredOptimizations()[0]?.savings || 0)}
              </div>
              <div className="text-xs text-green-700">Savings</div>
            </div>
            <div className="p-3 bg-orange-50 rounded border border-orange-200 text-center">
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(getFilteredOptimizations()[0]?.originalCost || 0)}
              </div>
              <div className="text-xs text-orange-700">Original Cost</div>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-center">
              <div className="text-lg font-bold text-blue-600">
                {getFilteredOptimizations()[0]?.improvementPercentage?.toFixed(1) || "0"}
                %
              </div>
              <div className="text-xs text-blue-700">Improvement</div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200 text-center">
              <div className="text-lg font-bold text-purple-600">
                {getFilteredOptimizations()[0]?.tokensSaved || 0}
              </div>
              <div className="text-xs text-purple-700">Tokens Saved</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Original Prompt
              </label>
              <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                {getFilteredOptimizations()[0]?.originalPrompt || 'No original prompt available'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Optimized Prompt
              </label>
              <OptimizedPromptDisplay
                content={getFilteredOptimizations()[0]?.optimizedPrompt || 'No optimized prompt available'}
                maxHeight="max-h-32"
              />
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

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {(["all", "pending", "applied"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === tab
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 text-gray-400">
                  ({getFilterCount(tab)})
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Optimizations List */}
      <div className="space-y-4">
        {getFilteredOptimizations()
          .sort((a, b) => {
            // Sort by createdAt date in descending order (most recent first)
            const dateA = new Date(a.createdAt || a.updatedAt || 0);
            const dateB = new Date(b.createdAt || b.updatedAt || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .map((optimization) => (
            <OptimizationCard
              key={optimization._id}
              optimization={optimization}
              onApply={handleApply}
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

      {getFilteredOptimizations().length === 0 && (
        <div className="py-12 text-center">
          <SparklesIcon className="mx-auto w-12 h-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === "all"
              ? "No optimizations yet"
              : filter === "applied"
                ? "No applied optimizations"
                : "No pending optimizations"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "all"
              ? "Use the Quick Optimize tool above to get started."
              : filter === "applied"
                ? "Apply some optimizations to see them here."
                : "All optimizations have been applied."}
          </p>
        </div>
      )}
    </div>
  );
};
