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
import { ProjectIdGuide } from "./ProjectIdGuide";
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
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');

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
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
          <CpuChipIcon className="w-4 h-4 text-white" />
        </div>
      );
    if (service === "aws-bedrock")
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center shadow-lg">
          <BoltIcon className="w-4 h-4 text-white" />
        </div>
      );
    if (service === "anthropic")
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
          <CodeBracketIcon className="w-4 h-4 text-white" />
        </div>
      );
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
        <PlayIcon className="w-4 h-4 text-white" />
      </div>
    );
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case "openai":
        return "bg-gradient-success/10 text-success-700 dark:text-success-300 border border-success-200/30";
      case "aws-bedrock":
        return "bg-gradient-warning/10 text-warning-700 dark:text-warning-300 border border-warning-200/30";
      case "anthropic":
        return "bg-gradient-primary/10 text-primary-700 dark:text-primary-300 border border-primary-200/30";
      case "google-ai":
        return "bg-gradient-secondary/10 text-secondary-700 dark:text-secondary-300 border border-secondary-200/30";
      default:
        return "bg-gradient-accent/10 text-accent-700 dark:text-accent-300 border border-accent-200/30";
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
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
      <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
            <CogIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              🔗 Integration Dashboard
            </h1>
            <p className="mt-2 font-body text-light-text-secondary dark:text-dark-text-secondary">
              Monitor your AI usage and manage integrations
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card card-gradient p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${activeTab === 'overview'
              ? 'bg-gradient-primary text-white shadow-lg glow-primary'
              : 'glass border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10'
              }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${activeTab === 'projects'
              ? 'bg-gradient-primary text-white shadow-lg glow-primary'
              : 'glass border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10'
              }`}
          >
            🗂️ Project IDs & Integration
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Integration Health - Simplified */}
          <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg glow-secondary">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold gradient-text">
                  📊 Quick Overview
                </h2>
              </div>
              <div
                className={`flex items-center px-4 py-2 rounded-full text-sm font-display font-bold shadow-lg ${health.color === "green"
                  ? "bg-gradient-success text-white glow-success"
                  : health.color === "yellow"
                    ? "bg-gradient-warning text-white glow-warning"
                    : "bg-gradient-danger text-white glow-danger"
                  }`}
              >
                {health.color === "green" ? (
                  <CheckCircleIcon className="mr-2 w-4 h-4" />
                ) : (
                  <ExclamationTriangleIcon className="mr-2 w-4 h-4" />
                )}
                {health.label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30 text-center">
                <div className="text-3xl font-display font-bold gradient-text mb-2">
                  {integrationStatus.apiKeysConfigured}
                </div>
                <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  🔑 API Keys
                </div>
              </div>
              <div className="card card-hover p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30 text-center">
                <div className="text-3xl font-display font-bold gradient-text-success mb-2">
                  {integrationStatus.projectsWithUsage}
                </div>
                <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  🚀 Active Projects
                </div>
              </div>
              <div className="card card-hover p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30 text-center">
                <div className="text-3xl font-display font-bold text-secondary-600 dark:text-secondary-400 mb-2">
                  {analytics?.summary?.totalRequests || 0}
                </div>
                <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  ⚡ API Calls
                </div>
              </div>
              <div className="card card-hover p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30 text-center">
                <div className="text-3xl font-display font-bold gradient-text-accent mb-2">
                  {formatCurrency(analytics?.summary?.totalCost || 0)}
                </div>
                <div className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  💰 Total Spent
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <div className="card card-gradient p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center mr-3 shadow-lg">
                    <BoltIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-bold gradient-text">⚡ Quick Actions</h2>
                </div>
                <div className="space-y-4">
                  {integrationStatus.apiKeysConfigured === 0 && (
                    <button
                      onClick={() => setShowIntegrationModal(true)}
                      className="w-full card card-hover p-4 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg">
                          <CogIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-display font-bold gradient-text">
                            Setup Integration
                          </div>
                          <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Add your first API key
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  <a
                    href="/settings"
                    className="w-full card card-hover p-4 bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30 transition-all duration-300 hover:scale-105 block"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center mr-4 shadow-lg">
                        <KeyIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-display font-bold gradient-text-success">
                          Manage API Keys
                        </div>
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          {integrationStatus.apiKeysConfigured} configured
                        </div>
                      </div>
                    </div>
                  </a>

                  <a
                    href="/projects"
                    className="w-full card card-hover p-4 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30 transition-all duration-300 hover:scale-105 block"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center mr-4 shadow-lg">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-display font-bold text-secondary-600 dark:text-secondary-400">
                          View Projects
                        </div>
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          {integrationStatus.totalProjects} total projects
                        </div>
                      </div>
                    </div>
                  </a>

                  <a
                    href="/analytics"
                    className="w-full card card-hover p-4 bg-gradient-to-br from-warning-50/50 to-warning-100/50 border-warning-200/30 transition-all duration-300 hover:scale-105 block"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center mr-4 shadow-lg">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-display font-bold gradient-text-warning">
                          Detailed Analytics
                        </div>
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                          View comprehensive reports
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-2">
              <div className="card card-gradient shadow-2xl backdrop-blur-xl">
                <div className="p-6 border-b border-primary-200/30">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 shadow-lg">
                      <ClockIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text">🕒 Recent AI Activity</h2>
                  </div>
                </div>
                {loadingUsage ? (
                  <div className="p-8 text-center">
                    <div className="spinner-lg text-primary-500 mb-4"></div>
                    <div className="font-display font-semibold gradient-text">Loading activity...</div>
                  </div>
                ) : recentUsage && recentUsage.length > 0 ? (
                  <div className="divide-y divide-primary-200/30 max-h-96 overflow-y-auto">
                    {recentUsage.map((usage: any, index: number) => (
                      <div
                        key={index}
                        className="p-6 hover:bg-primary-500/5 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {getActivityIcon(usage.service)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-display font-bold gradient-text truncate">
                                  {usage.service} API Call
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-display font-bold ${getServiceColor(usage.service)}`}>
                                  {usage.createdAt
                                    ? (() => {
                                      const date = new Date(usage.createdAt);
                                      const now = new Date();
                                      const diffInHours =
                                        (now.getTime() - date.getTime()) /
                                        (1000 * 60 * 60);

                                      if (diffInHours < 1) {
                                        return "⚡ Just now";
                                      } else if (diffInHours < 24) {
                                        return `🕒 ${Math.floor(diffInHours)}h ago`;
                                      } else if (diffInHours < 168) {
                                        return `📅 ${Math.floor(diffInHours / 24)}d ago`;
                                      } else {
                                        return `📆 ${date.toLocaleDateString()}`;
                                      }
                                    })()
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="glass p-3 rounded-xl border border-primary-200/30 mb-3">
                                <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                                  <span className="font-display font-bold">🤖 {usage.model}</span>
                                  {usage.projectName && (
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary ml-2">
                                      • 📁 {usage.projectName}
                                    </span>
                                  )}
                                </p>
                                {usage.prompt && (
                                  <p className="text-xs font-body text-light-text-muted dark:text-dark-text-muted mt-2 line-clamp-2">
                                    💬 {truncateText(usage.prompt, 120)}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs font-display font-semibold">
                                <span className="glass px-2 py-1 rounded-lg border border-primary-200/30 gradient-text">
                                  🪙 {usage.totalTokens?.toLocaleString() || "0"} tokens
                                </span>
                                <span className="glass px-2 py-1 rounded-lg border border-success-200/30 gradient-text-success">
                                  💰 {formatCurrency(usage.cost)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {usage.prompt && (
                            <button
                              onClick={() => handleViewActivity(usage)}
                              className="ml-4 p-2 glass rounded-xl border border-primary-200/30 hover:bg-primary-500/10 transition-all duration-300 hover:scale-110"
                            >
                              <EyeIcon className="w-4 h-4 gradient-text" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 shadow-2xl glow-secondary animate-pulse">
                      <ClockIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-display font-bold gradient-text">
                      No Recent Activity
                    </h3>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">
                      Start using the API to see activity here
                    </p>
                    {integrationStatus.apiKeysConfigured === 0 && (
                      <button
                        onClick={() => setShowIntegrationModal(true)}
                        className="btn-primary px-6 py-3 font-display font-semibold transition-all duration-300 hover:scale-105"
                      >
                        🚀 Setup Integration
                        <ArrowTopRightOnSquareIcon className="ml-2 w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
          <ProjectIdGuide />
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card shadow-2xl backdrop-blur-xl border border-primary-200/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                    <EyeIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold gradient-text">
                    🔍 Activity Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 glass rounded-xl border border-primary-200/30 hover:bg-primary-500/10 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-lg gradient-text">✕</span>
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
