import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { telemetryConfigApi } from '../services/telemetryConfigApi';
import TelemetryConfigModal from '../components/telemetry/TelemetryConfigModal';
import styles from './TelemetryConfigPage.module.css';

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

const TelemetryConfigPage: React.FC = () => {
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
                return <CheckCircle className={styles.statusIconSuccess} />;
            case 'error':
                return <XCircle className={styles.statusIconError} />;
            case 'partial':
                return <Activity className={styles.statusIconPartial} />;
            default:
                return <Activity className={styles.statusIconUnknown} />;
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
            <div className={styles.container}>
                <div className={styles.loading}>Loading configurations...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>External Telemetry Configuration</h1>
                    <p className={styles.subtitle}>
                        Configure external telemetry endpoints to pull your AI usage data into Cost Katana
                    </p>
                </div>
                <button onClick={handleCreate} className={styles.createButton}>
                    <Plus size={20} />
                    Add Configuration
                </button>
            </div>

            {configs.length === 0 ? (
                <div className={styles.emptyState}>
                    <Activity size={64} className={styles.emptyIcon} />
                    <h2>No Telemetry Configurations</h2>
                    <p>Add your first telemetry endpoint to start tracking external AI usage</p>
                    <button onClick={handleCreate} className={styles.emptyButton}>
                        <Plus size={20} />
                        Add Configuration
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {configs.map((config) => (
                        <div key={config._id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitle}>
                                    <span className={styles.endpointType}>
                                        {getEndpointTypeLabel(config.endpointType)}
                                    </span>
                                    {config.syncEnabled && (
                                        <span className={styles.badge}>Active</span>
                                    )}
                                </div>
                                <div className={styles.cardActions}>
                                    <button
                                        onClick={() => handleSync(config._id)}
                                        className={styles.iconButton}
                                        disabled={syncing === config._id}
                                        title="Trigger manual sync"
                                    >
                                        <RefreshCw 
                                            size={16} 
                                            className={syncing === config._id ? styles.spinning : ''}
                                        />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(config)}
                                        className={styles.iconButton}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(config._id)}
                                        className={styles.iconButtonDanger}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Endpoint:</span>
                                    <span className={styles.value}>{config.endpoint}</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Sync Interval:</span>
                                    <span className={styles.value}>
                                        Every {config.syncIntervalMinutes} minutes
                                    </span>
                                </div>

                                {config.lastSyncAt && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Last Sync:</span>
                                        <span className={styles.value}>
                                            {getStatusIcon(config.lastSyncStatus)}
                                            {new Date(config.lastSyncAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Records Synced:</span>
                                    <span className={styles.value}>
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

export default TelemetryConfigPage;

