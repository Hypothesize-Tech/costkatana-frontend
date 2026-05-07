import { useEffect, useState } from "react";
import {
  ChartBarIcon,
  HandThumbUpIcon,
  ArrowTrendingDownIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MetricTrendChart } from "@/components/dashboard/MetricTrendChart";
import {
  EvalsService,
  type EvalsDashboardData,
} from "@/services/evals.service";

const METRIC_LABELS: Record<string, string> = {
  contextRelevance: "Context relevance",
  answerFaithfulness: "Faithfulness",
  answerRelevance: "Answer relevance",
  retrievalPrecision: "Retrieval precision",
};

const EvalsDashboard: React.FC = () => {
  const [data, setData] = useState<EvalsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    EvalsService.getDashboard()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = data?.summary;
  const weakestLabel = summary?.weakestMetric
    ? METRIC_LABELS[summary.weakestMetric] ?? summary.weakestMetric
    : "—";

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display gradient-text-primary">
          Evals dashboard
        </h1>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
          RAGAS quality metrics joined with thumbs feedback. Updates every minute.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-danger-300/40 dark:border-danger-500/30 bg-danger-50/50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Avg overall RAGAS"
          value={summary ? Math.round(summary.averageOverall * 1000) / 10 : 0}
          icon={ChartBarIcon}
          format="percentage"
          loading={loading}
        />
        <StatsCard
          title="Positive feedback"
          value={summary ? Math.round(summary.positiveRatio * 1000) / 10 : 0}
          icon={HandThumbUpIcon}
          format="percentage"
          loading={loading}
        />
        <StatsCard
          title="Evaluated requests"
          value={summary?.totalEvaluated ?? 0}
          icon={ClipboardDocumentCheckIcon}
          format="number"
          loading={loading}
        />
        <StatsCard
          title="Weakest metric"
          value={0}
          icon={ArrowTrendingDownIcon}
          format="number"
          loading={loading}
          className="relative"
        />
      </div>

      {!loading && summary && (
        <div className="-mt-2 text-xs text-secondary-600 dark:text-secondary-300 px-2">
          Weakest metric: <span className="font-semibold">{weakestLabel}</span>
          {summary.positiveCount + summary.negativeCount > 0 && (
            <>
              {" · "}feedback {summary.positiveCount}↑ / {summary.negativeCount}↓
            </>
          )}
        </div>
      )}

      <MetricTrendChart data={data?.timeline ?? []} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Table
          title="By model"
          loading={loading}
          rows={(data?.byModel ?? []).map((row) => ({
            key: row.modelName,
            cells: [
              row.modelName,
              row.count.toString(),
              `${(row.averageOverall * 100).toFixed(1)}%`,
            ],
          }))}
          headers={["Model", "Calls", "Avg overall"]}
        />
        <Table
          title="By prompt version"
          loading={loading}
          rows={(data?.byPromptVersion ?? []).map((row) => ({
            key: `${row.promptTemplateId ?? "—"}:${row.promptVersionId ?? "—"}`,
            cells: [
              row.promptTemplateId
                ? `${row.promptTemplateId.slice(0, 6)}…`
                : "—",
              row.promptVersionId
                ? `${row.promptVersionId.slice(0, 6)}…`
                : "—",
              row.count.toString(),
              `${(row.averageOverall * 100).toFixed(1)}%`,
            ],
          }))}
          headers={["Template", "Version", "Calls", "Avg overall"]}
        />
      </div>
    </div>
  );
};

interface TableProps {
  title: string;
  headers: string[];
  rows: Array<{ key: string; cells: string[] }>;
  loading?: boolean;
}

const Table: React.FC<TableProps> = ({ title, headers, rows, loading }) => (
  <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
    <div className="px-6 py-4 border-b border-primary-200/30 dark:border-primary-500/20">
      <h3 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
        {title}
      </h3>
    </div>
    {loading ? (
      <div className="p-6">
        <div className="skeleton h-32 rounded-lg" />
      </div>
    ) : rows.length === 0 ? (
      <div className="p-6 text-sm text-secondary-500 dark:text-secondary-400">
        No data yet.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
              {headers.map((h) => (
                <th key={h} className="px-6 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-t border-primary-200/20 dark:border-primary-500/10"
              >
                {row.cells.map((c, i) => (
                  <td
                    key={i}
                    className="px-6 py-3 text-secondary-800 dark:text-secondary-200"
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default EvalsDashboard;
