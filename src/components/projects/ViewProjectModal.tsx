import React, { useState } from "react";
import {
  XMarkIcon,
  CurrencyDollarIcon,
  PencilIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "../common/Modal";
import { Project } from "../../types/project.types";
import { ProjectService } from "../../services/project.service";
import { useNotification } from "../../contexts/NotificationContext";

interface ViewProjectModalProps {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export const ViewProjectModal: React.FC<ViewProjectModalProps> = ({
  project,
  onClose,
  onEdit,
}) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<
    "overview" | "budget" | "settings"
  >("overview");
  const [recalculating, setRecalculating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyProjectId = async () => {
    try {
      await navigator.clipboard.writeText(project._id);
      setCopied(true);
      showNotification("Project ID copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showNotification("Failed to copy project ID", "error");
    }
  };

  const spent = project.spending?.current || 0;
  const amount = project.budget?.amount || 0;
  const percentage = amount > 0 ? (spent / amount) * 100 : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "budget", label: "Budget", icon: CurrencyDollarIcon },
    { id: "settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="6xl">
      <div className="flex flex-col h-full max-h-[90vh] glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex justify-between items-start p-8 border-b border-primary-200/30 glass rounded-t-xl">
          <div className="flex-1 min-w-0">
            <div className="flex gap-4 items-center mb-4">
              <div className="flex justify-center items-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-lg">
                <span className="text-white font-display font-bold text-2xl">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-4xl font-display font-bold gradient-text-primary">
                  {project.name}
                </h2>
                <span
                  className={`glass px-4 py-2 rounded-full font-display font-semibold border ${project.isActive
                    ? "border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300"
                    : "border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300"
                    }`}
                >
                  {project.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {project.description && (
              <p className="mb-4 text-secondary-600 dark:text-secondary-300 text-lg font-body">
                {project.description}
              </p>
            )}

            {/* Project ID Section */}
            <div className="mb-4 glass p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-display font-semibold text-secondary-600 dark:text-secondary-300 uppercase tracking-wide">
                    Project ID
                  </label>
                  <code className="block text-sm font-mono text-secondary-900 dark:text-white mt-1">
                    {project._id}
                  </code>
                </div>
                <button
                  onClick={handleCopyProjectId}
                  className="px-3 py-2 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-6 items-center text-sm text-secondary-600 dark:text-secondary-300 font-body">
              <div className="flex gap-2 items-center">
                <CalendarIcon className="w-4 h-4" />
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <ClockIcon className="w-4 h-4" />
                <span>Updated {formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center ml-4">
            <button
              onClick={() => onEdit(project)}
              className="px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 font-display font-semibold text-sm"
              title="Edit project"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-secondary-600 dark:text-secondary-300 hover:text-danger-500 hover:bg-danger-500/10 transition-all duration-300 hover:scale-110"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-primary-200/30 bg-gradient-primary/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-8 py-4 font-display font-medium transition-all duration-200 ${activeTab === tab.id
                ? "text-primary-700 dark:text-primary-300 border-b-2 border-primary-500 bg-gradient-primary/10"
                : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gradient-primary/5"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-8 bg-gradient-primary/5">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                  <div className="flex gap-3 items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                      <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-display font-semibold text-secondary-900 dark:text-white">Total Budget</span>
                  </div>
                  <p className="text-3xl font-display font-bold gradient-text-primary mb-2">
                    {formatCurrency(project.budget?.amount || 0)}
                  </p>
                  <p className="font-body text-secondary-600 dark:text-secondary-300">
                    {project.budget?.period || "monthly"}
                  </p>
                </div>

                <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                  <div className="flex gap-3 items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-display font-semibold text-secondary-900 dark:text-white">Spent</span>
                  </div>
                  <p className="text-3xl font-display font-bold gradient-text-success mb-2">
                    {formatCurrency(project.spending?.current || 0)}
                  </p>
                  <p className="font-body text-secondary-600 dark:text-secondary-300">
                    {project.budget?.amount > 0
                      ? `${Math.round(percentage)}% used`
                      : "0% used"}
                  </p>
                </div>

                <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                  <div className="flex gap-3 items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                      <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-display font-semibold text-secondary-900 dark:text-white">Remaining</span>
                  </div>
                  <p className="text-3xl font-display font-bold gradient-text-secondary mb-2">
                    {formatCurrency(
                      (project.budget?.amount || 0) -
                      (project.spending?.current || 0),
                    )}
                  </p>
                  <p className="font-body text-secondary-600 dark:text-secondary-300">
                    Available budget
                  </p>
                </div>
              </div>

              {/* Budget Status */}
              <div className="glass p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <h3 className="mb-4 text-lg font-display font-bold gradient-text-primary">
                  Budget Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-display font-medium text-secondary-900 dark:text-white">
                      Budget Utilization
                    </span>
                    <span className="text-sm font-display font-bold text-secondary-900 dark:text-white">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${percentage >= 90
                        ? "bg-gradient-danger"
                        : percentage >= 75
                          ? "bg-gradient-warning"
                          : "bg-gradient-success"
                        }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm font-body text-secondary-600 dark:text-secondary-300">
                    <span>$0</span>
                    <span>{formatCurrency(project.budget?.amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="p-6">
              <h3 className="mb-6 text-lg font-display font-bold gradient-text-primary">
                Budget Management
              </h3>

              <div className="space-y-6">
                {/* Budget Overview */}
                <div className="glass p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <h4 className="mb-4 font-display font-semibold text-secondary-900 dark:text-white">
                    Budget Overview
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-body text-secondary-600 dark:text-secondary-300">
                        Total Budget
                      </p>
                      <p className="text-xl font-display font-bold gradient-text-primary">
                        {formatCurrency(project.budget?.amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-body text-secondary-600 dark:text-secondary-300">
                        Amount Spent
                      </p>
                      <p className="text-xl font-display font-bold gradient-text-success">
                        {formatCurrency(project.spending?.current || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-body text-secondary-600 dark:text-secondary-300">
                        Remaining
                      </p>
                      <p className="text-xl font-display font-bold gradient-text-secondary">
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
                  <div className="glass p-4 rounded-xl border border-warning-200/30 dark:border-warning-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h4 className="mb-4 font-display font-semibold text-secondary-900 dark:text-white">
                      Budget Alerts
                    </h4>
                    <div className="space-y-3">
                      {project.budget.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-center glass p-3 rounded-lg border border-warning-200/30 dark:border-warning-500/20 bg-gradient-warning/10"
                        >
                          <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                          <div>
                            <p className="text-sm font-display font-medium text-warning-800 dark:text-warning-200">
                              Alert at {alert.threshold}%
                            </p>
                            <p className="text-xs font-body text-warning-700 dark:text-warning-300">
                              {alert.enabled ? "Enabled" : "Disabled"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Progress */}
                <div className="glass p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-display font-semibold text-secondary-900 dark:text-white">
                      Budget Progress
                    </h4>
                    <button
                      onClick={handleRecalculateSpending}
                      disabled={recalculating}
                      className="px-3 py-1.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-xs"
                    >
                      <ArrowPathIcon
                        className={`w-3 h-3 ${recalculating ? "animate-spin" : ""}`}
                      />
                      {recalculating ? "Recalculating..." : "Recalculate"}
                    </button>
                  </div>
                  <div className="w-full h-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${percentage >= 90
                        ? "bg-gradient-danger"
                        : percentage >= 75
                          ? "bg-gradient-warning"
                          : "bg-gradient-success"
                        }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="mt-2 text-sm font-body text-secondary-600 dark:text-secondary-300">
                    {Math.round(percentage)}% of budget used
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-6">
              <h3 className="mb-6 text-lg font-display font-bold gradient-text-primary">
                Project Settings
              </h3>

              <div className="space-y-6">
                {/* Cost Optimization */}
                <div className="glass p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <h4 className="mb-4 font-display font-semibold text-secondary-900 dark:text-white">
                    Cost Optimization
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-body text-secondary-900 dark:text-white">
                        Automatic optimization
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-display font-bold rounded-full border ${project.settings?.costOptimization?.enabled
                          ? "bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30"
                          : "bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border-secondary-200/30"
                          }`}
                      >
                        {project.settings?.costOptimization?.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-body text-secondary-900 dark:text-white">
                        Optimization level
                      </span>
                      <span className="text-sm font-body text-secondary-600 dark:text-secondary-300">
                        {project.settings?.costOptimization?.level || "Medium"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="glass p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <h4 className="mb-4 font-display font-semibold text-secondary-900 dark:text-white">
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-body text-secondary-900 dark:text-white">
                        Budget alerts
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-display font-bold rounded-full border ${project.settings?.notifications?.budgetAlerts
                          ? "bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30"
                          : "bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border-secondary-200/30"
                          }`}
                      >
                        {project.settings?.notifications?.budgetAlerts
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-body text-secondary-900 dark:text-white">
                        Usage reports
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-display font-bold rounded-full border ${project.settings?.notifications?.usageReports
                          ? "bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30"
                          : "bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border-secondary-200/30"
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
                <div className="glass p-4 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <h4 className="mb-4 font-display font-semibold text-secondary-900 dark:text-white">
                    Project Status
                  </h4>
                  <div className="flex gap-3 items-center">
                    <span
                      className={`px-3 py-1 text-sm font-display font-bold rounded-full border ${project.isActive
                        ? "bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30"
                        : "bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border-secondary-200/30"
                        }`}
                    >
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-sm font-body text-secondary-600 dark:text-secondary-300">
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
