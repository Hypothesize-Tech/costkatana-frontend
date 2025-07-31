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
      return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-200";
    if (isNearLimit)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-200";
    return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow transition-shadow dark:bg-gray-800 hover:shadow-lg dark:border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate dark:text-white">
                {project.name}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  project.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {project.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-4">
            <button
              onClick={onView}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="View project"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
              title="Edit project"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete project"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Budget Usage
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getBudgetColor()}`}
            >
              {budgetUsagePercentage.toFixed(0)}%
              {isOverBudget && (
                <FiAlertCircle className="inline ml-1 w-3 h-3" />
              )}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className={`h-2 rounded-full transition-all ${
                isOverBudget
                  ? "bg-red-600"
                  : isNearLimit
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex justify-center items-center mb-1 text-gray-400">
              <FiUsers className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {project.members?.length || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
          </div>
          <div>
            <div className="flex justify-center items-center mb-1 text-gray-400">
              <FiDollarSign className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(budgetAmount)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
          </div>
          <div>
            <div className="flex justify-center items-center mb-1 text-gray-400">
              <FiTrendingUp className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(budgetSpent)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Spent</p>
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-400">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Period indicator */}
        {project.budget?.period && (
          <div className="pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Budget period: {project.budget.period}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
