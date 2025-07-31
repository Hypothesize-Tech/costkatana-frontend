import React, { useState } from "react";
import {
  FiX,
  FiUsers,
  FiDollarSign,
  FiEdit3,
  FiSettings,
  FiTrendingUp,
  FiCalendar,
  FiAlertCircle,
  FiTarget,
  FiActivity,
  FiBarChart,
  FiRefreshCw,
} from "react-icons/fi";
import { Modal } from "../common/Modal";
import { Project } from "../../types/project.types";
import { ProjectService } from "../../services/project.service";
import { useNotification } from "../../contexts/NotificationContext";

interface ViewProjectModalProps {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onManageMembers: (project: Project) => void;
}

export const ViewProjectModal: React.FC<ViewProjectModalProps> = ({
  project,
  onClose,
  onEdit,
  onManageMembers,
}) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "budget" | "settings"
  >("overview");
  const [recalculating, setRecalculating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRecalculateSpending = async () => {
    try {
      setRecalculating(true);
      await ProjectService.recalculateProjectSpending(project._id);
      showNotification(
        "Project spending recalculated successfully!",
        "success",
      );
      // Refresh the page or reload project data
      window.location.reload();
    } catch (error: any) {
      console.error("Error recalculating spending:", error);
      showNotification(
        error.message || "Failed to recalculate spending",
        "error",
      );
    } finally {
      setRecalculating(false);
    }
  };

  const spent = project.spending?.current || 0;
  const amount = project.budget?.amount || 0;
  const percentage = amount > 0 ? (spent / amount) * 100 : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: FiBarChart },
    { id: "members", label: "Members", icon: FiUsers },
    { id: "budget", label: "Budget", icon: FiDollarSign },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="xl">
      <div className="flex flex-col h-full max-h-[90vh] bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="flex justify-between items-start p-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="flex-1 min-w-0">
            <div className="flex gap-3 items-center mb-3">
              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <span className="text-white font-bold text-lg">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    project.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {project.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {project.description && (
              <p className="mb-4 text-gray-600 dark:text-gray-400 text-lg">
                {project.description}
              </p>
            )}

            <div className="flex gap-6 items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex gap-2 items-center">
                <FiUsers className="w-4 h-4" />
                <span>{project.members?.length || 0} members</span>
              </div>
              <div className="flex gap-2 items-center">
                <FiCalendar className="w-4 h-4" />
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <FiActivity className="w-4 h-4" />
                <span>Updated {formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center ml-4">
            <button
              onClick={() => onManageMembers(project)}
              className="flex gap-2 items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg transition-all hover:bg-gray-50 hover:border-gray-400 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              title="Manage members"
            >
              <FiUsers className="w-4 h-4" />
              Members
            </button>
            <button
              onClick={() => onEdit(project)}
              className="flex gap-2 items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-all hover:bg-blue-700"
              title="Edit project"
            >
              <FiEdit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 rounded-lg transition-colors hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-8 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700">
                  <div className="flex gap-3 items-center text-blue-800 dark:text-blue-200">
                    <div className="p-2 bg-blue-200 rounded-lg dark:bg-blue-800">
                      <FiDollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Total Budget</span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(project.budget?.amount || 0)}
                  </p>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    {project.budget?.period || "monthly"}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700">
                  <div className="flex gap-3 items-center text-green-800 dark:text-green-200">
                    <div className="p-2 bg-green-200 rounded-lg dark:bg-green-800">
                      <FiTrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Spent</span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(project.spending?.current || 0)}
                  </p>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                    {project.budget?.amount > 0
                      ? `${Math.round(percentage)}% used`
                      : "0% used"}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700">
                  <div className="flex gap-3 items-center text-purple-800 dark:text-purple-200">
                    <div className="p-2 bg-purple-200 rounded-lg dark:bg-purple-800">
                      <FiTarget className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Remaining</span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {formatCurrency(
                      (project.budget?.amount || 0) -
                        (project.spending?.current || 0),
                    )}
                  </p>
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                    Available budget
                  </p>
                </div>
              </div>

              {/* Budget Status */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Budget Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Budget Utilization
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage >= 90
                          ? "bg-red-500"
                          : percentage >= 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>$0</span>
                    <span>{formatCurrency(project.budget?.amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Project Members
                </h3>
                <button
                  onClick={() => onManageMembers(project)}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                  Manage Members
                </button>
              </div>

              {project.members && project.members.length > 0 ? (
                <div className="space-y-3">
                  {project.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/20">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {member.email?.charAt(0).toUpperCase() ||
                              (typeof member.userId === "object" &&
                                member.userId.name?.charAt(0).toUpperCase()) ||
                              "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {member.email ||
                              (typeof member.userId === "object" &&
                                member.userId.name) ||
                              (typeof member.userId === "string"
                                ? member.userId
                                : "Unknown User")}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.role === "admin"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FiUsers className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No members added to this project yet
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "budget" && (
            <div className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Budget Management
              </h3>

              <div className="space-y-6">
                {/* Budget Overview */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                    Budget Overview
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Budget
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(project.budget?.amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Amount Spent
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(project.spending?.current || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Remaining
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          (project.budget?.amount || 0) -
                            (project.spending?.current || 0),
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Budget Alerts */}
                {project.budget?.alerts && project.budget.alerts.length > 0 && (
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                      Budget Alerts
                    </h4>
                    <div className="space-y-3">
                      {project.budget.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-center p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/20"
                        >
                          <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                              Alert at {alert.threshold}%
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                              {alert.enabled ? "Enabled" : "Disabled"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Progress */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Budget Progress
                    </h4>
                    <button
                      onClick={handleRecalculateSpending}
                      disabled={recalculating}
                      className="flex gap-2 items-center px-3 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg transition-all hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 disabled:opacity-50"
                    >
                      <FiRefreshCw
                        className={`w-3 h-3 ${recalculating ? "animate-spin" : ""}`}
                      />
                      {recalculating ? "Recalculating..." : "Recalculate"}
                    </button>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        percentage >= 90
                          ? "bg-red-500"
                          : percentage >= 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(percentage)}% of budget used
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Project Settings
              </h3>

              <div className="space-y-6">
                {/* Cost Optimization */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                    Cost Optimization
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Automatic optimization
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.settings?.costOptimization?.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {project.settings?.costOptimization?.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Optimization level
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {project.settings?.costOptimization?.level || "Medium"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Budget alerts
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.settings?.notifications?.budgetAlerts
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {project.settings?.notifications?.budgetAlerts
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Usage reports
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.settings?.notifications?.usageReports
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {project.settings?.notifications?.usageReports
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Status */}
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="mb-4 font-medium text-gray-900 dark:text-white">
                    Project Status
                  </h4>
                  <div className="flex gap-3 items-center">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        project.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.isActive
                        ? "Project is currently active"
                        : "Project is inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
