import React, { useCallback, useMemo, useRef } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAgentBuilderStore } from '../../../stores/agentBuilderStore';
import { NODE_COLOR, NODE_LABEL, NODE_TYPES } from '../nodes';
import { EDGE_TYPES } from '../edges';
import type { NodeType } from '../../../services/agentPlatform.service';

const InnerCanvas: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const flow = useReactFlow();

  const nodes = useAgentBuilderStore((s) => s.nodes);
  const edges = useAgentBuilderStore((s) => s.edges);
  const onNodesChange = useAgentBuilderStore((s) => s.applyNodeChanges);
  const onEdgesChange = useAgentBuilderStore((s) => s.applyEdgeChanges);
  const onConnect = useAgentBuilderStore((s) => s.connect);
  const addNode = useAgentBuilderStore((s) => s.addNode);
  const selectNode = useAgentBuilderStore((s) => s.selectNode);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;
      let parsed: { type: NodeType; name: string };
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }
      const bounds = ref.current?.getBoundingClientRect();
      const position = flow.screenToFlowPosition({
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      });
      addNode(parsed.type, parsed.name ?? NODE_LABEL[parsed.type], position);
    },
    [flow, addNode],
  );

  const decoratedEdges = useMemo(
    () =>
      edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const color = sourceNode ? NODE_COLOR[sourceNode.type as NodeType] : '#06ec9e';
        return {
          ...edge,
          type: edge.type ?? (edge.label ? 'labeled-branch' : 'default'),
          data: { ...(edge as { data?: Record<string, unknown> }).data, color },
        };
      }),
    [edges, nodes],
  );

  return (
    <div ref={ref} className="absolute inset-0 bg-light-bg-100 dark:bg-dark-bg-300">
      <ReactFlow
        nodes={nodes}
        edges={decoratedEdges}
        nodeTypes={NODE_TYPES as never}
        edgeTypes={EDGE_TYPES as never}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, n) => selectNode(n.id)}
        onPaneClick={() => selectNode(null)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'default' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          className="opacity-50"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          style={{ marginBottom: 16, marginLeft: 16 }}
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => NODE_COLOR[n.type as NodeType] ?? '#06ec9e'}
          nodeStrokeWidth={2}
          style={{ marginBottom: 16, marginRight: 16 }}
        />
      </ReactFlow>
    </div>
  );
};

const AgentCanvas: React.FC = () => (
  <ReactFlowProvider>
    <InnerCanvas />
  </ReactFlowProvider>
);

export default AgentCanvas;
