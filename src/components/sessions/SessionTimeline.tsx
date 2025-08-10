import React from 'react';
import { TraceNode } from '../../services/sessions.service';

interface SessionTimelineProps {
    nodes: TraceNode[];
    selectedNodeId?: string;
    onNodeClick?: (nodeId: string) => void;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
    nodes,
    selectedNodeId,
    onNodeClick
}) => {
    if (!nodes || nodes.length === 0) {
        return (
            <div className="p-4 text-gray-500 text-center">
                No trace data available
            </div>
        );
    }

    // Calculate timeline bounds
    const startTimes = nodes.map(n => new Date(n.start).getTime());
    const endTimes = nodes
        .filter(n => n.end)
        .map(n => new Date(n.end!).getTime());

    const minTime = Math.min(...startTimes);
    const maxTime = endTimes.length > 0
        ? Math.max(...endTimes)
        : Math.max(...startTimes) + 1000; // Add 1 second if no end times

    const totalDuration = maxTime - minTime;

    // Group nodes by depth for layout
    const nodesByDepth: Map<number, TraceNode[]> = new Map();
    nodes.forEach(node => {
        const depth = node.depth;
        if (!nodesByDepth.has(depth)) {
            nodesByDepth.set(depth, []);
        }
        nodesByDepth.get(depth)!.push(node);
    });

    const maxDepth = Math.max(...Array.from(nodesByDepth.keys()));

    return (
        <div className="p-4 bg-white rounded-lg shadow overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Session Timeline</h3>

            <div className="relative" style={{ minHeight: `${(maxDepth + 1) * 60}px` }}>
                {/* Time axis */}
                <div className="absolute left-0 right-0 top-0 h-8 border-b border-gray-300">
                    <div className="flex justify-between text-xs text-gray-500 px-2">
                        <span>0ms</span>
                        <span>{Math.round(totalDuration / 2)}ms</span>
                        <span>{Math.round(totalDuration)}ms</span>
                    </div>
                </div>

                {/* Render timeline bars */}
                {Array.from(nodesByDepth.entries()).map(([depth, depthNodes]) => (
                    <div key={depth} className="relative" style={{ top: `${40 + depth * 50}px` }}>
                        {depthNodes.map(node => {
                            const startOffset = new Date(node.start).getTime() - minTime;
                            const endTime = node.end ? new Date(node.end).getTime() : new Date(node.start).getTime() + 100;
                            const duration = endTime - new Date(node.start).getTime();

                            const leftPercent = (startOffset / totalDuration) * 100;
                            const widthPercent = (duration / totalDuration) * 100;

                            const isSelected = selectedNodeId === node.id;
                            const isError = node.status === 'error';

                            return (
                                <div
                                    key={node.id}
                                    className={`absolute h-8 rounded cursor-pointer transition-all hover:opacity-80 ${isError
                                            ? 'bg-red-500'
                                            : node.type === 'llm'
                                                ? 'bg-blue-500'
                                                : node.type === 'http'
                                                    ? 'bg-green-500'
                                                    : node.type === 'tool'
                                                        ? 'bg-purple-500'
                                                        : 'bg-gray-500'
                                        } ${isSelected ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`}
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: `${Math.max(widthPercent, 0.5)}%`,
                                        minWidth: '2px'
                                    }}
                                    onClick={() => onNodeClick?.(node.id)}
                                    title={`${node.label}\nDuration: ${node.duration || 0}ms\nStatus: ${node.status}`}
                                >
                                    <div className="px-1 py-1 text-white text-xs truncate">
                                        {node.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>HTTP</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>LLM</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Tool</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                    <span>Other</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Error</span>
                </div>
            </div>
        </div>
    );
};
