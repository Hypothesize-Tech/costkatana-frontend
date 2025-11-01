import React, { useState } from 'react';
import { Check, Sparkles, DollarSign, BarChart3, Shield, Zap, X } from 'lucide-react';

interface Feature {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    recommended?: boolean;
}

interface FeatureSelectorProps {
    onConfirm: (features: { name: string; enabled: boolean }[], integrationType: 'npm' | 'cli' | 'python' | 'http-headers') => void;
    onClose?: () => void;
    repositoryName?: string;
    detectedLanguage?: string;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({
    onConfirm,
    onClose,
    repositoryName,
    detectedLanguage
}) => {
    const [integrationType, setIntegrationType] = useState<'npm' | 'cli' | 'python' | 'http-headers'>(
        detectedLanguage === 'python' ? 'python' : 'npm'
    );

    const [features, setFeatures] = useState<Feature[]>([
        {
            id: 'cost-tracking',
            name: 'Cost Tracking',
            description: 'Real-time monitoring of AI API costs with detailed breakdowns',
            icon: <DollarSign className="w-5 h-5" />,
            enabled: true,
            recommended: true
        },
        {
            id: 'telemetry',
            name: 'Telemetry & Monitoring',
            description: 'Track performance metrics, latency, and usage patterns',
            icon: <BarChart3 className="w-5 h-5" />,
            enabled: true,
            recommended: true
        },
        {
            id: 'cortex-optimization',
            name: 'Cortex Optimization',
            description: 'Reduce token usage by 30-40% with intelligent compression',
            icon: <Sparkles className="w-5 h-5" />,
            enabled: false
        },
        {
            id: 'budget-management',
            name: 'Budget Management',
            description: 'Set spending limits and receive alerts',
            icon: <Shield className="w-5 h-5" />,
            enabled: false
        },
        {
            id: 'analytics',
            name: 'Advanced Analytics',
            description: 'Detailed insights and cost optimization recommendations',
            icon: <Zap className="w-5 h-5" />,
            enabled: false
        }
    ]);

    const toggleFeature = (id: string) => {
        setFeatures(features.map(f =>
            f.id === id ? { ...f, enabled: !f.enabled } : f
        ));
    };

    const handleConfirm = () => {
        const selectedFeatures = features
            .filter(f => f.enabled)
            .map(f => ({ name: f.id, enabled: true }));

        onConfirm(selectedFeatures, integrationType);
    };

    const enabledCount = features.filter(f => f.enabled).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                            Configure Integration
                        </h2>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                            </button>
                        )}
                    </div>
                    {repositoryName && (
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            Setting up CostKatana for <span className="font-semibold text-primary-600 dark:text-primary-400">{repositoryName}</span>
                        </p>
                    )}
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                    {/* Integration Type */}
                    <div>
                        <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                            Integration Type
                        </label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <button
                                onClick={() => setIntegrationType('npm')}
                                className={`p-4 border-2 rounded-xl transition-all focus-ring ${integrationType === 'npm'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">📦</div>
                                    <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">NPM Package</div>
                                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                                        cost-katana core
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setIntegrationType('cli')}
                                className={`p-4 border-2 rounded-xl transition-all focus-ring ${integrationType === 'cli'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">⌨️</div>
                                    <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">CLI Tool</div>
                                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                                        cost-katana cli
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setIntegrationType('python')}
                                className={`p-4 border-2 rounded-xl transition-all focus-ring ${integrationType === 'python'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🐍</div>
                                    <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">Python SDK</div>
                                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                                        cost-katana
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setIntegrationType('http-headers')}
                                className={`p-4 border-2 rounded-xl transition-all focus-ring ${integrationType === 'http-headers'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🌐</div>
                                    <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">HTTP Headers</div>
                                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                                        Any language
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                                Features ({enabledCount} selected)
                            </label>
                            <button
                                onClick={() => setFeatures(features.map(f => ({ ...f, enabled: true })))}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus-ring"
                            >
                                Select All
                            </button>
                        </div>

                        <div className="space-y-3">
                            {features.map((feature) => (
                                <button
                                    key={feature.id}
                                    onClick={() => toggleFeature(feature.id)}
                                    className={`w-full p-4 border-2 rounded-xl transition-all text-left focus-ring ${feature.enabled
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 ${feature.enabled
                                            ? 'text-primary-600 dark:text-primary-400'
                                            : 'text-secondary-400 dark:text-secondary-500'
                                            }`}>
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    {feature.name}
                                                </span>
                                                {feature.recommended && (
                                                    <span className="text-xs px-2 py-0.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-full">
                                                        Recommended
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                                {feature.description}
                                            </p>
                                        </div>
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center ${feature.enabled
                                            ? 'border-primary-500 bg-primary-500'
                                            : 'border-secondary-300 dark:border-secondary-600'
                                            }`}>
                                            {feature.enabled && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                        <p className="text-sm text-primary-900 dark:text-primary-100">
                            <strong>What happens next?</strong> We'll analyze your repository, generate integration code, and create a pull request with all the setup. You can review and merge it when ready!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {enabledCount === 0 ? 'Select at least one feature' : `${enabledCount} feature${enabledCount > 1 ? 's' : ''} selected`}
                    </div>
                    <div className="flex items-center gap-3">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-light-text-primary dark:text-dark-text-primary hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleConfirm}
                            disabled={enabledCount === 0}
                            className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Start Integration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureSelector;

