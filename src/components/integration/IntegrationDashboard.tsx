import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  KeyIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  CodeBracketIcon,
  CpuChipIcon,
  BoltIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { userService } from "../../services/user.service";
import { ProjectService } from "../../services/project.service";
import { analyticsService } from "../../services/analytics.service";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ApiKeyIntegration } from "./ApiKeyIntegration";
import { formatCurrency } from "../../utils/formatters";

interface IntegrationDashboardProps {
  projectId?: string;
}

interface DetailedActivity {
  id: string;
  type: "api_call" | "prompt" | "optimization" | "analysis";
  title: string;
  description: string;
  service: string;
  model: string;
  cost: number;
  totalTokens: number;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: Date;
  projectName?: string;
  prompt?: string;
  completion?: string;
  metadata?: any;
}

export const IntegrationDashboard: React.FC<IntegrationDashboardProps> = ({
  projectId,
}) => {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<DetailedActivity | null>(null);

  const { data: apiKeys, isLoading: loadingKeys } = useQuery(
    ["api-keys"],
    userService.getDashboardApiKeys,
  );

  const { data: projects, isLoading: loadingProjects } = useQuery(
    ["projects"],
    ProjectService.getProjects,
  );

  const { data: analytics, isLoading: loadingAnalytics } = useQuery(
    ["analytics-overview", projectId],
    () =>
      analyticsService.getAnalytics({
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        endDate: new Date().toISOString(),
        projectId: projectId && projectId !== "all" ? projectId : undefined,
      }),
  );

  // Fetch detailed recent usage for better activity display
  const { data: recentUsage, isLoading: loadingUsage } = useQuery(
    ["recent-usage", projectId],
    () =>
      analyticsService.getRecentUsage({
        limit: 10,
        projectId: projectId && projectId !== "all" ? projectId : undefined,
      }),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );

  const integrationStatus = {
    apiKeysConfigured: apiKeys?.length || 0,
    projectsWithUsage:
      projects?.filter((p) => p.spending?.current && p.spending.current > 0)
        .length || 0,
    totalProjects: projects?.length || 0,
    recentActivity: recentUsage || [],
  };

  const getIntegrationHealth = () => {
    const score =
      (integrationStatus.apiKeysConfigured > 0 ? 25 : 0) +
      (integrationStatus.projectsWithUsage > 0 ? 25 : 0) +
      (integrationStatus.totalProjects > 0 ? 25 : 0) +
      (integrationStatus.recentActivity.length > 0 ? 25 : 0);

    if (score >= 75)
      return { status: "healthy", color: "green", label: "Excellent" };
    if (score >= 50)
      return { status: "warning", color: "yellow", label: "Good" };
    return { status: "error", color: "red", label: "Needs Setup" };
  };

  const getActivityIcon = (service: string) => {
    if (service === "openai")
      return <CpuChipIcon className="w-5 h-5 text-green-600" />;
    if (service === "aws-bedrock")
      return <BoltIcon className="w-5 h-5 text-orange-600" />;
    if (service === "anthropic")
      return <CodeBracketIcon className="w-5 h-5 text-purple-600" />;
    return <PlayIcon className="w-5 h-5 text-blue-600" />;
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case "openai":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "aws-bedrock":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "anthropic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "google-ai":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleViewActivity = (usage: any) => {
    console.log("Activity data:", usage); // Debug log
    setSelectedActivity(usage);
  };

  const health = getIntegrationHealth();

  if (loadingKeys || loadingProjects || loadingAnalytics) {
    return <LoadingSpinner />;
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Integration Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor your AI usage and manage integrations
        </p>
      </div>

      {/* Integration Health - Simplified */}
      <div className="mb-8">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Overview
            </h2>
            <div
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                health.color === "green"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : health.color === "yellow"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {health.color === "green" ? (
                <CheckCircleIcon className="mr-1 w-4 h-4" />
              ) : (
                <ExclamationTriangleIcon className="mr-1 w-4 h-4" />
              )}
              {health.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrationStatus.apiKeysConfigured}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                API Keys
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrationStatus.projectsWithUsage}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Active Projects
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.summary?.totalRequests || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                API Calls
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics?.summary?.totalCost || 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Spent
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {integrationStatus.apiKeysConfigured === 0 && (
              <button
                onClick={() => setShowIntegrationModal(true)}
                className="w-full flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 transition-colors dark:bg-blue-900/20 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <CogIcon className="mr-3 w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    Setup Integration
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Add your first API key
                  </div>
                </div>
              </button>
            )}

            <a
              href="/settings"
              className="w-full flex items-center p-4 bg-green-50 rounded-lg border border-green-200 transition-colors dark:bg-green-900/20 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              <KeyIcon className="mr-3 w-6 h-6 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-medium text-green-900 dark:text-green-100">
                  Manage API Keys
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {integrationStatus.apiKeysConfigured} configured
                </div>
              </div>
            </a>

            <a
              href="/projects"
              className="w-full flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200 transition-colors dark:bg-purple-900/20 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              <DocumentTextIcon className="mr-3 w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-purple-900 dark:text-purple-100">
                  View Projects
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  {integrationStatus.totalProjects} total projects
                </div>
              </div>
            </a>

            <a
              href="/analytics"
              className="w-full flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200 transition-colors dark:bg-orange-900/20 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            >
              <ChartBarIcon className="mr-3 w-6 h-6 text-orange-600 dark:text-orange-400" />
              <div className="text-left">
                <div className="font-medium text-orange-900 dark:text-orange-100">
                  Detailed Analytics
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  View comprehensive reports
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent AI Activity
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            {loadingUsage ? (
              <div className="p-8 text-center">
                <LoadingSpinner />
              </div>
            ) : recentUsage && recentUsage.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {recentUsage.map((usage: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${getServiceColor(usage.service)} bg-opacity-10`}
                        >
                          {getActivityIcon(usage.service)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {usage.service} API Call
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {usage.createdAt
                                ? (() => {
                                    const date = new Date(usage.createdAt);
                                    const now = new Date();
                                    const diffInHours =
                                      (now.getTime() - date.getTime()) /
                                      (1000 * 60 * 60);

                                    if (diffInHours < 1) {
                                      return "Just now";
                                    } else if (diffInHours < 24) {
                                      return `${Math.floor(diffInHours)}h ago`;
                                    } else if (diffInHours < 168) {
                                      return `${Math.floor(diffInHours / 24)}d ago`;
                                    } else {
                                      return date.toLocaleDateString();
                                    }
                                  })()
                                : "N/A"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <span className="font-medium">{usage.model}</span>
                            {usage.projectName && (
                              <span className="text-gray-500 dark:text-gray-400 ml-2">
                                • {usage.projectName}
                              </span>
                            )}
                          </p>
                          {usage.prompt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {truncateText(usage.prompt, 120)}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {usage.totalTokens?.toLocaleString() || "0"}{" "}
                              tokens
                            </span>
                            <span>{formatCurrency(usage.cost)}</span>
                          </div>
                        </div>
                      </div>
                      {usage.prompt && (
                        <button
                          onClick={() => handleViewActivity(usage)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ClockIcon className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  No Recent Activity
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start using the API to see activity here
                </p>
                {integrationStatus.apiKeysConfigured === 0 && (
                  <button
                    onClick={() => setShowIntegrationModal(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                  >
                    Setup Integration
                    <ArrowTopRightOnSquareIcon className="ml-2 w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Activity Details
                </h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceColor(selectedActivity.service)}`}
                  >
                    {selectedActivity.service}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200">
                    {selectedActivity.model}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prompt
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedActivity.prompt}
                    </pre>
                  </div>
                </div>

                {selectedActivity.completion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Response
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {selectedActivity.completion}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Cost:
                    </span>
                    <div className="font-medium">
                      {formatCurrency(selectedActivity.cost || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Tokens:
                    </span>
                    <div className="font-medium">
                      {selectedActivity.totalTokens
                        ? selectedActivity.totalTokens.toLocaleString()
                        : selectedActivity.promptTokens &&
                            selectedActivity.completionTokens
                          ? (
                              selectedActivity.promptTokens +
                              selectedActivity.completionTokens
                            ).toLocaleString()
                          : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Time:
                    </span>
                    <div className="font-medium">
                      {selectedActivity.createdAt
                        ? new Date(selectedActivity.createdAt).toLocaleString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Modal */}
      <ApiKeyIntegration
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
      />
    </div>
  );
};
