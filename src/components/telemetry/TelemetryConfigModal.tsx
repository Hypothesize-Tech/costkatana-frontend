import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { telemetryConfigApi } from '../../services/telemetryConfigApi';
import styles from './TelemetryConfigModal.module.css';

interface TelemetryConfigModalProps {
    config: any | null;
    onClose: (reload: boolean) => void;
}

const TelemetryConfigModal: React.FC<TelemetryConfigModalProps> = ({ config, onClose }) => {
    const [formData, setFormData] = useState({
        endpointType: config?.endpointType || 'tempo',
        endpoint: config?.endpoint || '',
        authType: config?.authType || 'none',
        authToken: '',
        syncIntervalMinutes: config?.syncIntervalMinutes || 5,
        queryTimeRangeMinutes: config?.queryTimeRangeMinutes || 10,
        serviceName: config?.queryFilters?.serviceName || '',
        syncEnabled: config?.syncEnabled ?? true
    });

    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        setError(null);

        try {
            const response = await telemetryConfigApi.test({
                endpointType: formData.endpointType,
                endpoint: formData.endpoint,
                authToken: formData.authToken || undefined
            });

            if (response.success) {
                setTestResult(response.data);
            } else {
                setError('Test failed: ' + (response.message || 'Unknown error'));
            }
        } catch (err: any) {
            setError('Test failed: ' + (err.message || 'Connection error'));
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const payload = {
                endpointType: formData.endpointType,
                endpoint: formData.endpoint,
                authType: formData.authType,
                authToken: formData.authToken || undefined,
                syncIntervalMinutes: Number(formData.syncIntervalMinutes),
                queryTimeRangeMinutes: Number(formData.queryTimeRangeMinutes),
                syncEnabled: formData.syncEnabled,
                queryFilters: formData.serviceName ? {
                    serviceName: formData.serviceName
                } : undefined
            };

            if (config) {
                await telemetryConfigApi.update(config._id, payload);
            } else {
                await telemetryConfigApi.create(payload);
            }

            onClose(true);
        } catch (err: any) {
            setError(err.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={() => onClose(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {config ? 'Edit' : 'Add'} Telemetry Configuration
                    </h2>
                    <button onClick={() => onClose(false)} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Endpoint Type *</label>
                        <select
                            name="endpointType"
                            value={formData.endpointType}
                            onChange={handleChange}
                            className={styles.select}
                            required
                            disabled={!!config}
                        >
                            <option value="tempo">Grafana Tempo</option>
                            <option value="jaeger">Jaeger</option>
                            <option value="otlp-http">OTLP HTTP</option>
                            <option value="otlp-grpc">OTLP gRPC</option>
                            <option value="prometheus">Prometheus</option>
                            <option value="custom">Custom</option>
                        </select>
                        <span className={styles.hint}>Select your telemetry backend type</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Endpoint URL *</label>
                        <input
                            type="url"
                            name="endpoint"
                            value={formData.endpoint}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="https://tempo.example.com"
                            required
                        />
                        <span className={styles.hint}>
                            Full URL to your telemetry endpoint (e.g., https://tempo.example.com)
                        </span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Authentication Type</label>
                        <select
                            name="authType"
                            value={formData.authType}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="none">None</option>
                            <option value="bearer">Bearer Token</option>
                            <option value="basic">Basic Auth</option>
                            <option value="api-key">API Key</option>
                        </select>
                    </div>

                    {formData.authType !== 'none' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                {formData.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                            </label>
                            <input
                                type="password"
                                name="authToken"
                                value={formData.authToken}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder={config ? 'Leave blank to keep existing' : 'Enter token'}
                            />
                            <span className={styles.hint}>
                                {config ? 'Leave empty to keep existing token' : 'Your authentication token'}
                            </span>
                        </div>
                    )}

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Sync Interval (minutes)</label>
                            <input
                                type="number"
                                name="syncIntervalMinutes"
                                value={formData.syncIntervalMinutes}
                                onChange={handleChange}
                                className={styles.input}
                                min="1"
                                max="1440"
                                required
                            />
                            <span className={styles.hint}>How often to poll (1-1440)</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Query Range (minutes)</label>
                            <input
                                type="number"
                                name="queryTimeRangeMinutes"
                                value={formData.queryTimeRangeMinutes}
                                onChange={handleChange}
                                className={styles.input}
                                min="1"
                                max="1440"
                                required
                            />
                            <span className={styles.hint}>How far back to query</span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Service Name Filter (optional)</label>
                        <input
                            type="text"
                            name="serviceName"
                            value={formData.serviceName}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="my-ai-service"
                        />
                        <span className={styles.hint}>Only sync data from this service</span>
                    </div>

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="syncEnabled"
                                checked={formData.syncEnabled}
                                onChange={handleChange}
                                className={styles.checkbox}
                            />
                            <span>Enable automatic syncing</span>
                        </label>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {testResult && (
                        <div className={testResult.reachable ? styles.success : styles.warning}>
                            {testResult.reachable ? (
                                <>
                                    ✓ Endpoint is reachable (Response time: {testResult.responseTime}ms)
                                </>
                            ) : (
                                <>
                                    ✗ {testResult.message}
                                </>
                            )}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={handleTest}
                            className={styles.testButton}
                            disabled={testing || !formData.endpoint}
                        >
                            {testing ? (
                                <>
                                    <Loader size={16} className={styles.spinning} />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </button>

                        <div className={styles.rightActions}>
                            <button
                                type="button"
                                onClick={() => onClose(false)}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader size={16} className={styles.spinning} />
                                        Saving...
                                    </>
                                ) : (
                                    config ? 'Update' : 'Create'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TelemetryConfigModal;

