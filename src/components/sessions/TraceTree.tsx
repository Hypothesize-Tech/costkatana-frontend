import React, { useState, useEffect } from 'react';
import { TraceNode, TraceEdge } from '../../services/sessions.service';
import { ChevronRight, ChevronDown, AlertCircle, Clock, Cpu, DollarSign } from 'lucide-react';

interface TraceTreeProps {
    nodes: TraceNode[];
    edges: TraceEdge[];
    selectedNodeId?: string;
    onNodeSelect?: (nodeId: string) => void;
}

interface TreeNode extends TraceNode {
    children: TreeNode[];
}

export const TraceTree: React.FC<TraceTreeProps> = ({
    nodes,
    edges,
    selectedNodeId,
    onNodeSelect
}) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [treeData, setTreeData] = useState<TreeNode[]>([]);

    useEffect(() => {
        // Build tree structure from flat nodes and edges
        const nodeMap = new Map<string, TreeNode>();

        // Initialize all nodes
        nodes.forEach(node => {
            nodeMap.set(node.id, { ...node, children: [] });
        });

        // Build parent-child relationships
        edges.forEach(edge => {
            const parent = nodeMap.get(edge.from);
            const child = nodeMap.get(edge.to);
            if (parent && child) {
                parent.children.push(child);
            }
        });

        // Find root nodes (nodes without parents)
        const rootNodes: TreeNode[] = [];
        nodes.forEach(node => {
            const hasParent = edges.some(edge => edge.to === node.id);
            if (!hasParent) {
                const treeNode = nodeMap.get(node.id);
                if (treeNode) {
                    rootNodes.push(treeNode);
                }
            }
        });

        // Sort children by start time
        const sortChildren = (node: TreeNode) => {
            node.children.sort((a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime()
            );
            node.children.forEach(sortChildren);
        };
        rootNodes.forEach(sortChildren);

        setTreeData(rootNodes);

        // Expand all nodes by default
        setExpandedNodes(new Set(nodes.map(n => n.id)));
    }, [nodes, edges]);

    const toggleExpand = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const handleKeyDown = (e: React.KeyboardEvent, nodeId: string) => {
        if (e.key === 'Enter') {
            onNodeSelect?.(nodeId);
        } else if (e.key === ' ') {
            e.preventDefault();
            toggleExpand(nodeId);
        }
    };

    const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children.length > 0;
        const isSelected = selectedNodeId === node.id;
        const isError = node.status === 'error';

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded ${isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                        }`}
                    style={{ paddingLeft: `${level * 20 + 8}px` }}
                    onClick={() => onNodeSelect?.(node.id)}
                    onKeyDown={(e) => handleKeyDown(e, node.id)}
                    tabIndex={0}
                    role="treeitem"
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    aria-selected={isSelected}
                >
                    {hasChildren && (
                        <button
                            className="p-0.5 hover:bg-gray-200 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node.id);
                            }}
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-5" />}

                    {isError && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}

                    <span className={`flex-1 text-sm truncate ${isError ? 'text-red-600' : ''}`}>
                        {node.label}
                    </span>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {node.duration !== undefined && (
                            <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {node.duration}ms
                            </span>
                        )}
                        {node.aiModel && (
                            <span className="flex items-center gap-0.5">
                                <Cpu className="w-3 h-3" />
                                {node.aiModel.split('/').pop()?.split('-').slice(0, 2).join('-')}
                            </span>
                        )}
                        {node.costUSD !== undefined && (
                            <span className="flex items-center gap-0.5">
                                <DollarSign className="w-3 h-3" />
                                ${node.costUSD.toFixed(4)}
                            </span>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div role="group">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (treeData.length === 0) {
        return (
            <div className="p-4 text-gray-500 text-center">
                No trace data available
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Trace Tree</h3>
            <div className="overflow-auto" role="tree" aria-label="Trace Tree">
                {treeData.map(root => renderNode(root))}
            </div>
        </div>
    );
};
