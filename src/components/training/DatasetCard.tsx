import React, { useState } from "react";
import {
  DocumentTextIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  PlayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { TrainingDataset } from "../../services/training.service";

interface DatasetCardProps {
  dataset: TrainingDataset;
  onEdit?: (dataset: TrainingDataset) => void;
  onDelete?: (datasetId: string) => void;
  onExport?: (dataset: TrainingDataset) => void;
  onPopulate?: (datasetId: string) => void;
  onPreview?: (dataset: TrainingDataset) => void;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  onEdit,
  onDelete,
  onExport,
  onPopulate,
  onPreview,
}) => {
  const [isPopulating, setIsPopulating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "ready":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "exported":
        return <ArrowDownTrayIcon className="h-4 w-4 text-blue-500" />;
      case "training":
        return <PlayIcon className="h-4 w-4 text-purple-500" />;
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      default:
        return <ExclamationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "exported":
        return "bg-blue-100 text-blue-800";
      case "training":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePopulate = async () => {
    if (!onPopulate) return;

    setIsPopulating(true);
    try {
      await onPopulate(dataset._id);
    } finally {
      setIsPopulating(false);
    }
  };

  const formatCost = (cost: number) => {
    return cost < 0.01
      ? `$${(cost * 1000).toFixed(2)}k`
      : `$${cost.toFixed(3)}`;
  };

  const formatTokens = (tokens: number) => {
    return tokens > 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens.toString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {dataset.name}
              </h3>
              <div
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dataset.status)}`}
              >
                {getStatusIcon(dataset.status)}
                <span className="capitalize">{dataset.status}</span>
              </div>
            </div>

            {dataset.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {dataset.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="font-medium">Use Case:</span>
                <span>{dataset.targetUseCase.replace(/-/g, " ")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">Model:</span>
                <span>{dataset.targetModel}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex items-center space-x-2 ml-4">
            {dataset.requestIds.length > 0 && onPreview && (
              <button
                onClick={() => onPreview(dataset)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title="Preview Dataset"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(dataset)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                title="Edit Dataset"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(dataset._id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                title="Delete Dataset"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <DocumentTextIcon className="h-4 w-4" />
              <span className="text-xs">Requests</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {dataset.stats.totalRequests}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <StarIcon className="h-4 w-4" />
              <span className="text-xs">Avg Score</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {dataset.stats.averageScore.toFixed(1)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <DocumentTextIcon className="h-4 w-4" />
              <span className="text-xs">Tokens</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatTokens(dataset.stats.totalTokens)}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span className="text-xs">Cost</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCost(dataset.stats.totalCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Provider/Model Breakdown */}
      {(Object.keys(dataset.stats.providerBreakdown).length > 0 ||
        Object.keys(dataset.stats.modelBreakdown).length > 0) && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.keys(dataset.stats.providerBreakdown).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Providers</h4>
                <div className="space-y-1">
                  {Object.entries(dataset.stats.providerBreakdown).map(
                    ([provider, count]) => (
                      <div key={provider} className="flex justify-between">
                        <span className="text-gray-600">{provider}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {Object.keys(dataset.stats.modelBreakdown).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Models</h4>
                <div className="space-y-1">
                  {Object.entries(dataset.stats.modelBreakdown)
                    .slice(0, 3)
                    .map(([model, count]) => (
                      <div key={model} className="flex justify-between">
                        <span className="text-gray-600 truncate">{model}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  {Object.keys(dataset.stats.modelBreakdown).length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{Object.keys(dataset.stats.modelBreakdown).length - 3}{" "}
                      more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-3 w-3" />
              <span>
                Created {new Date(dataset.createdAt).toLocaleDateString()}
              </span>
            </div>

            {dataset.lastExportedAt && (
              <div className="flex items-center space-x-1">
                <ArrowDownTrayIcon className="h-3 w-3" />
                <span>
                  Exported{" "}
                  {new Date(dataset.lastExportedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div>
              <span>Min Score: {dataset.minScore}★</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Populate Button */}
            {dataset.status === "draft" && onPopulate && (
              <button
                onClick={handlePopulate}
                disabled={isPopulating}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPopulating ? "Populating..." : "Auto-Populate"}
              </button>
            )}

            {/* Export Button */}
            {dataset.requestIds.length > 0 && onExport && (
              <button
                onClick={() => onExport(dataset)}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
