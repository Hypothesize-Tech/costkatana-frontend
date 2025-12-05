import React, { useState } from 'react';
import { X, Loader, CheckCircle, XCircle } from 'lucide-react';
import { telemetryConfigApi } from '../../services/telemetryConfigApi';
import { Settings } from 'lucide-react';

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
        <div className="flex fixed inset-0 z-50 justify-center items-center p-2 sm:p-3 md:p-4 backdrop-blur-sm bg-black/50" onClick={() => onClose(false)}>
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-3 sm:p-4 md:p-5 lg:p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex gap-2 sm:gap-3 items-center min-w-0 flex-1">
                        <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-primary shrink-0">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h2 className="text-base sm:text-lg md:text-xl font-bold font-display gradient-text-primary truncate">
                            {config ? 'Edit' : 'Add'} Telemetry Configuration
                        </h2>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 btn btn-icon text-secondary-600 dark:text-secondary-300 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 shrink-0"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold font-display text-secondary-900 dark:text-white">
                            Endpoint Type *
                        </label>
                        <select
                            name="endpointType"
                            value={formData.endpointType}
                            onChange={handleChange}
                            className="input text-xs sm:text-sm"
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
                        <span className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-300">Select your telemetry backend type</span>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold font-display text-secondary-900 dark:text-white">
                            Endpoint URL *
                        </label>
                        <input
                            type="url"
                            name="endpoint"
                            value={formData.endpoint}
                            onChange={handleChange}
                            className="input text-xs sm:text-sm"
                            placeholder="https://tempo.example.com"
                            required
                        />
                        <span className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-300">
                            Full URL to your telemetry endpoint (e.g., https://tempo.example.com)
                        </span>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold font-display text-secondary-900 dark:text-white">
                            Authentication Type
                        </label>
                        <select
                            name="authType"
                            value={formData.authType}
                            onChange={handleChange}
                            className="input text-xs sm:text-sm"
                        >
                            <option value="none">None</option>
                            <option value="bearer">Bearer Token</option>
                            <option value="basic">Basic Auth</option>
                            <option value="api-key">API Key</option>
                        </select>
                    </div>

                    {formData.authType !== 'none' && (
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold font-display text-secondary-900 dark:text-white">
                                {formData.authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                            </label>
                            <input
                                type="password"
                                name="authToken"
                                value={formData.authToken}
                                onChange={handleChange}
                                className="input text-xs sm:text-sm"
                                placeholder={config ? 'Leave blank to keep existing' : 'Enter token'}
                            />
                            <span className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-300">
                                {config ? 'Leave empty to keep existing token' : 'Your authentication token'}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold font-display text-secondary-900 dark:text-white">
                                Sync Interval (minutes)
                            </label>
                            <input
                                type="number"
                                name="syncIntervalMinutes"
                                value={formData.syncIntervalMinutes}
                                onChange={handleChange}
                                className="input text-xs sm:text-sm"
                                min="1"
                                max="1440"
                                required
                            />
                            <span className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-300">How often to poll (1-1440)</span>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold font-display text-secondary-900 dark:text-white">
                                Query Range (minutes)
                            </label>
                            <input
                                type="number"
                                name="queryTimeRangeMinutes"
                                value={formData.queryTimeRangeMinutes}
                                onChange={handleChange}
                                className="input text-xs sm:text-sm"
                                min="1"
                                max="1440"
                                required
                            />
                            <span className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-300">How far back to query</span>
                        </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-semibold font-display text-secondary-900 dark:text-white">
                            Service Name Filter (optional)
                        </label>
                        <input
                            type="text"
                            name="serviceName"
                            value={formData.serviceName}
                            onChange={handleChange}
                            className="input text-xs sm:text-sm"
                            placeholder="my-ai-service"
                        />
                        <span className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-300">Only sync data from this service</span>
                    </div>

                    <div className="flex gap-2 sm:gap-3 items-center">
                        <input
                            type="checkbox"
                            name="syncEnabled"
                            checked={formData.syncEnabled}
                            onChange={handleChange}
                            className="toggle-switch-sm"
                        />
                        <label className="text-xs sm:text-sm font-medium cursor-pointer font-display text-secondary-900 dark:text-white">
                            Enable automatic syncing
                        </label>
                    </div>

                    {error && (
                        <div className="p-4 bg-gradient-to-r rounded-lg border glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                            <div className="flex gap-2 items-center">
                                <XCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                                <span className="text-sm font-body text-danger-700 dark:text-danger-300">{error}</span>
                            </div>
                        </div>
                    )}

                    {testResult && (
                        <div className={`glass rounded-lg p-4 border ${testResult.reachable ? 'border-success-200/30 dark:border-success-500/20 bg-gradient-to-r from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20' : 'border-warning-200/30 dark:border-warning-500/20 bg-gradient-to-r from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20'}`}>
                            <div className="flex gap-2 items-center">
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
                            className="inline-flex gap-2 items-center btn btn-secondary"
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
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex gap-2 items-center btn btn-primary"
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
