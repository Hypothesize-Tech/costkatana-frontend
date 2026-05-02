import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  agentPlatformService,
  AgentDag,
  DagValidationIssue,
} from '../../services/agentPlatform.service';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const PROMPTS = [
  'A customer support agent that answers questions from our help docs and escalates uncertain cases to a human via Slack.',
  'A research summariser that takes a topic, searches the web, and produces a structured 200-word brief.',
  'A lead qualifier that scores inbound form submissions and posts qualified leads to #sales.',
  'A code-review agent that reads a GitHub PR diff and flags risky changes.',
];

const TextToAgent: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [draft, setDraft] = useState<{
    dag: AgentDag;
    suggestedName: string;
    issues: DagValidationIssue[];
    ok: boolean;
  } | null>(null);

  const generateMutation = useMutation({
    mutationFn: (text: string) => agentPlatformService.textToAgent(text),
    onSuccess: (result) => {
      setDraft({
        dag: result.dag,
        suggestedName: result.suggestedName,
        issues: result.validation.issues,
        ok: result.validation.ok,
      });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Generation failed'),
  });

  const createMutation = useMutation({
    mutationFn: async (input: { name: string; dag: AgentDag }) => {
      const { agent } = await agentPlatformService.createAgent({
        name: input.name,
        description: description.slice(0, 280),
      });
      await agentPlatformService.saveDag(agent._id, input.dag, 'Generated from prompt');
      return agent;
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agent-platform', 'agents'] });
      toast.success(`Created ${agent.name}`);
      navigate(`/agent-builder/${agent._id}`);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Could not create'),
  });

  const onGenerate = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = description.trim();
    if (text.length < 10) {
      toast.error('Add a bit more detail (at least one sentence).');
      return;
    }
    setDraft(null);
    generateMutation.mutate(text);
  };

  return (
    <div className="bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-2 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-50">
            Text to Agent
          </h1>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1 max-w-2xl">
            Describe what your agent should do in plain English. We&apos;ll draft
            the canvas — nodes, models, branches — for you to refine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-3 md:gap-4">
          {/* Input */}
          <form
            onSubmit={onGenerate}
            className="p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl flex flex-col min-h-[420px]"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                Describe your agent
              </label>
              <span className="text-[10px] text-secondary-400 dark:text-secondary-500">
                {description.length} chars
              </span>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A support agent that answers from our docs and escalates low-confidence answers via Slack."
              className="w-full flex-1 min-h-[160px] resize-none rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-2 text-sm text-secondary-900 dark:text-secondary-50 placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
              rows={8}
            />

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="submit"
                disabled={generateMutation.isPending || description.trim().length < 10}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-md shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" /> Generate canvas
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDescription('');
                  setDraft(null);
                }}
                className="text-sm text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-primary-200/20 dark:border-primary-500/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-2 flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5" /> Try a prompt
              </div>
              <div className="flex flex-col gap-1.5">
                {PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setDescription(prompt)}
                    className="text-left text-xs text-secondary-700 dark:text-secondary-200 hover:text-secondary-900 dark:hover:text-secondary-50 hover:bg-light-bg-100/60 dark:hover:bg-dark-bg-100/60 px-3 py-2 rounded-lg border border-transparent hover:border-primary-200/40 dark:hover:border-primary-500/20 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Draft preview */}
          <div className="p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl flex flex-col min-h-[420px]">
            {!draft && !generateMutation.isPending && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="p-3 rounded-lg bg-secondary-100 dark:bg-secondary-800 mb-3">
                  <SparklesIcon className="w-6 h-6 text-secondary-500 dark:text-secondary-400" />
                </div>
                <div className="font-display text-sm font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
                  Generated canvas appears here
                </div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400 max-w-[280px]">
                  Describe your agent → we draft the pipeline → review → save.
                </div>
              </div>
            )}
            {generateMutation.isPending && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <ArrowPathIcon className="w-7 h-7 text-primary-500 animate-spin mb-2" />
                <div className="text-sm text-secondary-600 dark:text-secondary-300">
                  Drafting your canvas…
                </div>
              </div>
            )}
            {draft && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-0.5">
                      Suggested name
                    </div>
                    <div className="font-display text-base font-semibold text-secondary-900 dark:text-secondary-50">
                      {draft.suggestedName}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                      draft.ok
                        ? 'text-success-600 dark:text-success-400 border-success-300/40 dark:border-success-500/30 bg-success-50/50 dark:bg-success-900/20'
                        : 'text-accent-600 dark:text-accent-400 border-accent-300/40 dark:border-accent-500/30 bg-accent-50/50 dark:bg-accent-900/20'
                    }`}
                  >
                    {draft.ok ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3" /> Valid
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="w-3 h-3" />{' '}
                        {draft.issues.length} issue{draft.issues.length === 1 ? '' : 's'}
                      </>
                    )}
                  </span>
                </div>

                <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1.5">
                  Pipeline ({draft.dag.nodes.length} nodes)
                </div>
                <div className="flex flex-wrap items-center gap-1 mb-3">
                  {draft.dag.nodes.map((n, i) => (
                    <React.Fragment key={n.id}>
                      {i > 0 && (
                        <ArrowRightIcon className="w-2.5 h-2.5 text-secondary-400" />
                      )}
                      <span
                        className="px-2 py-0.5 rounded text-[11px] bg-light-bg-100 dark:bg-dark-bg-100 border border-primary-200/30 dark:border-primary-500/20 text-secondary-700 dark:text-secondary-200"
                        title={n.type}
                      >
                        {n.data.label}
                      </span>
                    </React.Fragment>
                  ))}
                </div>

                {draft.issues.length > 0 && (
                  <div className="mb-3 text-xs text-accent-700 dark:text-accent-300 bg-accent-50/40 dark:bg-accent-900/20 border border-accent-300/30 dark:border-accent-500/20 px-3 py-2 rounded space-y-1">
                    {draft.issues.slice(0, 3).map((issue, i) => (
                      <div key={i}>· {issue.message}</div>
                    ))}
                    {draft.issues.length > 3 && (
                      <div className="opacity-70">+ {draft.issues.length - 3} more</div>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-primary-200/20 dark:border-primary-500/10 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      createMutation.mutate({
                        name: draft.suggestedName,
                        dag: draft.dag,
                      })
                    }
                    disabled={createMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-md shadow-primary-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" /> Creating…
                      </>
                    ) : (
                      <>
                        Open in canvas <ArrowRightIcon className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onGenerate()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 text-secondary-700 dark:text-secondary-200 hover:bg-light-bg-100/40 dark:hover:bg-dark-bg-100/40 text-sm font-medium transition-colors"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToAgent;
