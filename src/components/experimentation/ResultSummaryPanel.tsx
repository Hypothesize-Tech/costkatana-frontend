import React, { useMemo, useState } from "react";
import { Trophy, TrendingDown, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { ExperimentationService } from "../../services/experimentation.service";
import type { WhatIfScenario } from "../../services/experimentation.service";

/** Single model row from comparison (static or real-time) */
export interface SummaryResultRow {
  id?: string;
  model: string;
  provider: string;
  response?: string;
  bedrockOutput?: string;
  metrics?: {
    cost: number;
    latency: number;
    tokenCount: number;
    qualityScore: number;
    errorRate: number;
  };
  costBreakdown?: {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
  actualCost?: number;
  executionTime?: number;
  aiEvaluation?: {
    overall_score?: number;
    overallScore?: number;
    recommendation?: string;
  };
}

export interface ComparisonAnalysisShape {
  winner?: { model: string; reason: string };
  costPerformanceAnalysis?: string;
  useCaseRecommendations?: string[];
}

interface ResultSummaryPanelProps {
  results: SummaryResultRow[];
  comparisonAnalysis: ComparisonAnalysisShape | null;
  /** Initial monthly request estimate for Δ cost */
  initialMonthlyVolume?: number;
  experimentId?: string | null;
  onScenarioSaved?: () => void;
}

function getCost(r: SummaryResultRow): number {
  return (
    r.actualCost ??
    r.costBreakdown?.totalCost ??
    r.metrics?.cost ??
    0
  );
}

function getQuality(r: SummaryResultRow): number {
  const ai =
    r.aiEvaluation?.overall_score ?? r.aiEvaluation?.overallScore ?? null;
  if (ai != null && !Number.isNaN(ai)) return ai;
  return r.metrics?.qualityScore ?? 0;
}

export const ResultSummaryPanel: React.FC<ResultSummaryPanelProps> = ({
  results,
  comparisonAnalysis,
  initialMonthlyVolume = 1000,
  experimentId,
  onScenarioSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthlyVolume, setMonthlyVolume] = useState(initialMonthlyVolume);

  const summary = useMemo(() => {
    if (!results.length) return null;

    const withCost = results.map((r) => ({
      r,
      cost: getCost(r),
      quality: getQuality(r),
    }));

    const sortedByCost = [...withCost].sort((a, b) => a.cost - b.cost);
    const cheapest = sortedByCost[0];
    const priciest = sortedByCost[sortedByCost.length - 1];

    const winnerFromAnalysis = comparisonAnalysis?.winner?.model;
    const winnerRow =
      winnerFromAnalysis != null
        ? withCost.find((x) => x.r.model === winnerFromAnalysis) ?? cheapest
        : cheapest;

    const baselineCost = priciest?.cost ?? 0;
    const winnerCost = winnerRow?.cost ?? 0;
    const deltaPerRun = Math.max(0, baselineCost - winnerCost);
    const monthlyDelta = deltaPerRun * monthlyVolume;

    const maxQ = Math.max(...withCost.map((x) => x.quality), 1);
    const winnerQ = winnerRow?.quality ?? 0;
    const qualityParityPct = Math.round((winnerQ / maxQ) * 100);

    return {
      winnerLabel: `${winnerRow.r.provider} — ${winnerRow.r.model}`,
      winnerReason: comparisonAnalysis?.winner?.reason,
      baselineCost,
      winnerCost,
      monthlyDelta,
      qualityParityPct,
      expensiveLabel: `${priciest.r.provider} — ${priciest.r.model}`,
    };
  }, [results, comparisonAnalysis, monthlyVolume]);

  const handleSaveAsScenario = async () => {
    if (!summary) return;
    setSaving(true);
    setError(null);
    try {
      const expensive = results.reduce((acc, r) => {
        const c = getCost(r);
        return c > getCost(acc) ? r : acc;
      }, results[0]);
      const cheap = results.reduce((acc, r) => {
        const c = getCost(r);
        return c < getCost(acc) ? r : acc;
      }, results[0]);

      const scenario: Omit<WhatIfScenario, "id"> = {
        name: `Model switch: ${expensive.model} → ${cheap.model}`,
        description: `Saved from model comparison${experimentId ? ` (experiment ${experimentId})` : ""}. Estimated ~$${summary.monthlyDelta.toFixed(2)}/mo savings at ${monthlyVolume.toLocaleString()} req/mo.`,
        changes: [
          {
            type: "model_switch",
            currentValue: { provider: expensive.provider, model: expensive.model },
            proposedValue: { provider: cheap.provider, model: cheap.model },
            affectedMetrics: ["cost", "latency", "quality"],
            description: `Switch from ${expensive.model} to ${cheap.model} based on comparison run.`,
          },
        ],
        timeframe: "monthly",
        baselineData: {
          cost: summary.baselineCost * monthlyVolume,
          volume: monthlyVolume,
          performance: summary.qualityParityPct,
        },
      };

      await ExperimentationService.createWhatIfScenario(scenario);
      setSaved(true);
      onScenarioSaved?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save scenario");
    } finally {
      setSaving(false);
    }
  };

  if (!summary) return null;

  return (
    <div className="glass p-4 sm:p-5 rounded-xl border-2 border-success-400/40 bg-gradient-to-br from-success-500/10 to-primary-500/10 space-y-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <Trophy className="w-8 h-8 text-amber-500 flex-shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
            Result summary
          </h4>
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-300 mt-1">
            Recommended: {summary.winnerLabel}
          </p>
          {summary.winnerReason && (
            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2 leading-relaxed">
              {summary.winnerReason}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass rounded-lg p-3 border border-success-200/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-success-700 dark:text-success-300">
            <TrendingDown className="w-4 h-4" />
            Est. monthly Δ cost
          </div>
          <p className="text-xl font-bold text-success-600 dark:text-success-400 mt-1">
            ${summary.monthlyDelta.toFixed(2)}
          </p>
          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-1">
            vs {summary.expensiveLabel} at {monthlyVolume.toLocaleString()}{" "}
            requests/mo
          </p>
        </div>
        <div className="glass rounded-lg p-3 border border-primary-200/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 dark:text-primary-300">
            <Sparkles className="w-4 h-4" />
            Quality parity
          </div>
          <p className="text-xl font-bold gradient-text mt-1">
            {summary.qualityParityPct}%
          </p>
          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-1">
            Winner score vs best score in this run
          </p>
        </div>
        <div className="glass rounded-lg p-3 border border-secondary-200/30 flex flex-col justify-center">
          <label
            htmlFor="result-summary-volume"
            className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1"
          >
            Volume (req/mo)
          </label>
          <input
            id="result-summary-volume"
            type="number"
            min={1}
            step={100}
            value={monthlyVolume}
            onChange={(e) =>
              setMonthlyVolume(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            className="input text-sm mt-1"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSaveAsScenario}
          disabled={saving || saved}
          className="btn btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : null}
          {saved ? "Saved to What-If" : "Save as What-If scenario"}
        </button>
        {error && (
          <span className="text-xs text-danger-600 dark:text-danger-400">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultSummaryPanel;
