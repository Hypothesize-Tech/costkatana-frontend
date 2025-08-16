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
    const [selectedRecord, setSelectedRecord] = useState<TelemetryRecord | null>(null);
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
        <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Telemetry Data</h2>
                            <p className="text-gray-600 text-sm">
                                View and vectorize telemetry records for semantic search
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filter.timeframe}
                            onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>
                        <select
                            value={filter.vectorized}
                            onChange={(e) => setFilter({ ...filter, vectorized: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="all">All Records</option>
                            <option value="vectorized">Vectorized Only</option>
                            <option value="not_vectorized">Not Vectorized</option>
                        </select>
                    </div>
                </div>

                {/* Selection Actions */}
                {selectedRecords.size > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                                {selectedRecords.size} records selected
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleVectorizeSelected}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    <Zap className="w-4 h-4" />
                                    Vectorize Selected
                                </button>
                                <button
                                    onClick={() => setSelectedRecords(new Set())}
                                    className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Records Table */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="text-gray-500">Loading telemetry data...</div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-12">
                        <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No telemetry data found</h3>
                        <p className="text-gray-600">Try adjusting your filters or check back later</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                checked={selectedRecords.size === records.length}
                                onChange={handleSelectAll}
                                className="rounded"
                            />
                            <div className="flex-1">Operation</div>
                            <div className="w-24">Status</div>
                            <div className="w-20">Cost</div>
                            <div className="w-20">Duration</div>
                            <div className="w-24">Vectorized</div>
                            <div className="w-20">Actions</div>
                        </div>

                        {/* Data Rows */}
                        {records.map((record) => (
                            <div
                                key={record._id}
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRecords.has(record._id)}
                                    onChange={() => handleSelectRecord(record._id)}
                                    className="rounded"
                                />

                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                        {record.operation_name || 'Unknown Operation'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(record.timestamp).toLocaleString()}
                                    </div>
                                    {record.gen_ai_model && (
                                        <div className="text-xs text-purple-600 mt-1">
                                            {record.gen_ai_model}
                                        </div>
                                    )}
                                </div>

                                <div className="w-24">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                        {record.status}
                                    </span>
                                </div>

                                <div className="w-20 text-right">
                                    {record.cost_usd ? (
                                        <span className="text-green-600 font-medium">
                                            ${record.cost_usd.toFixed(4)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>

                                <div className="w-20 text-right text-sm text-gray-600">
                                    {record.duration_ms}ms
                                </div>

                                <div className="w-24 text-center">
                                    {isVectorized(record) ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                                    )}
                                </div>

                                <div className="w-20">
                                    <button
                                        onClick={() => {
                                            setSelectedRecord(record);
                                            setShowDetailsModal(true);
                                        }}
                                        className="p-1 text-gray-500 hover:text-gray-700 rounded"
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
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{records.length}</div>
                            <div className="text-sm text-gray-600">Total Records</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {records.filter(r => isVectorized(r)).length}
                            </div>
                            <div className="text-sm text-gray-600">Vectorized</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600">
                                {records.filter(r => !isVectorized(r)).length}
                            </div>
                            <div className="text-sm text-gray-600">Not Vectorized</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {records.filter(r => r.cost_usd && r.cost_usd > 0).length}
                            </div>
                            <div className="text-sm text-gray-600">With Costs</div>
                        </div>
                    </div>
                </div>

                {/* Vectorization Flow Explanation */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">How Vectorization Works</h4>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                        <span>Telemetry Data</span>
                        <ArrowRight className="w-4 h-4" />
                        <span>AI Analysis</span>
                        <ArrowRight className="w-4 h-4" />
                        <span>Vector Embeddings</span>
                        <ArrowRight className="w-4 h-4" />
                        <span>Semantic Search</span>
                        <ArrowRight className="w-4 h-4" />
                        <span>Smart Insights</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
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
