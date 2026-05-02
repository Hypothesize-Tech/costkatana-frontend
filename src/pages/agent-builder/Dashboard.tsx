import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  agentPlatformService,
  AgentDefinition,
} from '../../services/agentPlatform.service';
import {
  PlusIcon,
  RocketLaunchIcon,
  Squares2X2Icon,
  SparklesIcon,
  ArrowRightIcon,
  EllipsisHorizontalIcon,
  CommandLineIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const STATUS_DOT: Record<AgentDefinition['status'], string> = {
  draft: 'bg-secondary-400',
  published: 'bg-primary-500 shadow-[0_0_6px_#06ec9e]',
  archived: 'bg-accent-500',
};

const QUICK_ACTIONS = [
  {
    to: '/agent-builder/templates',
    title: 'Pick a template',
    desc: 'Start from a working agent — clone, edit, deploy.',
    Icon: RocketLaunchIcon,
  },
  {
    to: '/agent-builder/text-to-agent',
    title: 'Describe in English',
    desc: 'Type what your agent should do — we draft the canvas.',
    Icon: SparklesIcon,
  },
  {
    to: '/agent-builder/templates',
    title: 'Blank canvas',
    desc: 'Drag nodes from the palette — full manual control.',
    Icon: CommandLineIcon,
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: agents = [], isLoading } = useQuery<AgentDefinition[]>({
    queryKey: ['agent-platform', 'agents'],
    queryFn: () => agentPlatformService.listAgents(),
  });

  const liveCount = agents.filter((a) => a.status === 'published').length;
  const draftCount = agents.filter((a) => a.status === 'draft').length;

  return (
    <div className="bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-2 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-50">
              Agent Builder
            </h1>
            <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1 max-w-2xl">
              Compose agents from typed nodes, run them with live tracing,
              forward-deploy as embeddable widgets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/agent-builder/templates"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <PlusIcon className="w-4 h-4" /> New agent
            </Link>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            label="Total agents"
            value={agents.length}
            loading={isLoading}
            tone="primary"
            Icon={Squares2X2Icon}
          />
          <StatCard
            label="Live"
            value={liveCount}
            loading={isLoading}
            tone="success"
            Icon={RocketLaunchIcon}
          />
          <StatCard
            label="Drafts"
            value={draftCount}
            loading={isLoading}
            tone="secondary"
            Icon={ClockIcon}
          />
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-3">
            Start something
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.title}
                to={action.to}
                className="group p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-400/50 transition-all hover:-translate-y-0.5 md:rounded-2xl"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-md shadow-[#06ec9e]/30 w-9 h-9 flex items-center justify-center mb-3">
                  <action.Icon className="w-4 h-4 text-white" />
                </div>
                <div className="font-display text-sm sm:text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
                  {action.title}
                </div>
                <div className="text-xs text-secondary-600 dark:text-secondary-300 leading-relaxed mb-3">
                  {action.desc}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                  Start <ArrowRightIcon className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Agents list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
              Your agents
            </h2>
          </div>
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-pulse"
                />
              ))}
            </div>
          )}
          {!isLoading && agents.length === 0 && (
            <div className="rounded-xl border shadow-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 text-center md:rounded-2xl">
              <Squares2X2Icon className="w-10 h-10 text-secondary-400 dark:text-secondary-500 mx-auto mb-3" />
              <div className="font-display text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
                No agents yet
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                Pick a template or describe what your agent should do.
              </p>
              <Link
                to="/agent-builder/templates"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-md shadow-primary-500/30 transition-all"
              >
                Browse templates <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
          {!isLoading && agents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {agents.map((agent) => (
                <button
                  key={agent._id}
                  type="button"
                  onClick={() => navigate(`/agent-builder/${agent._id}`)}
                  className="text-left p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:border-primary-400/50 transition-all hover:-translate-y-0.5 md:rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${STATUS_DOT[agent.status]}`}
                    />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                      {agent.status}
                    </span>
                    <span className="ml-auto text-secondary-400 dark:text-secondary-500">
                      <EllipsisHorizontalIcon className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="font-display text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
                    {agent.name}
                  </div>
                  <div className="text-xs text-secondary-600 dark:text-secondary-300 leading-relaxed mb-3 line-clamp-2 min-h-[34px]">
                    {agent.description || (
                      <span className="italic text-secondary-400 dark:text-secondary-500">
                        No description.
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.templateSourceSlug && (
                      <Tag>From: {agent.templateSourceSlug}</Tag>
                    )}
                    {(agent.tags ?? []).slice(0, 3).map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-primary-200/20 dark:border-primary-500/10">
                    <span className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                      Open canvas
                    </span>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-primary-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  loading?: boolean;
  tone: 'primary' | 'success' | 'secondary';
  Icon: React.ComponentType<{ className?: string }>;
}> = ({ label, value, loading, tone, Icon }) => {
  const styles =
    tone === 'primary'
      ? 'border-primary-200/30 dark:border-primary-500/20 from-[#06ec9e]/10 via-emerald-50/40 to-[#009454]/10 dark:from-[#06ec9e]/15 dark:via-emerald-900/20 dark:to-[#009454]/15'
      : tone === 'success'
        ? 'border-success-200/30 dark:border-success-500/20 from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20'
        : 'border-secondary-200/30 dark:border-secondary-500/20 from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20';
  const iconColor =
    tone === 'primary'
      ? 'text-primary-500'
      : tone === 'success'
        ? 'text-success-500'
        : 'text-secondary-500';
  return (
    <div
      className={`p-3 sm:p-4 md:p-5 glass rounded-xl border shadow-xl backdrop-blur-xl bg-gradient-to-br ${styles} md:rounded-2xl`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider font-medium text-secondary-500 dark:text-secondary-400">
          {label}
        </span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      {loading ? (
        <div className="h-7 w-12 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
      ) : (
        <div className="font-display text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-50">
          {value}
        </div>
      )}
    </div>
  );
};

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200/40 dark:border-primary-500/20">
    {children}
  </span>
);

export default Dashboard;
