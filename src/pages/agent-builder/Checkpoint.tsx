import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  agentPlatformService,
  subscribeToRun,
} from '../../services/agentPlatform.service';
import toast from 'react-hot-toast';
import {
  PauseCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Checkpoint: React.FC = () => {
  const { agentId, runId } = useParams<{ agentId: string; runId: string }>();
  const navigate = useNavigate();
  const [pausePayload, setPausePayload] = useState<unknown>(null);
  const [pauseReason, setPauseReason] = useState<string>('human review');
  const [adjustment, setAdjustment] = useState<string>('');

  useEffect(() => {
    if (!runId) return;
    const off = subscribeToRun(runId, {
      paused: (data) => {
        const d = data as any;
        setPausePayload(d.payload);
        setPauseReason(d.reason ?? 'human review');
      },
      'run.end': () => {
        if (agentId && runId) navigate(`/agent-builder/${agentId}/runs/${runId}`);
      },
      'run.error': () => {
        if (agentId && runId) navigate(`/agent-builder/${agentId}/runs/${runId}`);
      },
    });
    return off;
  }, [runId, agentId, navigate]);

  const resumeMutation = useMutation({
    mutationFn: async (decision: 'approve' | 'reject') => {
      if (!runId) throw new Error('no runId');
      const response =
        decision === 'approve'
          ? { approved: true, adjustment: adjustment || undefined, payload: pausePayload }
          : { approved: false, reason: adjustment || 'rejected by reviewer' };
      await agentPlatformService.resumeRun(runId, response);
      return decision;
    },
    onSuccess: (decision) => {
      toast.success(decision === 'approve' ? 'Approved' : 'Rejected');
    },
    onError: (err: Error) => toast.error(err.message ?? 'Resume failed'),
  });

  const previewText = useMemo(() => {
    if (!pausePayload) return '';
    if (typeof pausePayload === 'string') return pausePayload;
    return JSON.stringify(pausePayload, null, 2);
  }, [pausePayload]);

  return (
    <div className="bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-2 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(`/agent-builder/${agentId}/runs/${runId}`)}
          className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-50 inline-flex items-center gap-1 mb-3"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to trace
        </button>

        <div className="rounded-xl border-2 shadow-xl backdrop-blur-xl glass border-accent-300/40 dark:border-accent-500/30 bg-gradient-light-panel dark:bg-gradient-dark-panel p-5 md:p-7 md:rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider text-accent-700 dark:text-accent-400 bg-accent-100/60 dark:bg-accent-900/30 border border-accent-300/40 dark:border-accent-500/30">
              <PauseCircleIcon className="w-3 h-3" /> Awaiting approval
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-2">
            Agent paused for review
          </h2>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed mb-4">
            Reason:{' '}
            <span className="text-secondary-900 dark:text-secondary-50 font-medium">
              {pauseReason}
            </span>
            . Inspect the upstream payload below, then approve or reject.
          </p>

          {pausePayload ? (
            <div className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 p-3 mb-4">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-secondary-500 dark:text-secondary-400 mb-1.5">
                Upstream payload
              </div>
              <pre className="text-xs font-mono text-secondary-800 dark:text-secondary-100 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {previewText}
              </pre>
            </div>
          ) : (
            <div className="text-sm text-secondary-500 dark:text-secondary-400 inline-flex items-center gap-2 mb-4">
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Waiting for the runner
              to pause here…
            </div>
          )}

          <label className="block mb-5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary-500 dark:text-secondary-400 block mb-1.5">
              Optional adjustment / note
            </span>
            <textarea
              className="w-full rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-50 placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 resize-none"
              rows={3}
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              placeholder="e.g. tweak the draft reply, or explain the rejection."
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => resumeMutation.mutate('approve')}
              disabled={resumeMutation.isPending || !pausePayload}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-md shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resumeMutation.isPending && resumeMutation.variables === 'approve' ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Approving…
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" /> Approve & continue
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => resumeMutation.mutate('reject')}
              disabled={resumeMutation.isPending || !pausePayload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-danger-300/40 dark:border-danger-500/30 text-danger-600 dark:text-danger-400 hover:bg-danger-50/40 dark:hover:bg-danger-900/15 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XMarkIcon className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkpoint;
