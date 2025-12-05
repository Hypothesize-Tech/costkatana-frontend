import React, { useState, useEffect } from 'react';
import { Database, Zap, Eye, ArrowRight, CheckCircle, XCircle, X, Brain } from 'lucide-react';
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
            case 'success': return 'text-success-700 bg-success-100';
            case 'error': return 'text-danger-700 bg-danger-100';
            default: return 'text-secondary-700 bg-secondary-100';
        }
    };

    return (
        <div className={`rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel ${className}`}>
            {/* Header */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-primary-200/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-3 sm:gap-4 items-center">
                        <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-primary">
                            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl sm:text-2xl font-bold gradient-text-primary">Telemetry Data</h2>
                            <p className="font-body text-xs sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300">
                                View and vectorize telemetry records for semantic search
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
                        <select
                            value={filter.timeframe}
                            onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}
                            className="input text-sm sm:text-base"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>
                        <select
                            value={filter.vectorized}
                            onChange={(e) => setFilter({ ...filter, vectorized: e.target.value })}
                            className="input text-sm sm:text-base"
                        >
                            <option value="all">All Records</option>
                            <option value="vectorized">Vectorized Only</option>
                            <option value="not_vectorized">Not Vectorized</option>
                        </select>
                    </div>
                </div>

                {/* Selection Actions */}
                {selectedRecords.size > 0 && (
                    <div className="p-3 sm:p-4 mt-4 sm:mt-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-accent-200/30 from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex gap-2 sm:gap-3 items-center">
                                <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-accent">
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <span className="font-display font-semibold text-sm sm:text-base gradient-text-accent">
                                    {selectedRecords.size} records selected
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
                                <button
                                    onClick={handleVectorizeSelected}
                                    className="btn btn-primary inline-flex gap-2 items-center justify-center text-sm sm:text-base"
                                >
                                    <Zap className="w-4 h-4" />
                                    Vectorize Selected
                                </button>
                                <button
                                    onClick={() => setSelectedRecords(new Set())}
                                    className="btn btn-secondary text-sm sm:text-base"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Records Table */}
            <div className="p-4 sm:p-6 md:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="mx-auto mr-3 w-8 h-8 rounded-full border-b-2 animate-spin border-primary-500"></div>
                        <div className="font-body text-sm sm:text-base text-secondary-600 dark:text-secondary-300">Loading telemetry data...</div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-8 sm:py-12 text-center">
                        <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-primary/20">
                            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500" />
                        </div>
                        <h3 className="font-display mb-2 text-lg sm:text-xl font-bold gradient-text-primary">No telemetry data found</h3>
                        <p className="font-body text-sm sm:text-base text-secondary-600 dark:text-secondary-300">Try adjusting your filters or check back later</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {/* Header Row - Hidden on mobile, shown on tablet+ */}
                        <div className="hidden sm:flex gap-2 md:gap-4 items-center p-3 sm:p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                            <input
                                type="checkbox"
                                checked={selectedRecords.size === records.length}
                                onChange={handleSelectAll}
                                className="toggle-switch-sm"
                            />
                            <div className="flex-1 font-display font-semibold text-xs sm:text-sm gradient-text-primary">Operation</div>
                            <div className="w-20 sm:w-24 font-display font-semibold text-xs sm:text-sm gradient-text-secondary">Status</div>
                            <div className="w-16 sm:w-20 font-display font-semibold text-xs sm:text-sm gradient-text-success">Cost</div>
                            <div className="w-16 sm:w-20 font-display font-semibold text-xs sm:text-sm gradient-text-accent">Duration</div>
                            <div className="w-20 sm:w-24 font-display font-semibold text-xs sm:text-sm gradient-text-primary">Vectorized</div>
                            <div className="w-16 sm:w-20 font-display font-semibold text-xs sm:text-sm gradient-text-primary">Actions</div>
                        </div>

                        {/* Data Rows */}
                        {records.map((record) => (
                            <div
                                key={record._id}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-2 md:gap-4 items-start sm:items-center p-3 sm:p-4 rounded-xl border transition-all duration-200 glass border-primary-200/30 hover:bg-gradient-primary/5"
                            >
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <input
                                        type="checkbox"
                                        checked={selectedRecords.has(record._id)}
                                        onChange={() => handleSelectRecord(record._id)}
                                        className="toggle-switch-sm"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="font-display font-semibold text-sm sm:text-base text-secondary-900 dark:text-white truncate">
                                            {record.operation_name || 'Unknown Operation'}
                                        </div>
                                        <div className="font-body text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                                            {new Date(record.timestamp).toLocaleString()}
                                        </div>
                                        {record.gen_ai_model && (
                                            <div className="inline-block px-2 py-1 mt-1 sm:mt-2 text-xs font-display font-semibold rounded-full border glass border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300">
                                                {record.gen_ai_model}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="w-auto sm:w-20">
                                        <span className={`glass px-2 sm:px-3 py-1 rounded-full font-display font-semibold border text-xs ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </div>

                                    <div className="w-auto sm:w-20 text-right">
                                        {record.cost_usd ? (
                                            <span className="font-display font-bold text-sm sm:text-base gradient-text-success">
                                                ${record.cost_usd.toFixed(4)}
                                            </span>
                                        ) : (
                                            <span className="font-body text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">-</span>
                                        )}
                                    </div>

                                    <div className="w-auto sm:w-20 text-right">
                                        <span className="font-display text-xs sm:text-sm font-semibold gradient-text-accent">
                                            {record.duration_ms}ms
                                        </span>
                                    </div>

                                    <div className="w-auto sm:w-24 text-center">
                                        {isVectorized(record) ? (
                                            <div className="flex justify-center items-center mx-auto w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-lg bg-gradient-success">
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                            </div>
                                        ) : (
                                            <div className="flex justify-center items-center mx-auto w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-secondary/20">
                                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-500" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-auto sm:w-20">
                                        <button
                                            onClick={() => {
                                                setSelectedRecord(record);
                                                setShowDetailsModal(true);
                                            }}
                                            className="btn btn-icon-secondary"
                                            title="View details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                <div className="p-4 sm:p-6 mt-6 sm:mt-8 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <h4 className="font-display mb-3 sm:mb-4 font-semibold text-base sm:text-lg gradient-text-primary">Summary Statistics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 text-center">
                        <div className="p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-primary">{records.length}</div>
                            <div className="font-body text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">Total Records</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-success-200/30 dark:border-success-500/20">
                            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-success">
                                {records.filter(r => isVectorized(r)).length}
                            </div>
                            <div className="font-body text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">Vectorized</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20">
                            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-accent">
                                {records.filter(r => !isVectorized(r)).length}
                            </div>
                            <div className="font-body text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">Not Vectorized</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-secondary-200/30 dark:border-secondary-500/20">
                            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-secondary">
                                {records.filter(r => r.cost_usd && r.cost_usd > 0).length}
                            </div>
                            <div className="font-body text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">With Costs</div>
                        </div>
                    </div>
                </div>

                {/* Vectorization Flow Explanation */}
                <div className="p-4 sm:p-6 mt-6 sm:mt-8 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-primary-50/30 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/20">
                    <div className="flex gap-2 sm:gap-3 items-center mb-3 sm:mb-4">
                        <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-primary">
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h4 className="font-display font-semibold text-sm sm:text-base gradient-text-primary">How Vectorization Works</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center mb-3 sm:mb-4 text-xs sm:text-sm">
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 font-display font-medium rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 text-secondary-900 dark:text-white">Telemetry Data</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 font-display font-medium rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 text-secondary-900 dark:text-white">AI Analysis</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 font-display font-medium rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 text-secondary-900 dark:text-white">Vector Embeddings</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 font-display font-medium rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 text-secondary-900 dark:text-white">Semantic Search</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                        <span className="px-2 sm:px-3 py-1.5 sm:py-2 font-display font-medium rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 text-secondary-900 dark:text-white">Smart Insights</span>
                    </div>
                    <p className="font-body text-xs sm:text-sm text-secondary-900 dark:text-white">
                        Vectorized records can be found using natural language queries like "expensive AI operations" or "slow database calls"
                    </p>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedRecord && (
                <div className="flex fixed inset-0 z-50 justify-center items-center p-2 sm:p-4 backdrop-blur-sm bg-black/50" onClick={() => setShowDetailsModal(false)}>
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 sm:p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                            <div className="flex justify-between items-center">
                                <h3 className="font-display text-base sm:text-lg font-bold gradient-text-primary">Telemetry Record Details</h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 rounded-lg transition-all duration-200 btn btn-icon text-secondary-600 dark:text-secondary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    <X size={20} className="sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            {/* Basic Information */}
                            <div>
                                <h4 className="font-display mb-2 font-semibold text-sm sm:text-base gradient-text-primary">Basic Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                        <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">Operation:</span>
                                        <div className="mt-1 font-display font-semibold text-secondary-900 dark:text-white">{selectedRecord.operation_name}</div>
                                    </div>
                                    <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                        <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">Service:</span>
                                        <div className="mt-1 font-display font-semibold text-secondary-900 dark:text-white">{selectedRecord.service_name || 'N/A'}</div>
                                    </div>
                                    <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                        <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">Status:</span>
                                        <div className={`font-display font-semibold mt-1 ${getStatusColor(selectedRecord.status)}`}>
                                            {selectedRecord.status}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                        <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">Timestamp:</span>
                                        <div className="mt-1 font-display font-semibold text-secondary-900 dark:text-white">{new Date(selectedRecord.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div>
                                <h4 className="font-display mb-2 font-semibold text-sm sm:text-base gradient-text-accent">Performance Metrics</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    <div className="p-3 rounded-lg border glass border-accent-200/30 dark:border-accent-500/20">
                                        <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">Duration:</span>
                                        <div className="mt-1 font-display font-semibold gradient-text-accent">{selectedRecord.duration_ms}ms</div>
                                    </div>
                                    <div className="p-3 rounded-lg border glass border-success-200/30 dark:border-success-500/20">
                                        <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">Cost:</span>
                                        <div className="mt-1 font-display font-semibold gradient-text-success">
                                            {selectedRecord.cost_usd ? `$${selectedRecord.cost_usd.toFixed(4)}` : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Model Information */}
                            {selectedRecord.gen_ai_model && (
                                <div>
                                    <h4 className="font-display mb-2 font-semibold text-sm sm:text-base gradient-text-secondary">AI Model Information</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                        <div className="p-3 rounded-lg border glass border-secondary-200/30 dark:border-secondary-500/20">
                                            <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">Model:</span>
                                            <div className="mt-1 font-display font-semibold gradient-text-secondary">{selectedRecord.gen_ai_model}</div>
                                        </div>
                                        <div className="p-3 rounded-lg border glass border-secondary-200/30 dark:border-secondary-500/20">
                                            <span className="font-display font-medium text-secondary-600 dark:text-secondary-300">System:</span>
                                            <div className="mt-1 font-display font-semibold text-secondary-900 dark:text-white">{selectedRecord.gen_ai_system || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vectorization Status */}
                            <div>
                                <h4 className="font-display mb-2 font-semibold text-sm sm:text-base gradient-text-primary">Vectorization Status</h4>
                                <div className="p-3 mb-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                    <div className="flex gap-2 items-center">
                                        {isVectorized(selectedRecord) ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
                                                <span className="font-display font-semibold text-success-700 dark:text-success-300">Vectorized</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-secondary-400 dark:text-secondary-600" />
                                                <span className="font-display font-semibold text-secondary-600 dark:text-secondary-400">Not Vectorized</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {selectedRecord.semantic_content && (
                                    <div className="p-3 mb-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                        <strong className="font-display font-semibold text-secondary-900 dark:text-white">Semantic Content:</strong>
                                        <p className="mt-1 font-body text-xs text-secondary-600 dark:text-secondary-300">{selectedRecord.semantic_content}</p>
                                    </div>
                                )}
                                {selectedRecord.cost_narrative && (
                                    <div className="p-3 rounded-lg border glass border-accent-200/30 dark:border-accent-500/20">
                                        <strong className="font-display font-semibold text-secondary-900 dark:text-white">Cost Narrative:</strong>
                                        <p className="mt-1 font-body text-xs text-secondary-600 dark:text-secondary-300">{selectedRecord.cost_narrative}</p>
                                    </div>
                                )}
                            </div>

                            {/* Technical Details */}
                            <div>
                                <h4 className="font-display mb-2 font-semibold text-sm sm:text-base gradient-text-secondary">Technical Details</h4>
                                <div className="p-3 font-mono text-[10px] sm:text-xs rounded-lg border glass border-secondary-200/30 dark:border-secondary-500/20 overflow-x-auto">
                                    <div className="text-secondary-900 dark:text-white"><strong>Trace ID:</strong> {selectedRecord.trace_id}</div>
                                    <div className="text-secondary-900 dark:text-white"><strong>Span ID:</strong> {selectedRecord.span_id}</div>
                                    {selectedRecord.parent_span_id && (
                                        <div className="text-secondary-900 dark:text-white"><strong>Parent Span:</strong> {selectedRecord.parent_span_id}</div>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Logs */}
                            <div>
                                <h4 className="font-display mb-2 font-semibold text-sm sm:text-base gradient-text-secondary">Detailed Logs</h4>
                                <div className="overflow-y-auto p-3 sm:p-4 max-h-48 sm:max-h-64 font-mono text-[10px] sm:text-xs rounded-lg border glass border-secondary-200/30 dark:border-secondary-500/20 bg-gradient-dark-panel text-success-400">
                                    <div className="space-y-1">
                                        <div className="text-primary-400">[{new Date(selectedRecord.timestamp).toISOString()}] INFO</div>
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
                                                <div className="mt-2 text-accent-400">[AI MODEL] {selectedRecord.gen_ai_model}</div>
                                                {selectedRecord.gen_ai_input_tokens && (
                                                    <div>Input Tokens: {selectedRecord.gen_ai_input_tokens}</div>
                                                )}
                                                {selectedRecord.gen_ai_output_tokens && (
                                                    <div>Output Tokens: {selectedRecord.gen_ai_output_tokens}</div>
                                                )}
                                                {selectedRecord.cost_usd && (
                                                    <div className="text-success-400">Cost: ${selectedRecord.cost_usd.toFixed(4)}</div>
                                                )}
                                            </>
                                        )}
                                        {selectedRecord.error_message && (
                                            <div className="mt-2 text-danger-400">[ERROR] {selectedRecord.error_message}</div>
                                        )}
                                        <div className="mt-2 text-secondary-500">--- End of Log ---</div>
                                    </div>
                                </div>
                            </div>

                            {/* Raw Data */}
                            <div>
                                <h4 className="font-display mb-2 font-semibold text-sm sm:text-base gradient-text-secondary">Raw Telemetry Data</h4>
                                <div className="p-3 text-[10px] sm:text-xs rounded-lg border glass border-secondary-200/30 dark:border-secondary-500/20">
                                    <pre className="overflow-y-auto max-h-24 sm:max-h-32 whitespace-pre-wrap text-secondary-900 dark:text-white overflow-x-auto">
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
