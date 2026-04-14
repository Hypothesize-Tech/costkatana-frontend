import { useMemo, useState } from "react";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EyeIcon,
  LightBulbIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type {
  ActionKind,
  DecisionContext,
  TriggerReason,
  UrgencyLevel,
} from "@/types/decision.types";
import {
  useApplyDecision,
  useDismissDecision,
  useSnoozeDecision,
} from "@/hooks/useDecisions";

interface DecisionCardProps {
  decision: DecisionContext;
  variant?: "hero" | "queue";
  onDetails?: (decision: DecisionContext) => void;
}

function urgencyLabel(u: UrgencyLevel): string {
  switch (u) {
    case "now":
      return "Now";
    case "this_week":
      return "This week";
    case "this_month":
      return "This month";
    default:
      return "FYI";
  }
}

function urgencyClasses(u: UrgencyLevel): string {
  switch (u) {
    case "now":
      return "bg-danger-500/15 text-danger-600 dark:text-danger-300 border-danger-300/40";
    case "this_week":
      return "bg-warning-500/15 text-warning-600 dark:text-warning-300 border-warning-300/40";
    case "this_month":
      return "bg-primary-500/15 text-primary-600 dark:text-primary-300 border-primary-300/40";
    default:
      return "bg-neutral-500/15 text-light-text-secondary dark:text-dark-text-secondary border-neutral-300/30";
  }
}

function timeframeSuffix(tf: string): string {
  if (tf === "per_day") return "/day";
  if (tf === "per_week") return "/week";
  return "/month";
}

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 100 ? 0 : 2,
  });
}

function reasonLabel(r: TriggerReason): string {
  switch (r) {
    case "cost_spike":
      return "Cost spike";
    case "budget_pacing":
      return "Budget pace";
    case "new_team_activity":
      return "New team activity";
    case "model_overspend":
      return "Model overspend";
    case "caching_opportunity":
      return "Caching opportunity";
    case "compression_opportunity":
      return "Compression opportunity";
    case "summarization_opportunity":
      return "Summarization opportunity";
    case "batch_opportunity":
      return "Batch opportunity";
    case "static_threshold":
      return "Threshold alert";
    default:
      return "Periodic review";
  }
}

function actionIcon(kind: ActionKind) {
  if (kind === "configure") return Cog6ToothIcon;
  if (kind === "review") return EyeIcon;
  if (kind === "acknowledge") return BoltIcon;
  return ArrowRightIcon;
}

function actionClasses(kind: ActionKind): string {
  // Different kinds deserve different visual weight:
  // apply is the strong primary action, review is lighter, configure is neutral.
  if (kind === "apply") {
    return "bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl";
  }
  if (kind === "configure") {
    return "bg-gradient-to-r from-accent-500 to-accent-600 hover:opacity-90 text-white shadow-md";
  }
  if (kind === "review") {
    return "glass border border-primary-200/40 text-primary-700 dark:text-primary-300 hover:bg-primary-500/10";
  }
  // acknowledge
  return "glass border border-primary-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-500/5";
}

