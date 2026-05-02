import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { subscribeToRun } from '../../services/agentPlatform.service';
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PauseCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

type StepStatus = 'running' | 'succeeded' | 'failed' | 'paused';

interface TraceStep {
  nodeId: string;
  nodeType: string;
  status: StepStatus;
  startedAt: number;
  endedAt?: number;
  output?: unknown;
  costUsd?: number;
  tokens?: { in: number; out: number };
}

interface TraceState {
  steps: TraceStep[];
  status: 'running' | 'paused' | 'succeeded' | 'failed';
  output?: unknown;
  error?: { message: string };
  pauseInfo?: { nodeId: string; reason?: string; payload?: unknown };
  totalCost: number;
  totalTokens: { in: number; out: number };
}

const STATUS_BADGE: Record<
  StepStatus,
  { ring: string; bg: string; text: string }
> = {
  running:    { ring: 'border-highlight-400 dark:border-highlight-500', bg: 'bg-highlight-50/50 dark:bg-highlight-900/30', text: 'text-highlight-600 dark:text-highlight-400' },
  succeeded:  { ring: 'border-primary-500',                              bg: 'bg-primary-50/60 dark:bg-primary-900/30',     text: 'text-primary-600 dark:text-primary-400' },
  failed:     { ring: 'border-danger-500',                               bg: 'bg-danger-50/60 dark:bg-danger-900/30',       text: 'text-danger-600 dark:text-danger-400' },
  paused:     { ring: 'border-accent-500',                               bg: 'bg-accent-50/60 dark:bg-accent-900/30',       text: 'text-accent-600 dark:text-accent-400' },
};

