import React, { useState, useEffect } from "react";
import {
  BeakerIcon,
  ChartBarIcon,
  LightBulbIcon,
  InformationCircleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  ModelComparison,
  WhatIfScenarios,
  RealTimeWhatIfSimulator,
  OptimizationLeaderboard,
} from "../components/experimentation";
import { ExperimentationService } from "../services/experimentation.service";

type Tab = "cost-simulator" | "model-comparison" | "what-if-scenarios" | "leaderboard";

interface ExperimentationStats {
  totalExperiments: number;
  avgCostSavings: number;
  successRate: number;
  totalModelsCompared: number;
  totalSavings: number;
  changes: {
    experimentsChange: number;
    savingsChange: number;
    successRateChange: number;
    totalSavingsChange: number;
  };
}

const Experimentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("cost-simulator");
  const [stats, setStats] = useState<ExperimentationStats>({
    totalExperiments: 0,
    avgCostSavings: 0,
    successRate: 0,
    totalModelsCompared: 0,
    totalSavings: 0,
    changes: {
      experimentsChange: 0,
      savingsChange: 0,
      successRateChange: 0,
      totalSavingsChange: 0,
    },
  });
  const [recommendations, setRecommendations] = useState<{
    type: string;
    title: string;
    description: string;
    priority: string;
    potentialSavings: number;
    effort: string;
    actions: string[];
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    {
      id: "cost-simulator" as Tab,
      name: "Cost Simulator",
      icon: <SparklesIcon className="h-5 w-5" />,
      description:
        "Real-time prompt optimization - see instant cost savings up to 95%",
      color: "text-purple-600",
    },
    {
      id: "model-comparison" as Tab,
      name: "Model Comparison",
      icon: <ChartBarIcon className="h-5 w-5" />,
      description:
        "Compare different AI models based on your actual usage data",
      color: "text-blue-600",
    },
    {
      id: "what-if-scenarios" as Tab,
      name: "What-If Scenarios",
      icon: <LightBulbIcon className="h-5 w-5" />,
      description: "Analyze potential cost impacts of optimization strategies",
      color: "text-green-600",
    },
    {
      id: "leaderboard" as Tab,
      name: "Leaderboard",
      icon: <ArrowTrendingUpIcon className="h-5 w-5" />,
      description: "Top optimization wins and cost savings champions",
      color: "text-yellow-600",
    },
  ];

  useEffect(() => {
    loadExperimentationData();
  }, []);

  const loadExperimentationData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load current period data (last 30 days)
      const currentExperiments =
        await ExperimentationService.getExperimentHistory({
          limit: 100,
          startDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endDate: new Date().toISOString(),
        });

      // Load previous period data (30-60 days ago) for comparison
      const previousExperiments =
        await ExperimentationService.getExperimentHistory({
          limit: 100,
          startDate: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });

      // Calculate current period stats
      const totalExperiments = currentExperiments.length;
      const completedExperiments = currentExperiments.filter(
        (exp) => exp.status === "completed",
      );
      const successRate =
        totalExperiments > 0
          ? completedExperiments.length / totalExperiments
          : 0;

      let totalSavings = 0;
      let savingsCount = 0;

      completedExperiments.forEach((exp) => {
        if (exp.results && exp.results.costSaved) {
          totalSavings += exp.results.costSaved;
          savingsCount++;
        }
      });

      const avgCostSavings = savingsCount > 0 ? totalSavings / savingsCount : 0;
      const totalModelsCompared = currentExperiments.filter(
        (exp) => exp.type === "model_comparison",
      ).length;

      // Calculate previous period stats for comparison
      const prevTotalExperiments = previousExperiments.length;
      const prevCompletedExperiments = previousExperiments.filter(
        (exp) => exp.status === "completed",
      );
      const prevSuccessRate =
        prevTotalExperiments > 0
          ? prevCompletedExperiments.length / prevTotalExperiments
          : 0;

      let prevTotalSavings = 0;
      let prevSavingsCount = 0;

      prevCompletedExperiments.forEach((exp) => {
        if (exp.results && exp.results.costSaved) {
          prevTotalSavings += exp.results.costSaved;
          prevSavingsCount++;
        }
      });

      const prevAvgCostSavings =
        prevSavingsCount > 0 ? prevTotalSavings / prevSavingsCount : 0;

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const changes = {
        experimentsChange: calculateChange(
          totalExperiments,
          prevTotalExperiments,
        ),
        savingsChange: calculateChange(avgCostSavings, prevAvgCostSavings),
        successRateChange: calculateChange(successRate, prevSuccessRate),
        totalSavingsChange: calculateChange(totalSavings, prevTotalSavings),
      };

      setStats({
        totalExperiments,
        avgCostSavings,
        successRate,
        totalModelsCompared,
        totalSavings,
        changes,
      });

      // Load actual recommendations from backend
      const recs = await ExperimentationService.getExperimentRecommendations();
      setRecommendations(recs);
    } catch (error: unknown) {
      console.error("Error loading experimentation data:", error);
      const errorMessage = (error as Error)?.message || "Unknown error";
      setError("Failed to load experimentation data: " + errorMessage);

      // Set empty stats on error
      setStats({
        totalExperiments: 0,
        avgCostSavings: 0,
        successRate: 0,
        totalModelsCompared: 0,
        totalSavings: 0,
        changes: {
          experimentsChange: 0,
          savingsChange: 0,
          successRateChange: 0,
          totalSavingsChange: 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "cost-simulator":
        return <RealTimeWhatIfSimulator />;
      case "model-comparison":
        return <ModelComparison />;
      case "what-if-scenarios":
        return <WhatIfScenarios />;
      case "leaderboard":
        return <OptimizationLeaderboard timeRange="week" limit={20} showUserRank={true} />;
      default:
        return null;
    }
  };

  const formatChange = (change: number): { text: string; color: string } => {
    if (change === 0) return { text: "No change", color: "text-gray-600" };

    const isPositive = change > 0;
    const formattedChange = Math.abs(change).toFixed(1);

    return {
      text: `${isPositive ? "+" : "-"}${formattedChange}%`,
      color: isPositive ? "text-green-600" : "text-red-600",
    };
  };

  // Generate dynamic stat cards based on actual data
  const generateStatCards = () => {
    return [
      {
        title: "Total Experiments",
        value: stats.totalExperiments.toString(),
        icon: <BeakerIcon className="h-8 w-8 text-highlight-600 dark:text-highlight-400" />,
        color: "bg-highlight-50",
        change: formatChange(stats.changes.experimentsChange),
      },
      {
        title: "Average Cost Savings",
        value: `$${stats.avgCostSavings.toFixed(2)}`,
        icon: <CurrencyDollarIcon className="h-8 w-8 text-success-600 dark:text-success-400" />,
        color: "bg-success-50",
        change: formatChange(stats.changes.savingsChange),
      },
      {
        title: "Success Rate",
        value: `${(stats.successRate * 100).toFixed(1)}%`,
        icon: <ArrowTrendingUpIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />,
        color: "bg-primary-50",
        change: formatChange(stats.changes.successRateChange),
      },
      {
        title: "Total Savings",
        value: `$${stats.totalSavings.toFixed(2)}`,
        icon: <ChartBarIcon className="h-8 w-8 text-accent-600 dark:text-accent-400" />,
        color: "bg-accent-50",
        change: formatChange(stats.changes.totalSavingsChange),
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Header */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mx-6 mt-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="flex items-center text-3xl font-display font-bold gradient-text-primary">
                <BeakerIcon className="mr-3 w-8 h-8 text-primary-600 dark:text-primary-400" />
                Experimentation & A/B Testing
              </h1>
              <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
                Discover the most cost-effective solutions for your unique use
                cases using real data
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              <span className="text-sm font-medium text-secondary-900 dark:text-white">
                {recommendations.length > 0
                  ? `${recommendations.length} ${recommendations.length === 1 ? "recommendation" : "recommendations"} available`
                  : "Start experimenting to get recommendations"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-secondary-600 dark:text-secondary-300">
              Loading experimentation data...
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {generateStatCards().map((card, index) => (
                <div
                  key={index}
                  className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                        {card.title}
                      </p>
                      <p className="text-2xl font-display font-bold text-secondary-900 dark:text-white mt-1">
                        {card.value}
                      </p>
                      <div className="flex items-center mt-2">
                        <span
                          className={`text-xs font-medium ${card.change.color === 'text-green-600' ? 'text-success-600' : card.change.color === 'text-red-600' ? 'text-danger-600' : 'text-secondary-600'}`}
                        >
                          {card.change.text}
                        </span>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-1">
                          vs previous period
                        </span>
                      </div>
                    </div>
                    <div
                      className={`flex-shrink-0 glass rounded-lg p-3 border border-primary-200/30 bg-gradient-to-br from-primary-500/20 to-secondary-500/20`}
                    >
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Recommendations from Backend */}
            {recommendations.length > 0 ? (
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center">
                    <SparklesIcon className="h-5 w-5 text-accent-600 mr-2" />
                    AI-Powered Recommendations
                  </h2>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    Based on your actual usage patterns
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.slice(0, 6).map((rec, index) => (
                    <div
                      key={index}
                      className="glass rounded-lg border border-primary-200/30 bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
                          {rec.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rec.priority === "high"
                            ? "bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400"
                            : rec.priority === "medium"
                              ? "bg-accent-100 text-accent-800 dark:bg-accent-900/20 dark:text-accent-400"
                              : "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400"
                            }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-600 dark:text-secondary-300 mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CurrencyDollarIcon className="h-4 w-4 text-success-600" />
                          <span className="text-sm font-medium text-success-600">
                            ${rec.potentialSavings.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                          {rec.effort} effort
                        </span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rec.type === "model_comparison"
                            ? "bg-highlight-100 text-highlight-800 dark:bg-highlight-900/20 dark:text-highlight-400"
                            : rec.type === "what_if"
                              ? "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400"
                              : "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                            }`}
                        >
                          {rec.type.replace("_", " ")}
                        </span>
                      </div>
                      {rec.actions && rec.actions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-primary-200/30">
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">
                            Next Steps:
                          </p>
                          <ul className="text-xs text-secondary-600 dark:text-secondary-300 mt-1 list-disc list-inside">
                            {rec.actions
                              .slice(0, 2)
                              .map((action: string, actionIndex: number) => (
                                <li key={actionIndex}>{action}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 p-6 mb-8">
                <div className="flex items-center">
                  <SparklesIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-primary-900 dark:text-primary-200">
                      Getting Started with Experimentation
                    </h3>
                    <p className="text-sm text-primary-800 dark:text-primary-300 mt-1">
                      Start by comparing models in the Model Comparison tab. Our
                      system will analyze your usage patterns to provide
                      personalized recommendations.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Dynamic No Recommendations State */}
            {recommendations.length === 0 &&
              stats.totalExperiments > 0 &&
              !isLoading && (
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-8">
                  <div className="text-center">
                    <SparklesIcon className="h-8 w-8 text-secondary-400 dark:text-secondary-500 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
                      No New Recommendations
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                      Great! You've optimized well. We'll notify you when new
                      optimization opportunities arise.
                    </p>
                  </div>
                </div>
              )}
          </>
        )}

        {/* Main Content */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          {/* Tab Navigation */}
          <div className="border-b border-primary-200/30">
            <nav className="flex px-6 space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-secondary-500 dark:text-secondary-400 hover:text-primary-500 hover:border-primary-300"
                    }`}
                >
                  <span
                    className={
                      activeTab === tab.id ? "text-primary-600 dark:text-primary-400" : "text-secondary-400 dark:text-secondary-500"
                    }
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Descriptions */}
          <div className="px-6 py-4 bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50 border-b border-primary-200/30">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
                  {tabs.find((tab) => tab.id === activeTab)?.name}
                </h3>
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
                  {tabs.find((tab) => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="p-4 mb-4 glass rounded-lg border border-danger-200/30 bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="mr-2 w-5 h-5 text-danger-400" />
                  <span className="text-sm text-danger-800 dark:text-danger-400">{error}</span>
                </div>
              </div>
            )}

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experimentation;
