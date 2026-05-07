import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentBuilderStore } from '../../../stores/agentBuilderStore';
import {
  TrashIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { NodeType } from '../../../services/agentPlatform.service';
import { NODE_COLOR, NODE_LABEL } from '../nodes';
import PromptEditor from '../../prompt/PromptEditor';
import PromptVersionHistory from '../../prompt/PromptVersionHistory';
import { PromptTemplateService } from '../../../services/promptTemplate.service';

const MODEL_OPTIONS = [
  { id: 'anthropic.claude-3-5-sonnet-20241022-v2:0', name: 'Claude Sonnet 4', cost: '$3 / 1M in' },
  { id: 'anthropic.claude-3-5-haiku-20241022-v1:0', name: 'Haiku 3.5', cost: '$0.8 / 1M in' },
];

const inputCls =
  'w-full rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-2 py-1.5 text-xs text-secondary-900 dark:text-secondary-50 placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500';

const NodeConfigPanel: React.FC = () => {
  const navigate = useNavigate();
  const selectedNodeId = useAgentBuilderStore((s) => s.selectedNodeId);
  const nodes = useAgentBuilderStore((s) => s.nodes);
  const node = nodes.find((n) => n.id === selectedNodeId);
  const updateConfig = useAgentBuilderStore((s) => s.updateNodeConfig);
  const updateLabel = useAgentBuilderStore((s) => s.updateNodeLabel);
  const removeNode = useAgentBuilderStore((s) => s.removeNode);
  const allValidationIssues = useAgentBuilderStore((s) => s.validationIssues);
  const validationIssues = allValidationIssues.filter((i) => i.nodeId === selectedNodeId);

  if (!node) {
    return (
      <aside className="w-[300px] flex-shrink-0 bg-white dark:bg-dark-bg-100 border-l border-primary-200/30 dark:border-primary-500/20 flex flex-col">
        <div className="px-5 py-12 text-center">
          <Cog6ToothIcon className="w-7 h-7 text-secondary-400 dark:text-secondary-500 mx-auto mb-3" />
          <div className="text-sm text-secondary-500 dark:text-secondary-400">
            Click a node to edit it.
          </div>
        </div>
      </aside>
    );
  }

  const accent = NODE_COLOR[node.type as NodeType] ?? '#06ec9e';
  const cfg = (node.data?.config ?? {}) as Record<string, any>;

  return (
    <aside className="w-[300px] flex-shrink-0 bg-white dark:bg-dark-bg-100 border-l border-primary-200/30 dark:border-primary-500/20 flex flex-col overflow-y-auto">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-primary-200/30 dark:border-primary-500/20 flex items-center gap-2"
        style={{ borderTopColor: accent, borderTopWidth: 2 }}
      >
        <span
          className="w-2.5 h-2.5 rounded-sm"
          style={{ background: accent }}
          aria-hidden
        />
        <div className="font-display text-sm font-semibold flex-1 text-secondary-900 dark:text-secondary-50">
          {NODE_LABEL[node.type as NodeType]}
        </div>
      </div>

      {/* Validation issues */}
      {validationIssues.length > 0 && (
        <div className="px-5 py-3 border-b border-primary-200/20 dark:border-primary-500/10 bg-accent-50/40 dark:bg-accent-900/15">
          <div className="text-[10px] uppercase tracking-wider text-accent-700 dark:text-accent-400 font-semibold mb-1 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-3 h-3" />
            {validationIssues.length} issue{validationIssues.length === 1 ? '' : 's'}
          </div>
          <ul className="space-y-1 text-xs text-accent-700 dark:text-accent-300">
            {validationIssues.slice(0, 3).map((issue, i) => (
              <li key={i}>· {issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      <Section label="Label">
        <input
          type="text"
          className={inputCls}
          value={node.data.label}
          onChange={(e) => updateLabel(node.id, e.target.value)}
        />
      </Section>

      {node.type === 'llm-call' && (
        <>
          <Section label="Model">
            <div className="grid grid-cols-1 gap-2">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateConfig(node.id, { model: m.id })}
                  className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                    cfg.model === m.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-primary-200/30 dark:border-primary-500/20 hover:border-primary-400/60'
                  }`}
                >
                  <div className="text-xs text-secondary-900 dark:text-secondary-50 font-medium">
                    {m.name}
                  </div>
                  <div className="text-[10px] text-secondary-500 dark:text-secondary-400">
                    {m.cost}
                  </div>
                </button>
              ))}
            </div>
          </Section>
          <Section label="System prompt">
            <PromptNodeEditor
              templateId={cfg.promptTemplateId}
              freeformValue={cfg.system ?? ''}
              onFreeformChange={(v) => updateConfig(node.id, { system: v })}
              onTemplateBound={(id) => updateConfig(node.id, { promptTemplateId: id })}
              onTemplateUnbound={() => updateConfig(node.id, { promptTemplateId: undefined })}
              nodeId={node.id}
            />
          </Section>
          <Section label="Generation">
            <FieldRow
              label="Temperature"
              value={cfg.temperature ?? 0.3}
              onChange={(v) => updateConfig(node.id, { temperature: Number(v) })}
              type="number"
              step={0.1}
              min={0}
              max={2}
            />
            <FieldRow
              label="Max tokens"
              value={cfg.maxTokens ?? 1024}
              onChange={(v) => updateConfig(node.id, { maxTokens: Number(v) })}
              type="number"
              step={64}
              min={64}
              max={8192}
            />
          </Section>
        </>
      )}

      {node.type === 'vector-store-bedrock-kb' && (
        <Section label="Retrieval">
          <FieldRow
            label="Top K"
            value={cfg.topK ?? 5}
            onChange={(v) => updateConfig(node.id, { topK: Number(v) })}
            type="number"
            step={1}
            min={1}
            max={20}
          />
          <FieldRow
            label="KB ID (optional)"
            value={cfg.knowledgeBaseId ?? ''}
            onChange={(v) => updateConfig(node.id, { knowledgeBaseId: v })}
            placeholder="org default"
          />
          <button
            type="button"
            onClick={() => navigate('/agent-builder/knowledge-base')}
            className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/40 dark:border-primary-500/20 text-xs text-secondary-700 dark:text-secondary-200 hover:border-primary-400/60 hover:bg-light-bg-100/40 dark:hover:bg-dark-bg-200/40 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
            Manage knowledge base
          </button>
        </Section>
      )}

      {node.type === 'web-search' && (
        <Section label="Search">
          <FieldRow
            label="Static query"
            value={cfg.query ?? ''}
            onChange={(v) => updateConfig(node.id, { query: v })}
            placeholder="(use input.message)"
          />
          <FieldRow
            label="Max results"
            value={cfg.maxResults ?? 5}
            onChange={(v) => updateConfig(node.id, { maxResults: Number(v) })}
            type="number"
            step={1}
            min={1}
            max={20}
          />
        </Section>
      )}

      {node.type === 'if-else' && (
        <Section label="Predicate (simple)">
          <FieldRow
            label="Path"
            value={cfg.simple?.path ?? ''}
            onChange={(v) =>
              updateConfig(node.id, {
                simple: { ...(cfg.simple ?? {}), path: v },
              })
            }
            placeholder="confidence"
          />
          <div className="flex gap-2">
            <select
              className={inputCls}
              value={cfg.simple?.op ?? 'gte'}
              onChange={(e) =>
                updateConfig(node.id, {
                  simple: { ...(cfg.simple ?? {}), op: e.target.value },
                })
              }
            >
              {['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'truthy'].map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              className={inputCls}
              value={cfg.simple?.value ?? ''}
              onChange={(e) =>
                updateConfig(node.id, {
                  simple: { ...(cfg.simple ?? {}), value: e.target.value },
                })
              }
              placeholder="0.7"
            />
          </div>
          <div className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1">
            Edges labelled <code>true</code>/<code>false</code> route accordingly.
          </div>
        </Section>
      )}

      {node.type === 'checkpoint' && (
        <Section label="Pause behaviour">
          <FieldRow
            label="Reason"
            value={cfg.reason ?? ''}
            onChange={(v) => updateConfig(node.id, { reason: v })}
            placeholder="low_confidence"
          />
          <FieldRow
            label="Slack channel"
            value={cfg.notify?.slackChannel ?? ''}
            onChange={(v) =>
              updateConfig(node.id, {
                notify: { ...(cfg.notify ?? {}), slackChannel: v },
              })
            }
            placeholder="support-ops"
          />
          <FieldRow
            label="Timeout (s)"
            value={cfg.timeoutSeconds ?? 600}
            onChange={(v) => updateConfig(node.id, { timeoutSeconds: Number(v) })}
            type="number"
          />
        </Section>
      )}

      {node.type === 'response-output' && (
        <Section label="Reply template">
          <textarea
            className={`${inputCls} min-h-[80px] resize-none`}
            value={cfg.template ?? ''}
            onChange={(e) => updateConfig(node.id, { template: e.target.value })}
            placeholder="(passthrough — uses upstream .text)"
          />
          <div className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1">
            Use <code>{'{{ message }}'}</code> placeholders to interpolate inputs.
          </div>
        </Section>
      )}

      <Section label="Danger zone" tone="danger">
        <button
          type="button"
          onClick={() => removeNode(node.id)}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-danger-300/40 dark:border-danger-500/30 text-danger-600 dark:text-danger-400 hover:bg-danger-50/40 dark:hover:bg-danger-900/15 text-xs font-medium transition-colors"
        >
          <TrashIcon className="w-3.5 h-3.5" /> Remove this node
        </button>
      </Section>
    </aside>
  );
};

const Section: React.FC<{
  label: string;
  children: React.ReactNode;
  tone?: 'danger';
}> = ({ label, children, tone }) => (
  <section
    className={`px-5 py-4 border-b border-primary-200/20 dark:border-primary-500/10 space-y-2 ${
      tone === 'danger' ? 'mt-auto' : ''
    }`}
  >
    <div className="text-[10px] uppercase tracking-wider font-semibold text-secondary-500 dark:text-secondary-400">
      {label}
    </div>
    {children}
  </section>
);

const FieldRow: React.FC<{
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  step?: number;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, type = 'text', placeholder, step, min, max }) => (
  <label className="flex items-center gap-2 mb-1.5">
    <span className="text-[11px] text-secondary-600 dark:text-secondary-300 w-[100px] flex-shrink-0">
      {label}
    </span>
    <input
      type={type}
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  </label>
);

interface PromptNodeEditorProps {
  templateId?: string;
  freeformValue: string;
  onFreeformChange: (v: string) => void;
  onTemplateBound: (id: string) => void;
  onTemplateUnbound: () => void;
  nodeId: string;
}

const PromptNodeEditor: React.FC<PromptNodeEditorProps> = ({
  templateId,
  freeformValue,
  onFreeformChange,
  onTemplateBound,
  onTemplateUnbound,
  nodeId,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [boundContent, setBoundContent] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [bindError, setBindError] = useState<string | null>(null);
  const [bindLoading, setBindLoading] = useState(false);

  useEffect(() => {
    if (!templateId) {
      setBoundContent('');
      return;
    }
    let cancelled = false;
    PromptTemplateService.getTemplate(templateId)
      .then((t) => {
        if (!cancelled) setBoundContent(t.content ?? '');
      })
      .catch((e) =>
        setBindError(e instanceof Error ? e.message : 'Failed to load template'),
      );
    return () => {
      cancelled = true;
    };
  }, [templateId, refreshKey]);

  const bindNew = async () => {
    setBindLoading(true);
    setBindError(null);
    try {
      const created = await PromptTemplateService.createTemplate({
        name: `Agent prompt — ${nodeId.slice(0, 6)}`,
        content: freeformValue || 'You are a helpful assistant.',
        category: 'general',
      });
      onTemplateBound(created._id);
    } catch (e) {
      setBindError(e instanceof Error ? e.message : 'Failed to create template');
    } finally {
      setBindLoading(false);
    }
  };

  if (!templateId) {
    return (
      <>
        <textarea
          className="w-full rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-100 px-2 py-1.5 text-xs text-secondary-900 dark:text-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 min-h-[80px] resize-none"
          value={freeformValue}
          onChange={(e) => onFreeformChange(e.target.value)}
          placeholder="You are a helpful…"
        />
        <button
          type="button"
          onClick={bindNew}
          disabled={bindLoading}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/40 dark:border-primary-500/20 text-xs text-primary-700 dark:text-primary-300 hover:border-primary-400/60 hover:bg-primary-50/40 dark:hover:bg-primary-900/15 transition-colors disabled:opacity-50"
        >
          {bindLoading ? 'Saving…' : 'Save as versioned template'}
        </button>
        {bindError && (
          <div className="text-[11px] text-danger-600 dark:text-danger-400 mt-1">
            {bindError}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PromptEditor
        templateId={templateId}
        initialContent={boundContent}
        onSaved={() => setRefreshKey((k) => k + 1)}
        nodeId={nodeId}
      />
      <div className="flex items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={() => setShowHistory((s) => !s)}
          className="inline-flex items-center gap-1 text-[11px] text-primary-600 dark:text-primary-400 hover:underline"
        >
          <ClockIcon className="w-3 h-3" />
          {showHistory ? 'Hide versions' : 'View versions'}
        </button>
        <button
          type="button"
          onClick={onTemplateUnbound}
          className="text-[11px] text-secondary-500 dark:text-secondary-400 hover:underline"
        >
          Unbind
        </button>
      </div>
      {showHistory && (
        <div className="mt-2">
          <PromptVersionHistory
            templateId={templateId}
            refreshKey={refreshKey}
            onPinned={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      )}
    </>
  );
};

export default NodeConfigPanel;
