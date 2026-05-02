import { apiClient, longRunningApiClient, API_BASE_URL } from '../config/api';

// ───────────────────────── Types ─────────────────────────

export type NodeType =
  | 'user-message-input'
  | 'webhook-input'
  | 'llm-call'
  | 'embedder'
  | 'web-search'
  | 'vector-store-bedrock-kb'
  | 'api-call'
  | 'if-else'
  | 'checkpoint'
  | 'memory-read'
  | 'memory-write'
  | 'response-output';

export interface DagNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: { label: string; config: Record<string, unknown> };
}

export interface DagEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface AgentDag {
  nodes: DagNode[];
  edges: DagEdge[];
}

export interface DagValidationIssue {
  nodeId?: string;
  edgeId?: string;
  code: string;
  message: string;
}

export interface AgentDefinition {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  templateSourceSlug?: string;
  currentVersionId?: string;
  costEstimate?: { perRunUsd?: number; lastEstimatedAt?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentVersion {
  _id: string;
  agentDefinitionId: string;
  versionNumber: number;
  dag: AgentDag;
  compiledPlan?: unknown;
  entryNodeId?: string;
  terminalNodeIds: string[];
  publishedAt?: string;
  changelog: string;
}

export interface AgentTemplate {
  _id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  dag: AgentDag;
  requiredCapabilities: string[];
  isOfficial: boolean;
  clonedCount: number;
}

export type AgentRunStatus =
  | 'queued' | 'running' | 'paused_checkpoint'
  | 'succeeded' | 'failed' | 'cancelled';

export interface AgentRun {
  _id: string;
  agentDefinitionId: string;
  agentVersionId: string;
  status: AgentRunStatus;
  mode: 'test' | 'live';
  input: unknown;
  output?: unknown;
  error?: { message: string; nodeId?: string };
  tokens: { in: number; out: number };
  costUsd: number;
  startedAt: string;
  endedAt?: string;
  pausedAt?: string;
  currentNodeId?: string;
}

export interface AgentRunStep {
  _id: string;
  agentRunId: string;
  nodeId: string;
  nodeType: NodeType | string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'paused';
  input: unknown;
  output?: unknown;
  error?: { message: string };
  tokens: { in: number; out: number };
  costUsd: number;
  latencyMs: number;
  startedAt: string;
  endedAt?: string;
  traceMeta?: Record<string, unknown>;
}

export interface AgentDeployment {
  _id: string;
  agentDefinitionId: string;
  agentVersionId: string;
  channel: 'embed-widget' | 'api' | 'webhook' | 'slack' | 'discord' | 'whatsapp' | 'voice';
  status: 'active' | 'paused';
  publicId: string;
  originAllowlist: string[];
  rateLimit: { perMinPerIp?: number; perMinPerSession?: number };
  theme: { primary?: string; surface?: string; position?: string; logoUrl?: string };
  welcomeMessage: string;
  lastDeployedAt: string;
}

// ───────────────────────── Service ─────────────────────────

const PATH = '/agent-platform';

export const agentPlatformService = {
  listTemplates: async (): Promise<AgentTemplate[]> => {
    const { data } = await apiClient.get(`${PATH}/templates`);
    return data?.items ?? [];
  },

  listAgents: async (filter?: { projectId?: string; status?: string }): Promise<AgentDefinition[]> => {
    const { data } = await apiClient.get(`${PATH}/agents`, { params: filter });
    return data?.items ?? [];
  },

  getAgent: async (
    id: string,
  ): Promise<{ agent: AgentDefinition; currentVersion: AgentVersion | null }> => {
    const { data } = await apiClient.get(`${PATH}/agents/${id}`);
    return { agent: data.agent, currentVersion: data.currentVersion ?? null };
  },

  createAgent: async (body: {
    name: string;
    description?: string;
    templateSlug?: string;
    projectId?: string;
  }): Promise<{ agent: AgentDefinition; version: AgentVersion }> => {
    const { data } = await apiClient.post(`${PATH}/agents`, body);
    return { agent: data.agent, version: data.version };
  },

  updateAgent: async (
    id: string,
    patch: Partial<Pick<AgentDefinition, 'name' | 'description' | 'tags' | 'status'>>,
  ): Promise<AgentDefinition> => {
    const { data } = await apiClient.patch(`${PATH}/agents/${id}`, patch);
    return data.agent;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`${PATH}/agents/${id}`);
  },

  saveDag: async (
    id: string,
    dag: AgentDag,
    changelog?: string,
  ): Promise<{ version: AgentVersion; validation: { ok: boolean; issues: DagValidationIssue[] } }> => {
    const { data } = await apiClient.put(`${PATH}/agents/${id}/dag`, { dag, changelog });
    return { version: data.version, validation: data.validation };
  },

  publishVersion: async (
    id: string,
    versionId: string,
    changelog?: string,
  ): Promise<{ agent: AgentDefinition; version: AgentVersion }> => {
    const { data } = await apiClient.post(`${PATH}/agents/${id}/publish`, { versionId, changelog });
    return { agent: data.agent, version: data.version };
  },

  testRun: async (
    id: string,
    input: unknown,
    dag?: AgentDag,
  ): Promise<{ runId: string; streamUrl: string }> => {
    const { data } = await longRunningApiClient.post(`${PATH}/agents/${id}/test-run`, { input, dag });
    return { runId: data.runId, streamUrl: data.streamUrl };
  },

  resumeRun: async (runId: string, checkpointResponse: unknown): Promise<void> => {
    await apiClient.post(`${PATH}/runs/${runId}/resume`, { checkpointResponse });
  },

  textToAgent: async (description: string): Promise<{
    dag: AgentDag;
    validation: { ok: boolean; issues: DagValidationIssue[] };
    suggestedName: string;
  }> => {
    const { data } = await longRunningApiClient.post(`${PATH}/text-to-agent`, { description });
    return data;
  },

  // Knowledge base
  uploadKbDocuments: async (
    files: File[],
  ): Promise<{
    kbId: string;
    status: 'pending' | 'ready' | 'failed';
    documentCount: number;
    chunkCount: number;
    uploadedKeys: string[];
    errors?: Array<{ filename: string; message: string }>;
  }> => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f, f.name));
    const { data } = await longRunningApiClient.post(
      `${PATH}/kb/upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 },
    );
    return data;
  },

  getKbStatus: async (): Promise<{
    kb: {
      _id: string;
      status: 'pending' | 'ready' | 'failed';
      documentCount: number;
      s3Bucket: string;
      s3PrefixRoot: string;
      embeddingModel: string;
      lastError?: { message: string; at: string };
    } | null;
    chunkCount: number;
    documents: Array<{ docId: string; source: string; chunks: number }>;
  }> => {
    const { data } = await apiClient.get(`${PATH}/kb/status`);
    return data;
  },

  getKbDocumentChunks: async (docId: string): Promise<Array<{ ordinal: number; text: string }>> => {
    const { data } = await apiClient.get(`${PATH}/kb/documents/${docId}/chunks`);
    return data?.chunks ?? [];
  },

  deleteKbDocument: async (docId: string): Promise<{ deleted: number }> => {
    const { data } = await apiClient.delete(`${PATH}/kb/documents/${docId}`);
    return data;
  },

  // Deployments
  listDeployments: async (agentId?: string): Promise<AgentDeployment[]> => {
    const { data } = await apiClient.get(`${PATH}/deployments`, { params: { agentId } });
    return data?.items ?? [];
  },

  createDeployment: async (body: {
    agentId: string;
    versionId: string;
    channel: 'embed-widget' | 'api' | 'webhook';
    originAllowlist?: string[];
    rateLimit?: { perMinPerIp?: number; perMinPerSession?: number };
    theme?: { primary?: string; surface?: string; position?: string; logoUrl?: string };
    welcomeMessage?: string;
  }): Promise<AgentDeployment> => {
    const { data } = await apiClient.post(`${PATH}/deployments`, body);
    return data.deployment;
  },

  updateDeployment: async (
    id: string,
    patch: Partial<{
      originAllowlist: string[];
      rateLimit: { perMinPerIp?: number; perMinPerSession?: number };
      theme: { primary?: string; surface?: string; position?: string; logoUrl?: string };
      welcomeMessage: string;
      status: 'active' | 'paused';
    }>,
  ): Promise<AgentDeployment> => {
    const { data } = await apiClient.patch(`${PATH}/deployments/${id}`, patch);
    return data.deployment;
  },
};

// ───────────────────────── SSE helper ─────────────────────────

type SseEvent =
  | { type: 'step.start'; data: { runId: string; nodeId: string; nodeType: string; input: unknown } }
  | { type: 'step.end'; data: { runId: string; nodeId: string; nodeType: string; output: unknown; tokens?: { in: number; out: number }; costUsd?: number; latencyMs?: number } }
  | { type: 'paused'; data: { runId: string; nodeId: string; reason?: string; payload?: unknown } }
  | { type: 'run.end'; data: { runId: string; output: unknown; tokens?: { in: number; out: number }; costUsd?: number } }
  | { type: 'run.error'; data: { runId: string; nodeId?: string; error?: { message: string } } };

/**
 * Subscribe to a run's SSE stream. Returns an unsubscribe function.
 * Routes to the same domain as `apiClient` (cookies sent automatically).
 */
export function subscribeToRun(
  runId: string,
  handlers: Partial<Record<SseEvent['type'], (data: SseEvent['data']) => void>>,
): () => void {
  const url = `${API_BASE_URL}/api/agent-platform/runs/${runId}/stream`;
  const source = new EventSource(url, { withCredentials: true });

  const wireHandler = (type: SseEvent['type']) => {
    if (!handlers[type]) return;
    source.addEventListener(type, (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        handlers[type]!(payload);
      } catch {
        /* ignore malformed events */
      }
    });
  };

  (['step.start', 'step.end', 'paused', 'run.end', 'run.error'] as const).forEach(wireHandler);

  source.onerror = () => {
    // Browser auto-reconnects; surface terminal errors via the `run.error`
    // event the server sends explicitly.
  };

  return () => source.close();
}
