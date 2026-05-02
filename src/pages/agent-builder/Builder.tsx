import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  PlayIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

import {
  agentPlatformService,
  AgentDefinition,
  AgentVersion,
  DagValidationIssue,
} from '../../services/agentPlatform.service';
import { useAgentBuilderStore } from '../../stores/agentBuilderStore';

import AgentCanvas from '../../components/agentBuilder/canvas/AgentCanvas';
import NodePalette from '../../components/agentBuilder/canvas/NodePalette';
import NodeConfigPanel from '../../components/agentBuilder/canvas/NodeConfigPanel';
import CostEstimateBadge from '../../components/agentBuilder/canvas/CostEstimateBadge';

const AUTO_SAVE_DEBOUNCE_MS = 1500;

const Builder: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const hydrate = useAgentBuilderStore((s) => s.hydrateFromVersion);
  const dirty = useAgentBuilderStore((s) => s.dirty);
  const lastSavedAt = useAgentBuilderStore((s) => s.lastSavedAt);
  const setIssues = useAgentBuilderStore((s) => s.setValidationIssues);
  const issues = useAgentBuilderStore((s) => s.validationIssues);
  const markSaved = useAgentBuilderStore((s) => s.markSaved);
  const reset = useAgentBuilderStore((s) => s.reset);
  const toDag = useAgentBuilderStore((s) => s.toDag);
  const versionNumber = useAgentBuilderStore((s) => s.versionNumber);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  );

  const { data, isLoading, isError } = useQuery<{
    agent: AgentDefinition;
    currentVersion: AgentVersion | null;
  }>({
    queryKey: ['agent-platform', 'agent', agentId],
    queryFn: () => agentPlatformService.getAgent(agentId!),
    enabled: !!agentId,
  });

  useEffect(() => {
    if (!data?.agent || !data.currentVersion || !agentId) return;
    hydrate({
      agentId,
      agentVersionId: data.currentVersion._id,
      versionNumber: data.currentVersion.versionNumber,
      dag: data.currentVersion.dag,
    });
  }, [data, agentId, hydrate]);

  useEffect(() => () => reset(), [reset]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!agentId) throw new Error('no agentId');
      const dag = toDag();
      return agentPlatformService.saveDag(agentId, dag);
    },
    onMutate: () => setSaveState('saving'),
    onSuccess: ({ version, validation }) => {
      setIssues(validation.issues);
      markSaved(version._id, version.versionNumber);
      setSaveState('saved');
      queryClient.invalidateQueries({
        queryKey: ['agent-platform', 'agent', agentId],
      });
      setTimeout(() => setSaveState('idle'), 1400);
    },
    onError: (err: Error) => {
      setSaveState('error');
      toast.error(err.message ?? 'Save failed');
    },
  });

  useEffect(() => {
    if (!dirty || !data?.agent) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveMutation.mutate();
    }, AUTO_SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  const testRunMutation = useMutation({
    mutationFn: async (input: string) => {
      if (!agentId) throw new Error('no agentId');
      if (dirty) await saveMutation.mutateAsync();
      return agentPlatformService.testRun(agentId, input);
    },
    onSuccess: ({ runId }) => {
      navigate(`/agent-builder/${agentId}/runs/${runId}`);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Run failed'),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!agentId || !data?.currentVersion?._id) throw new Error('nothing to publish');
      if (dirty) await saveMutation.mutateAsync();
      const versionId =
        useAgentBuilderStore.getState().agentVersionId ?? data.currentVersion._id;
      return agentPlatformService.publishVersion(agentId, versionId);
    },
    onSuccess: () => {
      toast.success('Published');
      queryClient.invalidateQueries({
        queryKey: ['agent-platform', 'agent', agentId],
      });
      navigate(`/agent-builder/${agentId}/deploy`);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Publish failed'),
  });

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-light-bg-100 dark:bg-dark-bg-300">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }
  if (isError || !data?.agent) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-secondary-600 dark:text-secondary-300">
        Could not load agent.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <CanvasToolbar
        agent={data.agent}
        versionNumber={versionNumber || data.currentVersion?.versionNumber || 1}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        onTestRun={() => testRunMutation.mutate('Hello!')}
        onPublish={() => publishMutation.mutate()}
        publishPending={publishMutation.isPending}
        testRunPending={testRunMutation.isPending}
        issues={issues}
        onBack={() => navigate('/agent-builder')}
        onOpenKnowledgeBase={() => navigate('/agent-builder/knowledge-base')}
      />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <div className="flex-1 relative">
          <AgentCanvas />
          <CostEstimateBadge />
        </div>
        <NodeConfigPanel />
      </div>
    </div>
  );
};

