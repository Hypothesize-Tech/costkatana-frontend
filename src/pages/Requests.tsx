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
import { usageService } from "@/services/usage.service";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useProject } from "@/contexts/ProjectContext";
import toast from "react-hot-toast";

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
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    } else if (statusCode === 401) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />;
    } else if (statusCode === 429) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />;
    } else {
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
    }
  };

  const handleRefresh = () => {
    refetchAnalytics();
    refetchRequests();
    toast.success("Data refreshed");
  };

  // Add budget status badge component
  const BudgetStatusBadge: React.FC<{ budgetInfo: any }> = ({ budgetInfo }) => {
    if (!budgetInfo) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          No Budget Set
        </span>
      );
    }

    const { isOverBudget, isApproachingLimit, budgetPercentage } = budgetInfo;

    if (isOverBudget) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          Over Budget ({budgetPercentage.toFixed(1)}%)
        </span>
      );
    }

    if (isApproachingLimit) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
          Near Limit ({budgetPercentage.toFixed(1)}%)
        </span>
      );
    }

    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
        Within Budget ({budgetPercentage.toFixed(1)}%)
      </span>
    );
  };

  // Add approval status badge component
  const ApprovalStatusBadge: React.FC<{ approvalStatus: any }> = ({
    approvalStatus,
  }) => {
    if (!approvalStatus) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          No Approval Required
        </span>
      );
    }

    if (approvalStatus.requiredApproval) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
          Approval Required
        </span>
      );
    }

    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Requests
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor your real-time LLM API requests.
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Total Requests
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.totalRequests.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Total Cost
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatCost(stats.totalCost)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Avg Response Time
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.avgResponseTime}ms
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats.successRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg dark:bg-gray-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
      <div className="bg-white shadow rounded-lg dark:bg-gray-800">
        <div className="px-4 py-5 sm:p-6">
          {requestsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      TIMESTAMP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      MODEL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      LATENCY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      TOTAL TOKENS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      COST
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      USER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      BUDGET STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      PROJECT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                      APPROVAL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredRequests.map((request: Request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTimeAgo(request.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {request.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status, request.statusCode)}
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">
                            • {request.statusCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {request.latency} ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {request.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCost(request.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {request.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BudgetStatusBadge budgetInfo={request.budgetInfo} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No requests found for the selected filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
