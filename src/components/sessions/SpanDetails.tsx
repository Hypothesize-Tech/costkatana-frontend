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
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Span Details</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Close details"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Basic Info */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 w-20">Name:</span>
                            <span className="text-sm font-medium flex-1">{node.label}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 w-20">Type:</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${node.type === 'llm' ? 'bg-blue-100 text-blue-700' :
                                node.type === 'http' ? 'bg-green-100 text-green-700' :
                                    node.type === 'tool' ? 'bg-purple-100 text-purple-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {node.type.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 w-20">Status:</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${node.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {node.status === 'ok' ? 'SUCCESS' : 'ERROR'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timing */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Timing
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 w-20">Started:</span>
                            <span className="text-sm">{formatDate(node.start)}</span>
                        </div>
                        {node.end && (
                            <div className="flex items-start gap-2">
                                <span className="text-sm text-gray-500 w-20">Ended:</span>
                                <span className="text-sm">{formatDate(node.end)}</span>
                            </div>
                        )}
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 w-20">Duration:</span>
                            <span className="text-sm font-medium">{formatDuration(node.duration)}</span>
                        </div>
                    </div>
                </div>

                {/* LLM Metrics */}
                {node.aiModel && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Cpu className="w-4 h-4" />
                            LLM Metrics
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-sm text-gray-500 w-20">Model:</span>
                                <span className="text-sm font-mono">{node.aiModel}</span>
                            </div>
                            {node.tokens && (
                                <>
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm text-gray-500 w-20">Input:</span>
                                        <span className="text-sm">{node.tokens.input.toLocaleString()} tokens</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm text-gray-500 w-20">Output:</span>
                                        <span className="text-sm">{node.tokens.output.toLocaleString()} tokens</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm text-gray-500 w-20">Total:</span>
                                        <span className="text-sm font-medium">
                                            {(node.tokens.input + node.tokens.output).toLocaleString()} tokens
                                        </span>
                                    </div>
                                </>
                            )}
                            {node.costUSD !== undefined && (
                                <div className="flex items-start gap-2">
                                    <span className="text-sm text-gray-500 w-20">Cost:</span>
                                    <span className="text-sm font-medium text-green-600">
                                        ${node.costUSD.toFixed(6)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {spanMessages.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Messages
                        </h4>
                        <div className="space-y-3">
                            {spanMessages.map(message => (
                                <div key={message.messageId} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${message.role === 'user' ? 'bg-blue-100 text-blue-700' :
                                            message.role === 'assistant' ? 'bg-green-100 text-green-700' :
                                                message.role === 'system' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-purple-100 text-purple-700'
                                            }`}>
                                            {message.role.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                        {message.contentPreview}
                                        {!message.fullContentStored && (
                                            <span className="text-gray-400 italic">... (truncated)</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        Additional Information
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 w-20">Trace ID:</span>
                            <span className="text-xs font-mono break-all">{node.id}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 w-20">Depth:</span>
                            <span className="text-sm">{node.depth}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
