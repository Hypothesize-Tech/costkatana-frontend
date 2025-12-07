import React, { useState, useEffect } from 'react';
import {
    Cog6ToothIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChartBarIcon,
    BoltIcon,
    ShieldCheckIcon,
    BeakerIcon,
    CloudIcon,
    CpuChipIcon,
    ArrowPathIcon,
    DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { CostIntelligenceService } from '../services/costIntelligence.service';
import { CostIntelligenceConfig } from '../types/costIntelligence.types';
import { CostConfigShimmer } from '../components/shimmer';
import { useNavigate } from 'react-router-dom';

// Utility class for theme-based panel bg
const panelBg =
    'bg-white dark:bg-gray-950/80'; // use solid for white, subtle translucent for dark

const panelSectionBg =
    'bg-gray-50 dark:bg-gray-900'; // for important inner blocks

const minimalSectionBg =
    'bg-transparent dark:bg-transparent';

// Reduced shadow to match less "card" feeling
const panelShadow = 'shadow border border-primary-200/30 dark:border-primary-500/20';

const inputPanelBg =
    'bg-white dark:bg-[#15151b]'; // use subtle dark background for inputs, solid white for light

const CostIntelligenceConfigPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<CostIntelligenceConfig | null>(null);
    const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
    const [activeTab, setActiveTab] = useState<string>('telemetry');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const configData = await CostIntelligenceService.getConfig();
            setConfig(configData);

            // Validate on load
            const validationResult = await CostIntelligenceService.validateConfig();
            setValidation(validationResult);
        } catch (error) {
            console.error('Failed to load configuration:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (layer: string, updates: any) => {
        try {
            setSaving(true);
            await CostIntelligenceService.updateLayerConfig(layer, updates);
            await loadConfig(); // Reload to get updated config
        } catch (error) {
            console.error('Failed to update configuration:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all configuration to defaults?')) {
            try {
                setSaving(true);
                await CostIntelligenceService.resetConfig();
                await loadConfig();
            } catch (error) {
                console.error('Failed to reset configuration:', error);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleExport = async () => {
        try {
            const configData = await CostIntelligenceService.getConfig();
            const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cost-intelligence-config.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export configuration:', error);
        }
    };

    const toggleFeature = (layer: keyof CostIntelligenceConfig, feature: string, value: boolean) => {
        if (!config) return;

        const updates = { [feature]: value };
        handleUpdate(layer, updates);
    };

    const updateValue = (layer: keyof CostIntelligenceConfig, path: string[], value: any) => {
        if (!config) return;

        const layerConfig = config[layer] as any;
        const updates: any = {};

        if (path.length === 1) {
            updates[path[0]] = value;
        } else if (path.length === 2) {
            updates[path[0]] = {
                ...layerConfig[path[0]],
                [path[1]]: value
            };
        }

        handleUpdate(layer, updates);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background dark:bg-background-dark p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <CostConfigShimmer />
                </div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="min-h-screen bg-background dark:bg-background-dark p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">Failed to load configuration</p>
                    </div>
                </div>
            </div>
        );
    }

    const layers = [
        { id: 'telemetry', name: 'Layer 1: Telemetry', icon: ChartBarIcon, description: 'Cost telemetry collection and streaming' },
        { id: 'intelligence', name: 'Layer 2: Intelligence', icon: BoltIcon, description: 'Continuous background analysis and insights' },
        { id: 'routing', name: 'Layer 3: Routing', icon: CpuChipIcon, description: 'Telemetry-based model routing' },
        { id: 'enforcement', name: 'Layer 4: Enforcement', icon: ShieldCheckIcon, description: 'Pre-flight budget checks and limits' },
        { id: 'caching', name: 'Layer 5: Caching', icon: CloudIcon, description: 'Cache-first approach with semantic caching' },
        { id: 'simulation', name: 'Layer 6: Simulation', icon: BeakerIcon, description: 'Cost prediction and alternatives' },
    ];

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/cost-intelligence')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                <Cog6ToothIcon className="h-8 w-8 text-primary-500" />
                                Cost Intelligence Configuration
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Configure all 6 layers of the Cost Intelligence Stack
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 shadow"
                        >
                            <DocumentArrowDownIcon className="h-5 w-5" />
                            Export
                        </button>
                        <button
                            onClick={handleReset}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Validation Status */}
                {validation && (
                    <div className={`p-4 rounded-lg border ${validation.valid
                        ? 'bg-green-50 dark:bg-transparent border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-transparent border-red-200 dark:border-red-800'
                        }`}>
                        <div className="flex items-center gap-2">
                            {validation.valid ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircleIcon className="h-5 w-5 text-red-500" />
                            )}
                            <span className={`font-medium ${validation.valid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                }`}>
                                {validation.valid ? 'Configuration is valid' : 'Configuration has errors'}
                            </span>
                        </div>
                        {validation.errors.length > 0 && (
                            <ul className="mt-2 ml-7 list-disc text-sm text-red-700 dark:text-red-300">
                                {validation.errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                    {layers.map((layer) => {
                        const Icon = layer.icon;
                        return (
                            <button
                                key={layer.id}
                                onClick={() => setActiveTab(layer.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${activeTab === layer.id
                                    ? 'bg-primary-500 text-white shadow'
                                    : 'bg-gray-100 dark:bg-[#19191f] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#232332]'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="hidden sm:inline">{layer.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Configuration Panels */}
                <div className="space-y-6">
                    {/* Layer 1: Telemetry */}
                    {activeTab === 'telemetry' && (
                        <div className={`p-6 rounded-xl ${panelShadow} ${panelBg}`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Telemetry Configuration</h2>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Enable Telemetry</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Collect cost telemetry data</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.telemetry.enabled}
                                            onChange={(e) => toggleFeature('telemetry', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`p-4 rounded-lg ${panelSectionBg}`}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sample Rate: {config.telemetry.sampleRate}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={config.telemetry.sampleRate}
                                        onChange={(e) => updateValue('telemetry', ['sampleRate'], parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {(config.telemetry.sampleRate * 100).toFixed(0)}% of requests will be sampled
                                    </p>
                                </div>

                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Enable Streaming</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Real-time SSE streaming</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.telemetry.streaming.enabled}
                                            onChange={(e) => updateValue('telemetry', ['streaming', 'enabled'], e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Layer 2: Intelligence */}
                    {activeTab === 'intelligence' && (
                        <div className={`p-6 rounded-xl ${panelShadow} ${panelBg}`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Intelligence Configuration</h2>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Enable Intelligence</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Background analysis and insights</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.intelligence.enabled}
                                            onChange={(e) => toggleFeature('intelligence', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Continuous Analysis</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Run analysis in background</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.intelligence.continuousAnalysis}
                                            onChange={(e) => toggleFeature('intelligence', 'continuousAnalysis', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`p-4 rounded-lg ${panelSectionBg}`}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Spike Threshold: {config.intelligence.anomalyDetection.spikeThreshold}%
                                    </label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="200"
                                        step="10"
                                        value={config.intelligence.anomalyDetection.spikeThreshold}
                                        onChange={(e) => updateValue('intelligence', ['anomalyDetection', 'spikeThreshold'], parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Layer 3: Routing */}
                    {activeTab === 'routing' && (
                        <div className={`p-6 rounded-xl ${panelShadow} ${panelBg}`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Routing Configuration</h2>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Enable Routing</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent model routing</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.routing.enabled}
                                            onChange={(e) => toggleFeature('routing', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Use Telemetry Data</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Route based on actual performance</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.routing.useTelemetryData}
                                            onChange={(e) => toggleFeature('routing', 'useTelemetryData', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`p-4 rounded-lg ${panelSectionBg}`}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fallback Strategy
                                    </label>
                                    <select
                                        value={config.routing.fallbackStrategy}
                                        onChange={(e) => updateValue('routing', ['fallbackStrategy'], e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ${inputPanelBg} text-gray-900 dark:text-white`}
                                    >
                                        <option value="cost">Cost</option>
                                        <option value="speed">Speed</option>
                                        <option value="quality">Quality</option>
                                        <option value="balanced">Balanced</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Layer 4: Enforcement */}
                    {activeTab === 'enforcement' && (
                        <div className={`p-6 rounded-xl ${panelShadow} ${panelBg}`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enforcement Configuration</h2>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Enable Enforcement</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pre-flight budget checks</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.enforcement.enabled}
                                            onChange={(e) => toggleFeature('enforcement', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Hard Limits</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Reject requests when budget exceeded</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.enforcement.hardLimits}
                                            onChange={(e) => toggleFeature('enforcement', 'hardLimits', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Layer 5: Caching */}
                    {activeTab === 'caching' && (
                        <div className={`p-6 rounded-xl ${panelShadow} ${panelBg}`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Caching Configuration</h2>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Enable Caching</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Cache-first approach</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.caching.enabled}
                                            onChange={(e) => toggleFeature('caching', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Semantic Cache (Default)</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Enable semantic caching by default</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.caching.semanticCache.enabledByDefault}
                                            onChange={(e) => updateValue('caching', ['semanticCache', 'enabledByDefault'], e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`p-4 rounded-lg ${panelSectionBg}`}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Similarity Threshold: {config.caching.semanticCache.similarityThreshold}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={config.caching.semanticCache.similarityThreshold}
                                        onChange={(e) => updateValue('caching', ['semanticCache', 'similarityThreshold'], parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Layer 6: Simulation */}
                    {activeTab === 'simulation' && (
                        <div className={`p-6 rounded-xl ${panelShadow} ${panelBg}`}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Simulation Configuration</h2>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Enable Simulation</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Cost prediction for all requests</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.simulation.enabled}
                                            onChange={(e) => toggleFeature('simulation', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className={`flex items-center justify-between p-4 rounded-lg ${minimalSectionBg}`}>
                                    <div>
                                        <label className="font-medium text-gray-900 dark:text-white">Include Alternatives</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Suggest cheaper model alternatives</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.simulation.includeAlternatives}
                                            onChange={(e) => toggleFeature('simulation', 'includeAlternatives', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Global Settings */}
                    <div className={`p-6 rounded-xl ${panelShadow} ${panelBg}`}>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Global Settings</h2>
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${panelSectionBg}`}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Performance Mode
                                </label>
                                <select
                                    value={config.global.performanceMode}
                                    onChange={(e) => updateValue('global', ['performanceMode'], e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ${inputPanelBg} text-gray-900 dark:text-white`}
                                >
                                    <option value="low">Low (Maximum Performance)</option>
                                    <option value="medium">Medium (Balanced)</option>
                                    <option value="high">High (All Features)</option>
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Trade-off between features and performance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {saving && (
                    <div className="fixed bottom-4 right-4 p-4 bg-primary-500 text-white rounded-lg shadow">
                        <div className="flex items-center gap-2">
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            <span>Saving...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CostIntelligenceConfigPage;
