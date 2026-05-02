import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  CodeBracketSquareIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  MagnifyingGlassIcon,
  CircleStackIcon,
  ArrowPathRoundedSquareIcon,
  PauseCircleIcon,
  ArrowRightIcon,
  BookmarkIcon,
  PencilSquareIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import NodeShell from './NodeShell';
import type { NodeProps } from '@xyflow/react';
import type { NodeType } from '../../../services/agentPlatform.service';

/**
 * Per-category accent. We stay inside the CostKatana token system: emerald
 * primary for the most common nodes, slate / amber / sky for the rest. No
 * neon-on-noir.
 */
const ACCENT = {
  input:  { class: 'from-amber-500 to-orange-500',          color: '#f59e0b' }, // input
  llm:    { class: 'from-highlight-500 to-highlight-600',   color: '#0ea5e9' }, // sky
  tool:   { class: 'from-primary-500 to-emerald-500',       color: '#06ec9e' }, // emerald
  logic:  { class: 'from-violet-500 to-purple-500',         color: '#8b5cf6' }, // violet
  memory: { class: 'from-amber-400 to-yellow-500',          color: '#f59e0b' },
  human:  { class: 'from-rose-500 to-orange-500',           color: '#f43f5e' }, // checkpoint
  output: { class: 'from-secondary-500 to-secondary-600',   color: '#64748b' }, // slate
} as const;

type NodeData = { label: string; config: Record<string, unknown> };

export const UserMessageInputNode: React.FC<NodeProps> = ({ selected }) => (
  <NodeShell
    selected={!!selected}
    accentClass={ACCENT.input.class}
    accentColor={ACCENT.input.color}
    badge="INPUT"
    icon={<ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />}
    title="User message"
    hideLeft
    fields={[
      { label: 'trigger', value: 'on_chat_message' },
      { label: 'type', value: 'string' },
    ]}
  />
);

export const WebhookInputNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { method?: string; path?: string };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.input.class}
      accentColor={ACCENT.input.color}
      badge="INPUT"
      icon={<GlobeAltIcon className="w-3.5 h-3.5" />}
      title="Webhook"
      hideLeft
      fields={[
        { label: 'method', value: cfg?.method ?? 'POST' },
        { label: 'path', value: cfg?.path ?? '/hook' },
      ]}
    />
  );
};

export const LlmCallNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  const modelLabel = (cfg?.model ?? 'unset').split('.').pop() ?? cfg?.model ?? 'unset';
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.llm.class}
      accentColor={ACCENT.llm.color}
      badge="LLM"
      icon={<CubeTransparentIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'LLM Call'}
      fields={[
        { label: 'model', value: modelLabel },
        { label: 'temp', value: cfg?.temperature ?? 0.3 },
        { label: 'max', value: cfg?.maxTokens ?? 1024 },
      ]}
    />
  );
};

export const EmbedderNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { model?: string };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.llm.class}
      accentColor={ACCENT.llm.color}
      badge="LLM"
      icon={<CpuChipIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'Embedder'}
      fields={[{ label: 'model', value: cfg?.model ?? 'titan-embed-v2' }]}
    />
  );
};

export const WebSearchNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { maxResults?: number };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.tool.class}
      accentColor={ACCENT.tool.color}
      badge="TOOL"
      icon={<MagnifyingGlassIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'Web Search'}
      fields={[
        { label: 'provider', value: 'Google CSE' },
        { label: 'top_k', value: cfg?.maxResults ?? 5 },
      ]}
    />
  );
};

export const VectorStoreBedrockKbNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { topK?: number; knowledgeBaseId?: string };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.tool.class}
      accentColor={ACCENT.tool.color}
      badge="RAG"
      icon={<CircleStackIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'Bedrock KB'}
      fields={[
        { label: 'top_k', value: cfg?.topK ?? 5 },
        { label: 'kb', value: cfg?.knowledgeBaseId ?? 'org-default' },
      ]}
    />
  );
};

export const ApiCallNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { url?: string; method?: string };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.tool.class}
      accentColor={ACCENT.tool.color}
      badge="TOOL"
      icon={<CodeBracketSquareIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'API Call'}
      fields={[
        { label: 'method', value: cfg?.method ?? 'GET' },
        { label: 'url', value: cfg?.url?.replace(/^https?:\/\//, '') ?? 'unset' },
      ]}
    />
  );
};

