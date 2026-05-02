import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config/api';
import {
  agentPlatformService,
  AgentDefinition,
  AgentDeployment,
  AgentVersion,
} from '../../services/agentPlatform.service';
import toast from 'react-hot-toast';
import {
  RocketLaunchIcon,
  ClipboardDocumentIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  CircleStackIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

// Widget JS is served directly from the backend — no S3 upload needed.
const CDN_URL =
  import.meta.env.VITE_AGENT_WIDGET_CDN ??
  `${API_BASE_URL}/api/public/widget/bundle.js`;

const Deploy: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [allowlist, setAllowlist] = useState<string[]>([
    typeof window !== 'undefined' ? window.location.origin : '',
  ].filter(Boolean));
  const [draftOrigin, setDraftOrigin] = useState('');
  const [theme, setTheme] = useState({
    primary: '#06ec9e',
    surface: '#ffffff',
    position: 'bottom-right',
  });
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hi — how can I help today?',
  );
  const initialized = useRef(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery<{
    agent: AgentDefinition;
    currentVersion: AgentVersion | null;
  }>({
    queryKey: ['agent-platform', 'agent', agentId],
    queryFn: () => agentPlatformService.getAgent(agentId!),
    enabled: !!agentId,
  });

  const { data: existingDeployments = [] } = useQuery<AgentDeployment[]>({
    queryKey: ['agent-platform', 'deployments', agentId],
    queryFn: () => agentPlatformService.listDeployments(agentId),
    enabled: !!agentId,
  });

  const activeDeployment = existingDeployments.find(
    (d) => d.status === 'active' && d.channel === 'embed-widget',
  );

  // Pre-fill settings from existing deployment on first load
  useEffect(() => {
    if (activeDeployment && !initialized.current) {
      initialized.current = true;
      setAllowlist(activeDeployment.originAllowlist ?? []);
      setTheme({
        primary: activeDeployment.theme?.primary ?? '#06ec9e',
        surface: activeDeployment.theme?.surface ?? '#ffffff',
        position: activeDeployment.theme?.position ?? 'bottom-right',
      });
      setWelcomeMessage(activeDeployment.welcomeMessage ?? 'Hi — how can I help today?');
    }
  }, [activeDeployment]);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!agentId || !data?.currentVersion?._id)
        throw new Error('publish a version first');
      return agentPlatformService.createDeployment({
        agentId,
        versionId: data.currentVersion._id,
        channel: 'embed-widget',
        originAllowlist: allowlist,
        theme,
        welcomeMessage,
      });
    },
    onSuccess: () => {
      toast.success('Widget deployed — copy the script below');
      queryClient.invalidateQueries({
        queryKey: ['agent-platform', 'deployments', agentId],
      });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Deploy failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!activeDeployment) throw new Error('no active deployment');
      return agentPlatformService.updateDeployment(activeDeployment._id, {
        originAllowlist: allowlist,
        theme,
        welcomeMessage,
      });
    },
    onSuccess: () => {
      toast.success('Deployment updated');
      queryClient.invalidateQueries({
        queryKey: ['agent-platform', 'deployments', agentId],
      });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Update failed'),
  });

  const { data: kbStatus } = useQuery({
    queryKey: ['agent-platform', 'kb-status'],
    queryFn: () => agentPlatformService.getKbStatus(),
    retry: false,
  });

  const snippet = useMemo(() => {
    const id = activeDeployment?.publicId ?? '<deployment-id>';
    return `<script src="${CDN_URL}" data-deployment-id="${id}" data-api-url="${API_BASE_URL}" defer></script>`;
  }, [activeDeployment?.publicId]);

  const onAddOrigin = () => {
    const candidate = draftOrigin.trim().replace(/\/$/, '');
    if (!candidate) return;
    if (!/^https?:\/\//.test(candidate) && !candidate.startsWith('*.')) {
      toast.error('Origins should look like https://example.com or *.example.com');
      return;
    }
    if (allowlist.includes(candidate)) {
      setDraftOrigin('');
      return;
    }
    setAllowlist((prev) => [...prev, candidate]);
    setDraftOrigin('');
  };

  const onCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }
  if (!data?.agent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-secondary-600 dark:text-secondary-300 bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
        Agent not found.
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-2 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-5">
        <button
          type="button"
          onClick={() => navigate(`/agent-builder/${agentId}`)}
          className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-50 inline-flex items-center gap-1"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to canvas
        </button>

        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-50">
            Deploy: {data.agent.name}
          </h1>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
            {activeDeployment
              ? 'Your widget is live. Copy the script tag and paste it before </body> on your site.'
              : 'Configure and deploy this agent as an embeddable chat widget.'}
          </p>
        </div>

        {/* ── LIVE BANNER: shown only when deployed ── */}
        {activeDeployment && (
          <section className="p-4 md:p-5 rounded-xl md:rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-500/40 bg-gradient-light-panel dark:bg-gradient-dark-panel ring-1 ring-primary-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_#06ec9e]" />
              <span className="font-display text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                Live — embed this script on your site
              </span>
              <span className="ml-auto text-[10px] text-secondary-500 dark:text-secondary-400 font-mono">
                id: {activeDeployment.publicId}
              </span>
            </div>
            <div className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 p-3 font-mono text-xs overflow-x-auto mb-3">
              <code className="text-primary-700 dark:text-primary-300 break-all">{snippet}</code>
            </div>
            <button
              type="button"
              onClick={onCopySnippet}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-md shadow-primary-500/30 transition-all"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4" /> Copy script tag
                </>
              )}
            </button>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3 md:gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <Card title="Origin allowlist" subtitle="Domains allowed to embed this widget">
              <div className="flex flex-wrap gap-2 mb-3">
                {allowlist.map((origin) => (
                  <span
                    key={origin}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-light-bg-100 dark:bg-dark-bg-100 border border-primary-200/30 dark:border-primary-500/20 text-secondary-800 dark:text-secondary-100"
                  >
                    {origin}
                    <button
                      type="button"
                      onClick={() => setAllowlist((p) => p.filter((o) => o !== origin))}
                      className="text-secondary-400 hover:text-danger-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {allowlist.length === 0 && (
                  <span className="text-xs text-danger-600 dark:text-danger-400">
                    Empty allowlist blocks all traffic — add at least one origin.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draftOrigin}
                  onChange={(e) => setDraftOrigin(e.target.value)}
                  placeholder="https://app.example.com or *.example.com"
                  className="flex-1 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50 placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddOrigin();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={onAddOrigin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/40 dark:border-primary-500/20 text-sm text-secondary-700 dark:text-secondary-200 hover:border-primary-400/60 hover:bg-light-bg-100/40 dark:hover:bg-dark-bg-200/40 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </Card>

            <Card title="Theme" subtitle="Lightweight customization">
              <div className="grid grid-cols-2 gap-3">
                <ColorRow
                  label="Primary"
                  value={theme.primary}
                  onChange={(primary) => setTheme((t) => ({ ...t, primary }))}
                />
                <ColorRow
                  label="Surface"
                  value={theme.surface}
                  onChange={(surface) => setTheme((t) => ({ ...t, surface }))}
                />
              </div>
              <label className="flex items-center gap-2 mt-3">
                <span className="text-xs text-secondary-600 dark:text-secondary-300 w-[100px] flex-shrink-0">
                  Position
                </span>
                <select
                  value={theme.position}
                  onChange={(e) => setTheme((t) => ({ ...t, position: e.target.value }))}
                  className="flex-1 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                >
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                </select>
              </label>
            </Card>

            <Card title="Welcome message" subtitle="First line the visitor sees">
              <input
                type="text"
                className="w-full rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                maxLength={140}
              />
            </Card>

            <Card
              title="Knowledge base"
              subtitle="Required if your agent has a KB node"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <CircleStackIcon className="w-5 h-5 flex-shrink-0 text-primary-500" />
                  <div className="min-w-0">
                    {kbStatus?.kb ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              kbStatus.kb.status === 'ready'
                                ? 'bg-primary-500 shadow-[0_0_6px_#06ec9e]'
                                : kbStatus.kb.status === 'failed'
                                ? 'bg-danger-500'
                                : 'bg-accent-500 animate-pulse'
                            }`}
                          />
                          <span className="text-xs font-medium text-secondary-900 dark:text-secondary-50 capitalize">
                            {kbStatus.kb.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-0.5">
                          {kbStatus.kb.documentCount ?? 0} document{kbStatus.kb.documentCount !== 1 ? 's' : ''} · {kbStatus.chunkCount ?? 0} chunks indexed
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-medium text-accent-600 dark:text-accent-400">
                          No knowledge base yet
                        </div>
                        <div className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-0.5">
                          Upload documents before deploying an agent that uses a KB node.
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/agent-builder/knowledge-base')}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/40 dark:border-primary-500/20 text-xs text-secondary-700 dark:text-secondary-200 hover:border-primary-400/60 hover:bg-light-bg-100/40 dark:hover:bg-dark-bg-200/40 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  Manage KB
                </button>
              </div>
            </Card>

            {/* Deploy / Update button */}
            {activeDeployment ? (
              <button
                type="button"
                onClick={() => updateMutation.mutate()}
                disabled={isPending || allowlist.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-primary-500 text-primary-600 dark:text-primary-400 text-sm font-semibold hover:bg-primary-50/40 dark:hover:bg-primary-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" /> Updating…
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" /> Save changes
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                disabled={isPending || allowlist.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" /> Deploying…
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="w-4 h-4" /> Deploy widget
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right: live preview */}
          <div>
            <Card title="Preview" subtitle="What visitors will see">
              <WidgetPreview
                theme={theme}
                welcomeMessage={welcomeMessage}
                agentName={data.agent.name}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <section className="p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl">
    <div className="flex items-baseline justify-between mb-3">
      <h3 className="font-display text-sm font-semibold text-secondary-900 dark:text-secondary-50">
        {title}
      </h3>
      {subtitle && (
        <span className="text-[10px] text-secondary-500 dark:text-secondary-400">
          {subtitle}
        </span>
      )}
    </div>
    {children}
  </section>
);

const ColorRow: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2">
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-9 h-9 rounded border border-primary-200/30 dark:border-primary-500/20 bg-transparent cursor-pointer p-0.5"
    />
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-2 py-1 text-xs font-mono text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
      />
    </div>
  </label>
);

const WidgetPreview: React.FC<{
  theme: { primary: string; surface: string; position: string };
  welcomeMessage: string;
  agentName: string;
}> = ({ theme, welcomeMessage, agentName }) => {
  const align = theme.position === 'bottom-left' ? 'items-start' : 'items-end';
  return (
    <div
      className={`relative h-[280px] rounded-lg flex flex-col justify-end p-3 ${align} bg-secondary-100 dark:bg-secondary-900/50`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        className="rounded-2xl shadow-xl border border-primary-200/30 dark:border-primary-500/20 overflow-hidden flex flex-col w-[240px]"
        style={{ background: theme.surface, color: '#0f172a' }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2 border-b border-secondary-200/40"
          style={{
            background: `linear-gradient(180deg, ${theme.primary}1F, transparent)`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: theme.primary, boxShadow: `0 0 6px ${theme.primary}` }}
          />
          <span className="font-display text-xs font-semibold">{agentName}</span>
        </div>
        <div className="px-4 py-3 text-xs flex-1 min-h-[80px]">{welcomeMessage}</div>
        <div className="px-3 py-2 border-t border-secondary-200/40 flex items-center gap-2 bg-secondary-50/60">
          <input
            disabled
            className="bg-transparent text-xs text-secondary-500 flex-1 outline-none"
            placeholder="Type a message…"
          />
          <span
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: theme.primary, color: '#fff' }}
          >
            <CheckIcon className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Deploy;
