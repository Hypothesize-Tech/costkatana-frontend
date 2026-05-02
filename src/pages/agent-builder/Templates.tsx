import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  agentPlatformService,
  AgentTemplate,
} from '../../services/agentPlatform.service';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<AgentTemplate[]>({
    queryKey: ['agent-platform', 'templates'],
    queryFn: () => agentPlatformService.listTemplates(),
  });

  const cloneMutation = useMutation({
    mutationFn: (slug: string) =>
      agentPlatformService.createAgent({
        name: templates.find((t) => t.slug === slug)?.name ?? 'New Agent',
        templateSlug: slug,
      }),
    onSuccess: ({ agent }) => {
      queryClient.invalidateQueries({ queryKey: ['agent-platform', 'agents'] });
      toast.success(`Cloned: ${agent.name}`);
      navigate(`/agent-builder/${agent._id}`);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Could not clone'),
  });

  const blankMutation = useMutation({
    mutationFn: () =>
      agentPlatformService.createAgent({ name: 'Untitled Agent' }),
    onSuccess: ({ agent }) => {
      queryClient.invalidateQueries({ queryKey: ['agent-platform', 'agents'] });
      navigate(`/agent-builder/${agent._id}`);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Could not create'),
  });

  return (
    <div className="bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-2 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-50">
            Templates
          </h1>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1 max-w-2xl">
            Pick a starting point — or start from blank. Templates clone into
            your workspace as new editable agents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Blank canvas */}
          <button
            type="button"
            onClick={() => blankMutation.mutate()}
            disabled={blankMutation.isPending}
            className="text-left p-4 md:p-5 rounded-xl border-2 border-dashed border-primary-300/40 dark:border-primary-500/30 hover:border-primary-500/70 bg-light-bg-100/40 dark:bg-dark-bg-100/40 transition-all hover:-translate-y-0.5 md:rounded-2xl group"
          >
            <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 w-9 h-9 flex items-center justify-center mb-3">
              <DocumentTextIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-300" />
            </div>
            <div className="font-display text-sm sm:text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
              Blank canvas
            </div>
            <div className="text-xs text-secondary-600 dark:text-secondary-300 leading-relaxed mb-3">
              Start from nothing. Drag nodes from the palette, wire them up, run.
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
              {blankMutation.isPending ? 'Creating…' : 'Create empty'}
              <ArrowRightIcon className="w-3 h-3" />
            </span>
          </button>

          {/* Template cards */}
          {isLoading &&
            [0, 1].map((i) => (
              <div
                key={i}
                className="h-72 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-pulse"
              />
            ))}

          {!isLoading &&
            templates.map((template) => {
              return (
                <article
                  key={template._id}
                  className="p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-md shadow-[#06ec9e]/30 w-9 h-9 flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200/40 dark:border-primary-500/20 capitalize">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="font-display text-sm sm:text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-secondary-600 dark:text-secondary-300 leading-relaxed mb-3 min-h-[48px]">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {template.requiredCapabilities.slice(0, 4).map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1.5">
                    Pipeline
                  </div>
                  <div className="flex items-center gap-1 flex-wrap mb-4">
                    {template.dag.nodes.slice(0, 6).map((n, idx) => (
                      <React.Fragment key={n.id}>
                        {idx > 0 && (
                          <ArrowRightIcon className="w-2.5 h-2.5 text-secondary-400" />
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-light-bg-100 dark:bg-dark-bg-100 border border-primary-200/30 dark:border-primary-500/20 text-secondary-700 dark:text-secondary-200">
                          {n.data.label}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => cloneMutation.mutate(template.slug)}
                    disabled={cloneMutation.isPending}
                    className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-md shadow-primary-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {cloneMutation.isPending && cloneMutation.variables === template.slug
                      ? 'Cloning…'
                      : 'Use template'}
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>

                  <div className="mt-2 text-[10px] text-secondary-500 dark:text-secondary-400">
                    {template.clonedCount > 0 && `${template.clonedCount} clones · `}
                    {template.isOfficial ? 'Official' : 'Community'}
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Templates;