export const IfElseNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as {
    simple?: { path?: string; op?: string; value?: unknown };
  };
  const expr = cfg?.simple
    ? `${cfg.simple.path} ${cfg.simple.op} ${cfg.simple.value ?? ''}`
    : 'predicate';
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.logic.class}
      accentColor={ACCENT.logic.color}
      badge="LOGIC"
      icon={<ArrowPathRoundedSquareIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'If / Else'}
      fields={[{ label: 'if', value: expr }]}
      rightHandles={[
        { id: 'true', label: 'true', offsetY: 16 },
        { id: 'false', label: 'false', offsetY: 50 },
      ]}
    />
  );
};

export const CheckpointNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as {
    reason?: string;
    notify?: { slackChannel?: string; email?: string };
    timeoutSeconds?: number;
  };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.human.class}
      accentColor={ACCENT.human.color}
      badge="HUMAN"
      icon={<PauseCircleIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'Checkpoint'}
      fields={[
        { label: 'reason', value: cfg?.reason ?? '—' },
        {
          label: 'notify',
          value: cfg?.notify?.slackChannel ?? cfg?.notify?.email ?? 'dashboard',
        },
        {
          label: 'timeout',
          value: cfg?.timeoutSeconds ? `${cfg.timeoutSeconds}s` : '—',
        },
      ]}
    />
  );
};

export const MemoryReadNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { key?: string };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.memory.class}
      accentColor={ACCENT.memory.color}
      badge="MEMORY"
      icon={<BookmarkIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'Memory Read'}
      fields={[{ label: 'key', value: cfg?.key ?? 'unset' }]}
    />
  );
};

export const MemoryWriteNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { key?: string; ttlSeconds?: number };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.memory.class}
      accentColor={ACCENT.memory.color}
      badge="MEMORY"
      icon={<PencilSquareIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'Memory Write'}
      fields={[
        { label: 'key', value: cfg?.key ?? 'unset' },
        { label: 'ttl', value: cfg?.ttlSeconds ? `${cfg.ttlSeconds}s` : '∞' },
      ]}
    />
  );
};

export const ResponseOutputNode: React.FC<NodeProps> = ({ selected, data }) => {
  const cfg = (data as NodeData).config as { template?: string };
  return (
    <NodeShell
      selected={!!selected}
      accentClass={ACCENT.output.class}
      accentColor={ACCENT.output.color}
      badge="OUTPUT"
      icon={<ArrowRightIcon className="w-3.5 h-3.5" />}
      title={(data as NodeData).label || 'Response'}
      hideRight
      fields={[
        { label: 'template', value: cfg?.template ? '(custom)' : '(passthrough)' },
      ]}
    />
  );
};

export const NODE_TYPES: Record<NodeType, React.FC<NodeProps>> = {
  'user-message-input': UserMessageInputNode,
  'webhook-input': WebhookInputNode,
  'llm-call': LlmCallNode,
  embedder: EmbedderNode,
  'web-search': WebSearchNode,
  'vector-store-bedrock-kb': VectorStoreBedrockKbNode,
  'api-call': ApiCallNode,
  'if-else': IfElseNode,
  checkpoint: CheckpointNode,
  'memory-read': MemoryReadNode,
  'memory-write': MemoryWriteNode,
  'response-output': ResponseOutputNode,
};

/** Hex value used by edge color decoration. Mirrors `ACCENT[*].color`. */
export const NODE_COLOR: Record<NodeType, string> = {
  'user-message-input': ACCENT.input.color,
  'webhook-input': ACCENT.input.color,
  'llm-call': ACCENT.llm.color,
  embedder: ACCENT.llm.color,
  'web-search': ACCENT.tool.color,
  'vector-store-bedrock-kb': ACCENT.tool.color,
  'api-call': ACCENT.tool.color,
  'if-else': ACCENT.logic.color,
  checkpoint: ACCENT.human.color,
  'memory-read': ACCENT.memory.color,
  'memory-write': ACCENT.memory.color,
  'response-output': ACCENT.output.color,
};

export const NODE_LABEL: Record<NodeType, string> = {
  'user-message-input': 'User message',
  'webhook-input': 'Webhook',
  'llm-call': 'LLM call',
  embedder: 'Embedder',
  'web-search': 'Web search',
  'vector-store-bedrock-kb': 'Knowledge base',
  'api-call': 'API call',
  'if-else': 'If / else',
  checkpoint: 'Checkpoint',
  'memory-read': 'Memory read',
  'memory-write': 'Memory write',
  'response-output': 'Response',
};
