export type UrgencyLevel =
  | "now"
  | "this_week"
  | "this_month"
  | "informational";

export type DecisionState =
  | "action_required"
  | "monitoring"
  | "already_optimized"
  | "dismissed"
  | "not_applicable";

export type TriggerReason =
  | "cost_spike"
  | "budget_pacing"
  | "new_team_activity"
  | "model_overspend"
  | "caching_opportunity"
  | "compression_opportunity"
  | "summarization_opportunity"
  | "batch_opportunity"
  | "static_threshold"
  | "periodic_review";

export type ImpactTimeframe = "per_day" | "per_week" | "per_month";

export type ActionKind = "apply" | "review" | "configure" | "acknowledge";

export interface DecisionTrigger {
  reason: TriggerReason;
  detectedAt: string;
  evidence: Record<string, unknown>;
}

export interface DecisionImpact {
  amountUsd: number;
  timeframe: ImpactTimeframe;
  confidence: number;
}

export interface DecisionAction {
  label: string;
  kind: ActionKind;
  endpoint?: string;
  payload?: unknown;
}

export interface DecisionAttribution {
  team?: string;
  project?: string;
  endpoint?: string;
  model?: string;
  provider?: string;
}

export interface DecisionProof {
  appliedAt?: string;
  baselineCostUsd?: number;
  actualSavingsUsd?: number;
  observationWindowDays?: number;
}

export interface DecisionContext {
  id: string;
  userId: string;
  urgency: UrgencyLevel;
  state: DecisionState;
  trigger: DecisionTrigger;
  headline: string;
  narrative: string;
  impact: DecisionImpact;
  suggestedAction: DecisionAction;
  dismissible: boolean;
  source: {
    kind:
      | "proactive_suggestion"
      | "recommendation_engine"
      | "ai_insight"
      | "budget"
      | "cost_change_explainer"
      | "optimization";
    refId: string;
  };
  createdAt: string;
  expiresAt?: string;
  attribution?: DecisionAttribution;
  proof?: DecisionProof;
  score?: number;
  /** LLM-produced quantitative basis for the recommendation. */
  reasoning?: string;
}

export interface SavingsSummary {
  sinceDate: string;
  totalSavingsUsd: number;
  decisionsApplied: number;
  topCategory?: TriggerReason;
}

export interface DecisionListFilters {
  urgency?: UrgencyLevel;
  state?: DecisionState;
  team?: string;
  limit?: number;
}
