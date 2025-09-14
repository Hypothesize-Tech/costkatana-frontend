import React, { useState, useEffect } from 'react';
import { Database, Zap, Eye, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../../config/api';

interface TelemetryRecord {
    _id: string;
    timestamp: string;
    operation_name: string;
    service_name?: string;
    duration_ms: number;
    cost_usd?: number;
    status: string;
    gen_ai_model?: string;
    semantic_embedding?: number[];
    semantic_content?: string;
    cost_narrative?: string;
}

interface TelemetryViewerProps {
    onVectorizeSelected?: (records: TelemetryRecord[]) => void;
    className?: string;
}

export const TelemetryViewer: React.FC<TelemetryViewerProps> = ({
    onVectorizeSelected,
    className = ''
}) => {
    const [records, setRecords] = useState<TelemetryRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filter, setFilter] = useState({
        timeframe: '24h',
        status: 'all',
        vectorized: 'all' // all, vectorized, not_vectorized
    });

    useEffect(() => {
        loadTelemetryData();
    }, [filter]);

    const loadTelemetryData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: '50',
                sort_by: 'timestamp',
                sort_order: 'desc'
            });

            if (filter.status !== 'all') {
                params.append('status', filter.status);
            }

            const response = await apiClient.get(`/telemetry/query?${params}`);
            setRecords(response.data.data || []);
        } catch (error) {
            console.error('Failed to load telemetry data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRecord = (recordId: string) => {
        const newSelected = new Set(selectedRecords);
        if (newSelected.has(recordId)) {
            newSelected.delete(recordId);
        } else {
            newSelected.add(recordId);
        }
        setSelectedRecords(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedRecords.size === records.length) {
            setSelectedRecords(new Set());
        } else {
            setSelectedRecords(new Set(records.map(r => r._id)));
        }
    };

    const handleVectorizeSelected = () => {
        const selectedRecordObjects = records.filter(r => selectedRecords.has(r._id));
        onVectorizeSelected?.(selectedRecordObjects);
    };

    const isVectorized = (record: TelemetryRecord) => {
        return record.semantic_embedding && record.semantic_embedding.length > 0;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'text-green-700 bg-green-100';
            case 'error': return 'text-red-700 bg-red-100';
            default: return 'text-gray-700 bg-gray-100';
        }
    };

    return (
        <div className={`glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl ${className}`}>
            {/* Header */}
            <div className="p-8 border-b border-primary-200/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold gradient-text">Telemetry Data</h2>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                                View and vectorize telemetry records for semantic search
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filter.timeframe}
                            onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}
                            className="input"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>
                        <select
                            value={filter.vectorized}
                            onChange={(e) => setFilter({ ...filter, vectorized: e.target.value })}
                            className="input"
                        >
                            <option value="all">All Records</option>
                            <option value="vectorized">Vectorized Only</option>
                            <option value="not_vectorized">Not Vectorized</option>
                        </select>
                    </div>
                </div>

                {/* Selection Actions */}
                {selectedRecords.size > 0 && (
                    <div className="mt-6 glass p-4 border border-accent-200/30 bg-gradient-accent/10 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center glow-accent">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <span className="font-display font-semibold gradient-text-accent">
                                    {selectedRecords.size} records selected
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleVectorizeSelected}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    Vectorize Selected
                                </button>
                                <button
                                    onClick={() => setSelectedRecords(new Set())}
                                    className="btn-secondary"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Records Table */}
            <div className="p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mr-3"></div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Loading telemetry data...</div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-xl bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4">
                            <Database className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-display font-bold gradient-text mb-2">No telemetry data found</h3>
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Try adjusting your filters or check back later</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Header Row */}
                        <div className="flex items-center gap-4 p-4 glass rounded-xl border border-primary-200/30">
                            <input
                                type="checkbox"
                                checked={selectedRecords.size === records.length}
                                onChange={handleSelectAll}
                                className="toggle-switch-sm"
                            />
                            <div className="flex-1 font-display font-semibold gradient-text">Operation</div>
                            <div className="w-24 font-display font-semibold gradient-text">Status</div>
                            <div className="w-20 font-display font-semibold gradient-text">Cost</div>
                            <div className="w-20 font-display font-semibold gradient-text">Duration</div>
                            <div className="w-24 font-display font-semibold gradient-text">Vectorized</div>
                            <div className="w-20 font-display font-semibold gradient-text">Actions</div>
                        </div>

                        {/* Data Rows */}
                        {records.map((record) => (
                            <div
                                key={record._id}
                                className="flex items-center gap-4 p-4 glass rounded-xl border border-primary-200/30 hover:bg-gradient-primary/5 transition-all duration-200"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRecords.has(record._id)}
                                    onChange={() => handleSelectRecord(record._id)}
                                    className="toggle-switch-sm"
                                />

                                <div className="flex-1">
                                    <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                        {record.operation_name || 'Unknown Operation'}
                                    </div>
                                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                        {new Date(record.timestamp).toLocaleString()}
                                    </div>
                                    {record.gen_ai_model && (
                                        <div className="glass px-2 py-1 rounded-full border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 text-xs font-display font-semibold mt-2 inline-block">
                                            {record.gen_ai_model}
                                        </div>
                                    )}
                                </div>

                                <div className="w-24">
                                    <span className={`glass px-3 py-1 rounded-full font-display font-semibold border text-xs ${getStatusColor(record.status)}`}>
                                        {record.status}
                                    </span>
                                </div>

                                <div className="w-20 text-right">
                                    {record.cost_usd ? (
                                        <span className="font-display font-semibold gradient-text-success">
                                            ${record.cost_usd.toFixed(4)}
                                        </span>
                                    ) : (
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">-</span>
                                    )}
                                </div>

                                <div className="w-20 text-right">
                                    <span className="font-display font-semibold gradient-text-warning text-sm">
                                        {record.duration_ms}ms
                                    </span>
                                </div>

                                <div className="w-24 text-center">
                                    {isVectorized(record) ? (
                                        <div className="w-6 h-6 rounded-full bg-gradient-success flex items-center justify-center mx-auto glow-success">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-accent/20 flex items-center justify-center mx-auto">
                                            <XCircle className="w-4 h-4 text-accent-500" />
                                        </div>
                                    )}
                                </div>

                                <div className="w-20">
                                    <button
                                        onClick={() => {
                                            setSelectedRecord(record);
                                            setShowDetailsModal(true);
                                        }}
                                        className="btn-icon-secondary"
                                        title="View details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                <div className="mt-8 glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
                    <h4 className="font-display font-semibold gradient-text mb-4">Summary Statistics</h4>
                    <div className="grid grid-cols-4 gap-6 text-center">
                        <div className="glass rounded-lg p-4 border border-primary-200/30">
                            <div className="text-3xl font-display font-bold gradient-text">{records.length}</div>
                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Total Records</div>
                        </div>
                        <div className="glass rounded-lg p-4 border border-success-200/30">
                            <div className="text-3xl font-display font-bold gradient-text-success">
                                {records.filter(r => isVectorized(r)).length}
                            </div>
                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Vectorized</div>
                        </div>
                        <div className="glass rounded-lg p-4 border border-warning-200/30">
                            <div className="text-3xl font-display font-bold gradient-text-warning">
                                {records.filter(r => !isVectorized(r)).length}
                            </div>
                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Not Vectorized</div>
                        </div>
                        <div className="glass rounded-lg p-4 border border-info-200/30">
                            <div className="text-3xl font-display font-bold gradient-text-info">
                                {records.filter(r => r.cost_usd && r.cost_usd > 0).length}
                            </div>
                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">With Costs</div>
                        </div>
                    </div>
                </div>

                {/* Vectorization Flow Explanation */}
                <div className="mt-8 glass p-6 rounded-xl border border-info-200/30 bg-gradient-info/10 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-info flex items-center justify-center glow-info">
                            <span className="text-white text-sm">🧠</span>
                        </div>
                        <h4 className="font-display font-semibold gradient-text-info">How Vectorization Works</h4>
                    </div>
                    <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
                        <span className="glass px-3 py-2 rounded-lg border border-info-200/30 font-display font-medium text-light-text-primary dark:text-dark-text-primary">Telemetry Data</span>
                        <ArrowRight className="w-4 h-4 text-info-500" />
                        <span className="glass px-3 py-2 rounded-lg border border-info-200/30 font-display font-medium text-light-text-primary dark:text-dark-text-primary">AI Analysis</span>
                        <ArrowRight className="w-4 h-4 text-info-500" />
                        <span className="glass px-3 py-2 rounded-lg border border-info-200/30 font-display font-medium text-light-text-primary dark:text-dark-text-primary">Vector Embeddings</span>
                        <ArrowRight className="w-4 h-4 text-info-500" />
                        <span className="glass px-3 py-2 rounded-lg border border-info-200/30 font-display font-medium text-light-text-primary dark:text-dark-text-primary">Semantic Search</span>
                        <ArrowRight className="w-4 h-4 text-info-500" />
                        <span className="glass px-3 py-2 rounded-lg border border-info-200/30 font-display font-medium text-light-text-primary dark:text-dark-text-primary">Smart Insights</span>
                    </div>
                    <p className="font-body text-light-text-primary dark:text-dark-text-primary">
                        Vectorized records can be found using natural language queries like "expensive AI operations" or "slow database calls"
                    </p>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Telemetry Record Details</h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Basic Information */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Operation:</span>
                                        <div className="font-medium">{selectedRecord.operation_name}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Service:</span>
                                        <div className="font-medium">{selectedRecord.service_name || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <div className={`font-medium ${getStatusColor(selectedRecord.status)}`}>
                                            {selectedRecord.status}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Timestamp:</span>
                                        <div className="font-medium">{new Date(selectedRecord.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Duration:</span>
                                        <div className="font-medium">{selectedRecord.duration_ms}ms</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Cost:</span>
                                        <div className="font-medium text-green-600">
                                            {selectedRecord.cost_usd ? `$${selectedRecord.cost_usd.toFixed(4)}` : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Model Information */}
                            {selectedRecord.gen_ai_model && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">AI Model Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Model:</span>
                                            <div className="font-medium text-purple-600">{selectedRecord.gen_ai_model}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">System:</span>
                                            <div className="font-medium">{selectedRecord.gen_ai_system || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vectorization Status */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Vectorization Status</h4>
                                <div className="flex items-center gap-2">
                                    {isVectorized(selectedRecord) ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-green-700">Vectorized</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600">Not Vectorized</span>
                                        </>
                                    )}
                                </div>
                                {selectedRecord.semantic_content && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                        <strong>Semantic Content:</strong> {selectedRecord.semantic_content}
                                    </div>
                                )}
                                {selectedRecord.cost_narrative && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                        <strong>Cost Narrative:</strong> {selectedRecord.cost_narrative}
                                    </div>
                                )}
                            </div>

                            {/* Technical Details */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Technical Details</h4>
                                <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                                    <div><strong>Trace ID:</strong> {selectedRecord.trace_id}</div>
                                    <div><strong>Span ID:</strong> {selectedRecord.span_id}</div>
                                    {selectedRecord.parent_span_id && (
                                        <div><strong>Parent Span:</strong> {selectedRecord.parent_span_id}</div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Logs */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Detailed Logs</h4>
                                <div className="bg-gray-900 rounded p-4 text-green-400 text-xs font-mono max-h-64 overflow-y-auto">
                                    <div className="space-y-1">
                                        <div className="text-blue-400">[{new Date(selectedRecord.timestamp).toISOString()}] INFO</div>
                                        <div>Operation: {selectedRecord.operation_name}</div>
                                        <div>Service: {selectedRecord.service_name}</div>
                                        <div>Duration: {selectedRecord.duration_ms}ms</div>
                                        <div>Status: {selectedRecord.status_code}</div>
                                        {selectedRecord.http_method && (
                                            <div>HTTP Method: {selectedRecord.http_method}</div>
                                        )}
                                        {selectedRecord.http_route && (
                                            <div>Route: {selectedRecord.http_route}</div>
                                        )}
                                        {selectedRecord.gen_ai_model && (
                                            <>
                                                <div className="text-yellow-400 mt-2">[AI MODEL] {selectedRecord.gen_ai_model}</div>
                                                {selectedRecord.gen_ai_input_tokens && (
                                                    <div>Input Tokens: {selectedRecord.gen_ai_input_tokens}</div>
                                                )}
                                                {selectedRecord.gen_ai_output_tokens && (
                                                    <div>Output Tokens: {selectedRecord.gen_ai_output_tokens}</div>
                                                )}
                                                {selectedRecord.cost_usd && (
                                                    <div className="text-green-400">Cost: ${selectedRecord.cost_usd.toFixed(4)}</div>
                                                )}
                                            </>
                                        )}
                                        {selectedRecord.error_message && (
                                            <div className="text-red-400 mt-2">[ERROR] {selectedRecord.error_message}</div>
                                        )}
                                        <div className="text-gray-500 mt-2">--- End of Log ---</div>
                                    </div>
                                </div>
                            </div>

                            {/* Raw Data */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Raw Telemetry Data</h4>
                                <div className="bg-gray-100 rounded p-3 text-xs">
                                    <pre className="whitespace-pre-wrap text-gray-700 max-h-32 overflow-y-auto">
                                        {JSON.stringify(selectedRecord, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TelemetryViewer;
