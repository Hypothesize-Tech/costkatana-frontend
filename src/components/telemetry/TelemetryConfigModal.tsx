import React, { useState } from 'react';
import { X, Loader, CheckCircle, XCircle } from 'lucide-react';
import { telemetryConfigApi } from '../../services/telemetryConfigApi';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => onClose(false)}>
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                            <Cog6ToothIcon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-display font-bold gradient-text-primary">
                            {config ? 'Edit' : 'Add'} Telemetry Configuration
                        </h2>
                    </div>
                    <button 
                        onClick={() => onClose(false)} 
                        className="btn-icon p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white">
                            Endpoint Type *
                        </label>
                        <select
                            name="endpointType"
                            value={formData.endpointType}
                            onChange={handleChange}
                            className="input"
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
                        <span className="text-xs text-secondary-600 dark:text-secondary-300">Select your telemetry backend type</span>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white">
                            Endpoint URL *
                        </label>
                        <input
                            type="url"
                            name="endpoint"
                            value={formData.endpoint}
                            onChange={handleChange}
                            className="input"
                            placeholder="https://tempo.example.com"
                            required
                        />
                        <span className="text-xs text-secondary-600 dark:text-secondary-300">
                            Full URL to your telemetry endpoint (e.g., https://tempo.example.com)
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white">
                            Authentication Type
                        </label>
                        <select
                            name="authType"
                            value={formData.authType}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="none">None</option>
                            <option value="bearer">Bearer Token</option>
                            <option value="basic">Basic Auth</option>
                            <option value="api-key">API Key</option>
                        </select>
                    </div>

                    {formData.authType !== 'none' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white">
                                {formData.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                            </label>
                            <input
                                type="password"
                                name="authToken"
                                value={formData.authToken}
                                onChange={handleChange}
                                className="input"
                                placeholder={config ? 'Leave blank to keep existing' : 'Enter token'}
                            />
                            <span className="text-xs text-secondary-600 dark:text-secondary-300">
                                {config ? 'Leave empty to keep existing token' : 'Your authentication token'}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white">
                                Sync Interval (minutes)
                            </label>
                            <input
                                type="number"
                                name="syncIntervalMinutes"
                                value={formData.syncIntervalMinutes}
                                onChange={handleChange}
                                className="input"
                                min="1"
                                max="1440"
                                required
                            />
                            <span className="text-xs text-secondary-600 dark:text-secondary-300">How often to poll (1-1440)</span>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white">
                                Query Range (minutes)
                            </label>
                            <input
                                type="number"
                                name="queryTimeRangeMinutes"
                                value={formData.queryTimeRangeMinutes}
                                onChange={handleChange}
                                className="input"
                                min="1"
                                max="1440"
                                required
                            />
                            <span className="text-xs text-secondary-600 dark:text-secondary-300">How far back to query</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-display font-semibold text-secondary-900 dark:text-white">
                            Service Name Filter (optional)
                        </label>
                        <input
                            type="text"
                            name="serviceName"
                            value={formData.serviceName}
                            onChange={handleChange}
                            className="input"
                            placeholder="my-ai-service"
                        />
                        <span className="text-xs text-secondary-600 dark:text-secondary-300">Only sync data from this service</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="syncEnabled"
                            checked={formData.syncEnabled}
                            onChange={handleChange}
                            className="toggle-switch-sm"
                        />
                        <label className="text-sm font-display font-medium text-secondary-900 dark:text-white cursor-pointer">
                            Enable automatic syncing
                        </label>
                    </div>

                    {error && (
                        <div className="glass rounded-lg p-4 border border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                            <div className="flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                                <span className="text-sm font-body text-danger-700 dark:text-danger-300">{error}</span>
                            </div>
                        </div>
                    )}

                    {testResult && (
                        <div className={`glass rounded-lg p-4 border ${testResult.reachable ? 'border-success-200/30 dark:border-success-500/20 bg-gradient-to-r from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20' : 'border-warning-200/30 dark:border-warning-500/20 bg-gradient-to-r from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20'}`}>
                            <div className="flex items-center gap-2">
                                {testResult.reachable ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
                                        <span className="text-sm font-body text-success-700 dark:text-success-300">
                                            Endpoint is reachable (Response time: {testResult.responseTime}ms)
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                                        <span className="text-sm font-body text-warning-700 dark:text-warning-300">
                                            {testResult.message}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                        <button
                            type="button"
                            onClick={handleTest}
                            className="btn-secondary inline-flex items-center gap-2"
                            disabled={testing || !formData.endpoint}
                        >
                            {testing ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => onClose(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center gap-2"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
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
