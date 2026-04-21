import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { SourceChips, SourceChipItem } from './SourceChips';

export interface ToolCallCardData {
  id: string;
  name: string;
  input?: unknown;
  output?: { content: string; sources?: SourceChipItem[] };
  status?: 'running' | 'success' | 'error';
  durationMs?: number;
}

interface Props {
  call: ToolCallCardData;
}

const ToolIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  if (name === 'web_search') {
    return <MagnifyingGlassIcon className={className} />;
  }
  return <WrenchScrewdriverIcon className={className} />;
};

const StatusDot: React.FC<{ status?: ToolCallCardData['status'] }> = ({ status }) => {
  if (status === 'success') {
    return <CheckCircleIcon className="w-4 h-4 text-success-600 dark:text-success-400" />;
  }
  if (status === 'error') {
    return <ExclamationCircleIcon className="w-4 h-4 text-red-500" />;
  }
  return (
    <span className="inline-flex w-2 h-2 rounded-full bg-primary-500 animate-pulse flex-shrink-0" />
  );
};

const formatInputSummary = (name: string, input: unknown): string => {
  if (!input || typeof input !== 'object') return '';
  const obj = input as Record<string, unknown>;
  if (name === 'web_search' && typeof obj.query === 'string') {
    return obj.query;
  }
  // Generic fallback: first scalar value.
  const firstScalar = Object.values(obj).find(
    (v) => typeof v === 'string' || typeof v === 'number',
  );
  return firstScalar != null ? String(firstScalar) : '';
};

/**
 * Compact inline card representing a single tool invocation. Mirrors the
 * styling of Claude.ai / Perplexity tool chips — quiet palette, status dot,
 * click-to-expand for input JSON / full output / source chips.
 */
export const ToolCallCard: React.FC<Props> = ({ call }) => {
  const [expanded, setExpanded] = useState(false);
  const summary = formatInputSummary(call.name, call.input);
  const running = call.status === 'running' || !call.status;

  return (
    <div className="rounded-lg border border-secondary-200/60 dark:border-secondary-700/60 bg-white/30 dark:bg-dark-card/30 text-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary-50/60 dark:hover:bg-secondary-800/40 rounded-lg transition-colors"
      >
        <ToolIcon
          name={call.name}
          className="w-4 h-4 text-secondary-500 dark:text-secondary-400 flex-shrink-0"
        />
        <span className="font-medium text-secondary-800 dark:text-secondary-200 flex-shrink-0">
          {call.name === 'web_search' ? 'Searching the web' : call.name}
        </span>
        {summary && (
          <span className="text-secondary-500 dark:text-secondary-400 truncate flex-1 text-left">
            · {summary}
          </span>
        )}
        {!summary && <span className="flex-1" />}
        {typeof call.durationMs === 'number' && call.status !== 'running' && (
          <span className="text-[11px] text-secondary-400 dark:text-secondary-500">
            {(call.durationMs / 1000).toFixed(1)}s
          </span>
        )}
        <StatusDot status={call.status} />
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-secondary-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-secondary-200/50 dark:border-secondary-700/50 space-y-2">
          {Boolean(call.input) && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">
                Input
              </div>
              <pre className="font-mono text-[12px] text-secondary-700 dark:text-secondary-300 bg-secondary-50/50 dark:bg-secondary-900/30 rounded px-2 py-1 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(call.input, null, 2)}
              </pre>
            </div>
          )}
          {running && (
            <div className="text-[12px] text-secondary-500 italic">Running…</div>
          )}
          {call.output?.content && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">
                Output
              </div>
              <div className="text-[12px] text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-wrap">
                {call.output.content.length > 600
                  ? call.output.content.slice(0, 600) + '…'
                  : call.output.content}
              </div>
            </div>
          )}
          {call.output?.sources && call.output.sources.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">
                Sources
              </div>
              <SourceChips sources={call.output.sources} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCallCard;
