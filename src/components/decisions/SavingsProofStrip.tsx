import { SparklesIcon } from "@heroicons/react/24/outline";
import { useSavingsSummary } from "@/hooks/useDecisions";

export default function SavingsProofStrip() {
  const { data, isLoading } = useSavingsSummary(30);

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-3 border border-primary-200/30 animate-pulse">
        <div className="h-4 w-2/3 bg-primary-200/40 rounded" />
      </div>
    );
  }

  if (!data || data.totalSavingsUsd <= 0 || data.decisionsApplied <= 0) {
    return null;
  }

  const dateLabel = new Date(data.sinceDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="glass rounded-xl border border-success-200/30 bg-gradient-success/10 px-4 py-3 flex flex-wrap items-center gap-3 shadow-lg">
      <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow">
        <SparklesIcon className="w-4 h-4 text-white" />
      </div>
      <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
        We've saved you{" "}
        <span className="font-display font-bold text-success-600 dark:text-success-400">
          ${data.totalSavingsUsd.toFixed(2)}
        </span>{" "}
        since {dateLabel} across{" "}
        <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
          {data.decisionsApplied}
        </span>{" "}
        {data.decisionsApplied === 1 ? "decision" : "decisions"}.
      </p>
    </div>
  );
}
