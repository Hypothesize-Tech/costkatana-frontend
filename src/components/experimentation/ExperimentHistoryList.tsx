/**
 * ExperimentHistoryList
 *
 * Lists past experiments (model_comparison by default) with ability to view
 * full details including model responses.
 */
import React, { useState, useEffect } from "react";
import {
  History,
  ChevronRight,
  Eye,
  Beaker,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ExperimentationService } from "../../services/experimentation.service";
import type { ExperimentResult } from "../../services/experimentation.service";
import { ExperimentDetailModal } from "./ExperimentDetailModal";

interface ExperimentHistoryListProps {
  /** Filter by experiment type. Default: model_comparison */
  type?: "model_comparison" | "what_if" | "fine_tuning";
  /** Max items to show. Default: 10 */
  limit?: number;
  /** Compact display for sidebar. Default: false */
  compact?: boolean;
  /** Optional title override */
  title?: string;
  className?: string;
}

export const ExperimentHistoryList: React.FC<ExperimentHistoryListProps> = ({
  type = "model_comparison",
  limit = 10,
  compact = false,
  title,
  className = "",
}) => {
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExperiment, setSelectedExperiment] =
    useState<ExperimentResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    ExperimentationService.getExperimentHistory({
      type,
      limit,
      startDate: new Date(
        Date.now() - 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      endDate: new Date().toISOString(),
    })
      .then((data) => {
        setExperiments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load experiments");
        setExperiments([]);
      })
      .finally(() => setLoading(false));
  }, [type, limit]);

  const handleView = (exp: ExperimentResult) => {
    setSelectedExperiment(exp);
    setSelectedId(exp.id);
  };

  const handleCloseModal = () => {
    setSelectedExperiment(null);
    setSelectedId(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getModelCount = (exp: ExperimentResult) => {
    const res = exp.results as { models?: unknown[]; results?: unknown[] } | null;
    if (res?.models?.length) return res.models.length;
    if (res?.results?.length) return res.results.length;
    return 0;
  };

  const displayTitle = title ?? "Recent Experiments";

  return (
    <div
      className={`rounded-xl border border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel ${
        compact ? "p-3" : "p-4 sm:p-5"
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="flex items-center gap-2 text-sm sm:text-base font-display font-semibold text-secondary-900 dark:text-white">
          <History className="w-4 h-4 text-primary-500" />
          {displayTitle}
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && experiments.length === 0 && (
        <p className="text-sm text-secondary-500 dark:text-secondary-400 py-4 text-center">
          No experiments yet. Run a comparison to get started.
        </p>
      )}

      {!loading && !error && experiments.length > 0 && (
        <ul className="space-y-2">
          {experiments.map((exp) => {
            const modelCount = getModelCount(exp);
            return (
              <li key={exp.id}>
                <button
                  type="button"
                  onClick={() => handleView(exp)}
                  className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-primary-50/50 dark:hover:bg-dark-bg-200/50 transition-colors text-left group"
                >
                  <div
                    className={`flex-shrink-0 p-1.5 rounded-lg ${
                      exp.status === "completed"
                        ? "bg-success-100 dark:bg-success-900/30"
                        : exp.status === "failed"
                          ? "bg-danger-100 dark:bg-danger-900/30"
                          : "bg-accent-100 dark:bg-accent-900/30"
                    }`}
                  >
                    <Beaker
                      className={`w-4 h-4 ${
                        exp.status === "completed"
                          ? "text-success-600 dark:text-success-400"
                          : exp.status === "failed"
                            ? "text-danger-600 dark:text-danger-400"
                            : "text-accent-600 dark:text-accent-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                      {exp.name}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {modelCount > 0
                        ? `${modelCount} model${modelCount !== 1 ? "s" : ""} compared`
                        : exp.type?.replace("_", " ")}{" "}
                      · {formatDate(exp.startTime)}
                    </p>
                  </div>
                  <Eye className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 flex-shrink-0" />
                  <ChevronRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 flex-shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {(selectedId || selectedExperiment) && (
        <ExperimentDetailModal
          experimentId={selectedId}
          experiment={selectedExperiment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
