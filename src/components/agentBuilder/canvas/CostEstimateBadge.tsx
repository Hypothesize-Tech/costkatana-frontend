import React, { useMemo } from 'react';
import { useAgentBuilderStore } from '../../../stores/agentBuilderStore';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

const PER_MILLION_USD: Record<string, { in: number; out: number }> = {
  'anthropic.claude-3-5-sonnet-20241022-v2:0': { in: 3, out: 15 },
  'anthropic.claude-3-5-sonnet-20240620-v1:0': { in: 3, out: 15 },
  'anthropic.claude-sonnet-4-20250514-v1:0': { in: 3, out: 15 },
  'anthropic.claude-3-5-haiku-20241022-v1:0': { in: 0.8, out: 4 },
  'haiku-3.5': { in: 0.8, out: 4 },
};

/**
 * Heuristic per-run cost preview. Caveat: real cost depends on input length;
 * we assume ~1k in / 400 out per LLM node — close enough for a glanceable
 * estimate. The trace view shows the real number.
 */
function estimateRunCost(nodes: { type: string; data: { config: Record<string, unknown> } }[]): {
  usd: number;
  tokensIn: number;
  tokensOut: number;
  llmCount: number;
} {
  let usd = 0;
  let tokensIn = 0;
  let tokensOut = 0;
  let llmCount = 0;

  for (const node of nodes) {
    if (node.type === 'llm-call') {
      const cfg = node.data.config as { model?: string; maxTokens?: number };
      const model = cfg?.model ?? 'anthropic.claude-3-5-sonnet-20241022-v2:0';
      const pricing = PER_MILLION_USD[model] ?? PER_MILLION_USD['anthropic.claude-3-5-sonnet-20241022-v2:0'];
      const inT = 1000;
      const outT = Math.min(cfg?.maxTokens ?? 400, 800);
      usd += (inT * pricing.in) / 1_000_000 + (outT * pricing.out) / 1_000_000;
      tokensIn += inT;
      tokensOut += outT;
      llmCount += 1;
    } else if (node.type === 'embedder') {
      tokensIn += 500;
      usd += 0.00005;
    } else if (node.type === 'vector-store-bedrock-kb') {
      tokensIn += 200;
      usd += 0.0002;
    }
  }

  return { usd, tokensIn, tokensOut, llmCount };
}

const CostEstimateBadge: React.FC = () => {
  const nodes = useAgentBuilderStore((s) => s.nodes);
  const estimate = useMemo(() => estimateRunCost(nodes), [nodes]);
  const tokenLoad = Math.min(
    1,
    (estimate.tokensIn + estimate.tokensOut) / 6000,
  );

  return (
    <div className="absolute bottom-5 right-5 z-10 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel min-w-[200px]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-secondary-500 dark:text-secondary-400 mb-1.5">
        <CurrencyDollarIcon className="w-3 h-3" />
        Est. run cost
      </div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="font-display text-2xl font-bold text-secondary-900 dark:text-secondary-50">
          ${estimate.usd.toFixed(4)}
        </span>
        <span className="text-[10px] text-secondary-500 dark:text-secondary-400">/ run</span>
      </div>
      <div className="text-[10px] text-secondary-600 dark:text-secondary-300 mb-2">
        ~{(estimate.tokensIn + estimate.tokensOut).toLocaleString()} tok ·{' '}
        {estimate.llmCount} LLM node{estimate.llmCount === 1 ? '' : 's'}
      </div>
      <div className="h-1.5 rounded bg-secondary-200 dark:bg-secondary-700 overflow-hidden">
        <div
          className="h-full rounded bg-gradient-to-r from-[#06ec9e] to-emerald-500 transition-all duration-500"
          style={{ width: `${Math.max(6, tokenLoad * 100)}%` }}
        />
      </div>
    </div>
  );
};

export default CostEstimateBadge;
