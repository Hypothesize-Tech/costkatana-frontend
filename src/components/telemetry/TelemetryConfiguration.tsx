import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { telemetryConfigApi } from '../../services/telemetryConfigApi';
import TelemetryConfigModal from './TelemetryConfigModal';

interface TelemetryConfig {
    _id: string;
    endpointType: string;
    endpoint: string;
    syncEnabled: boolean;
    syncIntervalMinutes: number;
    isActive: boolean;
    lastSyncAt?: string;
    lastSyncStatus?: 'success' | 'error' | 'partial';
    totalRecordsSynced: number;
    createdAt: string;
}

const TelemetryConfiguration: React.FC = () => {
    const [configs, setConfigs] = useState<TelemetryConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<TelemetryConfig | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const response = await telemetryConfigApi.getAll();
            if (response.success) {
                setConfigs(response.data);
            }
        } catch (error) {
            console.error('Failed to load telemetry configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingConfig(null);
        setIsModalOpen(true);
    };

    const handleEdit = (config: TelemetryConfig) => {
        setEditingConfig(config);
        setIsModalOpen(true);
    };

    const handleDelete = async (configId: string) => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) {
            return;
        }

        try {
            await telemetryConfigApi.delete(configId);
            await loadConfigs();
        } catch (error) {
            console.error('Failed to delete config:', error);
            alert('Failed to delete configuration');
        }
    };

    const handleSync = async (configId: string) => {
        try {
            setSyncing(configId);
            await telemetryConfigApi.triggerSync(configId);
            await loadConfigs();
            alert('Sync triggered successfully');
        } catch (error) {
            console.error('Failed to trigger sync:', error);
            alert('Failed to trigger sync');
        } finally {
            setSyncing(null);
        }
    };

    const handleModalClose = async (reload: boolean) => {
        setIsModalOpen(false);
        setEditingConfig(null);
        if (reload) {
            await loadConfigs();
        }
    };

    const getStatusIcon = (status?: 'success' | 'error' | 'partial') => {
        switch (status) {
            case 'success':
                return <CheckCircle className="flex-shrink-0 text-success-600 dark:text-success-400" size={16} />;
            case 'error':
                return <XCircle className="flex-shrink-0 text-danger-600 dark:text-danger-400" size={16} />;
            case 'partial':
                return <Activity className="flex-shrink-0 text-warning-600 dark:text-warning-400" size={16} />;
            default:
                return <Activity className="flex-shrink-0 text-secondary-500 dark:text-secondary-400" size={16} />;
        }
    };

    const getEndpointTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'tempo': 'Grafana Tempo',
            'jaeger': 'Jaeger',
            'otlp-http': 'OTLP HTTP',
            'otlp-grpc': 'OTLP gRPC',
            'prometheus': 'Prometheus',
            'custom': 'Custom'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 animate-spin border-primary-600 dark:border-primary-400"></div>
                    <p className="text-secondary-600 dark:text-secondary-300">Loading configurations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            {/* Header */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="mb-1.5 sm:mb-2 text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white">
                            External Telemetry Sources
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300">
                            Configure external telemetry endpoints to pull your AI usage data into Cost Katana
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex gap-1.5 sm:gap-2 items-center justify-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap rounded-xl transition-all duration-300 btn btn-primary shrink-0"
                    >
                        <Plus size={16} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Add Source</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {configs.length === 0 ? (
                <div className="p-6 sm:p-8 md:p-10 lg:p-12 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex justify-center mb-3 sm:mb-4">
                        <Activity size={36} className="sm:w-10 sm:h-10 md:w-12 md:h-12 text-secondary-400 dark:text-secondary-600" />
                    </div>
                    <h3 className="mb-1.5 sm:mb-2 text-lg sm:text-xl font-bold font-display text-secondary-900 dark:text-white">
                        No External Telemetry Sources
                    </h3>
                    <p className="mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300">
                        Add your first telemetry endpoint to start tracking external AI usage
                    </p>
                    <button
                        onClick={handleCreate}
                        className="flex gap-1.5 sm:gap-2 items-center justify-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 mx-auto text-xs sm:text-sm md:text-base font-semibold rounded-xl transition-all duration-300 btn btn-primary"
                    >
                        <Plus size={16} className="sm:w-5 sm:h-5" />
                        Add Source
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {configs.map((config) => (
                        <div
                            key={config._id}
                            className="rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover"
                        >
                            {/* Card Header */}
                            <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-primary-200/20 dark:border-primary-500/10">
                                <div className="flex gap-2 sm:gap-3 md:gap-4 justify-between items-start mb-2 sm:mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-bold truncate font-display text-secondary-900 dark:text-white">
                                            {getEndpointTypeLabel(config.endpointType)}
                                        </h3>
                                        {config.syncEnabled && (
                                            <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold rounded-full border bg-success-500/20 dark:bg-success-500/20 text-success-700 dark:text-success-300 border-success-200/30 dark:border-success-500/20">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-shrink-0 gap-1.5 sm:gap-2 items-center">
                                        <button
                                            onClick={() => handleSync(config._id)}
                                            disabled={syncing === config._id}
                                            className="p-1.5 sm:p-2 rounded-lg transition-colors btn bg-secondary-500/10 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-500/20 dark:hover:bg-secondary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Trigger manual sync"
                                        >
                                            <RefreshCw
                                                size={14}
                                                className={`sm:w-4 sm:h-4 ${syncing === config._id ? 'animate-spin' : ''}`}
                                            />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(config)}
                                            className="p-1.5 sm:p-2 rounded-lg transition-colors btn bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 hover:bg-primary-500/20 dark:hover:bg-primary-500/30"
                                            title="Edit"
                                        >
                                            <Edit2 size={14} className="sm:w-4 sm:h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(config._id)}
                                            className="p-1.5 sm:p-2 rounded-lg transition-colors btn bg-danger-500/10 dark:bg-danger-500/20 text-danger-700 dark:text-danger-300 hover:bg-danger-500/20 dark:hover:bg-danger-500/30"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-2.5 sm:space-y-3 md:space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                                    <span className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                        Endpoint:
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white text-right max-w-full sm:max-w-[60%] break-words">
                                        {config.endpoint}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                                    <span className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                        Sync Interval:
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white">
                                        Every {config.syncIntervalMinutes} minutes
                                    </span>
                                </div>

                                {config.lastSyncAt && (
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                                        <span className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                            Last Sync:
                                        </span>
                                        <span className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white">
                                            {getStatusIcon(config.lastSyncStatus)}
                                            <span className="break-words">{new Date(config.lastSyncAt).toLocaleString()}</span>
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                                    <span className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                        Records Synced:
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white">
                                        {config.totalRecordsSynced.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <TelemetryConfigModal
                    config={editingConfig}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default TelemetryConfiguration;
