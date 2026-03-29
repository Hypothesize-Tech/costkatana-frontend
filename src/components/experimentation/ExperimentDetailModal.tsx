/**
 * ExperimentDetailModal
 *
 * VS-style comparison view: side-by-side metrics grid with highlighted best values,
 * and expandable model responses for easy comparison.
 */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  Trophy,
  Zap,
  RefreshCw,
  Download,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { FormattedModelResponse } from "../common/FormattedContent";
import { ExperimentationService } from "../../services/experimentation.service";
import type { ExperimentResult } from "../../services/experimentation.service";

interface ExperimentDetailModalProps {
  experimentId: string | null;
  experiment?: ExperimentResult | null;
  onClose: () => void;
}

export const ExperimentDetailModal: React.FC<ExperimentDetailModalProps> = ({
  experimentId,
  experiment: initialExperiment,
  onClose,
}) => {
  const [experiment, setExperiment] = useState<ExperimentResult | null>(
    initialExperiment ?? null,
  );
  const [loading, setLoading] = useState(!initialExperiment && !!experimentId);
  const [error, setError] = useState<string | null>(null);
  const [expandedResponses, setExpandedResponses] = useState<Set<number>>(
    new Set([0]),
  );
  const [refreshing, setRefreshing] = useState(false);

  const loadExperiment = useCallback(
    async (options?: { force?: boolean }) => {
      const force = options?.force === true;
      if (!experimentId) {
        setExperiment(initialExperiment ?? null);
        setLoading(false);
        return;
      }
      if (!force && initialExperiment?.id === experimentId) {
        setExperiment(initialExperiment);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await ExperimentationService.getExperimentById(
          experimentId,
        );
        setExperiment(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load experiment";
        setError(message);
        setExperiment(null);
      } finally {
        setLoading(false);
      }
    },
    [experimentId, initialExperiment],
  );

  useEffect(() => {
    void loadExperiment();
  }, [loadExperiment]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadExperiment({ force: true });
    } finally {
      setRefreshing(false);
    }
  }, [loadExperiment]);

  const handleExportJson = useCallback(async () => {
    if (!experimentId) return;
    try {
      const blob = await ExperimentationService.exportExperimentResults(
        experimentId,
        "json",
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `experiment-${experimentId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, [experimentId]);

  const toggleResponse = (index: number) => {
    setExpandedResponses((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  type ExperimentResultsData = {
    prompt?: string;
    models?: Array<{ provider: string; model: string }>;
    evaluationCriteria?: string[];
    comparisonMode?: string;
    results?: Array<{
      model: string;
      provider: string;
      response?: string;
      bedrockOutput?: string;
      aiEvaluation?: {
        overallScore?: number;
        overall_score?: number;
        criteriaScores?: Record<string, number>;
        criteria_scores?: Record<string, number>;
        criterion_scores?: Record<string, number>;
        reasoning?: string;
        recommendation?: string;
      };
      actualCost?: number;
      executionTime?: number;
      costBreakdown?: {
        inputTokens: number;
        outputTokens: number;
        inputCost: number;
        outputCost: number;
        totalCost: number;
      };
    }>;
    analysis?: {
      winner?: { model: string; reason: string };
      costPerformanceAnalysis?: string;
      useCaseRecommendations?: string[];
    };
  } | null;

  const res: ExperimentResultsData =
    experiment?.results != null
      ? (experiment.results as ExperimentResultsData)
      : null;

  /** Compute best indices per metric for highlighting (higher is better for scores, lower for cost/latency) */
  const bestIndices = useMemo(() => {
    if (!res?.results?.length) return {};
    const results = res.results;
    const idx: Record<string, number | number[]> = {};

    // Overall score - higher is better
    const scores = results.map(
      (r) =>
        r.aiEvaluation?.overallScore ??
        r.aiEvaluation?.overall_score ??
        -1,
    );
    const maxScore = Math.max(...scores);
    if (maxScore >= 0) {
      idx.overallScore = scores.findIndex((s) => s === maxScore);
    }

    // Cost - lower is better
    const costs = results.map((r) => r.actualCost ?? Infinity);
    const minCost = Math.min(...costs);
    if (minCost < Infinity) {
      idx.actualCost = costs.findIndex((c) => c === minCost);
    }

    // Latency - lower is better
    const latencies = results.map((r) => r.executionTime ?? Infinity);
    const minLat = Math.min(...latencies);
    if (minLat < Infinity) {
      idx.executionTime = latencies.findIndex((l) => l === minLat);
    }

    // Per-criterion scores - higher is better
    const allCriteria = new Set<string>();
    results.forEach((r) => {
      const cs =
        r.aiEvaluation?.criteriaScores ??
        r.aiEvaluation?.criteria_scores ??
        r.aiEvaluation?.criterion_scores ??
        {};
      Object.keys(cs).forEach((k) => allCriteria.add(k));
    });
    allCriteria.forEach((criterion) => {
      const vals = results.map(
        (r) =>
          Number(
            (r.aiEvaluation?.criteriaScores ??
              r.aiEvaluation?.criteria_scores ??
              r.aiEvaluation?.criterion_scores)?.[criterion],
          ) || -1,
      );
      const max = Math.max(...vals);
      if (max >= 0) {
        idx[`criteria_${criterion}`] = vals.findIndex((v) => v === max);
      }
    });

    return idx;
  }, [res?.results]);

  if (!experimentId && !initialExperiment) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={undefined}
      maxWidth="6xl"
      showCloseButton={true}
      fullscreen
    >
      <div className="space-y-6 w-full min-w-0 max-w-full">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
            <span className="ml-3 text-sm text-secondary-600 dark:text-secondary-400">
              Loading experiment...
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-200">
            {error}
          </div>
        )}

        {!loading && !error && experiment && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-primary-200/30">
              <div>
                <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                  {experiment.name}
                </h2>
                <div className="flex flex-wrap gap-3 mt-2 text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      experiment.status === "completed"
                        ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400"
                        : experiment.status === "failed"
                          ? "bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400"
                          : "bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-400"
                    }`}
                  >
                    {experiment.status}
                  </span>
                  <span>{experiment.type?.replace("_", " ")}</span>
                  <span>{formatDate(experiment.startTime)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    void handleExportJson();
                  }}
                  disabled={!experimentId || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleRefresh();
                  }}
                  disabled={refreshing || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {res && (
              <>
                {/* Prompt - collapsible */}
                {res.prompt && (
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-display font-semibold text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400">
                      <FileText className="w-4 h-4 text-primary-500" />
                      Test Prompt
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 rounded-lg border border-primary-200/30 bg-light-bg-100 dark:bg-dark-bg-100 p-4">
                      <pre className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap font-sans">
                        {res.prompt}
                      </pre>
                    </div>
                  </details>
                )}

                {/* Winner banner - prominent */}
                {res.analysis?.winner && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-success-500/15 to-primary-500/10 border-2 border-success-300/50 dark:border-success-600/40">
                    <div className="flex-shrink-0 p-2 rounded-full bg-success-500/20">
                      <Trophy className="w-6 h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-display font-bold text-success-800 dark:text-success-200">
                        Winner: {res.analysis.winner.model}
                      </h3>
                      <p className="text-sm text-success-700 dark:text-success-300 mt-0.5">
                        {res.analysis.winner.reason}
                      </p>
                      {res.analysis.costPerformanceAnalysis && (
                        <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                          {res.analysis.costPerformanceAnalysis}
                        </p>
                      )}
                      {res.analysis.useCaseRecommendations &&
                        res.analysis.useCaseRecommendations.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-xs text-secondary-600 dark:text-secondary-400 space-y-0.5">
                            {res.analysis.useCaseRecommendations.map(
                              (rec, i) => (
                                <li key={i}>{rec}</li>
                              ),
                            )}
                          </ul>
                        )}
                    </div>
                  </div>
                )}

                {/* VS Comparison Grid */}
                {res.results && res.results.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-display font-bold text-secondary-900 dark:text-white">
                      <Zap className="w-4 h-4 text-primary-500" />
                      Side-by-Side Comparison
                    </h3>
                    <div className="overflow-x-auto -mx-1">
                      <table className="w-full min-w-[480px] border-collapse">
                        <thead>
                          <tr className="border-b-2 border-primary-300/50 dark:border-primary-600/40">
                            <th className="text-left py-3 px-3 text-xs font-display font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider w-36">
                              Metric
                            </th>
                            {res.results.map((r, idx) => (
                              <th
                                key={idx}
                                className="py-3 px-3 text-center text-xs font-display font-semibold text-secondary-900 dark:text-white"
                              >
                                {r.provider} / {r.model}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {/* Overall Score */}
                          <tr className="border-b border-primary-200/30 hover:bg-primary-50/30 dark:hover:bg-dark-bg-200/30">
                            <td className="py-2.5 px-3 font-medium text-secondary-700 dark:text-secondary-300">
                              Overall Score
                            </td>
                            {res.results.map((r, idx) => {
                              const score =
                                r.aiEvaluation?.overallScore ??
                                r.aiEvaluation?.overall_score ??
                                null;
                              const isBest =
                                bestIndices.overallScore === idx &&
                                score != null;
                              return (
                                <td
                                  key={idx}
                                  className={`py-2.5 px-3 text-center ${
                                    isBest
                                      ? "bg-success-100 dark:bg-success-900/30 font-bold text-success-700 dark:text-success-300"
                                      : "text-secondary-800 dark:text-secondary-200"
                                  }`}
                                >
                                  {score != null ? `${score}/100` : "—"}
                                  {isBest && (
                                    <span
                                      className="ml-1"
                                      title="Best"
                                      aria-hidden
                                    >
                                      ✓
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                          {/* Cost */}
                          <tr className="border-b border-primary-200/30 hover:bg-primary-50/30 dark:hover:bg-dark-bg-200/30">
                            <td className="py-2.5 px-3 font-medium text-secondary-700 dark:text-secondary-300">
                              Cost
                            </td>
                            {res.results.map((r, idx) => {
                              const cost = r.actualCost ?? null;
                              const isBest =
                                bestIndices.actualCost === idx && cost != null;
                              return (
                                <td
                                  key={idx}
                                  className={`py-2.5 px-3 text-center ${
                                    isBest
                                      ? "bg-success-100 dark:bg-success-900/30 font-bold text-success-700 dark:text-success-300"
                                      : "text-secondary-800 dark:text-secondary-200"
                                  }`}
                                >
                                  {cost != null
                                    ? `$${cost.toFixed(4)}`
                                    : "—"}
                                  {isBest && (
                                    <span
                                      className="ml-1"
                                      title="Lowest cost"
                                      aria-hidden
                                    >
                                      ✓
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                          {/* Latency */}
                          <tr className="border-b border-primary-200/30 hover:bg-primary-50/30 dark:hover:bg-dark-bg-200/30">
                            <td className="py-2.5 px-3 font-medium text-secondary-700 dark:text-secondary-300">
                              Latency
                            </td>
                            {res.results.map((r, idx) => {
                              const lat = r.executionTime ?? null;
                              const isBest =
                                bestIndices.executionTime === idx &&
                                lat != null;
                              return (
                                <td
                                  key={idx}
                                  className={`py-2.5 px-3 text-center ${
                                    isBest
                                      ? "bg-success-100 dark:bg-success-900/30 font-bold text-success-700 dark:text-success-300"
                                      : "text-secondary-800 dark:text-secondary-200"
                                  }`}
                                >
                                  {lat != null ? `${lat}ms` : "—"}
                                  {isBest && (
                                    <span
                                      className="ml-1"
                                      title="Fastest"
                                      aria-hidden
                                    >
                                      ✓
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                          {/* Per-criterion scores */}
                          {(() => {
                            const allCriteria = new Set<string>();
                            res.results.forEach((r) => {
                              const cs =
                                r.aiEvaluation?.criteriaScores ??
                                r.aiEvaluation?.criteria_scores ??
                                r.aiEvaluation?.criterion_scores ??
                                {};
                              Object.keys(cs).forEach((k) => allCriteria.add(k));
                            });
                            return Array.from(allCriteria).map((criterion) => (
                              <tr
                                key={criterion}
                                className="border-b border-primary-200/30 hover:bg-primary-50/30 dark:hover:bg-dark-bg-200/30"
                              >
                                <td className="py-2.5 px-3 font-medium text-secondary-700 dark:text-secondary-300 capitalize">
                                  {criterion.replace(/_/g, " ")}
                                </td>
                                {res.results!.map((r, idx) => {
                                  const cs =
                                    r.aiEvaluation?.criteriaScores ??
                                    r.aiEvaluation?.criteria_scores ??
                                    r.aiEvaluation?.criterion_scores ??
                                    {};
                                  const score = Number(cs[criterion]);
                                  const isBest =
                                    bestIndices[
                                      `criteria_${criterion}` as keyof typeof bestIndices
                                    ] === idx &&
                                    !Number.isNaN(score);
                                  return (
                                    <td
                                      key={idx}
                                      className={`py-2.5 px-3 text-center ${
                                        isBest
                                          ? "bg-success-100 dark:bg-success-900/30 font-bold text-success-700 dark:text-success-300"
                                          : "text-secondary-800 dark:text-secondary-200"
                                      }`}
                                    >
                                      {!Number.isNaN(score)
                                        ? `${score}%`
                                        : "—"}
                                      {isBest && (
                                        <span
                                          className="ml-1"
                                          title="Best"
                                          aria-hidden
                                        >
                                          ✓
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Model Responses - side-by-side cards */}
                    <div className="w-full min-w-0">
                      <h3 className="flex items-center gap-2 text-sm font-display font-semibold text-secondary-900 dark:text-white mb-3 mt-6">
                        <MessageSquare className="w-4 h-4 text-primary-500" />
                        Model Responses
                      </h3>
                      <div className="flex flex-col md:flex-row gap-4 w-full min-w-0">
                        {res.results.map((r, idx) => {
                          const responseText =
                            r.response ?? r.bedrockOutput ?? "";
                          const hasResponse = responseText.length > 0;
                          const isExpanded = expandedResponses.has(idx);
                          const criteriaScores =
                            r.aiEvaluation?.criteriaScores ??
                            r.aiEvaluation?.criteria_scores ??
                            r.aiEvaluation?.criterion_scores ??
                            {};

                          return (
                            <div
                              key={idx}
                              className="rounded-xl border border-primary-200/30 bg-light-bg-100 dark:bg-dark-bg-100 overflow-hidden flex flex-col min-w-0 flex-1 md:min-w-[280px]"
                            >
                              <div className="px-3 py-2.5 border-b border-primary-200/30 bg-primary-50/30 dark:bg-dark-bg-200/50">
                                <span className="font-display font-semibold text-secondary-900 dark:text-white text-sm">
                                  {r.provider} / {r.model}
                                </span>
                              </div>
                              <div className="p-3 flex-1 flex flex-col min-h-0">
                                {hasResponse ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => toggleResponse(idx)}
                                      className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline mb-2"
                                    >
                                      {isExpanded
                                        ? "Collapse response"
                                        : "View full response"}
                                      {isExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </button>
                                    {isExpanded ? (
                                      <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-[50vh] min-h-0 rounded-lg border border-primary-200/30 bg-white dark:bg-dark-bg-200 p-3 w-full">
                                        <FormattedModelResponse
                                          content={responseText}
                                          className="w-full min-w-0"
                                        />
                                      </div>
                                    ) : (
                                      <p className="text-xs text-secondary-500 line-clamp-3">
                                        {responseText.slice(0, 150)}
                                        {responseText.length > 150 ? "..." : ""}
                                      </p>
                                    )}
                                {Object.keys(criteriaScores).length > 0 &&
                                  isExpanded && (
                                    <div className="mt-3 pt-3 border-t border-primary-200/30 space-y-1">
                                      {Object.entries(criteriaScores).map(
                                        ([c, s]) => {
                                          const n = Number(s);
                                          return (
                                            <div
                                              key={c}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              <span className="capitalize w-20 truncate text-secondary-500">
                                                {c.replace(/_/g, " ")}
                                              </span>
                                              <div className="flex-1 h-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
                                                <div
                                                  className="h-full bg-primary-500 rounded-full"
                                                  style={{
                                                    width: `${Math.min(
                                                      100,
                                                      Math.max(0, n),
                                                    )}%`,
                                                  }}
                                                />
                                              </div>
                                              <span className="w-6 text-right font-medium">
                                                {n}%
                                              </span>
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  )}
                                {r.aiEvaluation?.recommendation &&
                                  isExpanded && (
                                    <p className="mt-2 text-xs text-primary-600 dark:text-primary-400 italic">
                                      {r.aiEvaluation.recommendation}
                                    </p>
                                  )}
                                  </>
                                ) : (
                                  <p className="text-xs text-secondary-500 italic">
                                    No response captured
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {!res.results?.length && (
                  <p className="text-sm text-secondary-500 italic">
                    No comparison results available.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
