import React from "react";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiAlertCircle,
} from "react-icons/fi";
import { Project } from "../../types/project.types";

interface ProjectCardProps {
  project: Project;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onDelete,
}) => {
  const budgetAmount = project.budget?.amount || 0;
  const budgetSpent = project.spending?.current || 0;
  const budgetUsagePercentage =
    budgetAmount > 0 ? (budgetSpent / budgetAmount) * 100 : 0;
  const isOverBudget = budgetUsagePercentage > 100;
  const isNearLimit = budgetUsagePercentage > 80 && !isOverBudget;

  const getBudgetColor = () => {
    if (isOverBudget)
      return "text-danger-700 dark:text-danger-300 bg-gradient-danger/20 border-danger-200/30";
    if (isNearLimit)
      return "text-warning-700 dark:text-warning-300 bg-gradient-warning/20 border-warning-200/30";
    return "text-success-700 dark:text-success-300 bg-gradient-success/20 border-success-200/30";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="glass rounded-xl shadow-xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300 hover:border-primary-300/50 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex gap-3 items-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-display font-bold text-lg">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold gradient-text-primary truncate mb-1">
                  {project.name}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-display font-bold rounded-full border ${project.isActive
                    ? "bg-gradient-success/20 text-success-700 dark:text-success-300 border-success-200/30"
                    : "bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border-secondary-200/30"
                    }`}
                >
                  {project.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            {project.description && (
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={onView}
              className="glass p-2 rounded-lg border border-primary-200/30 text-primary-600 dark:text-primary-400 hover:scale-110 transition-all duration-200"
              title="View project"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="glass p-2 rounded-lg border border-success-200/30 text-success-600 dark:text-success-400 hover:scale-110 transition-all duration-200"
              title="Edit project"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="glass p-2 rounded-lg border border-danger-200/30 text-danger-600 dark:text-danger-400 hover:scale-110 transition-all duration-200"
              title="Delete project"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
              Budget Usage
            </span>
            <span
              className={`px-3 py-1 text-xs font-display font-bold rounded-full border ${getBudgetColor()}`}
            >
              {budgetUsagePercentage.toFixed(0)}%
              {isOverBudget && (
                <FiAlertCircle className="inline ml-1 w-3 h-3" />
              )}
            </span>
          </div>
          <div className="w-full h-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${isOverBudget
                ? "bg-gradient-danger"
                : isNearLimit
                  ? "bg-gradient-warning"
                  : "bg-gradient-success"
                }`}
              style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-lg p-4 border border-secondary-200/30 shadow-lg backdrop-blur-xl text-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg mx-auto mb-2">
              <FiUsers className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-display font-bold gradient-text-secondary">
              {project.members?.length || 0}
            </p>
            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Members</p>
          </div>
          <div className="glass rounded-lg p-4 border border-success-200/30 shadow-lg backdrop-blur-xl text-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg mx-auto mb-2">
              <FiDollarSign className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-display font-bold gradient-text-success">
              {formatCurrency(budgetAmount)}
            </p>
            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Budget</p>
          </div>
          <div className="glass rounded-lg p-4 border border-accent-200/30 shadow-lg backdrop-blur-xl text-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg mx-auto mb-2">
              <FiTrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-display font-bold gradient-text-accent">
              {formatCurrency(budgetSpent)}
            </p>
            <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Spent</p>
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-display font-medium bg-gradient-primary/20 text-primary-700 dark:text-primary-300 border border-primary-200/30 rounded-full"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-3 py-1 text-xs font-display font-medium bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 border border-secondary-200/30 rounded-full">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Period indicator */}
        {project.budget?.period && (
          <div className="pt-4 mt-6 border-t border-primary-200/30">
            <div className="glass rounded-lg p-3 border border-primary-200/30 shadow-lg backdrop-blur-xl text-center">
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                Budget period: <span className="font-display font-semibold gradient-text-primary">{project.budget.period}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