export default function DecisionCard({
  decision,
  variant = "hero",
  onDetails,
}: DecisionCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const applyMutation = useApplyDecision();
  const dismissMutation = useDismissDecision();
  const snoozeMutation = useSnoozeDecision();

  const confidenceDot = useMemo(() => {
    if (decision.impact.confidence >= 0.8) return "bg-success-500";
    if (decision.impact.confidence >= 0.5) return "bg-warning-500";
    return "bg-neutral-400";
  }, [decision.impact.confidence]);

  if (dismissed) return null;

  const isHero = variant === "hero";

  const handlePrimary = () => {
    const kind = decision.suggestedAction.kind;
    const endpoint = decision.suggestedAction.endpoint;
    const isInternalPath = endpoint && !endpoint.startsWith("/api/");

    if (kind === "review") {
      // User is just going to look. Don't mark it applied — that would be
      // dishonest. Just navigate. The item stays in the queue until they
      // actually act on it.
      if (isInternalPath) window.location.assign(endpoint!);
      return;
    }

    if (kind === "acknowledge") {
      // Acknowledgement == "I've seen this, drop it." Use dismiss so it
      // doesn't land in the applied-savings tally.
      setDismissed(true);
      dismissMutation.mutate({ id: decision.id, reason: "acknowledged" });
      return;
    }

    if (kind === "configure") {
      // Configure flow: record the intent (applied=user agreed), then
      // navigate to the settings page that actually toggles the feature.
      applyMutation.mutate(decision.id, {
        onSettled: () => {
          if (isInternalPath) window.location.assign(endpoint!);
        },
      });
      return;
    }

    // kind === "apply"
    applyMutation.mutate(decision.id);
  };
  const handleDismiss = () => {
    setDismissed(true);
    dismissMutation.mutate({ id: decision.id });
  };
  const handleSnooze = () => {
    setDismissed(true);
    snoozeMutation.mutate({ id: decision.id });
  };

  // Trust the AI-generated label (already <= 30 chars, imperative, grounded
  // in the real data). Fall back only when the model returned nothing.
  const defaultLabelByKind: Record<string, string> = {
    apply: "Apply",
    review: "Review",
    configure: "Configure",
    acknowledge: "Got it",
  };
  const fallbackLabel =
    defaultLabelByKind[decision.suggestedAction.kind] ?? "Open";
  const primaryLabel = applyMutation.isLoading
    ? "Working…"
    : decision.suggestedAction.label || fallbackLabel;

  return (
    <div
      className={`glass backdrop-blur-xl rounded-2xl border shadow-xl bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 border-primary-200/30 hover:shadow-2xl transition-all duration-300 ${
        isHero ? "p-5 sm:p-6 md:p-7" : "p-4 sm:p-5"
      }`}
      data-decision-id={decision.id}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-display font-semibold tracking-wide ${urgencyClasses(
            decision.urgency,
          )}`}
        >
          <ClockIcon className="w-3.5 h-3.5" />
          {urgencyLabel(decision.urgency)}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/10 text-primary-700 dark:text-primary-300 text-[11px] sm:text-xs font-display font-medium border border-primary-200/30">
          <SparklesIcon className="w-3 h-3" />
          {reasonLabel(decision.trigger.reason)}
        </span>
        {decision.attribution?.model && (
          <span className="px-2 py-1 rounded-lg bg-neutral-500/10 text-light-text-secondary dark:text-dark-text-secondary text-[11px] sm:text-xs font-display font-medium border border-neutral-300/30 truncate max-w-[14rem]">
            {decision.attribution.model}
          </span>
        )}
        <span
          className={`ml-auto inline-flex items-center gap-1.5 text-[11px] font-body text-light-text-muted dark:text-dark-text-muted`}
        >
          <span className={`w-2 h-2 rounded-full ${confidenceDot}`} />
          {Math.round(decision.impact.confidence * 100)}% confidence
        </span>
      </div>

      <h3
        className={`font-display font-bold gradient-text-primary leading-tight ${
          isHero ? "text-lg sm:text-xl md:text-2xl" : "text-base sm:text-lg"
        }`}
      >
        {decision.headline}
      </h3>

      {decision.narrative && (
        <p
          className={`italic font-body text-light-text-secondary dark:text-dark-text-secondary mt-2 leading-relaxed ${
            isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm"
          }`}
        >
          {decision.narrative}
        </p>
      )}

      {decision.reasoning && isHero && (
        <div className="mt-2 flex items-start gap-1.5 text-[11px] sm:text-xs font-body text-light-text-muted dark:text-dark-text-muted">
          <LightBulbIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary-500/70" />
          <span>
            <span className="font-display font-semibold text-primary-600 dark:text-primary-400 mr-1">
              Why:
            </span>
            {decision.reasoning}
          </span>
        </div>
      )}

      {decision.state !== "monitoring" && (
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="inline-flex items-center gap-2 glass px-3 py-2 rounded-xl border border-success-200/30 bg-gradient-success/10">
            <CurrencyDollarIcon className="w-4 h-4 text-success-600 dark:text-success-400" />
            <span
              className={`font-display font-bold text-success-600 dark:text-success-400 ${
                isHero ? "text-lg sm:text-xl" : "text-base"
              }`}
            >
              {formatUsd(decision.impact.amountUsd)}
              {timeframeSuffix(decision.impact.timeframe)}
            </span>
          </div>
        </div>
      )}

      {decision.state === "monitoring" ? (
        // Already applied — replace action buttons with an "in progress"
        // proof state. Realized savings get reconciled by the daily cron.
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-success/15 border border-success-300/40">
            <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
            <span className="font-display font-semibold text-sm text-success-700 dark:text-success-300">
              Applied
              {decision.proof?.appliedAt &&
                ` · ${new Date(decision.proof.appliedAt).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}`}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
            <ArrowPathIcon className="w-4 h-4 text-primary-500 animate-[spin_4s_linear_infinite]" />
            {decision.proof?.actualSavingsUsd !== undefined
              ? `Tracking — ${formatUsd(
                  decision.proof.actualSavingsUsd,
                )} saved so far`
              : "Tracking impact — realized savings update daily."}
          </div>
          {onDetails && (
            <button
              onClick={() => onDetails(decision)}
              className="sm:ml-auto px-3 py-2 rounded-xl glass border border-primary-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 transition-all duration-300 flex items-center gap-2 text-sm font-display"
            >
              <EyeIcon className="w-4 h-4" />
              Details
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-5">
          {(() => {
            const Icon = actionIcon(decision.suggestedAction.kind);
            return (
              <button
                onClick={handlePrimary}
                disabled={applyMutation.isLoading}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-display font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed ${actionClasses(
                  decision.suggestedAction.kind,
                )}`}
              >
                {primaryLabel}
                <Icon className="w-4 h-4" />
              </button>
            );
          })()}
          {onDetails && (
            <button
              onClick={() => onDetails(decision)}
              className="px-3 py-2.5 rounded-xl glass border border-primary-200/30 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-300 flex items-center gap-2 text-sm font-display"
            >
              <EyeIcon className="w-4 h-4" />
              Details
            </button>
          )}
          {decision.dismissible && (
            <>
              <button
                onClick={handleSnooze}
                disabled={snoozeMutation.isLoading}
                className="px-3 py-2.5 rounded-xl glass border border-primary-200/30 text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 transition-all duration-300 text-sm font-display"
              >
                Snooze 7d
              </button>
              <button
                onClick={handleDismiss}
                disabled={dismissMutation.isLoading}
                aria-label="Dismiss"
                className="p-2.5 rounded-xl glass border border-primary-200/30 text-light-text-muted dark:text-dark-text-muted hover:text-danger-500 hover:bg-danger-500/10 transition-all duration-300"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
