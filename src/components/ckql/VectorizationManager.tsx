import React, { useState, useEffect } from 'react';
import { Database, Play, Square, RefreshCw, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import CKQLService, { VectorizationJob, VectorizationStats } from '../../services/ckql.service';

interface VectorizationManagerProps {
    className?: string;
}

export const VectorizationManager: React.FC<VectorizationManagerProps> = ({
    className = ''
}) => {
    const [job, setJob] = useState<VectorizationJob | null>(null);
    const [stats, setStats] = useState<VectorizationStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStatus();
        const interval = setInterval(loadStatus, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, []);

    const loadStatus = async () => {
        try {
            const status = await CKQLService.getVectorizationStatus();
            setJob(status.current_job);
            setStats(status.statistics);
        } catch (error) {
            console.error('Failed to load vectorization status:', error);
        }
    };

    const startVectorization = async (options?: {
        timeframe?: string;
        forceReprocess?: boolean;
    }) => {
        setIsLoading(true);
        setError(null);

        try {
            const newJob = await CKQLService.startVectorization(options);
            setJob(newJob);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to start vectorization');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelVectorization = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await CKQLService.cancelVectorization();
            await loadStatus();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to cancel vectorization');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'processing':
                return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'failed':
                return 'text-red-700 bg-red-50 border-red-200';
            case 'processing':
                return 'text-blue-700 bg-blue-50 border-blue-200';
            default:
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        }
    };

    const formatDuration = (startTime: string, endTime?: string) => {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const duration = Math.round((end.getTime() - start.getTime()) / 1000);

        if (duration < 60) return `${duration}s`;
        if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
        return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Vector Search Setup</h2>
                </div>
                <button
                    onClick={() => loadStatus()}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Error</span>
                    </div>
                    <p className="text-red-600 mt-1">{error}</p>
                </div>
            )}

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.total_records.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Records</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                            {stats.vectorized_records.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Vectorized</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                            {stats.vectorization_rate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Coverage</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">
                            {stats.avg_embedding_dimensions}
                        </div>
                        <div className="text-sm text-gray-600">Dimensions</div>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {stats && stats.total_records > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Vectorization Progress</span>
                        <span>{stats.vectorization_rate.toFixed(1)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.vectorization_rate}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Current Job Status */}
            {job && (
                <div className={`p-4 border rounded-lg mb-6 ${getStatusColor(job.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <span className="font-medium capitalize">{job.status}</span>
                        </div>
                        <span className="text-sm">
                            {formatDuration(job.startTime, job.endTime)}
                        </span>
                    </div>

                    {job.status === 'processing' && (
                        <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Processing Records</span>
                                <span>{job.processedRecords} / {job.totalRecords}</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                                <div
                                    className="bg-current h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${job.totalRecords > 0 ? (job.processedRecords / job.totalRecords) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {job.error && (
                        <p className="text-sm mt-2">{job.error}</p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {(!job || job.status !== 'processing') && (
                    <>
                        <button
                            onClick={() => startVectorization({ timeframe: '24h' })}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Play className="w-4 h-4" />
                            Vectorize Last 24h
                        </button>
                        <button
                            onClick={() => startVectorization({ timeframe: '7d' })}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Vectorize Last 7d
                        </button>
                        <button
                            onClick={() => startVectorization({ forceReprocess: true })}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reprocess All
                        </button>
                    </>
                )}

                {job && job.status === 'processing' && (
                    <button
                        onClick={cancelVectorization}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Square className="w-4 h-4" />
                        Cancel
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">About Vector Search</h3>
                <p className="text-sm text-blue-800">
                    Vector search enables semantic queries like "find operations similar to high-cost AI calls"
                    or "show me patterns like yesterday's spike". Vectorization processes your telemetry data
                    to create embeddings that power intelligent cost analysis and anomaly detection.
                </p>
            </div>
        </div>
    );
};

export default VectorizationManager;

