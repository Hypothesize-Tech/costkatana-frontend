import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    FiX, FiInfo, FiCode, FiAlertCircle, FiClock, FiDollarSign,
    FiCpu, FiActivity, FiCopy, FiCheck
} from 'react-icons/fi';

interface LogDetailsProps {
    log: any;
    onClose: () => void;
}

export const LogDetails: React.FC<LogDetailsProps> = ({ log, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'response' | 'raw'>('overview');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const CopyButton = ({ text, field }: { text: string; field: string }) => (
        <button
            onClick={() => copyToClipboard(text, field)}
            className="p-1.5 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300"
            title="Copy to clipboard"
        >
            {copiedField === field ? (
                <FiCheck className="w-4 h-4 text-success-500 glow-success" />
            ) : (
                <FiCopy className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            )}
        </button>
    );

    const DetailRow = ({ label, value, copyable }: { label: string; value: any; copyable?: boolean }) => (
        <div className="flex items-start justify-between py-3 border-b border-primary-200/30 dark:border-primary-500/20 last:border-0">
            <span className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary min-w-[140px]">
                {label}
            </span>
            <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary text-right break-all">
                    {value}
                </span>
                {copyable && <CopyButton text={String(value)} field={label} />}
            </div>
        </div>
    );

    const CodeBlock = ({ code, language = 'json' }: { code: string; language?: string }) => (
        <div className="relative group">
            <div className="absolute top-3 right-3 z-10">
                <CopyButton text={code} field={`code-${language}`} />
            </div>
            <pre className="p-4 bg-slate-900 dark:bg-black rounded-lg overflow-x-auto text-sm">
                <code className="text-slate-100 font-mono">
                    {code}
                </code>
            </pre>
        </div>
    );

    const formatJson = (obj: any) => {
        try {
            return JSON.stringify(obj, null, 2);
        } catch {
            return String(obj);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="absolute inset-y-0 right-0 max-w-4xl w-full flex">
                <div className="relative w-full card shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent">
                        <div>
                            <h2 className="text-xl font-bold gradient-text-primary">
                                Log Details
                            </h2>
                            <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                {log.aiModel || log.model} • {log.service}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300"
                        >
                            <FiX className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary" />
                        </button>
                    </div>

                    {/* Status Banner */}
                    <div className={`px-6 py-3 border-b border-primary-200/30 dark:border-primary-500/20 ${log.success
                        ? 'bg-gradient-to-r from-success-50 to-transparent dark:from-success-900/20 dark:to-transparent'
                        : 'bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20 dark:to-transparent'
                        }`}>
                        <div className="flex items-center gap-3">
                            {log.success ? (
                                <FiCheck className="w-5 h-5 text-success-600 dark:text-success-400 glow-success" />
                            ) : (
                                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 glow-danger" />
                            )}
                            <div className="flex-1">
                                <p className={`text-sm font-bold ${log.success
                                    ? 'text-success-700 dark:text-success-300'
                                    : 'text-red-700 dark:text-red-300'
                                    }`}>
                                    {log.success ? 'Success' : 'Failed'}
                                </p>
                                <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                    {format(new Date(log.timestamp), 'PPpp')}
                                </p>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <FiClock className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{log.responseTime}ms</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FiCpu className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{log.totalTokens || (log.inputTokens + log.outputTokens)} tokens</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FiDollarSign className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                    <span className="font-bold gradient-text-primary">${log.cost?.toFixed(4) || '0.0000'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/30 to-transparent dark:from-primary-900/10 dark:to-transparent">
                        {[
                            { id: 'overview', label: 'Overview', icon: FiInfo },
                            { id: 'request', label: 'Request', icon: FiActivity },
                            { id: 'response', label: 'Response', icon: FiCode },
                            { id: 'raw', label: 'Raw JSON', icon: FiCode }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 relative ${activeTab === tab.id
                                    ? 'text-primary-600 dark:text-primary-400 gradient-text-primary'
                                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary glow-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="card p-6">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FiInfo className="text-primary-500" />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-1">
                                        <DetailRow label="Request ID" value={log.requestId} copyable />
                                        <DetailRow label="User ID" value={log.userId} copyable />
                                        {log.projectId && <DetailRow label="Project ID" value={log.projectId} copyable />}
                                        <DetailRow label="Service" value={log.service} />
                                        <DetailRow label="Operation" value={log.operation} />
                                        <DetailRow label="Model" value={log.aiModel || log.model} />
                                        <DetailRow label="Status Code" value={log.statusCode} />
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="card p-6">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FiActivity className="text-blue-500" />
                                        Performance Metrics
                                    </h3>
                                    <div className="space-y-1">
                                        <DetailRow label="Response Time" value={`${log.responseTime}ms`} />
                                        <DetailRow label="Input Tokens" value={log.inputTokens || 0} />
                                        <DetailRow label="Output Tokens" value={log.outputTokens || 0} />
                                        <DetailRow label="Total Tokens" value={log.totalTokens || (log.inputTokens + log.outputTokens)} />
                                        <DetailRow label="Cost" value={`$${log.cost?.toFixed(6) || '0.000000'}`} />
                                        {log.cacheHit !== undefined && (
                                            <DetailRow label="Cache Hit" value={log.cacheHit ? 'Yes' : 'No'} />
                                        )}
                                        {log.cortexEnabled !== undefined && (
                                            <DetailRow label="Cortex Enabled" value={log.cortexEnabled ? 'Yes' : 'No'} />
                                        )}
                                    </div>
                                </div>

                                {/* Error Info (if applicable) */}
                                {!log.success && log.errorMessage && (
                                    <div className="card p-6 border-l-4 border-red-500">
                                        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                            <FiAlertCircle />
                                            Error Information
                                        </h3>
                                        <div className="space-y-1">
                                            <DetailRow label="Error Type" value={log.errorType || 'Unknown'} />
                                            <DetailRow label="Error Message" value={log.errorMessage} copyable />
                                            {log.errorCode && <DetailRow label="Error Code" value={log.errorCode} />}
                                        </div>
                                        {log.errorStack && (
                                            <div className="mt-4">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                                                    Stack Trace
                                                </label>
                                                <CodeBlock code={log.errorStack} language="text" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'request' && (
                            <div className="space-y-6">
                                {/* Prompt */}
                                {log.prompt && (
                                    <div className="card p-6">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FiCode className="text-primary-500" />
                                            Prompt
                                        </h3>
                                        <CodeBlock code={formatJson(log.prompt)} />
                                    </div>
                                )}

                                {/* Parameters */}
                                {log.parameters && Object.keys(log.parameters).length > 0 && (
                                    <div className="card p-6">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FiCpu className="text-blue-500" />
                                            Parameters
                                        </h3>
                                        <CodeBlock code={formatJson(log.parameters)} />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'response' && (
                            <div className="space-y-6">
                                {/* Result */}
                                {log.result && (
                                    <div className="card p-6">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <FiCode className="text-success-500" />
                                            Response
                                        </h3>
                                        <CodeBlock code={formatJson(log.result)} />
                                    </div>
                                )}

                                {/* Error (if applicable) */}
                                {!log.success && log.errorMessage && (
                                    <div className="card p-6">
                                        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                            <FiAlertCircle />
                                            Error
                                        </h3>
                                        <CodeBlock code={log.errorMessage} language="text" />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'raw' && (
                            <div className="card p-6">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiCode className="text-primary-500" />
                                    Complete Log Object
                                </h3>
                                <CodeBlock code={formatJson(log)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
