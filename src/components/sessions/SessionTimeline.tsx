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
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                    No trace data available
                </p>
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
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-x-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">⏱️</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-primary">Session Timeline</h3>
            </div>

            <div className="relative" style={{ minHeight: `${(maxDepth + 1) * 60}px` }}>
                {/* Time axis */}
                <div className="absolute left-0 right-0 top-0 h-8 border-b border-primary-200/30">
                    <div className="flex justify-between font-body text-light-text-secondary dark:text-dark-text-secondary px-2 text-sm">
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
                                    className={`absolute h-8 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${isError
                                        ? 'bg-gradient-danger shadow-lg'
                                        : node.type === 'llm'
                                            ? 'bg-gradient-primary shadow-lg'
                                            : node.type === 'http'
                                                ? 'bg-gradient-success shadow-lg'
                                                : node.type === 'tool'
                                                    ? 'bg-gradient-secondary shadow-lg'
                                                    : 'bg-gradient-accent shadow-lg'
                                        } ${isSelected ? 'ring-2 ring-offset-2 ring-primary-500 shadow-xl' : ''}`}
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: `${Math.max(widthPercent, 0.5)}%`,
                                        minWidth: '2px'
                                    }}
                                    onClick={() => onNodeClick?.(node.id)}
                                    title={`${node.label}\nDuration: ${node.duration || 0}ms\nStatus: ${node.status}`}
                                >
                                    <div className="px-2 py-1 text-white font-body text-xs truncate">
                                        {node.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-primary-200/30">
                <h4 className="font-display font-semibold gradient-text-secondary mb-4">Legend</h4>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-success rounded-lg shadow-lg"></div>
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">HTTP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-primary rounded-lg shadow-lg"></div>
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">LLM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-secondary rounded-lg shadow-lg"></div>
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">Tool</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-accent rounded-lg shadow-lg"></div>
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">Other</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-danger rounded-lg shadow-lg"></div>
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">Error</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
