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
} from "@heroicons/react/24/outline";
import { ConversationalAgent } from "../components/chat/ConversationalAgent";
import { StatsCard } from "../components/dashboard/StatsCard";
import { CostChart } from "../components/dashboard/CostChart";
import { ServiceBreakdown } from "../components/dashboard/ServiceBreakdown";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { DashboardService, DashboardData } from "../services/dashboard.service";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { AccountClosureBanner } from "../components/common/AccountClosureBanner";
import { useNotification } from "../contexts/NotificationContext";
import { formatTimestamp } from "../utils/formatters";
import logo from "../assets/logo.jpg";
import { useProject } from "@/contexts/ProjectContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center p-6">
        <div className="text-center glass backdrop-blur-xl rounded-2xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary shadow-lg">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <LoadingSpinner />
          <p className="mt-4 text-base font-display font-semibold gradient-text-primary">
            Loading dashboard...
          </p>
          <p className="mt-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
            Preparing your analytics
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center p-6">
        <div className="text-center glass backdrop-blur-xl rounded-2xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-8 max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary shadow-lg">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold gradient-text-primary mb-2">
            No Data Available
          </h3>
          <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Unable to load dashboard data at this time.
          </p>
          <button
            onClick={() =>
              fetchDashboardData(
                selectedProject === "all" ? undefined : selectedProject,
              )
            }
            className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 font-display font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl glow-primary hover:scale-105"
          >
            <ArrowPathIcon className="w-5 h-5" />
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
        <div className="mx-auto px-5 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand & Project Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg shrink-0">
                <img src={logo} alt="Cost Katana" className="w-5 h-5 rounded-lg" />
              </div>
              <div className="min-w-0 flex-1 hidden sm:block">
                <h1 className="font-display font-bold text-xl gradient-text-primary truncate">
                  Cost Katana
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 shrink-0">
                <div className="w-2 h-2 bg-gradient-success rounded-full shadow-sm shrink-0"></div>
                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary truncate max-w-[120px]">
                  {getSelectedProjectName()}
                </span>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View Mode Toggle */}
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 glass rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md border border-primary-200/30 shrink-0"
                title="Menu"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

              {/* Project Filter */}
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
                  <Menu.Items className="absolute right-0 z-30 mt-2 w-72 glass bg-white/95 dark:bg-secondary-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-primary-200/50 dark:border-secondary-700/50 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-primary-200/30 dark:border-secondary-700/30">
                        <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider flex items-center gap-2">
                          <FolderIcon className="w-3.5 h-3.5 text-primary-500" />
                          Select Project
                        </p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject("all")}
                            className={`${active ? "bg-primary-50/80 dark:bg-primary-900/30" : ""
                              } ${selectedProject === "all" ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-50/50 dark:bg-primary-900/20" : "text-light-text-primary dark:text-dark-text-primary"} 
                              flex items-center w-full text-left px-4 py-2.5 text-sm transition-all duration-200 hover:scale-102`}
                          >
                            <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3 shadow-sm shrink-0"></div>
                            All Projects
                          </button>
                        )}
                      </Menu.Item>
                      {projects.map((project) => (
                        <Menu.Item key={project._id}>
                          {({ active }) => (
                            <button
                              onClick={() => setSelectedProject(project._id)}
                              className={`${active ? "bg-primary-50/80 dark:bg-primary-900/30" : ""
                                } ${selectedProject === project._id ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-50/50 dark:bg-primary-900/20" : "text-light-text-primary dark:text-dark-text-primary"} 
                                flex items-center w-full text-left px-4 py-2.5 text-sm transition-all duration-200 hover:scale-102`}
                            >
                              <div className="w-2 h-2 bg-gradient-accent rounded-full mr-3 shadow-sm shrink-0"></div>
                              <span className="truncate">{project.name}</span>
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Time Range Filter */}
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

              {/* Refresh Button */}
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

      {/* Mobile Sidebar */}
      <Transition show={sidebarOpen} as={Fragment}>
        <div className="fixed inset-0 z-50 md:hidden">
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
            <div className="relative flex w-full flex-col bg-white dark:bg-secondary-900 shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Menu
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setViewMode("chat");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${viewMode === "chat"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                      }`}
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" />
                    Chat Interface
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("split");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${viewMode === "split"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                      }`}
                  >
                    <Squares2X2Icon className="w-5 h-5 mr-3" />
                    Split View
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("dashboard");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${viewMode === "dashboard"
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                      }`}
                  >
                    <ChartBarIcon className="w-5 h-5 mr-3" />
                    Analytics Dashboard
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Main Content */}
      <main className="flex-1 min-h-0 flex">
        {/* Chat Interface Area */}
        <div
          className={`transition-all duration-500 ease-in-out ${viewMode === "dashboard"
            ? "w-0 overflow-hidden"
            : viewMode === "chat"
              ? "w-full"
              : "w-2/3"
            } flex flex-col`}
        >
          <div className="h-[calc(100vh-5rem)] p-6">
            <div className="h-full glass backdrop-blur-xl rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden">
              <ConversationalAgent />
            </div>
          </div>
        </div>

        {/* Dashboard Panel */}
        {viewMode !== "chat" && (
          <div
            className={`transition-all duration-500 ease-in-out ${viewMode === "dashboard" ? "w-full" : "w-1/3"
              } flex flex-col`}
          >
            {/* Dashboard Content */}
            <div className="h-[calc(100vh-5rem)] p-6 pl-0">
              <div className="h-full glass backdrop-blur-xl rounded-2xl shadow-xl border border-primary-200/30 bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden flex flex-col">
                {/* Dashboard Header */}
                <div className="flex-shrink-0 glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg bg-gradient-to-r from-white/80 via-white/50 to-white/80 dark:from-dark-card/80 dark:via-dark-card/50 dark:to-dark-card/80 px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-lg gradient-text-primary">
                          Analytics Dashboard
                        </h2>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                          Real-time insights and metrics
                        </p>
                      </div>
                    </div>
                    {viewMode === "split" && (
                      <button
                        onClick={() =>
                          setDashboardPanelCollapsed(!dashboardPanelCollapsed)
                        }
                        className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 glass rounded-lg hover:bg-primary-500/10 transition-all duration-300 border border-primary-200/30"
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
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Charts and Analytics */}
                    {viewMode === "dashboard" ? (
                      // Full dashboard view
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                          <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <CostChart data={data.chartData} />
                          </div>
                          <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <ServiceBreakdown
                              data={
                                (data as any).transformedServiceBreakdown || []
                              }
                            />
                          </div>
                        </div>

                        <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
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
                      <div className="space-y-5">
                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary-200/30">
                            <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                              <CpuChipIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-sm font-display font-semibold gradient-text-primary">
                              Service Breakdown
                            </h3>
                          </div>
                          <ServiceBreakdown
                            data={
                              (data as any).transformedServiceBreakdown || []
                            }
                          />
                        </div>

                        <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary-200/30">
                            <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                              <ChartBarIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-sm font-display font-semibold gradient-text-primary">
                              Cost Trend
                            </h3>
                          </div>
                          <CostChart data={data.chartData} />
                        </div>

                        {data.recentActivity &&
                          data.recentActivity.length > 0 ? (
                          <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary-200/30">
                              <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                <ClockIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <h3 className="text-sm font-display font-semibold gradient-text-primary">
                                Recent Activity
                              </h3>
                            </div>
                            <div className="space-y-2.5">
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
                                      className="flex justify-between items-center py-2.5 px-3.5 glass rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 hover:from-primary-50/50 hover:to-primary-100/30 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 transition-all duration-300 cursor-pointer group"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                          {activity.description ||
                                            activity.prompt ||
                                            "Recent activity"}
                                        </p>
                                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                          {formatTimestamp(timestamp)}
                                        </p>
                                      </div>
                                      <div className="ml-3 text-right">
                                        <div className="text-sm font-display font-semibold gradient-text-primary">
                                          ${(activity.cost || 0).toFixed(4)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ) : (
                          <div className="glass backdrop-blur-xl rounded-xl p-8 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-6 h-6 text-primary-500" />
                              </div>
                              <h3 className="text-sm font-display font-semibold gradient-text-primary mb-2">
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
