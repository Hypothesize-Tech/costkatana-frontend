import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  BellAlertIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTopDecision, useDismissDecision } from "@/hooks/useDecisions";
import { Link } from "react-router-dom";

const STORAGE_KEY = "ck_nudge_dismissed_at";
const NUDGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default function DecisionNudge() {
  const { data } = useTopDecision();
  const dismissMutation = useDismissDecision();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const last = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (last && Date.now() - Number(last) < NUDGE_COOLDOWN_MS) {
      setHidden(true);
    }
  }, []);

  const decision = data?.decision;
  if (hidden || !decision || decision.urgency !== "now") return null;

  const onDismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setHidden(true);
    if (decision.dismissible) {
      dismissMutation.mutate({ id: decision.id, reason: "nudge_dismissed" });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[95vw] sm:w-96 animate-slide-in-right">
      <div className="glass rounded-2xl border border-danger-300/40 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 shadow-2xl p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-danger flex items-center justify-center shadow flex-shrink-0">
            <BellAlertIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-display font-semibold uppercase tracking-wider text-danger-600 dark:text-danger-300">
                Action needed now
              </span>
              <button
                onClick={onDismiss}
                aria-label="Dismiss nudge"
                className="text-light-text-muted dark:text-dark-text-muted hover:text-danger-500 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-display font-bold text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary leading-snug line-clamp-2">
              {decision.headline}
            </h4>
            {decision.narrative && (
              <p className="italic text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-2">
                {decision.narrative}
              </p>
            )}
            <Link
              to="/dashboard"
              onClick={onDismiss}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-primary text-white text-xs font-display font-semibold shadow hover:shadow-md transition-all"
            >
              Open decision
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
