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
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl hover:shadow-xl transition-all hover:scale-[1.02]">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-display font-bold gradient-text-primary truncate">
                {dataset.name}
              </h3>
              <div className={`badge-${dataset.status === 'ready' ? 'success' : dataset.status === 'draft' ? 'warning' : dataset.status === 'training' ? 'info' : 'secondary'} inline-flex items-center gap-1`}>
                {getStatusIcon(dataset.status)}
                <span className="capitalize">{dataset.status}</span>
              </div>
            </div>

            {dataset.description && (
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3 line-clamp-2">
                {dataset.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-display font-medium gradient-text-secondary">Use Case:</span>
                <span className="badge-secondary text-xs">{dataset.targetUseCase.replace(/-/g, " ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-medium gradient-text-secondary">Model:</span>
                <span className="font-mono text-light-text-primary dark:text-dark-text-primary text-xs">{dataset.targetModel}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex items-center space-x-2 ml-4">
            {dataset.requestIds.length > 0 && onPreview && (
              <button
                onClick={() => onPreview(dataset)}
                className="btn-icon-secondary"
                title="Preview Dataset"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(dataset)}
                className="btn-icon-secondary"
                title="Edit Dataset"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(dataset._id)}
                className="btn-icon-secondary hover:text-danger-600 hover:bg-danger-50"
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
          <div className="text-center glass rounded-lg p-3 border border-info-200/30">
            <div className="flex items-center justify-center gap-2 text-info-600 dark:text-info-400 mb-2">
              <DocumentTextIcon className="h-4 w-4" />
              <span className="text-xs font-display font-medium">Requests</span>
            </div>
            <div className="text-lg font-display font-bold gradient-text-info">
              {dataset.stats.totalRequests}
            </div>
          </div>

          <div className="text-center glass rounded-lg p-3 border border-warning-200/30">
            <div className="flex items-center justify-center gap-2 text-warning-600 dark:text-warning-400 mb-2">
              <StarIcon className="h-4 w-4" />
              <span className="text-xs font-display font-medium">Avg Score</span>
            </div>
            <div className="text-lg font-display font-bold gradient-text-warning">
              {dataset.stats.averageScore.toFixed(1)}
            </div>
          </div>

          <div className="text-center glass rounded-lg p-3 border border-secondary-200/30">
            <div className="flex items-center justify-center gap-2 text-secondary-600 dark:text-secondary-400 mb-2">
              <DocumentTextIcon className="h-4 w-4" />
              <span className="text-xs font-display font-medium">Tokens</span>
            </div>
            <div className="text-lg font-display font-bold gradient-text-secondary">
              {formatTokens(dataset.stats.totalTokens)}
            </div>
          </div>

          <div className="text-center glass rounded-lg p-3 border border-success-200/30">
            <div className="flex items-center justify-center gap-2 text-success-600 dark:text-success-400 mb-2">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span className="text-xs font-display font-medium">Cost</span>
            </div>
            <div className="text-lg font-display font-bold gradient-text-success">
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
                <div className="glass rounded-lg p-4 border border-purple-200/30">
                  <h4 className="font-display font-medium gradient-text-purple mb-3">Providers</h4>
                  <div className="space-y-2">
                    {Object.entries(dataset.stats.providerBreakdown).map(
                      ([provider, count]) => (
                        <div key={provider} className="flex justify-between items-center">
                          <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">{provider}</span>
                          <span className="badge-primary text-xs">{count}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {Object.keys(dataset.stats.modelBreakdown).length > 0 && (
                <div className="glass rounded-lg p-4 border border-accent-200/30">
                  <h4 className="font-display font-medium gradient-text-accent mb-3">Models</h4>
                  <div className="space-y-2">
                    {Object.entries(dataset.stats.modelBreakdown)
                      .slice(0, 3)
                      .map(([model, count]) => (
                        <div key={model} className="flex justify-between items-center">
                          <span className="font-mono text-light-text-secondary dark:text-dark-text-secondary truncate text-xs">{model}</span>
                          <span className="badge-secondary text-xs">{count}</span>
                        </div>
                      ))}
                    {Object.keys(dataset.stats.modelBreakdown).length > 3 && (
                      <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
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
      <div className="px-6 py-4 glass border-t border-primary-200/30 rounded-b-xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>
                Created {new Date(dataset.createdAt).toLocaleDateString()}
              </span>
            </div>

            {dataset.lastExportedAt && (
              <div className="flex items-center gap-1">
                <ArrowDownTrayIcon className="h-3 w-3" />
                <span>
                  Exported{" "}
                  {new Date(dataset.lastExportedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <span>Min Score:</span>
              <span className="badge-warning text-xs">{dataset.minScore}★</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Populate Button */}
            {dataset.status === "draft" && onPopulate && (
              <button
                onClick={handlePopulate}
                disabled={isPopulating}
                className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPopulating ? (
                  <>
                    <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                    Populating...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Auto-Populate
                  </>
                )}
              </button>
            )}

            {/* Export Button */}
            {dataset.requestIds.length > 0 && onExport && (
              <button
                onClick={() => onExport(dataset)}
                className="btn-success text-sm inline-flex items-center gap-2"
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
