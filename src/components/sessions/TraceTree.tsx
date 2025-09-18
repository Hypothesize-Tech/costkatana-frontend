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
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg transition-all duration-200 hover:scale-102 ${isSelected ? 'glass border border-primary-300/50 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20' : 'hover:bg-gradient-primary/5'
                        }`}
                    style={{ paddingLeft: `${level * 20 + 12}px` }}
                    onClick={() => onNodeSelect?.(node.id)}
                    onKeyDown={(e) => handleKeyDown(e, node.id)}
                    tabIndex={0}
                    role="treeitem"
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    aria-selected={isSelected}
                >
                    {hasChildren && (
                        <button
                            className="glass p-1 rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl hover:bg-gradient-primary/20 transition-all duration-200 hover:scale-110"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node.id);
                            }}
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-primary-600" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-primary-600" />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-6" />}

                    {isError && <AlertCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />}

                    <span className={`flex-1 font-body truncate ${isError ? 'text-danger-600' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                        {node.label}
                    </span>

                    <div className="flex items-center gap-3 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                        {node.duration !== undefined && (
                            <span className="flex items-center gap-1 glass px-2 py-1 rounded-full border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-accent-50/20 to-accent-100/20 dark:from-accent-900/10 dark:to-accent-800/10">
                                <Clock className="w-3 h-3 text-accent-500" />
                                {node.duration}ms
                            </span>
                        )}
                        {node.aiModel && (
                            <span className="flex items-center gap-1 glass px-2 py-1 rounded-full border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-primary-50/20 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/10">
                                <Cpu className="w-3 h-3 text-primary-500" />
                                {node.aiModel.split('/').pop()?.split('-').slice(0, 2).join('-')}
                            </span>
                        )}
                        {node.costUSD !== undefined && (
                            <span className="flex items-center gap-1 glass px-2 py-1 rounded-full border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-success-50/20 to-success-100/20 dark:from-success-900/10 dark:to-success-800/10">
                                <DollarSign className="w-3 h-3 text-success-500" />
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
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌳</span>
                </div>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                    No trace data available
                </p>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">🌳</span>
                </div>
                <h3 className="text-xl font-display font-bold gradient-text-secondary">Trace Tree</h3>
            </div>
            <div className="overflow-auto" role="tree" aria-label="Trace Tree">
                {treeData.map(root => renderNode(root))}
            </div>
        </div>
    );
};
