import React from 'react';
import { TraceNode, Message } from '../../services/sessions.service';
import { X, Clock, Cpu, Hash, MessageSquare } from 'lucide-react';

interface SpanDetailsProps {
    node: TraceNode | null;
    messages: Message[];
    onClose: () => void;
}

export const SpanDetails: React.FC<SpanDetailsProps> = ({
    node,
    messages,
    onClose
}) => {
    if (!node) {
        return null;
    }

    const spanMessages = messages.filter(m => m.traceId === node.id);
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString();
    };

    const formatDuration = (ms?: number) => {
        if (ms === undefined) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${(ms / 60000).toFixed(2)}m`;
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 glass border-l border-primary-200/30 shadow-2xl backdrop-blur-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-200/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
                        <span className="text-white text-sm">🔍</span>
                    </div>
                    <h3 className="text-xl font-display font-bold gradient-text">Span Details</h3>
                </div>
                <button
                    onClick={onClose}
                    className="btn-icon-secondary"
                    aria-label="Close details"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Basic Info */}
                <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                    <h4 className="font-display font-semibold gradient-text mb-4">Basic Information</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Name:</span>
                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary flex-1">{node.label}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Type:</span>
                            <span className={`glass px-3 py-1 rounded-full font-display font-semibold border ${node.type === 'llm' ? 'border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300' :
                                node.type === 'http' ? 'border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300' :
                                    node.type === 'tool' ? 'border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300' :
                                        'border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300'
                                }`}>
                                {node.type.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Status:</span>
                            <span className={`glass px-3 py-1 rounded-full font-display font-semibold border ${node.status === 'ok' ? 'border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300' : 'border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300'
                                }`}>
                                {node.status === 'ok' ? 'SUCCESS' : 'ERROR'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timing */}
                <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
                    <h4 className="font-display font-semibold gradient-text-accent mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Timing
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Started:</span>
                            <span className="font-body text-light-text-primary dark:text-dark-text-primary">{formatDate(node.start)}</span>
                        </div>
                        {node.end && (
                            <div className="flex items-start gap-3">
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Ended:</span>
                                <span className="font-body text-light-text-primary dark:text-dark-text-primary">{formatDate(node.end)}</span>
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Duration:</span>
                            <span className="font-display font-semibold gradient-text-accent">{formatDuration(node.duration)}</span>
                        </div>
                    </div>
                </div>

                {/* LLM Metrics */}
                {node.aiModel && (
                    <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                        <h4 className="font-display font-semibold gradient-text-secondary mb-4 flex items-center gap-2">
                            <Cpu className="w-5 h-5" />
                            LLM Metrics
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Model:</span>
                                <span className="font-mono text-light-text-primary dark:text-dark-text-primary">{node.aiModel}</span>
                            </div>
                            {node.tokens && (
                                <>
                                    <div className="flex items-start gap-3">
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Input:</span>
                                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">{node.tokens.input.toLocaleString()} tokens</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Output:</span>
                                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">{node.tokens.output.toLocaleString()} tokens</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Total:</span>
                                        <span className="font-display font-semibold gradient-text-secondary">
                                            {(node.tokens.input + node.tokens.output).toLocaleString()} tokens
                                        </span>
                                    </div>
                                </>
                            )}
                            {node.costUSD !== undefined && (
                                <div className="flex items-start gap-3">
                                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Cost:</span>
                                    <span className="font-display font-semibold gradient-text-success">
                                        ${node.costUSD.toFixed(6)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {spanMessages.length > 0 && (
                    <div className="glass rounded-xl p-6 border border-warning-200/30 shadow-lg backdrop-blur-xl">
                        <h4 className="font-display font-semibold gradient-text-warning mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Messages
                        </h4>
                        <div className="space-y-4">
                            {spanMessages.map(message => (
                                <div key={message.messageId} className="glass rounded-lg p-4 border border-primary-200/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`glass px-3 py-1 rounded-full font-display font-semibold border ${message.role === 'user' ? 'border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300' :
                                            message.role === 'assistant' ? 'border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300' :
                                                message.role === 'system' ? 'border-warning-200/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                                    'border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300'
                                            }`}>
                                            {message.role.toUpperCase()}
                                        </span>
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="font-body text-light-text-primary dark:text-dark-text-primary whitespace-pre-wrap break-words">
                                        {message.contentPreview}
                                        {!message.fullContentStored && (
                                            <span className="text-light-text-secondary dark:text-dark-text-secondary italic">... (truncated)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div className="glass rounded-xl p-6 border border-info-200/30 shadow-lg backdrop-blur-xl">
                    <h4 className="font-display font-semibold gradient-text mb-4 flex items-center gap-2">
                        <Hash className="w-5 h-5" />
                        Additional Information
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Trace ID:</span>
                            <span className="font-mono text-light-text-primary dark:text-dark-text-primary text-sm break-all">{node.id}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary w-20">Depth:</span>
                            <span className="font-display font-semibold gradient-text">{node.depth}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
