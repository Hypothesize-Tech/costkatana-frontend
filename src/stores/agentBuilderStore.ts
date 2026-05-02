import { create } from 'zustand';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import type {
  AgentDag,
  DagEdge,
  DagNode,
  DagValidationIssue,
  NodeType,
} from '../services/agentPlatform.service';

/**
 * Single source of truth for the canvas. Bridges xyflow's Node/Edge shape
 * with the backend's DagNode/DagEdge by using the same fields plus a few
 * xyflow-only helpers (`selected`, etc.).
 */

export type CanvasNode = DagNode & {
  selected?: boolean;
  dragging?: boolean;
};
export type CanvasEdge = DagEdge & {
  type?: 'default' | 'labeled-branch';
  selected?: boolean;
  animated?: boolean;
};

interface AgentBuilderState {
  agentId: string | null;
  agentVersionId: string | null;
  versionNumber: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeId: string | null;
  dirty: boolean;
  validationIssues: DagValidationIssue[];
  lastSavedAt: number | null;

  // Actions
  hydrateFromVersion(input: {
    agentId: string;
    agentVersionId: string;
    versionNumber: number;
    dag: AgentDag;
  }): void;
  setNodes(updater: (nodes: CanvasNode[]) => CanvasNode[]): void;
  setEdges(updater: (edges: CanvasEdge[]) => CanvasEdge[]): void;
  applyNodeChanges(changes: NodeChange[]): void;
  applyEdgeChanges(changes: EdgeChange[]): void;
  connect(connection: Connection): void;
  addNode(type: NodeType, label: string, position: { x: number; y: number }): void;
  removeNode(nodeId: string): void;
  selectNode(nodeId: string | null): void;
  updateNodeConfig(nodeId: string, patch: Record<string, unknown>): void;
  updateNodeLabel(nodeId: string, label: string): void;
  setValidationIssues(issues: DagValidationIssue[]): void;
  markSaved(versionId: string, versionNumber: number): void;
  reset(): void;
  toDag(): AgentDag;
}

const newId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).substring(2, 8)}`;

const DEFAULT_CONFIG: Partial<Record<NodeType, Record<string, unknown>>> = {
  'llm-call': {
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    temperature: 0.3,
    maxTokens: 1024,
  },
  'vector-store-bedrock-kb': { topK: 5 },
  'web-search': { maxResults: 5 },
  'if-else': { simple: { path: 'confidence', op: 'gte', value: 0.7 } },
  checkpoint: { reason: 'human_review', timeoutSeconds: 600 },
};

export const useAgentBuilderStore = create<AgentBuilderState>((set, get) => ({
  agentId: null,
  agentVersionId: null,
  versionNumber: 0,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  dirty: false,
  validationIssues: [],
  lastSavedAt: null,

  hydrateFromVersion: ({ agentId, agentVersionId, versionNumber, dag }) =>
    set({
      agentId,
      agentVersionId,
      versionNumber,
      nodes: (dag.nodes ?? []) as CanvasNode[],
      edges: ((dag.edges ?? []) as CanvasEdge[]).map((e) => ({
        type: e.label ? 'labeled-branch' : 'default',
        ...e,
      })),
      dirty: false,
      validationIssues: [],
      selectedNodeId: null,
      lastSavedAt: Date.now(),
    }),

  setNodes: (updater) =>
    set((state) => ({ nodes: updater(state.nodes), dirty: true })),

  setEdges: (updater) =>
    set((state) => ({ edges: updater(state.edges), dirty: true })),

  applyNodeChanges: (changes) =>
    set((state) => {
      const updated = applyNodeChanges(
        changes,
        state.nodes as unknown as never[],
      ) as unknown as CanvasNode[];
      const hasMeaningfulChange = changes.some(
        (c) => c.type !== 'select' && c.type !== 'dimensions',
      );
      // Track selection separately to avoid spamming dirty=true on click.
      const selectChange = changes.find((c) => c.type === 'select');
      let selectedNodeId = state.selectedNodeId;
      if (selectChange && 'selected' in selectChange) {
        selectedNodeId = selectChange.selected ? selectChange.id : null;
      }
      return {
        nodes: updated,
        selectedNodeId,
        dirty: state.dirty || hasMeaningfulChange,
      };
    }),

  applyEdgeChanges: (changes) =>
    set((state) => {
      const updated = applyEdgeChanges(
        changes,
        state.edges as unknown as never[],
      ) as unknown as CanvasEdge[];
      const hasMeaningfulChange = changes.some((c) => c.type !== 'select');
      return {
        edges: updated,
        dirty: state.dirty || hasMeaningfulChange,
      };
    }),

  connect: (connection) =>
    set((state) => {
      if (!connection.source || !connection.target) return state;
      const newEdge: CanvasEdge = {
        id: newId('e'),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: 'default',
      };
      return {
        edges: addEdge(newEdge as never, state.edges as never[]) as unknown as CanvasEdge[],
        dirty: true,
      };
    }),

  addNode: (type, label, position) =>
    set((state) => {
      const node: CanvasNode = {
        id: newId('n'),
        type,
        position,
        data: {
          label,
          config: { ...(DEFAULT_CONFIG[type] ?? {}) },
        },
      };
      return { nodes: [...state.nodes, node], dirty: true };
    }),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId:
        state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      dirty: true,
    })),

  selectNode: (nodeId) =>
    set((state) => ({
      selectedNodeId: nodeId,
      nodes: state.nodes.map((n) => ({ ...n, selected: n.id === nodeId })),
    })),

  updateNodeConfig: (nodeId, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...patch } } }
          : n,
      ),
      dirty: true,
    })),

  updateNodeLabel: (nodeId, label) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
      ),
      dirty: true,
    })),

  setValidationIssues: (issues) => set({ validationIssues: issues }),

  markSaved: (versionId, versionNumber) =>
    set({
      agentVersionId: versionId,
      versionNumber,
      dirty: false,
      lastSavedAt: Date.now(),
    }),

  reset: () =>
    set({
      agentId: null,
      agentVersionId: null,
      versionNumber: 0,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      dirty: false,
      validationIssues: [],
      lastSavedAt: null,
    }),

  toDag: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: { label: n.data.label, config: n.data.config },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: e.targetHandle ?? null,
      })),
    };
  },
}));
