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
import { OptimizationCard } from "../components/optimization/OptimizationCard";
import { OptimizationShimmer } from "../components/shimmer/OptimizationShimmer";
import { OptimizationForm } from "../components/optimization/OptimizationForm";
import { BulkOptimizer } from "../components/optimization/BulkOptimizer";
import { QuickOptimize } from "../components/optimization/QuickOptimize";
import { VisualComplianceTab } from "../components/optimization/VisualComplianceTab";
import { VisualComplianceBatch } from "../components/optimization/VisualComplianceBatch";
import { VisualComplianceDashboard } from "../components/optimization/VisualComplianceDashboard";
import { formatCurrency, formatSmartNumber } from "../utils/formatters";
import { useNotifications } from "../contexts/NotificationContext";
import { processFormattedText } from "../utils/codeFormatter";
import "../styles/codeBlocks.css";

export const Optimization: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  // Removed filter - no longer tracking applied/pending status
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'quick' | 'bulk' | 'visual' | 'visual-batch' | 'visual-dashboard'>('quick');
  const [optimizationTypeFilter, setOptimizationTypeFilter] = useState<'all' | 'text' | 'visual_compliance'>('all');
  const pageSize = 10;
  const { showNotification } = useNotifications();
  const navigate = useNavigate();


  // Direct API calls instead of React Query
  const [optimizations, setOptimizations] = useState<any>(null);
  const [optimizationsLoading, setOptimizationsLoading] = useState(false);

  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({
    quick: false,
    bulk: false,
    visual: false,
    'visual-batch': false,
    'visual-dashboard': false,
  });

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

  React.useEffect(() => {
    // Show shimmer when switching tabs
    setTabLoading(prev => ({ ...prev, [activeTab]: true }));
    setTabLoading(prev => ({ ...prev, [activeTab]: false }))
  }, [activeTab]);



  // Get all optimizations (with type filtering)
  const getAllOptimizations = () => {
    if (!optimizations?.data) return [];

    if (optimizationTypeFilter === 'all') {
      return optimizations.data;
    }

    return optimizations.data.filter((opt: any) => {
      const type = opt.optimizationType || 'text'; // Default to text for backward compatibility
      return type === optimizationTypeFilter;
    });
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

  if (optimizationsLoading || summaryLoading || tabLoading[activeTab]) {
    return <OptimizationShimmer activeTab={activeTab} />;
  }

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-2 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 lg:p-8 md:rounded-xl">
            <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-center sm:mb-4 sm:gap-4">
              <h1 className="text-xl font-bold font-display gradient-text-primary sm:text-2xl md:text-3xl">
                AI Usage Optimization
              </h1>
              <div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto sm:space-x-4 sm:gap-0">
                <button
                  onClick={() => navigate("/optimizations/wizard")}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg btn-secondary min-h-[44px] sm:px-4 sm:py-2 sm:text-sm md:rounded-xl [touch-action:manipulation] active:scale-95"
                >
                  <AcademicCapIcon className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Cost Audit Wizard</span>
                  <span className="sm:hidden">Wizard</span>
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg btn-primary min-h-[44px] sm:px-4 sm:py-2 sm:text-sm md:rounded-xl [touch-action:manipulation] active:scale-95"
                >
                  <PlusIcon className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Advanced Optimization</span>
                  <span className="sm:hidden">Advanced</span>
                </button>
              </div>
            </div>
            <p className="text-xs font-body text-secondary-600 dark:text-secondary-300 sm:text-sm md:text-base">
              AI-powered usage optimization to reduce costs while maintaining
              quality
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {calculatedStats && (
          <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-4 md:gap-6 md:grid-cols-3 md:mb-8">
            <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Total Saved</p>
                  <p className="text-lg font-bold font-display text-success-600 dark:text-success-400 sm:text-xl md:text-2xl truncate">
                    {formatCurrency(calculatedStats.totalSaved)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-success-500/20 to-success-600/20 sm:w-12 sm:h-12 md:rounded-xl">
                  <ChartBarIcon className="w-5 h-5 text-success-600 dark:text-success-400 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">
                    Optimizations
                  </p>
                  <p className="text-lg font-bold font-display text-secondary-900 dark:text-white sm:text-xl md:text-2xl">
                    {calculatedStats.total}
                  </p>
                </div>
                <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-primary-500/20 to-secondary-500/20 sm:w-12 sm:h-12 md:rounded-xl">
                  <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl sm:col-span-2 md:col-span-1">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">
                    Avg Improvement
                  </p>
                  <p className="text-lg font-bold font-display text-accent-600 dark:text-accent-400 sm:text-xl md:text-2xl">
                    {formatSmartNumber(calculatedStats.avgImprovement)}%
                  </p>
                </div>
                <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-accent-500/20 to-accent-600/20 sm:w-12 sm:h-12 md:rounded-xl">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-accent-600 dark:text-accent-400 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show stats even when no optimizations exist */}
        {!calculatedStats && !optimizationsLoading && !summaryLoading && (
          <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-4 md:gap-6 md:grid-cols-4 md:mb-8">
            <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Total Saved</p>
                  <p className="text-lg font-bold font-display text-success-600 dark:text-success-400 sm:text-xl md:text-2xl">
                    {formatCurrency(0)}
                  </p>
                </div>
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-success-500/20 to-success-600/20 sm:w-12 sm:h-12 md:rounded-xl">
                  <ChartBarIcon className="w-5 h-5 text-success-600 dark:text-success-400 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">
                    Optimizations
                  </p>
                  <p className="text-lg font-bold font-display text-secondary-900 dark:text-white sm:text-xl md:text-2xl">0</p>
                </div>
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-primary-500/20 to-secondary-500/20 sm:w-12 sm:h-12 md:rounded-xl">
                  <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">Applied</p>
                  <p className="text-lg font-bold font-display text-highlight-600 dark:text-highlight-400 sm:text-xl md:text-2xl">0</p>
                </div>
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-highlight-500/20 to-highlight-600/20 sm:w-12 sm:h-12 md:rounded-xl">
                  <CheckCircleIcon className="w-5 h-5 text-highlight-600 dark:text-highlight-400 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-300 sm:text-sm">
                    Avg Improvement
                  </p>
                  <p className="text-lg font-bold font-display text-accent-600 dark:text-accent-400 sm:text-xl md:text-2xl">0.0%</p>
                </div>
                <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-br rounded-lg from-accent-500/20 to-accent-600/20 sm:w-12 sm:h-12 md:rounded-xl">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-accent-600 dark:text-accent-400 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <div className="flex overflow-x-auto space-x-1 border-b border-primary-200 dark:border-primary-700 scrollbar-hide sm:space-x-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-2 py-2.5 font-medium transition-colors min-h-[44px] whitespace-nowrap flex-shrink-0 text-xs sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${activeTab === 'quick'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              <span className="hidden sm:inline">Quick Optimize</span>
              <span className="sm:hidden">Quick</span>
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-2 py-2.5 font-medium transition-colors min-h-[44px] whitespace-nowrap flex-shrink-0 text-xs sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${activeTab === 'bulk'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              <span className="hidden sm:inline">Bulk Optimizer</span>
              <span className="sm:hidden">Bulk</span>
            </button>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-2 py-2.5 font-medium transition-colors min-h-[44px] whitespace-nowrap flex-shrink-0 text-xs sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${activeTab === 'visual'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              <span className="hidden md:inline">Visual Compliance</span>
              <span className="md:hidden">Visual</span>
            </button>
            <button
              onClick={() => setActiveTab('visual-batch')}
              className={`px-2 py-2.5 font-medium transition-colors min-h-[44px] whitespace-nowrap flex-shrink-0 text-xs sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${activeTab === 'visual-batch'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              <span className="hidden md:inline">Visual Batch</span>
              <span className="md:hidden">Batch</span>
            </button>
            <button
              onClick={() => setActiveTab('visual-dashboard')}
              className={`px-2 py-2.5 font-medium transition-colors min-h-[44px] whitespace-nowrap flex-shrink-0 text-xs sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${activeTab === 'visual-dashboard'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              <span className="hidden md:inline">Cost Dashboard</span>
              <span className="md:hidden">Dashboard</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'quick' && (
          <>
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

            {/* Type Filter for Optimizations List */}
            {optimizations?.data && optimizations.data.length > 0 && (
              <div className="flex flex-col gap-3 justify-between items-start mb-4 sm:flex-row sm:items-center sm:gap-4 sm:mb-6">
                <h2 className="text-lg font-semibold font-display gradient-text-primary sm:text-xl md:text-2xl">
                  Optimization History
                </h2>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setOptimizationTypeFilter('all')}
                    className={`px-3 py-2 rounded-lg text-xs font-display font-medium transition-all duration-200 min-h-[40px] sm:px-4 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${optimizationTypeFilter === 'all'
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'glass border border-primary-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:border-primary-300/50'
                      }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setOptimizationTypeFilter('text')}
                    className={`px-3 py-2 rounded-lg text-xs font-display font-medium transition-all duration-200 inline-flex items-center gap-1.5 min-h-[40px] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${optimizationTypeFilter === 'text'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'glass border border-blue-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:border-blue-300/50'
                      }`}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Text
                  </button>
                  <button
                    onClick={() => setOptimizationTypeFilter('visual_compliance')}
                    className={`px-3 py-2 rounded-lg text-xs font-display font-medium transition-all duration-200 inline-flex items-center gap-1.5 min-h-[40px] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${optimizationTypeFilter === 'visual_compliance'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'glass border border-purple-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:border-purple-300/50'
                      }`}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Visual
                  </button>
                </div>
              </div>
            )}

            {/* Latest Optimization Preview */}
            {optimizations?.data && optimizations.data.length > 0 && getAllOptimizations().length > 0 && (
              <div className="p-3 mb-4 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl md:mb-8">
                <div className="flex flex-col gap-2 justify-between items-start mb-3 sm:flex-row sm:items-center sm:mb-4 sm:gap-4">
                  <h3 className="text-base font-semibold font-display gradient-text-primary sm:text-lg">
                    <span className="block sm:inline">Latest Optimization</span>
                    {getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex && (
                      <span className="px-2 py-1 ml-0 mt-1 text-xs font-medium text-white rounded-full border shadow-sm from-accent-500 to-secondary-500 dark:from-accent-400 dark:to-secondary-400 border-accent-300/50 dark:border-accent-500/50 inline-block sm:ml-2 sm:mt-0">
                        ✨ Cortex Optimized
                      </span>
                    )}
                  </h3>
                  <span className="text-xs font-body text-secondary-600 dark:text-secondary-300 sm:text-sm">
                    {new Date(
                      getAllOptimizations()[0]?.createdAt ||
                      getAllOptimizations()[0]?.updatedAt,
                    ).toLocaleDateString()}
                  </span>
                </div>

                {/* With/Without Cortex Comparison */}
                {getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex && (
                  <div className="p-3 mb-3 bg-gradient-to-br rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-secondary-50/30 to-accent-50/30 dark:from-secondary-900/20 dark:to-accent-900/20 sm:p-4 md:mb-4 md:rounded-xl">
                    <div className="flex gap-2 items-center mb-3 sm:gap-3 sm:mb-4">
                      <div className="flex justify-center items-center w-5 h-5 bg-gradient-to-r rounded-lg shadow-lg from-secondary-500 to-accent-500 sm:w-6 sm:h-6">
                        <span className="text-[10px] text-white sm:text-xs">✨</span>
                      </div>
                      <h4 className="text-sm font-semibold font-display gradient-text-secondary sm:text-base">Cortex Impact Analysis</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <div className="p-3 bg-gradient-to-br rounded-lg border glass border-danger-200/30 from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 sm:p-4">
                        <div className="flex gap-2 items-center mb-2 sm:mb-3">
                          <div className="w-3 h-3 bg-gradient-to-r rounded-full shadow-lg from-danger-500 to-danger-600 sm:w-4 sm:h-4"></div>
                          <h5 className="text-xs font-semibold font-display text-danger-600 dark:text-danger-400 sm:text-sm">Without Cortex</h5>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-body text-secondary-600 dark:text-secondary-300 sm:text-sm">Tokens:</span>
                            <span className="text-xs font-bold font-display text-secondary-900 dark:text-white sm:text-sm">{getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-body text-secondary-600 dark:text-secondary-300 sm:text-sm">Cost:</span>
                            <span className="text-xs font-bold font-display text-secondary-900 dark:text-white sm:text-sm break-words">{formatCurrency(getAllOptimizations()[0].cortexImpactMetrics.costImpact.estimatedCostWithoutCortex)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-br rounded-lg border glass border-success-200/30 from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 sm:p-4">
                        <div className="flex gap-2 items-center mb-2 sm:mb-3">
                          <div className="w-3 h-3 bg-gradient-to-r rounded-full shadow-lg from-success-500 to-success-600 sm:w-4 sm:h-4"></div>
                          <h5 className="text-xs font-semibold font-display text-success-600 dark:text-success-400 sm:text-sm">With Cortex</h5>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-body text-secondary-600 dark:text-secondary-300 sm:text-sm">Tokens:</span>
                            <span className="text-xs font-bold font-display text-success-600 dark:text-success-400 sm:text-sm">{getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-body text-secondary-600 dark:text-secondary-300 sm:text-sm">Cost:</span>
                            <span className="text-xs font-bold font-display text-success-600 dark:text-success-400 sm:text-sm break-words">{formatCurrency(getAllOptimizations()[0].cortexImpactMetrics.costImpact.actualCostWithCortex)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 mt-3 bg-gradient-to-r rounded-lg border glass border-primary-200/30 from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20 sm:p-3 sm:mt-4">
                      <div className="flex flex-col gap-2 justify-between items-start sm:flex-row sm:items-center sm:gap-0">
                        <div className="flex gap-2 items-center">
                          <div className="w-3 h-3 bg-gradient-to-r rounded-full shadow-lg from-primary-500 to-secondary-500 sm:w-4 sm:h-4"></div>
                          <span className="text-xs font-semibold font-display gradient-text-primary sm:text-sm">Net Savings</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-base font-bold font-display gradient-text-primary sm:text-lg">
                            {formatCurrency(Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.costSavings))}
                            <span className="ml-1 text-xs sm:text-sm">
                              ({Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.savingsPercentage).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3 sm:gap-3 sm:mb-4 md:grid-cols-3 lg:grid-cols-6">
                  <div className="p-2 text-center bg-gradient-to-br rounded-lg border glass border-success-200/30 from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 sm:p-3">
                    <div className="text-sm font-bold font-display text-success-600 dark:text-success-400 sm:text-base md:text-lg break-words">
                      ${formatSmartNumber(
                        (getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                          ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.costImpact.costSavings)
                          : (getAllOptimizations()[0]?.optimizationType === 'visual_compliance' && getAllOptimizations()[0]?.metadata?.costBreakdown?.netSavings)
                            ? getAllOptimizations()[0].metadata.costBreakdown.netSavings.amount
                            : getAllOptimizations()[0]?.costSaved || getAllOptimizations()[0]?.savings || 0
                      )}
                    </div>
                    <div className="text-[10px] font-body text-success-700 dark:text-success-300 sm:text-xs">
                      {getAllOptimizations()[0]?.optimizationType === 'visual_compliance' ? 'Net Savings' : 'Savings'}
                    </div>
                  </div>
                  <div className="p-2 text-center bg-gradient-to-br rounded-lg border glass border-danger-200/30 from-danger-50/50 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 sm:p-3">
                    <div className="text-sm font-bold font-display text-danger-600 dark:text-danger-400 sm:text-base md:text-lg break-words">
                      ${formatSmartNumber(
                        (getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                          ? getAllOptimizations()[0].cortexImpactMetrics.costImpact.estimatedCostWithoutCortex
                          : getAllOptimizations()[0]?.originalCost || 0
                      )}
                    </div>
                    <div className="text-[10px] font-body text-danger-700 dark:text-danger-300 sm:text-xs">Original Cost</div>
                  </div>
                  <div className="p-2 text-center bg-gradient-to-br rounded-lg border glass border-primary-200/30 from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 sm:p-3">
                    <div className="text-sm font-bold font-display text-primary-600 dark:text-primary-400 sm:text-base md:text-lg">
                      {formatSmartNumber(
                        (getAllOptimizations()[0]?.metadata?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                          ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.percentageSavings)
                          : (getAllOptimizations()[0]?.optimizationType === 'visual_compliance' && getAllOptimizations()[0]?.metadata?.costBreakdown?.netSavings)
                            ? getAllOptimizations()[0].metadata.costBreakdown.netSavings.percentage
                            : getAllOptimizations()[0]?.improvementPercentage || 0
                      )}%
                    </div>
                    <div className="text-[10px] font-body text-primary-700 dark:text-primary-300 sm:text-xs">
                      {getAllOptimizations()[0]?.optimizationType === 'visual_compliance' ? 'Net Benefit' : 'Improvement'}
                    </div>
                  </div>
                  <div className="p-2 text-center bg-gradient-to-br rounded-lg border glass border-secondary-200/30 from-secondary-50/50 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20 sm:p-3">
                    <div className="text-sm font-bold font-display text-secondary-600 dark:text-secondary-400 sm:text-base md:text-lg">
                      {(getAllOptimizations()[0]?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                        ? Math.abs(getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.absoluteSavings).toLocaleString()
                        : getAllOptimizations()[0]?.tokensSaved || 0}
                    </div>
                    <div className="text-[10px] font-body text-secondary-700 dark:text-secondary-300 sm:text-xs">Tokens Saved</div>
                  </div>
                  <div className="p-2 text-center bg-gradient-to-br rounded-lg border glass border-accent-200/30 from-accent-50/50 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20 sm:p-3">
                    <div className="text-sm font-bold font-display text-accent-600 dark:text-accent-400 sm:text-base md:text-lg">
                      {(getAllOptimizations()[0]?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                        ? getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withoutCortex.toLocaleString()
                        : getAllOptimizations()[0]?.originalTokens || 0}
                    </div>
                    <div className="text-[10px] font-body text-accent-700 dark:text-accent-300 sm:text-xs">Original Tokens</div>
                  </div>
                  <div className="p-2 text-center bg-gradient-to-br rounded-lg border glass border-highlight-200/30 from-highlight-50/50 to-highlight-100/30 dark:from-highlight-900/20 dark:to-highlight-800/20 sm:p-3">
                    <div className="text-sm font-bold font-display text-highlight-600 dark:text-highlight-400 sm:text-base md:text-lg">
                      {(getAllOptimizations()[0]?.cortexEnabled && getAllOptimizations()[0]?.cortexImpactMetrics && !getAllOptimizations()[0]?.metadata?.cortex?.lightweightCortex)
                        ? getAllOptimizations()[0].cortexImpactMetrics.tokenReduction.withCortex.toLocaleString()
                        : getAllOptimizations()[0]?.optimizedTokens || 0}
                    </div>
                    <div className="text-[10px] font-body text-highlight-700 dark:text-highlight-300 sm:text-xs">Optimized Tokens</div>
                  </div>
                </div>

                {/* Cortex Model Information */}
                {getAllOptimizations()[0]?.metadata?.cortex?.cortexModel && (
                  <div className="p-3 mb-3 bg-gradient-to-br rounded-lg border glass border-purple-200/30 from-purple-50/50 to-indigo-100/30 dark:from-purple-900/20 dark:to-indigo-800/20 sm:p-4 md:rounded-xl">
                    <div className="flex gap-2 items-center mb-2 sm:mb-3">
                      <div className="flex justify-center items-center w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg sm:w-5 sm:h-5">
                        <CpuChipIcon className="w-2.5 h-2.5 text-white sm:w-3 sm:h-3" />
                      </div>
                      <h4 className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-display dark:from-purple-400 dark:to-indigo-400 sm:text-sm">
                        Cortex Models
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="p-1.5 text-center rounded-lg bg-white/50 dark:bg-black/20 sm:p-2">
                        <div className="mb-0.5 text-[10px] font-body text-secondary-600 dark:text-secondary-300 sm:text-xs">Encoder</div>
                        <div className="text-[10px] font-medium truncate font-display text-secondary-900 dark:text-white sm:text-xs">
                          {getAllOptimizations()[0].metadata.cortex.cortexModel.encoder?.split('.')[1] || 'N/A'}
                        </div>
                      </div>
                      <div className="p-1.5 text-center rounded-lg bg-white/50 dark:bg-black/20 sm:p-2">
                        <div className="mb-0.5 text-[10px] font-body text-secondary-600 dark:text-secondary-300 sm:text-xs">Processor/Core</div>
                        <div className="text-[10px] font-medium truncate font-display text-secondary-900 dark:text-white sm:text-xs">
                          {(getAllOptimizations()[0].metadata.cortex.cortexModel.core || getAllOptimizations()[0].metadata.cortex.cortexModel.processor)?.split('.')[1] || 'N/A'}
                        </div>
                      </div>
                      <div className="p-1.5 text-center rounded-lg bg-white/50 dark:bg-black/20 sm:p-2">
                        <div className="mb-0.5 text-[10px] font-body text-secondary-600 dark:text-secondary-300 sm:text-xs">Decoder</div>
                        <div className="text-[10px] font-medium truncate font-display text-secondary-900 dark:text-white sm:text-xs">
                          {getAllOptimizations()[0].metadata.cortex.cortexModel.decoder?.split('.')[1] || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="mb-1 text-xs font-semibold font-display text-secondary-900 dark:text-white sm:text-sm">
                      User Query
                    </label>
                    <div className="overflow-y-auto p-2 max-h-24 text-xs rounded-lg border glass border-primary-200/30 font-body text-secondary-700 dark:text-secondary-300 sm:p-3 sm:max-h-32 sm:text-sm">
                      {getAllOptimizations()[0]?.userQuery || getAllOptimizations()[0]?.originalPrompt || 'No query available'}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 text-xs font-semibold font-display text-secondary-900 dark:text-white sm:text-sm">
                      Generated Answer
                    </label>
                    <div className="overflow-y-auto p-2 max-h-24 text-xs rounded-lg border glass border-success-200/30 font-body text-secondary-700 dark:text-secondary-300 sm:p-3 sm:max-h-32 sm:text-sm">
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
          </>
        )}

        {activeTab === 'bulk' && (
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
        )}

        {activeTab === 'visual' && (
          <div className="mb-8">
            <VisualComplianceTab
              onOptimizationCreated={(newOptimization: any) => {
                // Add the new optimization to the list
                setOptimizations((prev: any) => {
                  if (!prev) return {
                    data: [newOptimization],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 1,
                      pages: 1
                    }
                  };
                  return {
                    ...prev,
                    data: [newOptimization, ...prev.data],
                    pagination: {
                      ...prev.pagination,
                      total: prev.pagination.total + 1,
                      pages: Math.ceil((prev.pagination.total + 1) / prev.pagination.limit)
                    }
                  };
                });

                // Update summary
                if (summary) {
                  setSummary((prev: any) => ({
                    ...prev,
                    total: prev.total + 1,
                    totalSaved: prev.totalSaved + (newOptimization.costSaved || 0),
                    totalTokensSaved: prev.totalTokensSaved + (newOptimization.optimizedTokens || 0),
                    avgImprovement: ((prev.avgImprovement * prev.total) + (newOptimization.improvementPercentage || 0)) / (prev.total + 1)
                  }));
                }
              }}
            />
          </div>
        )}

        {activeTab === 'visual-batch' && (
          <div className="mb-8">
            <VisualComplianceBatch />
          </div>
        )}

        {activeTab === 'visual-dashboard' && (
          <div className="mb-8">
            <VisualComplianceDashboard />
          </div>
        )}

        {/* Optimizations List - Only show for quick and bulk tabs */}
        {(activeTab === 'quick' || activeTab === 'bulk') && (
          <>
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
              <div className="flex flex-col gap-3 justify-between items-start p-3 mt-4 rounded-lg border glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:flex-row sm:items-center sm:p-4 sm:mt-6 md:mt-8 md:rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">
                    Showing {((optimizations.pagination.page - 1) * optimizations.pagination.limit) + 1} to{" "}
                    {Math.min(optimizations.pagination.page * optimizations.pagination.limit, optimizations.pagination.total)} of{" "}
                    {optimizations.pagination.total} results
                  </span>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-2.5 py-2 text-xs font-medium rounded-md border text-secondary-600 dark:text-secondary-300 glass border-primary-200/30 hover:bg-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-0.5 sm:space-x-1">
                    {Array.from({ length: Math.min(5, optimizations.pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2.5 py-2 text-xs font-medium rounded-md transition-all duration-200 min-h-[40px] sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95 ${currentPage === page
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
                    className="px-2.5 py-2 text-xs font-medium rounded-md border text-secondary-600 dark:text-secondary-300 glass border-primary-200/30 hover:bg-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] sm:px-3 sm:py-2 sm:text-sm [touch-action:manipulation] active:scale-95"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {getAllOptimizations().length === 0 && (
              <div className="py-8 text-center rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:py-10 md:py-12 md:rounded-xl">
                <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 bg-gradient-to-br rounded-lg from-primary-500/20 to-secondary-500/20 sm:w-14 sm:h-14 md:w-16 md:h-16 md:rounded-xl">
                  <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                </div>
                <h3 className="mt-2 text-base font-semibold font-display text-secondary-900 dark:text-white sm:text-lg">
                  No answer generations yet
                </h3>
                <p className="mt-1 text-xs text-secondary-600 dark:text-secondary-300 sm:text-sm">
                  Use the Quick Optimize tool above to get started.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
