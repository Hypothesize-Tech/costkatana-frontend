import React, { useState, useEffect } from 'react';
import { Database, Play, Square, RefreshCw, CheckCircle, AlertCircle, Clock, TrendingUp, Lightbulb } from 'lucide-react'; // Added Lightbulb for info section
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
                return <CheckCircle className="w-5 h-5 text-success-500" />;
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-danger-500" />;
            case 'processing':
                return <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-warning-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-success-700 bg-success-50 border-success-200';
            case 'failed':
                return 'text-danger-700 bg-danger-50 border-danger-200';
            case 'processing':
                return 'text-primary-700 bg-primary-50 border-primary-200';
            default:
                return 'text-warning-700 bg-warning-50 border-warning-200';
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
        <div className={`glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 md:p-8 animate-fade-in ${className}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl">
                        <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold gradient-text-primary">Vector Search Setup</h2>
                </div>
                <button
                    onClick={() => loadStatus()}
                    className="btn btn-icon text-light-text-muted dark:text-dark-text-muted hover:text-primary-500 rounded-xl glass hover:bg-primary-500/10 transition-all duration-300 hover:scale-110"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="mb-8 glass rounded-2xl border border-danger-200/50 shadow-lg backdrop-blur-xl bg-gradient-to-br from-danger-50 to-danger-100/50 p-4 animate-scale-in">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-display font-bold text-danger-800 dark:text-danger-200">Error</span>
                            <p className="font-body text-sm font-medium text-danger-700 dark:text-danger-300 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 hover:scale-105 transition-transform duration-300">
                        <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-primary">
                            {stats.total_records.toLocaleString()}
                        </div>
                        <div className="font-body text-xs sm:text-sm font-medium text-light-text-muted dark:text-dark-text-muted">Total Records</div>
                    </div>
                    <div className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 hover:scale-105 transition-transform duration-300">
                        <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-success">
                            {stats.vectorized_records.toLocaleString()}
                        </div>
                        <div className="font-body text-xs sm:text-sm font-medium text-light-text-muted dark:text-dark-text-muted">Vectorized</div>
                    </div>
                    <div className="glass rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 hover:scale-105 transition-transform duration-300">
                        <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-accent">
                            {stats.vectorization_rate.toFixed(1)}%
                        </div>
                        <div className="font-body text-xs sm:text-sm font-medium text-light-text-muted dark:text-dark-text-muted">Coverage</div>
                    </div>
                    <div className="glass rounded-xl border border-secondary-200/30 shadow-lg backdrop-blur-xl p-4 sm:p-5 md:p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 hover:scale-105 transition-transform duration-300">
                        <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold gradient-text-secondary">
                            {stats.avg_embedding_dimensions}
                        </div>
                        <div className="font-body text-xs sm:text-sm font-medium text-light-text-muted dark:text-dark-text-muted">Dimensions</div>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {stats && stats.total_records > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3">
                        <span>Vectorization Progress</span>
                        <span className="font-display font-bold gradient-text-primary">{stats.vectorization_rate.toFixed(1)}% Complete</span>
                    </div>
                    <div className="w-full bg-primary-200/30 rounded-full h-3 shadow-inner">
                        <div
                            className="progress-bar h-3 rounded-full transition-all duration-500"
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
                            <span className="font-display font-medium capitalize">{job.status}</span>
                        </div>
                        <span className="font-body text-sm">
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
                        <p className="font-body text-sm">{job.error}</p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {(!job || job.status !== 'processing') && (
                    <>
                        <button
                            onClick={() => startVectorization({ timeframe: '24h' })}
                            disabled={isLoading}
                            className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <Play className="w-4 h-4" />
                            Vectorize Last 24h
                        </button>
                        <button
                            onClick={() => startVectorization({ timeframe: '7d' })}
                            disabled={isLoading}
                            className="btn btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Vectorize Last 7d
                        </button>
                        <button
                            onClick={() => startVectorization({ forceReprocess: true })}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 bg-gradient-accent text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
                        className="flex items-center gap-2 bg-gradient-danger text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Square className="w-4 h-4" />
                        Cancel
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-5 md:p-6 glass border border-primary-200/30 shadow-lg backdrop-blur-xl rounded-2xl">
                <h3 className="font-display font-bold text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                        <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    About Vector Search
                </h3>
                <p className="font-body text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    Vector search enables semantic queries like "find operations similar to high-cost AI calls"
                    or "show me patterns like yesterday's spike". Vectorization processes your telemetry data
                    to create embeddings that power intelligent cost analysis and anomaly detection.
                </p>
            </div>
        </div>
    );
};

export default VectorizationManager;

