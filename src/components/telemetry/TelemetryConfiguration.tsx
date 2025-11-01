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
                return <CheckCircle className="text-success-600 dark:text-success-400 flex-shrink-0" size={16} />;
            case 'error':
                return <XCircle className="text-danger-600 dark:text-danger-400 flex-shrink-0" size={16} />;
            case 'partial':
                return <Activity className="text-warning-600 dark:text-warning-400 flex-shrink-0" size={16} />;
            default:
                return <Activity className="text-secondary-500 dark:text-secondary-400 flex-shrink-0" size={16} />;
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
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                    <p className="text-secondary-600 dark:text-secondary-300">Loading configurations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-white mb-2">
                            External Telemetry Sources
                        </h2>
                        <p className="text-secondary-600 dark:text-secondary-300">
                            Configure external telemetry endpoints to pull your AI usage data into Cost Katana
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Add Source
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {configs.length === 0 ? (
                <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <Activity size={48} className="text-secondary-400 dark:text-secondary-600" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white mb-2">
                        No External Telemetry Sources
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-300 mb-6">
                        Add your first telemetry endpoint to start tracking external AI usage
                    </p>
                    <button
                        onClick={handleCreate}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 mx-auto"
                    >
                        <Plus size={20} />
                        Add Source
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configs.map((config) => (
                        <div
                            key={config._id}
                            className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover transition-all duration-300"
                        >
                            {/* Card Header */}
                            <div className="p-6 border-b border-primary-200/20 dark:border-primary-500/10">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-white truncate">
                                            {getEndpointTypeLabel(config.endpointType)}
                                        </h3>
                                        {config.syncEnabled && (
                                            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-success-500/20 dark:bg-success-500/20 text-success-700 dark:text-success-300 text-xs font-semibold border border-success-200/30 dark:border-success-500/20">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleSync(config._id)}
                                            disabled={syncing === config._id}
                                            className="p-2 rounded-lg bg-secondary-500/10 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-500/20 dark:hover:bg-secondary-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Trigger manual sync"
                                        >
                                            <RefreshCw
                                                size={16}
                                                className={syncing === config._id ? 'animate-spin' : ''}
                                            />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(config)}
                                            className="p-2 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 hover:bg-primary-500/20 dark:hover:bg-primary-500/30 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(config._id)}
                                            className="p-2 rounded-lg bg-danger-500/10 dark:bg-danger-500/20 text-danger-700 dark:text-danger-300 hover:bg-danger-500/20 dark:hover:bg-danger-500/30 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                        Endpoint:
                                    </span>
                                    <span className="text-sm font-semibold text-secondary-900 dark:text-white text-right max-w-[60%] break-words">
                                        {config.endpoint}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                        Sync Interval:
                                    </span>
                                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">
                                        Every {config.syncIntervalMinutes} minutes
                                    </span>
                                </div>

                                {config.lastSyncAt && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                            Last Sync:
                                        </span>
                                        <span className="text-sm font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                                            {getStatusIcon(config.lastSyncStatus)}
                                            {new Date(config.lastSyncAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                                        Records Synced:
                                    </span>
                                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">
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
