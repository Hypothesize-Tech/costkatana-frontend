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
import { IntegrationShimmer } from "../shimmer/IntegrationShimmer";
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
        <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg dark:from-green-600 dark:to-green-700 sm:w-8 sm:h-8">
          <CpuChipIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
        </div>
      );
    if (service === "aws-bedrock")
      return (
        <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg dark:from-yellow-600 dark:to-yellow-700 sm:w-8 sm:h-8">
          <BoltIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
        </div>
      );
    if (service === "anthropic")
      return (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg sm:w-8 sm:h-8">
          <CodeBracketIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
        </div>
      );
    return (
      <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-lg dark:from-gray-600 dark:to-gray-700 sm:w-8 sm:h-8">
        <PlayIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
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
    setSelectedActivity(usage);
  };

  const health = getIntegrationHealth();

  if (loadingKeys || loadingProjects || loadingAnalytics) {
    return <IntegrationShimmer />;
  }

  return (
    <div className="px-3 py-4 mx-auto space-y-4 max-w-7xl sm:px-4 sm:py-6 sm:space-y-6 md:px-6 md:py-8 md:space-y-8 lg:px-8">
      <div className="p-3 bg-gradient-to-br rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 sm:rounded-2xl md:p-6 lg:p-8">
        <div className="flex gap-2 items-center sm:gap-3 md:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
            <Cog6ToothIcon className="w-4 h-4 text-white sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap gap-1.5 items-center text-lg font-bold sm:text-xl sm:gap-2 md:text-2xl lg:text-3xl font-display gradient-text-primary">
              <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-[#06ec9e] dark:text-emerald-400 flex-shrink-0" />
              <span className="break-words">Integration Dashboard</span>
            </h1>
            <p className="mt-1 text-xs sm:mt-1.5 sm:text-sm md:mt-2 md:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
              Monitor your AI usage and manage integrations
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="p-3 bg-gradient-to-br rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 sm:rounded-2xl md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 md:gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn flex items-center justify-center gap-2 min-h-[44px] px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 [touch-action:manipulation] active:scale-95 sm:min-h-[40px] sm:px-4 sm:rounded-xl md:min-h-[36px] ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50'
              : 'btn-secondary'
              }`}
          >
            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`btn flex items-center justify-center gap-2 min-h-[44px] px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 [touch-action:manipulation] active:scale-95 sm:min-h-[40px] sm:px-4 sm:rounded-xl md:min-h-[36px] ${activeTab === 'projects'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50'
              : 'btn-secondary'
              }`}
          >
            <FolderIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden md:inline">Project IDs & Integration</span>
            <span className="md:hidden">Projects</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Integration Health - Simplified */}
          <div className="p-3 bg-gradient-to-br rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 sm:rounded-2xl md:p-6 lg:p-8">
            <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-center sm:gap-4 sm:mb-4 md:mb-6">
              <div className="flex gap-2 items-center sm:gap-3 md:gap-4 min-w-0 flex-1">
                <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-lg sm:w-8 sm:h-8 md:w-10 md:h-10 md:rounded-xl dark:from-gray-600 dark:to-gray-700 flex-shrink-0">
                  <ChartBarIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="flex gap-1.5 items-center text-base font-bold sm:text-lg sm:gap-2 md:text-xl lg:text-2xl font-display gradient-text-primary min-w-0">
                  <ChartBarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0 hidden sm:block" />
                  <span className="truncate">Quick Overview</span>
                </h2>
              </div>
              <div
                className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-display font-bold shadow-lg flex-shrink-0 sm:px-3 sm:py-1.5 md:px-4 md:py-2 md:text-sm ${health.color === "green"
                  ? "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white"
                  : health.color === "yellow"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white"
                  }`}
              >
                {health.color === "green" ? (
                  <CheckCircleIcon className="mr-1 w-3 h-3 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:mr-2 md:w-4 md:h-4" />
                ) : (
                  <ExclamationTriangleIcon className="mr-1 w-3 h-3 sm:mr-1.5 sm:w-3.5 sm:h-3.5 md:mr-2 md:w-4 md:h-4" />
                )}
                <span className="whitespace-nowrap">{health.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-2 md:gap-4 md:grid-cols-4 lg:gap-6">
              <div className="glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-3 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation] sm:p-4 sm:rounded-xl md:p-6">
                <div className="mb-1 text-xl font-bold sm:text-2xl md:text-3xl font-display gradient-text-primary sm:mb-1.5 md:mb-2 break-words">
                  {integrationStatus.apiKeysConfigured}
                </div>
                <div className="flex gap-1 justify-center items-center text-[10px] font-semibold sm:text-xs md:text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">
                  <KeyIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">API Keys</span>
                </div>
              </div>
              <div className="glass rounded-lg border border-green-200/30 dark:border-green-500/20 shadow-lg backdrop-blur-xl p-3 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation] sm:p-4 sm:rounded-xl md:p-6">
                <div className="mb-1 text-xl font-bold text-green-600 sm:text-2xl md:text-3xl font-display dark:text-green-400 sm:mb-1.5 md:mb-2 break-words">
                  {integrationStatus.projectsWithUsage}
                </div>
                <div className="flex gap-1 justify-center items-center text-[10px] font-semibold sm:text-xs md:text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">
                  <BoltIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">Active Projects</span>
                </div>
              </div>
              <div className="glass rounded-lg border border-gray-200/30 dark:border-gray-500/20 shadow-lg backdrop-blur-xl p-3 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation] sm:p-4 sm:rounded-xl md:p-6">
                <div className="mb-1 text-xl font-bold text-gray-700 sm:text-2xl md:text-3xl font-display dark:text-gray-300 sm:mb-1.5 md:mb-2 break-words">
                  {analytics?.summary?.totalRequests || 0}
                </div>
                <div className="flex gap-1 justify-center items-center text-[10px] font-semibold sm:text-xs md:text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">
                  <BoltIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">API Calls</span>
                </div>
              </div>
              <div className="glass rounded-lg border border-yellow-200/30 dark:border-yellow-500/20 shadow-lg backdrop-blur-xl p-3 bg-gradient-to-br from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 text-center hover:scale-105 transition-transform duration-300 [touch-action:manipulation] sm:p-4 sm:rounded-xl md:p-6">
                <div className="mb-1 text-lg font-bold text-yellow-700 sm:text-xl md:text-2xl lg:text-3xl font-display dark:text-yellow-300 sm:mb-1.5 md:mb-2 break-words">
                  {formatCurrency(analytics?.summary?.totalCost || 0)}
                </div>
                <div className="flex gap-1 justify-center items-center text-[10px] font-semibold sm:text-xs md:text-sm font-display text-light-text-secondary dark:text-dark-text-secondary">
                  <BanknotesIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">Total Spent</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <div className="p-3 bg-gradient-to-br rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 sm:rounded-2xl md:p-6">
                <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
                  <div className="flex justify-center items-center w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg dark:from-purple-600 dark:to-purple-700 flex-shrink-0 sm:w-8 sm:h-8">
                    <BoltIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
                  </div>
                  <h2 className="flex gap-1.5 items-center text-base font-bold sm:text-lg sm:gap-2 md:text-xl font-display gradient-text-primary ml-2 sm:ml-0">
                    <BoltIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#06ec9e] dark:text-emerald-400 flex-shrink-0" />
                    <span>Quick Actions</span>
                  </h2>
                </div>
                <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                  {integrationStatus.apiKeysConfigured === 0 && (
                    <button
                      onClick={() => setShowIntegrationModal(true)}
                      className="btn btn-secondary w-full flex items-center gap-2.5 text-left min-h-[44px] p-3 rounded-lg [touch-action:manipulation] active:scale-95 sm:gap-3 sm:p-3.5 sm:rounded-xl md:p-4"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0 sm:w-10 sm:h-10 sm:rounded-xl">
                        <Cog6ToothIcon className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold font-display sm:text-sm md:text-base truncate">
                          Setup Integration
                        </div>
                        <div className="text-[10px] opacity-80 sm:text-xs md:text-sm font-body truncate">
                          Add your first API key
                        </div>
                      </div>
                    </button>
                  )}

                  <a
                    href="/settings"
                    className="btn btn-secondary w-full flex items-center gap-2.5 text-left min-h-[44px] p-3 rounded-lg [touch-action:manipulation] active:scale-95 sm:gap-3 sm:p-3.5 sm:rounded-xl md:p-4"
                  >
                    <div className="flex flex-shrink-0 justify-center items-center w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg dark:from-green-600 dark:to-green-700 sm:w-10 sm:h-10 sm:rounded-xl">
                      <KeyIcon className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold font-display sm:text-sm md:text-base truncate">
                        Manage API Keys
                      </div>
                      <div className="text-[10px] opacity-80 sm:text-xs md:text-sm font-body truncate">
                        {integrationStatus.apiKeysConfigured} configured
                      </div>
                    </div>
                  </a>

                  <a
                    href="/projects"
                    className="btn btn-secondary w-full flex items-center gap-2.5 text-left min-h-[44px] p-3 rounded-lg [touch-action:manipulation] active:scale-95 sm:gap-3 sm:p-3.5 sm:rounded-xl md:p-4"
                  >
                    <div className="flex flex-shrink-0 justify-center items-center w-9 h-9 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-lg dark:from-gray-600 dark:to-gray-700 sm:w-10 sm:h-10 sm:rounded-xl">
                      <DocumentTextIcon className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold font-display sm:text-sm md:text-base truncate">
                        View Projects
                      </div>
                      <div className="text-[10px] opacity-80 sm:text-xs md:text-sm font-body truncate">
                        {integrationStatus.totalProjects} total projects
                      </div>
                    </div>
                  </a>

                  <a
                    href="/analytics"
                    className="btn btn-secondary w-full flex items-center gap-2.5 text-left min-h-[44px] p-3 rounded-lg [touch-action:manipulation] active:scale-95 sm:gap-3 sm:p-3.5 sm:rounded-xl md:p-4"
                  >
                    <div className="flex flex-shrink-0 justify-center items-center w-9 h-9 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg dark:from-yellow-600 dark:to-yellow-700 sm:w-10 sm:h-10 sm:rounded-xl">
                      <ChartBarIcon className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold font-display sm:text-sm md:text-base truncate">
                        Detailed Analytics
                      </div>
                      <div className="text-[10px] opacity-80 sm:text-xs md:text-sm font-body truncate">
                        View comprehensive reports
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:rounded-2xl">
                <div className="p-3 border-b sm:p-4 md:p-6 border-primary-200/30 dark:border-primary-500/20">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center mr-2 shadow-lg flex-shrink-0 sm:w-8 sm:h-8 sm:mr-3">
                      <ClockIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4" />
                    </div>
                    <h2 className="flex gap-1.5 items-center text-base font-bold sm:text-lg sm:gap-2 md:text-xl font-display gradient-text-primary min-w-0">
                      <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#06ec9e] dark:text-emerald-400 flex-shrink-0 hidden sm:block" />
                      <span className="truncate">Recent AI Activity</span>
                    </h2>
                  </div>
                </div>
                {loadingUsage ? (
                  <div className="p-4 text-center sm:p-6 md:p-8">
                    <div className="spinner-lg text-[#06ec9e] dark:text-emerald-400 mb-3 sm:mb-4"></div>
                    <div className="text-xs font-semibold font-display gradient-text-primary sm:text-sm md:text-base">Loading activity...</div>
                  </div>
                ) : recentUsage && recentUsage.length > 0 ? (
                  <div className="overflow-y-auto max-h-[60vh] sm:max-h-96 divide-y divide-primary-200/30 dark:divide-primary-500/20">
                    {recentUsage.map((usage: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-white/50 dark:hover:bg-dark-card/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] sm:p-4 md:p-6"
                      >
                        <div className="flex flex-col gap-2.5 justify-between items-start sm:flex-row sm:items-center sm:gap-3 md:gap-4">
                          <div className="flex flex-1 items-start space-x-2.5 min-w-0 sm:items-center sm:space-x-3 md:space-x-4">
                            <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                              {getActivityIcon(usage.service)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="text-sm font-bold truncate sm:text-base md:text-lg font-display gradient-text-primary">
                                  {usage.service} API Call
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-display font-bold ${getServiceColor(usage.service)} flex-shrink-0 sm:text-xs`}>
                                  {usage.createdAt
                                    ? (() => {
                                      const date = new Date(usage.createdAt);
                                      const now = new Date();
                                      const diffInHours =
                                        (now.getTime() - date.getTime()) /
                                        (1000 * 60 * 60);

                                      if (diffInHours < 1) {
                                        return (
                                          <span className="flex gap-1 items-center">
                                            <BoltIcon className="w-3 h-3" />
                                            Just now
                                          </span>
                                        );
                                      } else if (diffInHours < 24) {
                                        return (
                                          <span className="flex gap-1 items-center">
                                            <ClockIcon className="w-3 h-3" />
                                            {Math.floor(diffInHours)}h ago
                                          </span>
                                        );
                                      } else if (diffInHours < 168) {
                                        return (
                                          <span className="flex gap-1 items-center">
                                            <CalendarIcon className="w-3 h-3" />
                                            {Math.floor(diffInHours / 24)}d ago
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="flex gap-1 items-center">
                                            <CalendarDaysIcon className="w-3 h-3" />
                                            {date.toLocaleDateString()}
                                          </span>
                                        );
                                      }
                                    })()
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="p-2.5 mb-2.5 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 sm:p-3 sm:mb-3 sm:rounded-xl">
                                <p className="flex flex-wrap gap-1.5 items-center text-[10px] sm:text-xs md:text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                                  <span className="flex gap-1 items-center font-bold font-display">
                                    <CpuChipIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:h-4 md:w-4 flex-shrink-0" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">{usage.model}</span>
                                  </span>
                                  {usage.projectName && (
                                    <span className="flex gap-1 items-center text-light-text-secondary dark:text-dark-text-secondary">
                                      <FolderIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                      <span className="truncate max-w-[100px] sm:max-w-none">{usage.projectName}</span>
                                    </span>
                                  )}
                                </p>
                                {usage.prompt && (
                                  <p className="flex gap-1.5 items-start mt-1.5 text-[10px] font-body text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 sm:gap-2 sm:mt-2 sm:text-xs">
                                    <ChatBubbleLeftRightIcon className="h-2.5 w-2.5 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0 mt-0.5 sm:h-3 sm:w-3" />
                                    <span className="break-words">{truncateText(usage.prompt, 80)}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5 items-center text-[10px] font-semibold sm:gap-2 sm:text-xs md:gap-4 md:text-xs font-display">
                                <span className="glass px-1.5 py-1 rounded-md border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl text-[#06ec9e] dark:text-emerald-400 flex items-center gap-1 sm:px-2 sm:rounded-lg">
                                  <BanknotesIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                  <span className="whitespace-nowrap">{usage.totalTokens?.toLocaleString() || "0"} tokens</span>
                                </span>
                                <span className="glass px-1.5 py-1 rounded-md border border-green-200/30 dark:border-green-500/20 shadow-lg backdrop-blur-xl text-green-600 dark:text-green-400 flex items-center gap-1 sm:px-2 sm:rounded-lg">
                                  <CurrencyDollarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                  <span className="whitespace-nowrap">{formatCurrency(usage.cost)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          {usage.prompt && (
                            <button
                              onClick={() => handleViewActivity(usage)}
                              className="btn btn-ghost ml-0 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center flex-shrink-0 [touch-action:manipulation] sm:ml-4 sm:min-h-[32px] sm:min-w-[32px]"
                            >
                              <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center sm:p-6 md:p-8">
                    <div className="flex justify-center items-center mx-auto mb-3 w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-2xl animate-pulse sm:w-12 sm:h-12 sm:mb-4 sm:rounded-2xl md:w-16 md:h-16 dark:from-gray-600 dark:to-gray-700">
                      <ClockIcon className="w-5 h-5 text-white sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="mb-1.5 text-base font-bold sm:text-lg sm:mb-2 md:text-xl font-display gradient-text-primary">
                      No Recent Activity
                    </h3>
                    <p className="mb-3 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:mb-4 sm:text-sm md:mb-6">
                      Start using the API to see activity here
                    </p>
                    {integrationStatus.apiKeysConfigured === 0 && (
                      <button
                        onClick={() => setShowIntegrationModal(true)}
                        className="btn btn-primary flex items-center gap-1.5 mx-auto min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50 transition-all duration-300 [touch-action:manipulation] active:scale-95 sm:gap-2 sm:px-4 sm:text-sm sm:rounded-xl"
                      >
                        <BoltIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Setup Integration</span>
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
        <div className="p-3 bg-gradient-to-br rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-4 sm:rounded-2xl md:p-6 lg:p-8">
          <ProjectIdGuide />
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-2 backdrop-blur-sm bg-black/50 sm:p-3 md:p-4">
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/95 to-white/90 dark:from-dark-card/95 dark:to-dark-card/90 max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] overflow-y-auto animate-scale-in sm:rounded-2xl m-2 sm:m-0">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex gap-2 justify-between items-start mb-3 sm:gap-3 sm:mb-4 md:gap-4 md:mb-6">
                <div className="flex flex-1 gap-1.5 items-center min-w-0 sm:gap-2 md:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0 sm:rounded-xl">
                    <EyeIcon className="w-3.5 h-3.5 text-white sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="flex gap-1.5 items-center text-base font-bold truncate sm:text-lg sm:gap-2 md:text-xl lg:text-2xl font-display gradient-text-primary">
                    <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-[#06ec9e] dark:text-emerald-400 flex-shrink-0 hidden sm:block" />
                    <span className="truncate">Activity Details</span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="btn btn-ghost p-2 min-h-[36px] min-w-[36px] flex items-center justify-center flex-shrink-0 [touch-action:manipulation] sm:min-h-[32px] sm:min-w-[32px]"
                >
                  <span className="text-base sm:text-lg md:text-xl">✕</span>
                </button>
              </div>

              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span
                    className={`px-2 py-1 text-[10px] font-medium rounded-full sm:text-xs ${getServiceColor(selectedActivity.service)}`}
                  >
                    {selectedActivity.service}
                  </span>
                  <span className="px-2 py-1 text-[10px] text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200 sm:text-xs">
                    {selectedActivity.model}
                  </span>
                </div>

                <div>
                  <label className="block mb-1.5 text-[10px] font-medium sm:mb-2 sm:text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary">
                    Prompt
                  </label>
                  <div className="p-2.5 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 sm:p-3 sm:rounded-xl">
                    <pre className="overflow-x-auto text-[10px] whitespace-pre-wrap sm:text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary break-words">
                      {selectedActivity.prompt}
                    </pre>
                  </div>
                </div>

                {selectedActivity.completion && (
                  <div>
                    <label className="block mb-1.5 text-[10px] font-medium sm:mb-2 sm:text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary">
                      Response
                    </label>
                    <div className="p-2.5 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 sm:p-3 sm:rounded-xl">
                      <pre className="overflow-x-auto text-[10px] whitespace-pre-wrap sm:text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary break-words">
                        {selectedActivity.completion}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 text-[10px] sm:grid-cols-3 sm:gap-3 sm:text-xs md:gap-4 md:text-sm">
                  <div>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Cost:
                    </span>
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary break-words">
                      {formatCurrency(selectedActivity.cost || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Tokens:
                    </span>
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary break-words">
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
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary break-words text-[9px] sm:text-[10px] md:text-xs">
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
