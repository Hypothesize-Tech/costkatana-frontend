import React, { useState, useEffect } from 'react';
import { apiClient } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface CPIDashboardProps {
    userId: string;
    projectId?: string;
}

interface ProviderComparison {
    provider: string;
    modelId: string;
    modelName: string;
    cpiScore: number;
    estimatedCost: number;
    estimatedLatency: number;
    metrics: {
        costEfficiencyScore: number;
        performanceScore: number;
        qualityScore: number;
        reliabilityScore: number;
    };
}

interface CPIAnalytics {
    providerComparison: Array<{
        provider: string;
        averageCPI: number;
        costTrend: number;
        performanceTrend: number;
        marketShare: number;
        totalRequests: number;
        totalCost: number;
    }>;
    costSavings: {
        totalSaved: number;
        percentageSaved: number;
        savingsByProvider: Record<string, number>;
        savingsByModel: Record<string, number>;
    };
    performanceInsights: Array<{
        insight: string;
        impact: 'high' | 'medium' | 'low';
        recommendation: string;
        estimatedSavings?: number;
    }>;
}

interface OptimizationRecommendation {
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    estimatedSavings?: number;
    estimatedLatencyImprovement?: number;
    estimatedUptimeImprovement?: number;
    confidence: number;
    action: string;
}

