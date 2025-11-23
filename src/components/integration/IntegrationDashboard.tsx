import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  KeyIcon,
  ChartBarIcon,
  Cog6ToothIcon,
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
  FolderIcon,
  LinkIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CalendarDaysIcon,
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
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center shadow-lg">
          <CpuChipIcon className="w-4 h-4 text-white" />
        </div>
      );
    if (service === "aws-bedrock")
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 flex items-center justify-center shadow-lg">
          <BoltIcon className="w-4 h-4 text-white" />
        </div>
      );
    if (service === "anthropic")
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg">
          <CodeBracketIcon className="w-4 h-4 text-white" />
        </div>
      );
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg">
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
    <div className="px-4 py-6 sm:py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg">
            <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold gradient-text-primary flex items-center gap-2">
              <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-[#06ec9e] dark:text-emerald-400" />
              Integration Dashboard
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
              Monitor your AI usage and manage integrations
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn flex items-center justify-center gap-2 min-h-[36px] px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 [touch-action:manipulation] active:scale-95 ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50'
              : 'btn-secondary'
              }`}
          >
            <ChartBarIcon className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`btn flex items-center justify-center gap-2 min-h-[36px] px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 [touch-action:manipulation] active:scale-95 ${activeTab === 'projects'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50'
              : 'btn-secondary'
              }`}
          >
            <FolderIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Project IDs & Integration</span>
            <span className="sm:hidden">Projects</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Integration Health - Simplified */}
          <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold gradient-text-primary flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Quick Overview
                </h2>
              </div>
              <div
                className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-display font-bold shadow-lg ${health.color === "green"
                  ? "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white"
                  : health.color === "yellow"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white"
                  }`}
              >
                {health.color === "green" ? (
                  <CheckCircleIcon className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <ExclamationTriangleIcon className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                )}
                {health.label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation]">
                <div className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary mb-1 sm:mb-2">
                  {integrationStatus.apiKeysConfigured}
                </div>
                <div className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-center gap-1">
                  <KeyIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  API Keys
                </div>
              </div>
              <div className="glass rounded-xl border border-green-200/30 dark:border-green-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">
                  {integrationStatus.projectsWithUsage}
                </div>
                <div className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-center gap-1">
                  <BoltIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  Active Projects
                </div>
              </div>
              <div className="glass rounded-xl border border-gray-200/30 dark:border-gray-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  {analytics?.summary?.totalRequests || 0}
                </div>
                <div className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-center gap-1">
                  <BoltIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  API Calls
                </div>
              </div>
              <div className="glass rounded-xl border border-yellow-200/30 dark:border-yellow-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-yellow-700 dark:text-yellow-300 mb-1 sm:mb-2">
                  {formatCurrency(analytics?.summary?.totalCost || 0)}
                </div>
                <div className="text-xs sm:text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-center gap-1">
                  <BanknotesIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  Total Spent
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-4 sm:p-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center shadow-lg">
                    <BoltIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
                    <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#06ec9e] dark:text-emerald-400" />
                    Quick Actions
                  </h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {integrationStatus.apiKeysConfigured === 0 && (
                    <button
                      onClick={() => setShowIntegrationModal(true)}
                      className="btn btn-secondary w-full flex items-center gap-3 text-left min-h-[44px] p-3 sm:p-4 rounded-xl [touch-action:manipulation] active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Cog6ToothIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-bold text-sm sm:text-base">
                          Setup Integration
                        </div>
                        <div className="text-xs sm:text-sm font-body opacity-80">
                          Add your first API key
                        </div>
                      </div>
                    </button>
                  )}

                  <a
                    href="/settings"
                    className="btn btn-secondary w-full flex items-center gap-3 text-left min-h-[44px] p-3 sm:p-4 rounded-xl [touch-action:manipulation] active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <KeyIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold text-sm sm:text-base">
                        Manage API Keys
                      </div>
                      <div className="text-xs sm:text-sm font-body opacity-80">
                        {integrationStatus.apiKeysConfigured} configured
                      </div>
                    </div>
                  </a>

                  <a
                    href="/projects"
                    className="btn btn-secondary w-full flex items-center gap-3 text-left min-h-[44px] p-3 sm:p-4 rounded-xl [touch-action:manipulation] active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold text-sm sm:text-base">
                        View Projects
                      </div>
                      <div className="text-xs sm:text-sm font-body opacity-80">
                        {integrationStatus.totalProjects} total projects
                      </div>
                    </div>
                  </a>

                  <a
                    href="/analytics"
                    className="btn btn-secondary w-full flex items-center gap-3 text-left min-h-[44px] p-3 sm:p-4 rounded-xl [touch-action:manipulation] active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <ChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold text-sm sm:text-base">
                        Detailed Analytics
                      </div>
                      <div className="text-xs sm:text-sm font-body opacity-80">
                        View comprehensive reports
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="p-4 sm:p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center mr-3 shadow-lg">
                      <ClockIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-display font-bold gradient-text-primary flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#06ec9e] dark:text-emerald-400" />
                      Recent AI Activity
                    </h2>
                  </div>
                </div>
                {loadingUsage ? (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="spinner-lg text-[#06ec9e] dark:text-emerald-400 mb-4"></div>
                    <div className="font-display font-semibold gradient-text-primary text-sm sm:text-base">Loading activity...</div>
                  </div>
                ) : recentUsage && recentUsage.length > 0 ? (
                  <div className="divide-y divide-primary-200/30 dark:divide-primary-500/20 max-h-96 overflow-y-auto">
                    {recentUsage.map((usage: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 sm:p-6 hover:bg-white/50 dark:hover:bg-dark-card/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            {getActivityIcon(usage.service)}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <h4 className="text-base sm:text-lg font-display font-bold gradient-text-primary truncate">
                                  {usage.service} API Call
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-display font-bold ${getServiceColor(usage.service)} flex-shrink-0`}>
                                  {usage.createdAt
                                    ? (() => {
                                      const date = new Date(usage.createdAt);
                                      const now = new Date();
                                      const diffInHours =
                                        (now.getTime() - date.getTime()) /
                                        (1000 * 60 * 60);

                                      if (diffInHours < 1) {
                                        return (
                                          <span className="flex items-center gap-1">
                                            <BoltIcon className="h-3 w-3" />
                                            Just now
                                          </span>
                                        );
                                      } else if (diffInHours < 24) {
                                        return (
                                          <span className="flex items-center gap-1">
                                            <ClockIcon className="h-3 w-3" />
                                            {Math.floor(diffInHours)}h ago
                                          </span>
                                        );
                                      } else if (diffInHours < 168) {
                                        return (
                                          <span className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" />
                                            {Math.floor(diffInHours / 24)}d ago
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="flex items-center gap-1">
                                            <CalendarDaysIcon className="h-3 w-3" />
                                            {date.toLocaleDateString()}
                                          </span>
                                        );
                                      }
                                    })()
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="glass p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl mb-3">
                                <p className="text-xs sm:text-sm font-body text-light-text-primary dark:text-dark-text-primary flex items-center gap-2 flex-wrap">
                                  <span className="font-display font-bold flex items-center gap-1">
                                    <CpuChipIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {usage.model}
                                  </span>
                                  {usage.projectName && (
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                      <FolderIcon className="h-3 w-3" />
                                      {usage.projectName}
                                    </span>
                                  )}
                                </p>
                                {usage.prompt && (
                                  <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-2 line-clamp-2 flex items-start gap-2">
                                    <ChatBubbleLeftRightIcon className="h-3 w-3 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0 mt-0.5" />
                                    <span>{truncateText(usage.prompt, 120)}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 text-xs font-display font-semibold flex-wrap">
                                <span className="glass px-2 py-1 rounded-lg border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl text-[#06ec9e] dark:text-emerald-400 flex items-center gap-1.5">
                                  <BanknotesIcon className="h-3 w-3" />
                                  {usage.totalTokens?.toLocaleString() || "0"} tokens
                                </span>
                                <span className="glass px-2 py-1 rounded-lg border border-green-200/30 dark:border-green-500/20 shadow-lg backdrop-blur-xl text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                  <CurrencyDollarIcon className="h-3 w-3" />
                                  {formatCurrency(usage.cost)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {usage.prompt && (
                            <button
                              onClick={() => handleViewActivity(usage)}
                              className="btn btn-ghost ml-0 sm:ml-4 p-2 min-h-[32px] min-w-[32px] flex items-center justify-center flex-shrink-0 [touch-action:manipulation]"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
                      <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg sm:text-xl font-display font-bold gradient-text-primary">
                      No Recent Activity
                    </h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-4 sm:mb-6">
                      Start using the API to see activity here
                    </p>
                    {integrationStatus.apiKeysConfigured === 0 && (
                      <button
                        onClick={() => setShowIntegrationModal(true)}
                        className="btn btn-primary flex items-center gap-2 mx-auto min-h-[36px] px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50 transition-all duration-300 [touch-action:manipulation] active:scale-95"
                      >
                        <BoltIcon className="w-4 h-4" />
                        Setup Integration
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
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
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-4 sm:p-6 lg:p-8">
          <ProjectIdGuide />
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/95 to-white/90 dark:from-dark-card/95 dark:to-dark-card/90 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex justify-between items-start mb-4 sm:mb-6 gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                    <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold gradient-text-primary flex items-center gap-2 truncate">
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#06ec9e] dark:text-emerald-400 flex-shrink-0" />
                    Activity Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="btn btn-ghost p-2 min-h-[32px] min-w-[32px] flex items-center justify-center flex-shrink-0 [touch-action:manipulation]"
                >
                  <span className="text-lg sm:text-xl">✕</span>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceColor(selectedActivity.service)}`}
                  >
                    {selectedActivity.service}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                    {selectedActivity.model}
                  </span>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    Prompt
                  </label>
                  <div className="p-3 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50">
                    <pre className="text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap overflow-x-auto">
                      {selectedActivity.prompt}
                    </pre>
                  </div>
                </div>

                {selectedActivity.completion && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                      Response
                    </label>
                    <div className="p-3 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50">
                      <pre className="text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap overflow-x-auto">
                        {selectedActivity.completion}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Cost:
                    </span>
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {formatCurrency(selectedActivity.cost || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Tokens:
                    </span>
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
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
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Time:
                    </span>
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
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
