import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
  FolderIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { ConversationalAgent } from "../components/chat/ConversationalAgent";
import { StatsCard } from "../components/dashboard/StatsCard";
import { CostChart } from "../components/dashboard/CostChart";
import { ServiceBreakdown } from "../components/dashboard/ServiceBreakdown";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { DashboardService, DashboardData } from "../services/dashboard.service";
import { AccountClosureBanner } from "../components/common/AccountClosureBanner";
import { useNotification } from "../contexts/NotificationContext";
import { formatTimestamp } from "../utils/formatters";
import logo from "../assets/logo.jpg";
import { useProject } from "@/contexts/ProjectContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { DashboardShimmer } from "../components/shimmer/DashboardShimmer";

// Extended DashboardData interface to include projectBreakdown
interface ExtendedDashboardData extends DashboardData {
  projectBreakdown?: Array<{
    projectId: string;
    projectName: string;
    cost: number;
    requests: number;
    percentage: number;
    budgetUtilization?: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<ExtendedDashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Real-time updates
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([]);
  const [_sseConnection, setSseConnection] = useState<EventSource | null>(null);

  // View mode states
  const [viewMode, setViewMode] = useState<"split" | "chat" | "dashboard">(
    "chat",
  );
  const [dashboardPanelCollapsed, setDashboardPanelCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { showNotification } = useNotification();
  const {
    selectedProject,
    setSelectedProject,
    projects,
    getSelectedProjectName,
  } = useProject();

  // Fetch user profile to check account closure status
  const { data: userProfile } = useQuery(['user-profile'], userService.getProfile);

  const fetchDashboardData = async (projectId?: string) => {
    try {
      setRefreshing(true);

      // Get dashboard data
      const dashboardData = await DashboardService.getDashboardData(projectId);

      // Get recent activity separately for better data
      const recentActivityData = await DashboardService.getRecentActivity(5);

      // Process recent activity data
      if (recentActivityData.length > 0) {
        // Data available, use it as is
      } else {
        // No recent activity data available
      }

      // Enhanced data processing
      const enhanced = {
        ...dashboardData,
        recentActivity:
          recentActivityData.length > 0
            ? recentActivityData
            : dashboardData.recentActivity || [],
        transformedServiceBreakdown:
          dashboardData.serviceBreakdown?.map((service: any) => ({
            service: service.service || "Unknown",
            totalCost: service.cost || 0,
            totalTokens: service.tokens || 0,
            totalCalls: service.requests || 0,
            calls: service.requests || 0,
            percentage: service.percentage || 0,
            avgCost: (service.cost || 0) / (service.requests || 1),
            avgTokens: (service.tokens || 0) / (service.requests || 1),
            trend: "stable" as const,
            percentageChange: 0,
          })) || [],
      };

      // Add project breakdown if multiple projects exist
      if (projects.length > 1 && selectedProject === "all") {
        const projectBreakdown = await Promise.all(
          projects.map(async (project) => {
            const projectData = await DashboardService.getDashboardData(
              project._id,
            );
            return {
              projectId: project._id,
              projectName: project.name,
              cost: projectData.stats.totalCost || 0,
              requests: projectData.stats.totalRequests || 0,
              percentage:
                ((projectData.stats.totalCost || 0) /
                  (dashboardData.stats.totalCost || 1)) *
                100,
              budgetUtilization: (project as any).budget
                ? ((projectData.stats.totalCost || 0) /
                  (project as any).budget) *
                100
                : undefined,
            };
          }),
        );
        enhanced.projectBreakdown = projectBreakdown;
      }

      setData(enhanced as ExtendedDashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showNotification("Failed to load dashboard data", "error");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedProject === "all" ? undefined : selectedProject);
  }, [selectedProject, timeRange]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchDashboardData(
        selectedProject === "all" ? undefined : selectedProject,
      );
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Set up real-time updates
  useEffect(() => {
    const connection = DashboardService.connectToUsageUpdates((update) => {
      console.log("📡 Real-time update received:", update);

      switch (update.type) {
        case "usage_tracked":
          setRealtimeUpdates((prev) => [update.data, ...prev.slice(0, 9)]);
          console.log("📊 Real-time updates:", realtimeUpdates.length + 1);
          // Optionally refresh dashboard data
          if (data) {
            fetchDashboardData(
              selectedProject !== "all" ? selectedProject : undefined,
            );
          }
          break;
        case "budget_warning":
          showNotification(update.message, "warning", {
            title: "Budget Warning",
          });
          break;
        case "approval_request":
          showNotification(update.message, "info", {
            title: "Approval Required",
          });
          break;
      }
    });

    setSseConnection(connection);
    console.log(
      "📡 SSE connection status:",
      _sseConnection ? "active" : "initializing",
    );

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.close();
      }
    };
  }, [selectedProject]);

  // Loading state - Show shimmer that matches the dashboard layout
  if (loading) {
    return <DashboardShimmer viewMode={viewMode} />;
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center p-4 sm:p-6">
        <div className="text-center glass backdrop-blur-xl rounded-xl sm:rounded-2xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-6 sm:p-8 max-w-md w-full mx-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 glow-primary shadow-lg">
            <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-display font-bold gradient-text-primary mb-2">
            No Data Available
          </h3>
          <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-4 sm:mb-6">
            Unable to load dashboard data at this time.
          </p>
          <button
            onClick={() =>
              fetchDashboardData(
                selectedProject === "all" ? undefined : selectedProject,
              )
            }
            className="btn btn-primary inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-display font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl glow-primary hover:scale-105"
          >
            <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Account Closure Banner */}
      {userProfile?.accountClosure && userProfile.accountClosure.status === 'pending_deletion' && (
        <AccountClosureBanner closureStatus={userProfile.accountClosure} />
      )}

      {/* Professional Header */}
      <header className="glass backdrop-blur-xl sticky top-0 z-20 border-b border-primary-200/30 shadow-xl bg-gradient-to-r from-white/90 via-white/70 to-white/90 dark:from-dark-card/90 dark:via-dark-card/70 dark:to-dark-card/90 shrink-0">
        <div className="mx-auto px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5">
          {/* Mobile: Stacked Layout */}
          <div className="flex flex-col gap-3 md:hidden">
            {/* Top Row: Brand & Menu */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl glow-primary shadow-lg shrink-0">
                  <img src={logo} alt="Cost Katana" className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display font-bold text-base sm:text-lg gradient-text-primary truncate">
                    Cost Katana
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 glass rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md border border-primary-200/30 shrink-0"
                title="Menu"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>
            {/* Bottom Row: Controls */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {/* Project Filter - Mobile */}
              <Menu as="div" className="relative shrink-0">
                <Menu.Button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary glass bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/20 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm min-w-[90px] justify-between">
                  <div className="flex items-center gap-1 min-w-0">
                    <FolderIcon className="w-3 h-3 text-primary-500 shrink-0" />
                    <span className="truncate text-xs">
                      {selectedProject === "all"
                        ? "All"
                        : getSelectedProjectName().length > 8
                          ? getSelectedProjectName().substring(0, 8) + "..."
                          : getSelectedProjectName()}
                    </span>
                  </div>
                  <ChevronDownIcon className="w-3 h-3 flex-shrink-0 text-primary-500" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-1"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-1"
                >
                  <Menu.Items className="absolute left-0 z-30 mt-2 w-56 sm:w-64 backdrop-blur-xl rounded-lg shadow-xl border border-primary-200/30 bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="py-1.5">
                      <div className="px-3 py-2 border-b border-primary-200/30 dark:border-primary-700/30">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-lg glow-primary shadow-sm">
                            <FolderIcon className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                            Select Project
                          </p>
                        </div>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject("all")}
                            className={`${active ? "bg-primary-500/10 dark:bg-primary-900/20" : ""
                              } ${selectedProject === "all"
                                ? "text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500"
                                : "text-light-text-primary dark:text-dark-text-primary"} 
                              flex items-center w-full text-left px-3 py-2 text-xs transition-all duration-200 hover:bg-primary-500/5 dark:hover:bg-primary-900/10`}
                          >
                            <div className={`w-2 h-2 rounded-full mr-2.5 shrink-0 ${selectedProject === "all"
                              ? "bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm"
                              : "bg-primary-300 dark:bg-primary-700"
                              }`}></div>
                            <span className="truncate">All Projects</span>
                            {selectedProject === "all" && (
                              <CheckIcon className="w-3.5 h-3.5 ml-auto text-primary-500 shrink-0" />
                            )}
                          </button>
                        )}
                      </Menu.Item>
                      {projects.map((project) => (
                        <Menu.Item key={project._id}>
                          {({ active }) => (
                            <button
                              onClick={() => setSelectedProject(project._id)}
                              className={`${active ? "bg-primary-500/10 dark:bg-primary-900/20" : ""
                                } ${selectedProject === project._id
                                  ? "text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500"
                                  : "text-light-text-primary dark:text-dark-text-primary"} 
                                flex items-center w-full text-left px-3 py-2 text-xs transition-all duration-200 hover:bg-primary-500/5 dark:hover:bg-primary-900/10`}
                            >
                              <div className={`w-2 h-2 rounded-full mr-2.5 shrink-0 ${selectedProject === project._id
                                ? "bg-gradient-to-br from-accent-500 to-accent-600 shadow-sm"
                                : "bg-accent-300 dark:bg-accent-700"
                                }`}></div>
                              <span className="truncate flex-1">{project.name}</span>
                              {selectedProject === project._id && (
                                <CheckIcon className="w-3.5 h-3.5 ml-auto text-primary-500 shrink-0" />
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Time Range Filter - Mobile */}
              <div className="glass rounded-lg border border-primary-200/30 p-1 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 shrink-0">
                <div className="relative">
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                    <ClockIcon className="w-3 h-3 text-primary-500" />
                  </div>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="pl-7 pr-6 py-1.5 text-xs font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary transition-all duration-300 shadow-sm cursor-pointer appearance-none min-w-[85px]"
                  >
                    <option value="24h">24h</option>
                    <option value="7d">7d</option>
                    <option value="30d">30d</option>
                    <option value="90d">90d</option>
                  </select>
                  <ChevronDownIcon className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-primary-500 pointer-events-none" />
                </div>
              </div>

              {/* Refresh Button - Mobile */}
              <button
                onClick={() =>
                  fetchDashboardData(
                    selectedProject === "all" ? undefined : selectedProject,
                  )
                }
                disabled={refreshing}
                className="flex items-center justify-center p-2 text-white bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg disabled:opacity-50 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg disabled:cursor-not-allowed glow-primary min-w-[36px] min-h-[36px] shrink-0"
                title="Refresh Data"
              >
                {refreshing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowPathIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tablet & Desktop: Horizontal Layout */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {/* Left: Brand & Project Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg shrink-0">
                <img src={logo} alt="Cost Katana" className="w-5 h-5 rounded-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display font-bold text-xl gradient-text-primary truncate">
                  Cost Katana
                </h1>
              </div>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 shrink-0">
                <div className="w-2 h-2 bg-gradient-success rounded-full shadow-sm shrink-0"></div>
                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary truncate max-w-[120px]">
                  {getSelectedProjectName()}
                </span>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View Mode Toggle - Tablet & Desktop */}
              <div className="hidden lg:flex items-center glass rounded-lg p-1 border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                <button
                  onClick={() => setViewMode("chat")}
                  className={`flex items-center px-3 py-1.5 text-xs font-display font-semibold rounded-lg transition-all duration-300 shrink-0 ${viewMode === "chat"
                    ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg glow-primary"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10"
                    }`}
                  title="Chat Interface"
                >
                  <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="hidden xl:inline">Chat</span>
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`flex items-center px-3 py-1.5 text-xs font-display font-semibold rounded-lg transition-all duration-300 shrink-0 ${viewMode === "split"
                    ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg glow-primary"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10"
                    }`}
                  title="Split View"
                >
                  <Squares2X2Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="hidden xl:inline">Split</span>
                </button>
                <button
                  onClick={() => setViewMode("dashboard")}
                  className={`flex items-center px-3 py-1.5 text-xs font-display font-semibold rounded-lg transition-all duration-300 shrink-0 ${viewMode === "dashboard"
                    ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg glow-primary"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10"
                    }`}
                  title="Analytics Dashboard"
                >
                  <ChartBarIcon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="hidden xl:inline">Analytics</span>
                </button>
              </div>

              {/* Full Analytics Link */}
              <Link
                to="/analytics"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold text-primary-600 dark:text-primary-400 glass bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 border border-primary-200/30 rounded-lg hover:bg-primary-500/20 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 backdrop-blur-sm"
                title="Full Analytics"
              >
                <ChartBarIcon className="w-4 h-4 shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">Analytics</span>
              </Link>

              {/* Mobile Menu Button - Tablet */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 glass rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md border border-primary-200/30 shrink-0"
                title="Menu"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

              {/* Project Filter - Tablet & Desktop */}
              <Menu as="div" className="relative shrink-0">
                <Menu.Button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary glass bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/20 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 min-w-[100px] justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FolderIcon className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate text-xs">
                      {selectedProject === "all"
                        ? "All Projects"
                        : getSelectedProjectName()}
                    </span>
                  </div>
                  <ChevronDownIcon className="w-3.5 h-3.5 flex-shrink-0 text-primary-500" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-1"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-1"
                >
                  <Menu.Items className="absolute right-0 z-30 mt-2 w-64 backdrop-blur-xl rounded-lg shadow-xl border border-primary-200/30 bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="py-1.5">
                      <div className="px-3 py-2 border-b border-primary-200/30 dark:border-primary-700/30">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-lg glow-primary shadow-sm">
                            <FolderIcon className="w-3 h-3 text-white" />
                          </div>
                          <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                            Select Project
                          </p>
                        </div>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject("all")}
                            className={`${active ? "bg-primary-500/10 dark:bg-primary-900/20" : ""
                              } ${selectedProject === "all"
                                ? "text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500"
                                : "text-light-text-primary dark:text-dark-text-primary"} 
                              flex items-center w-full text-left px-3 py-2 text-xs transition-all duration-200 hover:bg-primary-500/5 dark:hover:bg-primary-900/10`}
                          >
                            <div className={`w-2 h-2 rounded-full mr-2.5 shrink-0 ${selectedProject === "all"
                              ? "bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm"
                              : "bg-primary-300 dark:bg-primary-700"
                              }`}></div>
                            <span className="truncate">All Projects</span>
                            {selectedProject === "all" && (
                              <CheckIcon className="w-3.5 h-3.5 ml-auto text-primary-500 shrink-0" />
                            )}
                          </button>
                        )}
                      </Menu.Item>
                      {projects.map((project) => (
                        <Menu.Item key={project._id}>
                          {({ active }) => (
                            <button
                              onClick={() => setSelectedProject(project._id)}
                              className={`${active ? "bg-primary-500/10 dark:bg-primary-900/20" : ""
                                } ${selectedProject === project._id
                                  ? "text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500"
                                  : "text-light-text-primary dark:text-dark-text-primary"} 
                                flex items-center w-full text-left px-3 py-2 text-xs transition-all duration-200 hover:bg-primary-500/5 dark:hover:bg-primary-900/10`}
                            >
                              <div className={`w-2 h-2 rounded-full mr-2.5 shrink-0 ${selectedProject === project._id
                                ? "bg-gradient-to-br from-accent-500 to-accent-600 shadow-sm"
                                : "bg-accent-300 dark:bg-accent-700"
                                }`}></div>
                              <span className="truncate flex-1">{project.name}</span>
                              {selectedProject === project._id && (
                                <CheckIcon className="w-3.5 h-3.5 ml-auto text-primary-500 shrink-0" />
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Time Range Filter - Tablet & Desktop */}
              <div className="glass rounded-lg border border-primary-200/30 p-1 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                    <ClockIcon className="w-3.5 h-3.5 text-primary-500" />
                  </div>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="pl-8 pr-7 py-1.5 text-xs font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 cursor-pointer appearance-none min-w-[110px]"
                  >
                    <option value="24h">24h</option>
                    <option value="7d">7d</option>
                    <option value="30d">30d</option>
                    <option value="90d">90d</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                </div>
              </div>

              {/* Refresh Button - Tablet & Desktop */}
              <button
                onClick={() =>
                  fetchDashboardData(
                    selectedProject === "all" ? undefined : selectedProject,
                  )
                }
                disabled={refreshing}
                className="flex items-center justify-center p-2 text-white bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg disabled:opacity-50 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed glow-primary hover:scale-105 disabled:hover:scale-100 min-w-[36px] min-h-[36px]"
                title="Refresh Data"
              >
                {refreshing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowPathIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Sidebar */}
      <Transition show={sidebarOpen} as={Fragment}>
        <div className="fixed inset-0 z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex w-full max-w-sm flex-col glass backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel border-r border-primary-200/30 dark:border-primary-500/20 shadow-xl h-full overflow-y-auto">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-primary-200/30 dark:border-primary-500/20 sticky top-0 glass backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl glow-primary shadow-lg">
                    <img src={logo} alt="Cost Katana" className="w-5 h-5 rounded-lg" />
                  </div>
                  <h2 className="text-lg font-display font-bold gradient-text-primary">
                    Menu
                  </h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                {/* View Mode Selection */}
                <div className="space-y-3">
                  <h3 className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider px-1">
                    View Mode
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setViewMode("chat");
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-display font-medium rounded-xl transition-all ${viewMode === "chat"
                        ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg glow-primary"
                        : "text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 glass border border-primary-200/30"
                        }`}
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 shrink-0" />
                      Chat Interface
                    </button>
                    <button
                      onClick={() => {
                        setViewMode("split");
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-display font-medium rounded-xl transition-all ${viewMode === "split"
                        ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg glow-primary"
                        : "text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 glass border border-primary-200/30"
                        }`}
                    >
                      <Squares2X2Icon className="w-5 h-5 mr-3 shrink-0" />
                      Split View
                    </button>
                    <button
                      onClick={() => {
                        setViewMode("dashboard");
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-display font-medium rounded-xl transition-all ${viewMode === "dashboard"
                        ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg glow-primary"
                        : "text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 glass border border-primary-200/30"
                        }`}
                    >
                      <ChartBarIcon className="w-5 h-5 mr-3 shrink-0" />
                      Analytics Dashboard
                    </button>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                  <h3 className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider px-1">
                    Quick Links
                  </h3>
                  <Link
                    to="/analytics"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full flex items-center px-4 py-3 text-sm font-display font-medium text-primary-600 dark:text-primary-400 glass border border-primary-200/30 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                  >
                    <ChartBarIcon className="w-5 h-5 mr-3 shrink-0" />
                    Full Analytics
                  </Link>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Main Content */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Chat Interface Area */}
        <div
          className={`transition-all duration-500 ease-in-out ${viewMode === "dashboard"
            ? "w-0 overflow-hidden lg:w-0"
            : viewMode === "chat"
              ? "w-full"
              : "w-full lg:w-2/3"
            } flex flex-col`}
        >
          <div className="h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="h-full glass backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden">
              <ConversationalAgent />
            </div>
          </div>
        </div>

        {/* Dashboard Panel */}
        {viewMode !== "chat" && (
          <div
            className={`transition-all duration-500 ease-in-out ${viewMode === "dashboard"
              ? "w-full"
              : "w-full lg:w-1/3"
              } flex flex-col`}
          >
            {/* Dashboard Content */}
            <div className="h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] p-2 sm:p-3 md:p-4 lg:p-6 lg:pl-0">
              <div className="h-full glass backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden flex flex-col">
                {/* Dashboard Header */}
                <div className="flex-shrink-0 glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg bg-gradient-to-r from-white/80 via-white/50 to-white/80 dark:from-dark-card/80 dark:via-dark-card/50 dark:to-dark-card/80 px-2.5 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-2.5 md:py-3 lg:py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 sm:p-2.5 rounded-lg sm:rounded-xl glow-primary shadow-lg shrink-0">
                        <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display font-bold text-base sm:text-lg gradient-text-primary truncate">
                          Analytics Dashboard
                        </h2>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5 hidden sm:block">
                          Real-time insights and metrics
                        </p>
                      </div>
                    </div>
                    {viewMode === "split" && (
                      <button
                        onClick={() =>
                          setDashboardPanelCollapsed(!dashboardPanelCollapsed)
                        }
                        className="hidden lg:flex p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 glass rounded-lg hover:bg-primary-500/10 transition-all duration-300 border border-primary-200/30 shrink-0"
                        title={dashboardPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
                      >
                        {dashboardPanelCollapsed ? (
                          <ChevronRightIcon className="w-4 h-4" />
                        ) : (
                          <ChevronLeftIcon className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Dashboard Content */}
                {!dashboardPanelCollapsed && (
                  <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4 lg:p-5 space-y-3 sm:space-y-4 md:space-y-5">
                    {/* Charts and Analytics */}
                    {viewMode === "dashboard" ? (
                      // Full dashboard view
                      <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-4">
                          <StatsCard
                            title="Total Cost"
                            value={data.stats.totalCost}
                            icon={CurrencyDollarIcon}
                            format="currency"
                            change={
                              data.stats.costChange
                                ? {
                                  value: data.stats.costChange,
                                  percentage: Math.abs(data.stats.costChange),
                                  trend:
                                    data.stats.costChange > 0 ? "up" : "down",
                                }
                                : undefined
                            }
                          />
                          <StatsCard
                            title="Total Requests"
                            value={data.stats.totalRequests}
                            icon={ChartBarIcon}
                          />
                          <StatsCard
                            title="Avg Cost/Request"
                            value={data.stats.averageCostPerRequest}
                            icon={CurrencyDollarIcon}
                            format="currency"
                          />
                          <StatsCard
                            title="Active Services"
                            value={data.serviceBreakdown?.length || 0}
                            icon={CpuChipIcon}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2">
                          <div className="glass backdrop-blur-xl rounded-xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <CostChart data={data.chartData} />
                          </div>
                          <div className="glass backdrop-blur-xl rounded-xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <ServiceBreakdown
                              data={
                                (data as any).transformedServiceBreakdown || []
                              }
                            />
                          </div>
                        </div>

                        <div className="glass backdrop-blur-xl rounded-xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                          <RecentActivity
                            topPrompts={
                              data.recentActivity?.map((activity: any) => ({
                                prompt: activity.prompt || activity.description,
                                totalCost:
                                  typeof activity.cost === "number"
                                    ? activity.cost
                                    : 0,
                                totalCalls: 1,
                                avgCost:
                                  typeof activity.cost === "number"
                                    ? activity.cost
                                    : 0,
                                lastUsed:
                                  activity.createdAt ||
                                  activity.updatedAt ||
                                  new Date(),
                                services: [
                                  activity.service ||
                                  activity.type ||
                                  "unknown",
                                ],
                                models: [],
                              })) || []
                            }
                            optimizationOpportunities={0}
                          />
                        </div>
                      </div>
                    ) : (
                      // Compact split view
                      <div className="space-y-3 sm:space-y-4 md:space-y-5">
                        <div className="glass backdrop-blur-xl rounded-xl p-2.5 sm:p-3 md:p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-primary-200/30">
                            <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg shrink-0">
                              <CpuChipIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-display font-semibold gradient-text-primary truncate">
                              Service Breakdown
                            </h3>
                          </div>
                          <ServiceBreakdown
                            data={
                              (data as any).transformedServiceBreakdown || []
                            }
                          />
                        </div>

                        <div className="glass backdrop-blur-xl rounded-xl p-2.5 sm:p-3 md:p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2.5 sm:mb-3 md:mb-4 pb-2 sm:pb-3 border-b border-primary-200/30">
                            <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg shrink-0">
                              <ChartBarIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-display font-semibold gradient-text-primary truncate">
                              Cost Trend
                            </h3>
                          </div>
                          <CostChart data={data.chartData} />
                        </div>

                        {data.recentActivity &&
                          data.recentActivity.length > 0 ? (
                          <div className="glass backdrop-blur-xl rounded-xl p-2.5 sm:p-3 md:p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-2 mb-2.5 sm:mb-3 md:mb-4 pb-2 sm:pb-3 border-b border-primary-200/30">
                              <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg shrink-0">
                                <ClockIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <h3 className="text-xs sm:text-sm font-display font-semibold gradient-text-primary truncate">
                                Recent Activity
                              </h3>
                            </div>
                            <div className="space-y-2 sm:space-y-2.5">
                              {data.recentActivity
                                .slice(0, 5)
                                .map((activity: any, index) => {
                                  const timestamp =
                                    activity.timestamp ||
                                    activity.createdAt ||
                                    activity.updatedAt ||
                                    activity.date ||
                                    new Date();

                                  return (
                                    <div
                                      key={activity.id || index}
                                      className="flex justify-between items-start sm:items-center gap-2 sm:gap-3 py-2 sm:py-2.5 px-2.5 sm:px-3.5 glass rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 hover:from-primary-50/50 hover:to-primary-100/30 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 transition-all duration-300 cursor-pointer group"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                          {activity.description ||
                                            activity.prompt ||
                                            "Recent activity"}
                                        </p>
                                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                          {formatTimestamp(timestamp)}
                                        </p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="text-xs sm:text-sm font-display font-semibold gradient-text-primary whitespace-nowrap">
                                          ${(activity.cost || 0).toFixed(4)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ) : (
                          <div className="glass backdrop-blur-xl rounded-xl p-6 sm:p-8 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="text-center">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
                              </div>
                              <h3 className="text-xs sm:text-sm font-display font-semibold gradient-text-primary mb-2">
                                No Recent Activity
                              </h3>
                              <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Start using AI models to see activity here
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