export const CPIDashboard: React.FC<CPIDashboardProps> = ({ userId, projectId }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'routing' | 'comparison' | 'analytics' | 'recommendations'>('overview');
    const [providerComparison, setProviderComparison] = useState<ProviderComparison[]>([]);
    const [analytics, setAnalytics] = useState<CPIAnalytics | null>(null);
    const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testConfig, setTestConfig] = useState({
        promptTokens: 1000,
        completionTokens: 500,
        useCase: 'general' as const,
        qualityRequirement: 'medium' as const,
        latencyRequirement: 'normal' as const,
        reliabilityRequirement: 'medium' as const
    });

    const actualUserId = userId === 'current' ? user?.id : userId;

    useEffect(() => {
        if (actualUserId) {
            loadProviderComparison();
            loadAnalytics();
            loadRecommendations();
        }
    }, [actualUserId, projectId, testConfig]);

    const loadProviderComparison = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.post('/cpi/compare', testConfig);

            if (response.data.success) {
                setProviderComparison(response.data.data.comparison);
            } else {
                setError(response.data.error || 'Failed to load provider comparison');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load provider comparison');
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(`/cpi/analytics?userId=${actualUserId}&projectId=${projectId || 'all'}`);

            if (response.data.success) {
                setAnalytics(response.data.data.analytics);
            } else {
                setError(response.data.error || 'Failed to load analytics');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(`/cpi/recommendations?userId=${actualUserId}&projectId=${projectId || 'all'}&timeframe=30d`);

            if (response.data.success) {
                setRecommendations(response.data.data.recommendations);
            } else {
                setError(response.data.error || 'Failed to load recommendations');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConfigChange = (field: keyof typeof testConfig, value: any) => {
        setTestConfig(prev => ({ ...prev, [field]: value }));
    };

    const refreshData = () => {
        loadProviderComparison();
        loadAnalytics();
        loadRecommendations();
    };

    const getCPIScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(amount);
    };

    const formatLatency = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    if (loading && !providerComparison.length && !analytics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error && !providerComparison.length && !analytics) {
        return (
            <div className="p-6 border border-danger-200/30 rounded-xl glass backdrop-blur-xl shadow-lg animate-scale-in" style={{ background: 'linear-gradient(90deg, rgba(255, 79, 100, 0.1), rgba(233, 78, 78, 0.1))' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-danger p-2 rounded-lg glow-danger">
                            <span className="text-lg text-white">⚠️</span>
                        </div>
                        <p className="font-body text-danger-700 dark:text-danger-300">{error}</p>
                    </div>
                    <button
                        onClick={refreshData}
                        className="btn-primary font-display font-semibold"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-screen relative overflow-hidden">
            {/* Ambient Glow Effects */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse"></div>

            {/* Header */}
            <div className="card shadow-2xl backdrop-blur-xl border border-primary-200/30 p-8 animate-fade-in relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-primary p-4 rounded-xl glow-primary">
                            <span className="text-3xl">📊</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold gradient-text mb-2">
                                Cost-Performance Index (CPI) Dashboard
                            </h1>
                            <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Intelligent routing and cost optimization across AI providers
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="btn-primary font-display font-semibold px-6 py-3 disabled:opacity-50 hover:scale-105 transition-all duration-300"
                    >
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="card shadow-2xl backdrop-blur-xl border border-primary-200/30 relative z-10">
                <nav className="flex space-x-2 px-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: '📊' },
                        { id: 'routing', label: 'Intelligent Routing', icon: '🧠' },
                        { id: 'comparison', label: 'Provider Comparison', icon: '⚖️' },
                        { id: 'analytics', label: 'Analytics', icon: '📈' },
                        { id: 'recommendations', label: 'Recommendations', icon: '💡' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-6 py-4 text-sm font-display font-semibold border-b-4 border-transparent transition-all duration-300 hover:scale-105 rounded-t-xl ${activeTab === tab.id
                                ? 'bg-gradient-primary text-white shadow-lg border-b-primary-500'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="card shadow-2xl backdrop-blur-xl border border-primary-200/30 p-8 relative z-10">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
                                <span className="text-lg">📊</span>
                            </div>
                            <h2 className="text-2xl font-display font-bold gradient-text">CPI Overview</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <>
                                {/* Key Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-primary-500" style={{ background: 'linear-gradient(135deg, rgba(155, 93, 229, 0.1), rgba(241, 91, 181, 0.05))' }}>
                                        <div className="text-sm font-display font-semibold text-primary-600 dark:text-primary-400 mb-2">Average CPI Score</div>
                                        <div className="text-3xl font-display font-bold gradient-text">
                                            {analytics ? (analytics.providerComparison.reduce((sum, p) => sum + p.averageCPI, 0) / analytics.providerComparison.length).toFixed(1) : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-success-500" style={{ background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(61, 190, 139, 0.05))' }}>
                                        <div className="text-sm font-display font-semibold text-success-600 dark:text-success-400 mb-2">Cost Savings</div>
                                        <div className="text-3xl font-display font-bold gradient-text">
                                            {analytics ? formatCurrency(analytics.costSavings.totalSaved) : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-accent-500" style={{ background: 'linear-gradient(135deg, rgba(254, 228, 64, 0.1), rgba(255, 149, 0, 0.05))' }}>
                                        <div className="text-sm font-display font-semibold text-accent-600 dark:text-accent-400 mb-2">Total Requests</div>
                                        <div className="text-3xl font-display font-bold gradient-text">
                                            {analytics ? analytics.providerComparison.reduce((sum, p) => sum + p.totalRequests, 0).toLocaleString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-highlight-500" style={{ background: 'linear-gradient(135deg, rgba(241, 91, 181, 0.1), rgba(255, 149, 0, 0.05))' }}>
                                        <div className="text-sm font-display font-semibold text-highlight-600 dark:text-highlight-400 mb-2">Providers</div>
                                        <div className="text-3xl font-display font-bold gradient-text">
                                            {analytics ? analytics.providerComparison.length : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Performing Models */}
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-gradient-success p-2 rounded-lg glow-success">
                                            <span className="text-lg text-white">🏆</span>
                                        </div>
                                        <h3 className="text-xl font-display font-bold gradient-text">Top Performing Models</h3>
                                    </div>
                                    {providerComparison.length > 0 ? (
                                        <div className="space-y-4">
                                            {providerComparison
                                                .sort((a, b) => b.cpiScore - a.cpiScore)
                                                .slice(0, 3)
                                                .map((model, index) => (
                                                    <div key={`${model.provider}-${model.modelId}`} className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="bg-gradient-primary p-3 rounded-xl text-white font-display font-bold text-xl glow-primary">#{index + 1}</div>
                                                                <div>
                                                                    <div className="font-display font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">{model.modelName}</div>
                                                                    <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">{model.provider}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-display font-bold gradient-text">
                                                                    {model.cpiScore}
                                                                </div>
                                                                <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">CPI Score</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="card p-8 text-center">
                                            <div className="text-6xl mb-4">📊</div>
                                            <p className="text-lg font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">No provider comparison data available</p>
                                            <p className="text-sm font-body text-light-text-muted dark:text-dark-text-muted mt-2">Start using AI services to see performance metrics</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'routing' && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
                                <span className="text-lg">🧠</span>
                            </div>
                            <h2 className="text-2xl font-display font-bold gradient-text">Intelligent Routing</h2>
                        </div>

                        <div className="card p-6 shadow-lg border-l-4 border-primary-500" style={{ background: 'linear-gradient(135deg, rgba(155, 93, 229, 0.1), rgba(241, 91, 181, 0.05))' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
                                    <span className="text-lg text-white">💡</span>
                                </div>
                                <div className="text-lg font-display font-semibold gradient-text">How it works</div>
                            </div>
                            <p className="font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">
                                The CPI system automatically routes your AI requests to the best provider based on cost, performance, quality, and reliability requirements.
                                Simply add the <code className="bg-primary-100/50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-1 rounded-lg text-sm font-mono border border-primary-200/30">x-costkatana-intelligent-routing: true</code> header to your requests.
                            </p>
                        </div>

                        {/* Test Configuration */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-accent p-2 rounded-lg glow-accent">
                                    <span className="text-lg text-white">⚙️</span>
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text">Test Configuration</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="label mb-2">Prompt Tokens</label>
                                    <input
                                        type="number"
                                        value={testConfig.promptTokens}
                                        onChange={(e) => handleTestConfigChange('promptTokens', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2">Completion Tokens</label>
                                    <input
                                        type="number"
                                        value={testConfig.completionTokens}
                                        onChange={(e) => handleTestConfigChange('completionTokens', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2">Use Case</label>
                                    <select
                                        value={testConfig.useCase}
                                        onChange={(e) => handleTestConfigChange('useCase', e.target.value)}
                                        className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                    >
                                        <option value="general">General</option>
                                        <option value="creative">Creative</option>
                                        <option value="analytical">Analytical</option>
                                        <option value="conversational">Conversational</option>
                                        <option value="code">Code</option>
                                        <option value="vision">Vision</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label mb-2">Quality Requirement</label>
                                    <select
                                        value={testConfig.qualityRequirement}
                                        onChange={(e) => handleTestConfigChange('qualityRequirement', e.target.value)}
                                        className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="ultra">Ultra</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label mb-2">Latency Requirement</label>
                                    <select
                                        value={testConfig.latencyRequirement}
                                        onChange={(e) => handleTestConfigChange('latencyRequirement', e.target.value)}
                                        className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                    >
                                        <option value="relaxed">Relaxed</option>
                                        <option value="normal">Normal</option>
                                        <option value="strict">Strict</option>
                                        <option value="real-time">Real-time</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label mb-2">Reliability Requirement</label>
                                    <select
                                        value={testConfig.reliabilityRequirement}
                                        onChange={(e) => handleTestConfigChange('reliabilityRequirement', e.target.value)}
                                        className="w-full px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Routing Strategy Configuration */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-secondary p-2 rounded-lg glow-secondary">
                                    <span className="text-lg text-white">🎯</span>
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text">Routing Strategy</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-success-500" style={{ background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(61, 190, 139, 0.05))' }}>
                                    <h4 className="font-display font-semibold text-lg gradient-text mb-3">Cost Optimized</h4>
                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">Prioritizes lower cost models</p>
                                    <div className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                                        Weights: Cost 50%, Performance 20%, Quality 15%, Reliability 15%
                                    </div>
                                </div>
                                <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-primary-500" style={{ background: 'linear-gradient(135deg, rgba(155, 93, 229, 0.1), rgba(241, 91, 181, 0.05))' }}>
                                    <h4 className="font-display font-semibold text-lg gradient-text mb-3">Performance Optimized</h4>
                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">Prioritizes faster response times</p>
                                    <div className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                                        Weights: Cost 15%, Performance 50%, Quality 20%, Reliability 15%
                                    </div>
                                </div>
                                <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-accent-500" style={{ background: 'linear-gradient(135deg, rgba(254, 228, 64, 0.1), rgba(255, 149, 0, 0.05))' }}>
                                    <h4 className="font-display font-semibold text-lg gradient-text mb-3">Balanced</h4>
                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">Optimizes for cost-performance ratio</p>
                                    <div className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                                        Weights: Cost 30%, Performance 30%, Quality 20%, Reliability 20%
                                    </div>
                                </div>
                                <div className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg border-l-4 border-highlight-500" style={{ background: 'linear-gradient(135deg, rgba(241, 91, 181, 0.1), rgba(255, 149, 0, 0.05))' }}>
                                    <h4 className="font-display font-semibold text-lg gradient-text mb-3">Reliability Optimized</h4>
                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">Prioritizes stable, reliable models</p>
                                    <div className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                                        Weights: Cost 20%, Performance 15%, Quality 20%, Reliability 45%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'comparison' && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
                                <span className="text-lg">⚖️</span>
                            </div>
                            <h2 className="text-2xl font-display font-bold gradient-text">Provider Comparison</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="spinner"></div>
                            </div>
                        ) : providerComparison.length > 0 ? (
                            <div className="card shadow-2xl backdrop-blur-xl border border-primary-200/30 overflow-hidden">
                                <table className="min-w-full divide-y divide-primary-200/30">
                                    <thead className="glass bg-gradient-to-r from-primary-50/30 to-secondary-50/30">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-display font-bold gradient-text uppercase tracking-wider">
                                                Provider & Model
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-display font-bold gradient-text uppercase tracking-wider">
                                                CPI Score
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-display font-bold gradient-text uppercase tracking-wider">
                                                Cost (per 1M tokens)
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-display font-bold gradient-text uppercase tracking-wider">
                                                Latency
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-display font-bold gradient-text uppercase tracking-wider">
                                                Metrics
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="glass divide-y divide-primary-200/30">
                                        {providerComparison.map((model) => (
                                            <tr key={`${model.provider}-${model.modelId}`} className="hover:bg-primary-500/5 transition-all duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{model.modelName}</div>
                                                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">{model.provider}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xl font-display font-bold gradient-text">
                                                        {model.cpiScore}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    {formatCurrency(model.estimatedCost)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    {formatLatency(model.estimatedLatency)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500">Cost:</span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-green-600 h-2 rounded-full"
                                                                    style={{ width: `${model.metrics.costEfficiencyScore}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-700">{model.metrics.costEfficiencyScore}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500">Perf:</span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${model.metrics.performanceScore}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-700">{model.metrics.performanceScore}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500">Quality:</span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-purple-600 h-2 rounded-full"
                                                                    style={{ width: `${model.metrics.qualityScore}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-700">{model.metrics.qualityScore}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500">Reliability:</span>
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-orange-600 h-2 rounded-full"
                                                                    style={{ width: `${model.metrics.reliabilityScore}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-700">{model.metrics.reliabilityScore}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="card p-8 text-center">
                                <div className="text-6xl mb-4">⚖️</div>
                                <p className="text-lg font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">No provider comparison data available</p>
                                <p className="text-sm font-body text-light-text-muted dark:text-dark-text-muted mt-2">Try adjusting the test configuration above</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">CPI Analytics</h2>

                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : analytics ? (
                            <>
                                {/* Provider Performance */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Performance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {analytics.providerComparison.map((provider) => (
                                            <div key={provider.provider} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900 capitalize">{provider.provider}</h4>
                                                    <div className={`text-lg font-bold ${getCPIScoreColor(provider.averageCPI)}`}>
                                                        {provider.averageCPI.toFixed(1)}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Market Share:</span>
                                                        <span className="font-medium">{provider.marketShare.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Total Requests:</span>
                                                        <span className="font-medium">{provider.totalRequests.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Total Cost:</span>
                                                        <span className="font-medium">{formatCurrency(provider.totalCost)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Cost Trend:</span>
                                                        <span className={`font-medium ${provider.costTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {provider.costTrend > 0 ? '+' : ''}{provider.costTrend.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cost Savings */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Savings</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-900 mb-2">
                                                {formatCurrency(analytics.costSavings.totalSaved)}
                                            </div>
                                            <div className="text-green-700">
                                                {analytics.costSavings.percentageSaved.toFixed(1)}% total savings
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Insights */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
                                    {analytics.performanceInsights.length > 0 ? (
                                        <div className="space-y-3">
                                            {analytics.performanceInsights.map((insight, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)}`}>
                                                                    {insight.impact} impact
                                                                </span>
                                                                {insight.estimatedSavings && (
                                                                    <span className="text-sm text-green-600 font-medium">
                                                                        Save {formatCurrency(insight.estimatedSavings)} per request
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-900 mb-2">{insight.insight}</p>
                                                            <p className="text-sm text-gray-600">
                                                                <strong>Recommendation:</strong> {insight.recommendation}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            No performance insights available yet.
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                No analytics data available.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Optimization Recommendations</h2>

                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : recommendations.length > 0 ? (
                            <div className="space-y-4">
                                {recommendations.map((recommendation, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(recommendation.impact)}`}>
                                                        {recommendation.impact} impact
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        Confidence: {Math.round(recommendation.confidence * 100)}%
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-gray-900 mb-2">{recommendation.title}</h4>
                                                <p className="text-gray-600 mb-2">{recommendation.description}</p>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    {recommendation.estimatedSavings && (
                                                        <span className="text-green-600 font-medium">
                                                            💰 Save {formatCurrency(recommendation.estimatedSavings)} per request
                                                        </span>
                                                    )}
                                                    {recommendation.estimatedLatencyImprovement && (
                                                        <span className="text-blue-600 font-medium">
                                                            ⚡ {Math.round(recommendation.estimatedLatencyImprovement * 100)}% latency improvement
                                                        </span>
                                                    )}
                                                    {recommendation.estimatedUptimeImprovement && (
                                                        <span className="text-purple-600 font-medium">
                                                            🔒 {Math.round(recommendation.estimatedUptimeImprovement * 100)}% uptime improvement
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-3">
                                                    <span className="text-xs text-gray-500">
                                                        Action: {recommendation.action}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                No optimization recommendations available yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
