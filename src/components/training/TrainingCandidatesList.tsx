import React, { useState, useEffect } from "react";
import {
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  FunnelIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  trainingService,
  TrainingCandidate,
} from "../../services/training.service";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface TrainingCandidatesListProps {
  onSelectionChange?: (selectedRequestIds: string[]) => void;
  selectionMode?: boolean;
  initialSelection?: string[];
  filters?: {
    minScore?: number;
    maxTokens?: number;
    maxCost?: number;
    providers?: string[];
    models?: string[];
    features?: string[];
  };
}

export const TrainingCandidatesList: React.FC<TrainingCandidatesListProps> = ({
  onSelectionChange,
  selectionMode = false,
  initialSelection = [],
  filters = {},
}) => {
  const [candidates, setCandidates] = useState<TrainingCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelection),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadCandidates();
  }, [localFilters]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedIds));
    }
  }, [selectedIds, onSelectionChange]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await trainingService.scoring.getTrainingCandidates({
        ...localFilters,
        limit: 100,
      });
      setCandidates(data);
    } catch (error) {
      console.error("Failed to load training candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (requestId: string) => {
    if (!selectionMode) return;

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(
          candidates
            .map((c) => c.usageData.metadata?.requestId)
            .filter(Boolean),
        ),
      );
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-3 font-body text-light-text-secondary dark:text-dark-text-secondary">
          Loading training candidates...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
                <span className="text-white text-sm">🏆</span>
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary">
                Training Candidates
              </h3>
            </div>
            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              High-quality requests (4+ stars) suitable for training
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {selectionMode && candidates.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="btn-secondary text-sm"
              >
                {selectedIds.size === candidates.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span className="text-sm">Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">
                  Min Score
                </label>
                <select
                  value={localFilters.minScore || 4}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      minScore: parseInt(e.target.value),
                    }))
                  }
                  className="select"
                >
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={localFilters.maxTokens || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxTokens: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Cost ($)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={localFilters.maxCost || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxCost: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {selectionMode && selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedIds.size} request{selectedIds.size !== 1 ? "s" : ""}{" "}
                selected for training dataset
              </span>
            </div>
          </div>
        )}

        {/* Candidates List */}
        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Training Candidates Found
            </h3>
            <p className="text-gray-600 mb-4">
              Start scoring your requests with 4+ stars to see training candidates
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => {
              const requestId = candidate.usageData.metadata?.requestId;
              const isSelected = requestId ? selectedIds.has(requestId) : false;

              return (
                <div
                  key={candidate.requestScore._id}
                  className={`border rounded-lg p-4 transition-colors ${selectionMode
                    ? `cursor-pointer hover:bg-gray-50 ${isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                    }`
                    : "border-gray-200"
                    }`}
                  onClick={() => requestId && handleSelect(requestId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Score and Tags */}
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${i < candidate.requestScore.score
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                          <span className="text-sm font-medium ml-1">
                            {candidate.requestScore.score}/5
                          </span>
                        </div>

                        {candidate.requestScore.trainingTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidate.requestScore.trainingTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Prompt Preview */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          <span className="font-medium">Prompt:</span>{" "}
                          {candidate.usageData.prompt}
                        </p>
                        {candidate.usageData.completion && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            <span className="font-medium">Response:</span>{" "}
                            {candidate.usageData.completion}
                          </p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">
                            {candidate.usageData.service}
                          </span>
                          <span>•</span>
                          <span>{candidate.usageData.model}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <DocumentTextIcon className="h-3 w-3" />
                          <span>
                            {formatTokens(candidate.usageData.totalTokens)} tokens
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="h-3 w-3" />
                          <span>{formatCost(candidate.usageData.cost)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {new Date(
                              candidate.usageData.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {candidate.requestScore.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                          <span className="font-medium">Notes:</span>{" "}
                          {candidate.requestScore.notes}
                        </div>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {selectionMode && (
                      <div
                        className={`ml-4 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                          }`}
                      >
                        {isSelected && (
                          <CheckIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Efficiency Metrics */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        Token Efficiency:{" "}
                        <span className="font-medium">
                          {candidate.requestScore.tokenEfficiency.toFixed(4)}{" "}
                          score/token
                        </span>
                      </span>
                      <span>
                        Cost Efficiency:{" "}
                        <span className="font-medium">
                          {candidate.requestScore.costEfficiency.toFixed(2)}{" "}
                          score/$
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