const CanvasToolbar: React.FC<{
  agent: AgentDefinition;
  versionNumber: number;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: number | null;
  onTestRun: () => void;
  onPublish: () => void;
  publishPending: boolean;
  testRunPending: boolean;
  issues: DagValidationIssue[];
  onBack: () => void;
  onOpenKnowledgeBase: () => void;
}> = ({
  agent,
  versionNumber,
  saveState,
  lastSavedAt,
  onTestRun,
  onPublish,
  publishPending,
  testRunPending,
  issues,
  onBack,
  onOpenKnowledgeBase,
}) => {
    const status = useMemo(() => {
      if (saveState === 'saving')
        return {
          icon: <ArrowPathIcon className="w-3 h-3 animate-spin" />,
          text: 'Saving…',
          cls: 'text-secondary-500 dark:text-secondary-400',
        };
      if (saveState === 'saved')
        return {
          icon: <CheckCircleIcon className="w-3 h-3" />,
          text: 'Saved',
          cls: 'text-success-600 dark:text-success-400',
        };
      if (saveState === 'error')
        return {
          icon: <ExclamationTriangleIcon className="w-3 h-3" />,
          text: 'Save failed',
          cls: 'text-danger-600 dark:text-danger-400',
        };
      if (lastSavedAt) {
        const ago = Math.round((Date.now() - lastSavedAt) / 1000);
        return {
          icon: <CheckCircleIcon className="w-3 h-3" />,
          text: ago < 5 ? 'Just saved' : `Saved ${ago}s ago`,
          cls: 'text-secondary-400 dark:text-secondary-500',
        };
      }
      return { icon: null, text: '', cls: 'text-secondary-400' };
    }, [saveState, lastSavedAt]);

    const statusDot =
      agent.status === 'published'
        ? 'bg-primary-500 shadow-[0_0_6px_#06ec9e]'
        : 'bg-secondary-400';

    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-dark-bg-100 border-b border-primary-200/30 dark:border-primary-500/20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-50 inline-flex items-center gap-1"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            Back
          </button>
          <button
            type="button"
            onClick={onOpenKnowledgeBase}
            className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-50 inline-flex items-center gap-1"
          >
            <CircleStackIcon className="w-3.5 h-3.5" />
            KB
          </button>
          <span className="w-px h-5 bg-primary-200/30 dark:bg-primary-500/20 mx-1" />
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-display text-sm font-semibold text-secondary-900 dark:text-secondary-50 truncate">
              {agent.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
              v{versionNumber} · {agent.status}
            </span>
          </div>
          {issues.length > 0 && (
            <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border border-accent-300/40 dark:border-accent-500/30 text-accent-700 dark:text-accent-400 bg-accent-50/40 dark:bg-accent-900/15">
              <ExclamationTriangleIcon className="w-3 h-3" />
              {issues.length} issue{issues.length === 1 ? '' : 's'}
            </span>
          )}
          {status.text && (
            <span className={`text-[10px] inline-flex items-center gap-1 ml-2 ${status.cls}`}>
              {status.icon} {status.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/40 dark:border-primary-500/20 text-xs text-secondary-700 dark:text-secondary-200 hover:border-primary-400/60 hover:bg-light-bg-100/40 dark:hover:bg-dark-bg-200/40 transition-colors disabled:opacity-50"
            onClick={onTestRun}
            disabled={testRunPending}
          >
            {testRunPending ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PlayIcon className="w-3.5 h-3.5" />
            )}
            Run & Trace
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium shadow-md shadow-primary-500/30 transition-all disabled:opacity-50"
            onClick={onPublish}
            disabled={publishPending}
          >
            {publishPending ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RocketLaunchIcon className="w-3.5 h-3.5" />
            )}
            Publish
          </button>
        </div>
      </div>
    );
  };

export default Builder;
