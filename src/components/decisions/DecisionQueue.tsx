import { useDecisionQueue } from "@/hooks/useDecisions";
import DecisionCard from "./DecisionCard";

interface DecisionQueueProps {
  limit?: number;
  skipTop?: boolean;
}

export default function DecisionQueue({
  limit = 3,
  skipTop = true,
}: DecisionQueueProps) {
  const { data, isLoading } = useDecisionQueue({
    state: "action_required",
    limit: limit + (skipTop ? 1 : 0),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="glass rounded-xl p-4 border border-primary-200/30 animate-pulse"
          >
            <div className="h-3 w-20 bg-primary-200/40 rounded mb-3" />
            <div className="h-5 w-3/4 bg-primary-200/40 rounded mb-2" />
            <div className="h-3 w-full bg-primary-200/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const decisions = (data ?? []).slice(skipTop ? 1 : 0, skipTop ? 1 + limit : limit);
  if (decisions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm sm:text-base font-semibold text-light-text-secondary dark:text-dark-text-secondary tracking-wide">
          Next up
        </h3>
        <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
          {decisions.length} more {decisions.length === 1 ? "decision" : "decisions"}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {decisions.map((d) => (
          <DecisionCard key={d.id} decision={d} variant="queue" />
        ))}
      </div>
    </div>
  );
}