const Trace: React.FC = () => {
  const { agentId, runId } = useParams<{ agentId: string; runId: string }>();
  const navigate = useNavigate();
  const [trace, setTrace] = useState<TraceState>({
    steps: [],
    status: 'running',
    totalCost: 0,
    totalTokens: { in: 0, out: 0 },
  });

  useEffect(() => {
    if (!runId) return;
    const unsubscribe = subscribeToRun(runId, {
      'step.start': (data) => {
        setTrace((s) => ({
          ...s,
          steps: [
            ...s.steps,
            {
              nodeId: (data as any).nodeId,
              nodeType: (data as any).nodeType,
              status: 'running',
              startedAt: Date.now(),
            },
          ],
        }));
      },
      'step.end': (data) => {
        const d = data as any;
        setTrace((s) => ({
          ...s,
          steps: s.steps.map((step) =>
            step.nodeId === d.nodeId && step.status === 'running'
              ? {
                  ...step,
                  status: 'succeeded',
                  endedAt: Date.now(),
                  output: d.output,
                  costUsd: d.costUsd,
                  tokens: d.tokens,
                }
              : step,
          ),
          totalCost: s.totalCost + (d.costUsd ?? 0),
          totalTokens: {
            in: s.totalTokens.in + (d.tokens?.in ?? 0),
            out: s.totalTokens.out + (d.tokens?.out ?? 0),
          },
        }));
      },
      paused: (data) => {
        const d = data as any;
        setTrace((s) => ({
          ...s,
          status: 'paused',
          pauseInfo: { nodeId: d.nodeId, reason: d.reason, payload: d.payload },
          steps: s.steps.map((step) =>
            step.nodeId === d.nodeId
              ? { ...step, status: 'paused', endedAt: Date.now() }
              : step,
          ),
        }));
      },
      'run.end': (data) => {
        setTrace((s) => ({
          ...s,
          status: 'succeeded',
          output: (data as any).output,
        }));
      },
      'run.error': (data) => {
        const d = data as any;
        setTrace((s) => ({
          ...s,
          status: 'failed',
          error: d.error,
          steps: d.nodeId
            ? s.steps.map((step) =>
                step.nodeId === d.nodeId
                  ? { ...step, status: 'failed', endedAt: Date.now() }
                  : step,
              )
            : s.steps,
        }));
      },
    });
    return unsubscribe;
  }, [runId]);

  useEffect(() => {
    if (trace.status === 'paused' && agentId && runId) {
      const t = setTimeout(
        () => navigate(`/agent-builder/${agentId}/runs/${runId}/checkpoint`),
        700,
      );
      return () => clearTimeout(t);
    }
  }, [trace.status, agentId, runId, navigate]);

  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);
  useEffect(() => {
    if (trace.steps.length > 0 && selectedStepIdx >= trace.steps.length) {
      setSelectedStepIdx(trace.steps.length - 1);
    }
  }, [trace.steps.length, selectedStepIdx]);

  const selectedStep = trace.steps[selectedStepIdx];

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-light-bg-100 dark:bg-dark-bg-300">
      {/* Timeline */}
      <aside className="w-[320px] flex-shrink-0 bg-white dark:bg-dark-bg-100 border-r border-primary-200/30 dark:border-primary-500/20 overflow-y-auto p-4">
        <button
          type="button"
          onClick={() => navigate(`/agent-builder/${agentId}`)}
          className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-50 inline-flex items-center gap-1 mb-3"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to canvas
        </button>
        <div className="font-display text-base font-semibold text-secondary-900 dark:text-secondary-50">
          Trace replay
        </div>
        <div className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-3">
          RUN · {runId?.substring(runId.length - 8)}
        </div>
        <RunSummary trace={trace} />
        <div className="mt-4 space-y-1.5">
          {trace.steps.map((step, i) => {
            const badge = STATUS_BADGE[step.status];
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedStepIdx(i)}
                className={`w-full text-left p-3 rounded-lg border transition-colors flex gap-3 ${
                  selectedStepIdx === i
                    ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/20'
                    : 'border-transparent hover:border-primary-200/40 dark:hover:border-primary-500/20 hover:bg-light-bg-100/40 dark:hover:bg-dark-bg-200/40'
                }`}
              >
                <div className="flex flex-col items-center pt-0.5">
                  <span className={`w-3 h-3 rounded-full border-2 ${badge.ring} ${badge.bg}`} />
                  {i < trace.steps.length - 1 && (
                    <span
                      className="w-px flex-1 bg-primary-200/40 dark:bg-primary-500/20 my-1"
                      style={{ minHeight: 18 }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-secondary-900 dark:text-secondary-50 capitalize truncate">
                    {step.nodeType.replace(/-/g, ' ')}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-secondary-500 dark:text-secondary-400 mt-0.5">
                    <StepStatusChip status={step.status} />
                    {step.endedAt && <span>{step.endedAt - step.startedAt}ms</span>}
                    {step.costUsd !== undefined && step.costUsd > 0 && (
                      <span>${step.costUsd.toFixed(4)}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {trace.steps.length === 0 && (
            <div className="text-xs text-secondary-500 dark:text-secondary-400 text-center py-12">
              <ArrowPathIcon className="w-4 h-4 animate-spin mx-auto mb-2 text-primary-500" />
              Waiting for first step…
            </div>
          )}
        </div>
      </aside>

      {/* Detail */}
      <section className="flex-1 overflow-y-auto p-6 md:p-8">
        {selectedStep ? (
          <StepDetail step={selectedStep} index={selectedStepIdx} />
        ) : (
          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            Pick a step to inspect.
          </div>
        )}
      </section>
    </div>
  );
};

const RunSummary: React.FC<{ trace: TraceState }> = ({ trace }) => {
  const meta = (() => {
    if (trace.status === 'running') return { cls: 'text-highlight-600 dark:text-highlight-400', label: 'Running…' };
    if (trace.status === 'paused')  return { cls: 'text-accent-600 dark:text-accent-400',       label: 'Paused at checkpoint' };
    if (trace.status === 'failed')  return { cls: 'text-danger-600 dark:text-danger-400',       label: 'Failed' };
    return { cls: 'text-success-600 dark:text-success-400', label: 'Succeeded' };
  })();
  return (
    <div className="rounded-lg border shadow-sm glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel p-3">
      <div className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${meta.cls}`}>
        {meta.label}
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px] text-secondary-500 dark:text-secondary-400">
        <Cell value={String(trace.steps.length)} label="STEPS" />
        <Cell value={`$${trace.totalCost.toFixed(4)}`} label="COST" />
        <Cell
          value={(trace.totalTokens.in + trace.totalTokens.out).toLocaleString()}
          label="TOKENS"
        />
      </div>
      {trace.error?.message && (
        <div className="mt-2 text-xs text-danger-600 dark:text-danger-400">
          {trace.error.message}
        </div>
      )}
    </div>
  );
};

const Cell: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div>
    <div className="font-display text-sm font-semibold text-secondary-900 dark:text-secondary-50">
      {value}
    </div>
    <div>{label}</div>
  </div>
);

const StepStatusChip: React.FC<{ status: StepStatus }> = ({ status }) => {
  const Icon = {
    running: <ArrowPathIcon className="w-2.5 h-2.5 animate-spin" />,
    succeeded: <CheckCircleIcon className="w-2.5 h-2.5" />,
    failed: <ExclamationTriangleIcon className="w-2.5 h-2.5" />,
    paused: <PauseCircleIcon className="w-2.5 h-2.5" />,
  }[status];
  const cls = STATUS_BADGE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${cls.bg} ${cls.text}`}
    >
      {Icon} {status}
    </span>
  );
};

const StepDetail: React.FC<{ step: TraceStep; index: number }> = ({ step, index }) => (
  <div className="max-w-3xl">
    <div className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">
      Step {index + 1}
    </div>
    <h2 className="font-display text-2xl sm:text-3xl font-bold capitalize text-secondary-900 dark:text-secondary-50 mb-1">
      {step.nodeType.replace(/-/g, ' ')}
    </h2>
    <div className="flex items-center gap-2 mb-5">
      <StepStatusChip status={step.status} />
      {step.endedAt && (
        <span className="text-xs text-secondary-500 dark:text-secondary-400">
          {step.endedAt - step.startedAt}ms
        </span>
      )}
    </div>

    <div className="grid grid-cols-3 gap-3 mb-5">
      <Metric label="Latency" value={step.endedAt ? `${step.endedAt - step.startedAt}ms` : '—'} />
      <Metric label="Cost" value={step.costUsd !== undefined ? `$${step.costUsd.toFixed(4)}` : '—'} />
      <Metric
        label="Tokens"
        value={step.tokens ? `${step.tokens.in}/${step.tokens.out}` : '—'}
      />
    </div>

    <div className="rounded-xl border shadow-sm backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel p-4">
      <div className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-2">
        Output
      </div>
      <pre className="text-xs font-mono whitespace-pre-wrap text-secondary-800 dark:text-secondary-100 max-h-[400px] overflow-y-auto">
        {step.output ? JSON.stringify(step.output, null, 2) : '(awaiting…)'}
      </pre>
    </div>
  </div>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border shadow-sm backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel p-3">
    <div className="font-display text-lg font-bold text-secondary-900 dark:text-secondary-50">
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mt-0.5">
      {label}
    </div>
  </div>
);

export default Trace;
