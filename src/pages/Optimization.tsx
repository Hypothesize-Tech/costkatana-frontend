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

  // Get all optimizations (no filtering needed)
  const getAllOptimizations = () => {
    if (!optimizations?.data) return [];
    return optimizations.data;
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
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Usage Optimization
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
          AI-powered usage optimization to reduce costs while maintaining
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
                  {formatSmartNumber(calculatedStats.avgImprovement)}%
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
      {optimizations?.data && optimizations.data.length > 0 && getAllOptimizations().length > 0 && (
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Latest Optimization
            </h3>
            <span className="text-sm text-gray-500">
              {new Date(
                getAllOptimizations()[0]?.createdAt ||
                getAllOptimizations()[0]?.updatedAt,
              ).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
              <div className="text-lg font-bold text-green-600">
                ${formatSmartNumber(getAllOptimizations()[0]?.costSaved || getAllOptimizations()[0]?.savings || 0)}
              </div>
              <div className="text-xs text-green-700">Savings</div>
            </div>
            <div className="p-3 bg-orange-50 rounded border border-orange-200 text-center">
              <div className="text-lg font-bold text-orange-600">
                ${formatSmartNumber(getAllOptimizations()[0]?.originalCost || 0)}
              </div>
              <div className="text-xs text-orange-700">Original Cost</div>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-center">
              <div className="text-lg font-bold text-blue-600">
                {formatSmartNumber(getAllOptimizations()[0]?.improvementPercentage || 0)}%
              </div>
              <div className="text-xs text-blue-700">Improvement</div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200 text-center">
              <div className="text-lg font-bold text-purple-600">
                {getAllOptimizations()[0]?.tokensSaved || 0}
              </div>
              <div className="text-xs text-purple-700">Tokens Saved</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                User Query
              </label>
              <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                {getAllOptimizations()[0]?.userQuery || getAllOptimizations()[0]?.originalPrompt || 'No query available'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                Generated Answer
              </label>
              <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
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
        <div className="py-12 text-center">
          <SparklesIcon className="mx-auto w-12 h-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No answer generations yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Use the Quick Optimize tool above to get started.
          </p>
        </div>
      )}
    </div>
  );
};
