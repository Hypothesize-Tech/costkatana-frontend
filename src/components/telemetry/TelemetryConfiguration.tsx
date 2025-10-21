import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { telemetryConfigApi } from '../../services/telemetryConfigApi';
import TelemetryConfigModal from './TelemetryConfigModal';
import './TelemetryConfiguration.css';

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
                return <CheckCircle className="telemetry-config-status-icon-success" size={16} />;
            case 'error':
                return <XCircle className="telemetry-config-status-icon-error" size={16} />;
            case 'partial':
                return <Activity className="telemetry-config-status-icon-partial" size={16} />;
            default:
                return <Activity className="telemetry-config-status-icon-unknown" size={16} />;
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
            <div className="telemetry-config-container">
                <div className="telemetry-config-loading">Loading configurations...</div>
            </div>
        );
    }

    return (
        <div className="telemetry-config-container">
            <div className="telemetry-config-header">
                <div>
                    <h2 className="telemetry-config-title">External Telemetry Sources</h2>
                    <p className="telemetry-config-subtitle">
                        Configure external telemetry endpoints to pull your AI usage data into Cost Katana
                    </p>
                </div>
                <button onClick={handleCreate} className="telemetry-config-create-button">
                    <Plus size={20} />
                    Add Source
                </button>
            </div>

            {configs.length === 0 ? (
                <div className="telemetry-config-empty-state">
                    <Activity size={48} className="telemetry-config-empty-icon" />
                    <h3>No External Telemetry Sources</h3>
                    <p>Add your first telemetry endpoint to start tracking external AI usage</p>
                    <button onClick={handleCreate} className="telemetry-config-empty-button">
                        <Plus size={20} />
                        Add Source
                    </button>
                </div>
            ) : (
                <div className="telemetry-config-grid">
                    {configs.map((config) => (
                        <div key={config._id} className="telemetry-config-card">
                            <div className="telemetry-config-card-header">
                                <div className="telemetry-config-card-title">
                                    <span className="telemetry-config-endpoint-type">
                                        {getEndpointTypeLabel(config.endpointType)}
                                    </span>
                                    {config.syncEnabled && (
                                        <span className="telemetry-config-badge">Active</span>
                                    )}
                                </div>
                                <div className="telemetry-config-card-actions">
                                    <button
                                        onClick={() => handleSync(config._id)}
                                        className="telemetry-config-icon-button"
                                        disabled={syncing === config._id}
                                        title="Trigger manual sync"
                                    >
                                        <RefreshCw
                                            size={16}
                                            className={syncing === config._id ? 'telemetry-config-spinning' : ''}
                                        />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(config)}
                                        className="telemetry-config-icon-button"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(config._id)}
                                        className="telemetry-config-icon-button-danger"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="telemetry-config-card-content">
                                <div className="telemetry-config-info-row">
                                    <span className="telemetry-config-label">Endpoint:</span>
                                    <span className="telemetry-config-value">{config.endpoint}</span>
                                </div>

                                <div className="telemetry-config-info-row">
                                    <span className="telemetry-config-label">Sync Interval:</span>
                                    <span className="telemetry-config-value">
                                        Every {config.syncIntervalMinutes} minutes
                                    </span>
                                </div>

                                {config.lastSyncAt && (
                                    <div className="telemetry-config-info-row">
                                        <span className="telemetry-config-label">Last Sync:</span>
                                        <span className="telemetry-config-value">
                                            {getStatusIcon(config.lastSyncStatus)}
                                            {new Date(config.lastSyncAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="telemetry-config-info-row">
                                    <span className="telemetry-config-label">Records Synced:</span>
                                    <span className="telemetry-config-value">
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

