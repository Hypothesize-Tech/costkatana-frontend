import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { usageService } from "../services/usage.service";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useProject } from "../contexts/ProjectContext";
import { useNotification } from "../contexts/NotificationContext";

interface Request {
  id: string;
  timestamp: Date;
  model: string;
  service: string;
  status: "success" | "error";
  statusCode: number;
  latency: number;
  totalTokens: number;
  cost: number;
  user: string;
  errorMessage?: string;
  budgetInfo?: {
    isOverBudget: boolean;
    isApproachingLimit: boolean;
    budgetPercentage: number;
  };
  approvalStatus?: {
    requiredApproval: boolean;
  };
  projectName?: string;
}

interface AnalyticsStats {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  avgResponseTime: number;
  errorCount: number;
  successCount: number;
  successRate: string;
}

export default function Requests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "success" | "error"
  >("all");
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">(
    "30d",
  );
  const { selectedProject } = useProject();
  const { showNotification } = useNotification();

  // Real-time analytics query
  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ["usage-analytics", timeRange, selectedFilter, selectedProject],
    queryFn: () =>
      usageService.getUsageAnalytics({
        timeRange,
        status: selectedFilter,
        projectId: selectedProject !== "all" ? selectedProject : undefined,
      }),
    keepPreviousData: true,
  });

  // Real-time requests query
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["realtime-requests", selectedProject],
    queryFn: () =>
      usageService.getRealTimeRequests({
        projectId: selectedProject !== "all" ? selectedProject : undefined,
        limit: 100,
      }),
    keepPreviousData: true,
  });

  const requests = requestsData?.data || [];
  const stats = (analyticsData?.data?.stats as AnalyticsStats) || {
    totalCost: 0,
    totalTokens: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    errorCount: 0,
    successCount: 0,
    successRate: "0.0",
  };

  // Filter requests based on search query
  const filteredRequests = requests.filter((request: Request) => {
    const matchesSearch =
      request.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || request.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 5,
    }).format(cost);
  };

  const getStatusIcon = (status: string, statusCode: number) => {
    if (status === "success") {
      return <CheckCircleIcon className="w-4 h-4 text-success-500" />;
    } else if (statusCode === 401) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-warning-500" />;
    } else if (statusCode === 429) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-accent-500" />;
    } else {
      return <ExclamationTriangleIcon className="w-4 h-4 text-error-500" />;
    }
  };

  const handleRefresh = () => {
    refetchAnalytics();
    refetchRequests();
    showNotification("Data refreshed", "success");
  };

  // Add budget status badge component with CostKatana design
  const BudgetStatusBadge: React.FC<{ budgetInfo: any }> = ({ budgetInfo }) => {
    if (!budgetInfo) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold leading-5 bg-gradient-to-r rounded-full border from-secondary-500/20 to-accent-500/20 text-secondary-600 dark:text-secondary-400 border-primary-200/30">
          No Budget Set
        </span>
      );
    }

    const { isOverBudget, isApproachingLimit, budgetPercentage } = budgetInfo;

    if (isOverBudget) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold leading-5 text-white bg-gradient-to-r rounded-full shadow-lg from-danger-500 to-danger-600">
          Over Budget ({budgetPercentage.toFixed(1)}%)
        </span>
      );
    }

    if (isApproachingLimit) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold leading-5 text-white bg-gradient-to-r rounded-full shadow-lg from-warning-500 to-accent-500">
          Near Limit ({budgetPercentage.toFixed(1)}%)
        </span>
      );
    }

    return (
      <span className="inline-flex px-3 py-1 text-xs font-semibold leading-5 text-white bg-gradient-to-r rounded-full shadow-lg from-success-500 to-success-600">
        Within Budget ({budgetPercentage.toFixed(1)}%)
      </span>
    );
  };

  // Add approval status badge component with CostKatana design
  const ApprovalStatusBadge: React.FC<{ approvalStatus: any }> = ({
    approvalStatus,
  }) => {
    if (!approvalStatus) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold leading-5 bg-gradient-to-r rounded-full border from-secondary-500/20 to-accent-500/20 text-secondary-600 dark:text-secondary-400 border-primary-200/30">
          No Approval Required
        </span>
      );
    }

    if (approvalStatus.requiredApproval) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-semibold leading-5 text-white bg-gradient-to-r rounded-full shadow-lg from-primary-500 to-highlight-500">
          Approval Required
        </span>
      );
    }

    return (
      <span className="inline-flex px-3 py-1 text-xs font-semibold leading-5 text-white bg-gradient-to-r rounded-full shadow-lg from-success-500 to-success-600">
        Auto Approved
      </span>
    );
  };

  // Helper function to get project display name
  const getProjectDisplayName = (projectName?: string) => {
    if (!projectName || projectName.trim() === "") {
      return "All Projects";
    }
    return projectName;
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Header */}
      <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold font-display gradient-text-primary">
              Requests
            </h1>
            <p className="text-secondary-600 dark:text-secondary-300">
              Monitor your real-time LLM API requests.
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              className="inline-flex gap-2 items-center btn btn-secondary"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20">
              <ChartBarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Total Requests
              </dt>
              <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {stats.totalRequests.toLocaleString()}
              </dd>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20">
              <ChartBarIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="flex-1">
              <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Total Cost
              </dt>
              <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {formatCost(stats.totalCost)}
              </dd>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20">
              <ClockIcon className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
            </div>
            <div className="flex-1">
              <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Avg Response Time
              </dt>
              <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {stats.avgResponseTime}ms
              </dd>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20">
              <CheckCircleIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="flex-1">
              <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Success Rate
              </dt>
              <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {stats.successRate}%
              </dd>
            </div>
          </div>
        </div>

        {/* Token Breakdown Stats Card */}
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
          <div className="flex items-center">
            <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20">
              <ChartBarIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div className="flex-1">
              <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                Token Breakdown
              </dt>
              <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                {stats.totalTokens.toLocaleString()}
              </dd>
              <dd className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
                <div className="flex justify-between">
                  <span>Input: {Math.round(stats.totalTokens * 0.7).toLocaleString()}</span>
                  <span>Output: {Math.round(stats.totalTokens * 0.3).toLocaleString()}</span>
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input"
                />
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex-shrink-0">
              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "1h" | "24h" | "7d" | "30d")
                }
                className="select"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedFilter}
                onChange={(e) =>
                  setSelectedFilter(
                    e.target.value as "all" | "success" | "error",
                  )
                }
                className="select"
              >
                <option value="all">All</option>
                <option value="success">Successful</option>
                <option value="error">Client Errors</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="px-6 py-6">
          {requestsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-200/30">
                <thead className="bg-gradient-to-r rounded-lg border glass border-primary-200/20 from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      TIMESTAMP
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      MODEL
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      LATENCY
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      TOKEN BREAKDOWN
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      COST
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      USER
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      BUDGET STATUS
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      PROJECT
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left uppercase font-display text-secondary-700 dark:text-secondary-300">
                      APPROVAL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-br divide-y glass from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-primary-200/20">
                  {filteredRequests.map((request: Request) => (
                    <tr
                      key={request.id}
                      className="transition-all duration-300 hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-success-500/5"
                    >
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-secondary-700 dark:text-secondary-300">
                        {formatTimeAgo(request.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-secondary-700 dark:text-secondary-300">
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r rounded-full from-primary-500/20 to-success-500/20 text-primary-600 dark:text-primary-400">
                          {request.model}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status, request.statusCode)}
                          <span className="ml-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            • {request.statusCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-secondary-700 dark:text-secondary-300">
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r rounded-full from-highlight-500/20 to-accent-500/20 text-highlight-600 dark:text-highlight-400">
                          {request.latency} ms
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-secondary-700 dark:text-secondary-300">
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r rounded-full from-accent-500/20 to-warning-500/20 text-accent-600 dark:text-accent-400">
                          {request.totalTokens.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold whitespace-nowrap text-success-600 dark:text-success-400">
                        {formatCost(request.cost)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-secondary-700 dark:text-secondary-300">
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r rounded-full from-secondary-500/20 to-accent-500/20 text-secondary-600 dark:text-secondary-400">
                          {request.user}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BudgetStatusBadge budgetInfo={request.budgetInfo} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-secondary-700 dark:text-secondary-300">
                        {getProjectDisplayName(request.projectName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ApprovalStatusBadge
                          approvalStatus={request.approvalStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="py-12 text-center">
                  <div className="p-8 mx-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br rounded-full from-primary-500/20 to-success-500/20">
                      <MagnifyingGlassIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold font-display text-secondary-900 dark:text-white">
                      No Requests Found
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-300">
                      No requests found for the selected filters. Try adjusting your search criteria.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
