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
      <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg font-medium text-secondary-600 dark:text-secondary-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center">
        <div className="text-center glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
          <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-r from-primary-100/50 to-primary-200/50 dark:from-primary-800/50 dark:to-primary-700/50">
            <ChartBarIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
            No Data Available
          </h3>
          <p className="text-secondary-600 dark:text-secondary-300 mb-6">
            Unable to load dashboard data at this time.
          </p>
          <button
            onClick={() =>
              fetchDashboardData(
                selectedProject === "all" ? undefined : selectedProject,
              )
            }
            className="btn-primary inline-flex items-center px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
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
      <header className="glass backdrop-blur-xl sticky top-0 z-20 border-b border-primary-200/30 bg-gradient-to-r from-light-bg-200/80 to-light-bg-300/80 dark:from-dark-bg-200/80 dark:to-dark-bg-300/80">
        <div className="mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            {/* Brand & Project Info */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl glow-primary ring-2 ring-primary-200/30 dark:ring-primary-700/30">
                    <img src={logo} alt="Cost Katana" className="w-10 h-10 rounded-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold gradient-text-primary tracking-tight">
                    Cost Katana
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-success rounded-full shadow-sm"></div>
                    <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      {getSelectedProjectName()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="hidden lg:flex items-center glass rounded-2xl p-1.5 shadow-lg border border-primary-200/30 bg-white/50 dark:bg-secondary-800/50">
                <button
                  onClick={() => setViewMode("chat")}
                  className={`flex items-center px-4 py-2.5 text-sm font-display font-semibold rounded-xl transition-all duration-300 ${viewMode === "chat"
                    ? "bg-gradient-primary text-white shadow-lg glow-primary transform scale-105"
                    : "text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 hover:scale-102"
                    }`}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`flex items-center px-4 py-2.5 text-sm font-display font-semibold rounded-xl transition-all duration-300 ${viewMode === "split"
                    ? "bg-gradient-primary text-white shadow-lg glow-primary transform scale-105"
                    : "text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 hover:scale-102"
                    }`}
                >
                  <Squares2X2Icon className="w-4 h-4 mr-2" />
                  Split
                </button>
                <button
                  onClick={() => setViewMode("dashboard")}
                  className={`flex items-center px-4 py-2.5 text-sm font-display font-semibold rounded-xl transition-all duration-300 ${viewMode === "dashboard"
                    ? "bg-gradient-primary text-white shadow-lg glow-primary transform scale-105"
                    : "text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 hover:scale-102"
                    }`}
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Analytics
                </button>
              </div>

              {/* View Full Analytics Button */}
              <Link
                to="/analytics"
                className="hidden md:flex items-center px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 glass bg-primary-50/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/50 rounded-xl hover:bg-primary-100/80 dark:hover:bg-primary-900/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 backdrop-blur-sm"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Full Analytics
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-3 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 glass rounded-xl hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md border border-secondary-200/30 dark:border-secondary-700/30"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

              {/* Project Filter */}
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 glass bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl hover:bg-white dark:hover:bg-secondary-800 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 min-w-[140px] justify-between">
                  <span className="truncate">
                    {selectedProject === "all"
                      ? "All Projects"
                      : getSelectedProjectName()}
                  </span>
                  <ChevronDownIcon className="ml-2 w-4 h-4 flex-shrink-0" />
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
                  <Menu.Items className="absolute right-0 z-30 mt-3 w-72 glass bg-white/95 dark:bg-secondary-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-secondary-200/50 dark:border-secondary-700/50 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-secondary-200/30 dark:border-secondary-700/30">
                        <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Select Project
                        </p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject("all")}
                            className={`${active ? "bg-primary-50/80 dark:bg-primary-900/30" : ""
                              } ${selectedProject === "all" ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-50/50 dark:bg-primary-900/20" : "text-secondary-700 dark:text-secondary-300"} 
                                                        flex items-center w-full text-left px-4 py-3 text-sm transition-all duration-200 hover:scale-102`}
                          >
                            <div className="w-2 h-2 bg-gradient-primary rounded-full mr-3 shadow-sm"></div>
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
                                } ${selectedProject === project._id ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-50/50 dark:bg-primary-900/20" : "text-secondary-700 dark:text-secondary-300"} 
                                                            flex items-center w-full text-left px-4 py-3 text-sm transition-all duration-200 hover:scale-102`}
                            >
                              <div className="w-2 h-2 bg-gradient-accent rounded-full mr-3 shadow-sm"></div>
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
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2.5 text-sm font-medium glass bg-white/90 dark:bg-secondary-800/90 backdrop-blur-sm border border-secondary-200/50 dark:border-secondary-700/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-secondary-700 dark:text-secondary-300 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 cursor-pointer"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={() =>
                  fetchDashboardData(
                    selectedProject === "all" ? undefined : selectedProject,
                  )
                }
                disabled={refreshing}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-primary rounded-xl disabled:opacity-50 hover:bg-gradient-success transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed glow-primary hover:scale-105 disabled:hover:scale-100 min-w-[44px] justify-center"
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
            <div className="h-full bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-secondary-200/50 dark:border-secondary-700/50 overflow-hidden">
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
              <div className="h-full bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-secondary-200/50 dark:border-secondary-700/50 overflow-hidden flex flex-col">
                {/* Dashboard Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-primary-50 to-highlight-50 dark:from-secondary-800 dark:to-secondary-700 border-b border-secondary-200/50 dark:border-secondary-700/50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
                        <ChartBarIcon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold gradient-text-primary">
                        Analytics Dashboard
                      </h2>
                    </div>
                    {viewMode === "split" && (
                      <button
                        onClick={() =>
                          setDashboardPanelCollapsed(!dashboardPanelCollapsed)
                        }
                        className="p-2 text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-100/50 dark:hover:bg-primary-800/50 transition-all"
                      >
                        {dashboardPanelCollapsed ? (
                          <ChevronRightIcon className="w-5 h-5" />
                        ) : (
                          <ChevronLeftIcon className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Dashboard Content */}
                {!dashboardPanelCollapsed && (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Charts and Analytics */}
                    {viewMode === "dashboard" ? (
                      // Full dashboard view
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                          <div className="bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-xl p-6 border border-secondary-200/50 dark:border-secondary-700/50 card-hover">
                            <CostChart data={data.chartData} />
                          </div>
                          <div className="bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-xl p-6 border border-secondary-200/50 dark:border-secondary-700/50 card-hover">
                            <ServiceBreakdown
                              data={
                                (data as any).transformedServiceBreakdown || []
                              }
                            />
                          </div>
                        </div>

                        <div className="bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-xl p-6 border border-secondary-200/50 dark:border-secondary-700/50 card-hover">
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
                      <div className="space-y-6">
                        <div className="bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-xl p-5 border border-secondary-200/50 dark:border-secondary-700/50 card-hover">
                          <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                            <CpuChipIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Service Breakdown
                          </h3>
                          <ServiceBreakdown
                            data={
                              (data as any).transformedServiceBreakdown || []
                            }
                          />
                        </div>

                        <div className="bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-xl p-5 border border-secondary-200/50 dark:border-secondary-700/50 card-hover">
                          <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                            <ChartBarIcon className="w-5 h-5 mr-2 text-primary-600" />
                            Cost Trend
                          </h3>
                          <CostChart data={data.chartData} />
                        </div>

                        {data.recentActivity &&
                          data.recentActivity.length > 0 ? (
                          <div className="bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-xl p-5 border border-secondary-200/50 dark:border-secondary-700/50 card-hover">
                            <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                              <ClockIcon className="w-5 h-5 mr-2 text-primary-600" />
                              Recent Activity
                            </h3>
                            <div className="space-y-3">
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
                                      className="flex justify-between items-center py-3 px-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-lg border border-primary-200/30 dark:border-primary-600/30 hover:bg-primary-100/50 dark:hover:bg-primary-900/30 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                                          {activity.description ||
                                            activity.prompt ||
                                            "Recent activity"}
                                        </p>
                                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                                          {formatTimestamp(timestamp)}
                                        </p>
                                      </div>
                                      <div className="ml-4 text-right">
                                        <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                          ${(activity.cost || 0).toFixed(4)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/60 dark:bg-secondary-800/60 backdrop-blur-sm rounded-xl p-8 border border-secondary-200/50 dark:border-secondary-700/50">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-6 h-6 text-primary-500" />
                              </div>
                              <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-2">
                                No Recent Activity
                              </h3>
                              <p className="text-xs text-secondary-500 dark:text-secondary-400">
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
