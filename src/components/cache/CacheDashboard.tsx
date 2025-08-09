import React, { useState, useEffect } from 'react';
import {
    Database,
    TrendingUp,
    Zap,
    Server,
    CheckCircle,
    XCircle,
    RefreshCw,
    Download,
    Upload,
    Trash2,
    Activity
} from 'lucide-react';
import { cacheService } from '../../services/cache.service';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface CacheStats {
    redis: {
        hits: number;
        misses: number;
        totalRequests: number;
        hitRate: number;
        avgResponseTime: number;
        costSaved: number;
        tokensSaved: number;
        deduplicationCount: number;
        semanticMatches: number;
        cacheSize: number;
        topModels: { model: string; hits: number }[];
        topUsers: { userId: string; hits: number }[];
        provider: string;
        features: {
            semanticCaching: boolean;
            deduplication: boolean;
            userScoped: boolean;
            modelSpecific: boolean;
        };
    };

    combined: {
        totalHits: number;
        totalMisses: number;
        totalRequests: number;
        overallHitRate: number;
        totalCostSaved: number;
        totalTokensSaved: number;
    };
}

const CacheDashboard: React.FC = () => {
    const [stats, setStats] = useState<CacheStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'redis' | 'analytics'>('overview');
    const [clearModalOpen, setClearModalOpen] = useState(false);
    const [clearOptions, setClearOptions] = useState({
        model: '',
        provider: ''
    });

    useEffect(() => {
        fetchCacheStats();
        const interval = setInterval(fetchCacheStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchCacheStats = async () => {
        try {
            setRefreshing(true);
            const data = await cacheService.getCacheStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch cache stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleClearCache = async () => {
        try {
            await cacheService.clearCache(
                clearOptions.model || undefined,
                clearOptions.provider || undefined
            );
            setClearModalOpen(false);
            fetchCacheStats();
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    };

    const exportCache = async () => {
        try {
            const data = await cacheService.exportCache();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cache-export-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export cache:', error);
        }
    };

    const importCache = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await cacheService.importCache(data.entries);
            fetchCacheStats();
        } catch (error) {
            console.error('Failed to import cache:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="py-8 text-center">
                <p className="text-gray-500">Failed to load cache statistics</p>
            </div>
        );
    }

    const hitRateChartData = {
        labels: ['Redis Cache', 'Combined'],
        datasets: [{
            label: 'Hit Rate (%)',
            data: [stats.redis.hitRate, stats.combined.overallHitRate],
            backgroundColor: ['#10b981', '#8b5cf6'],
            borderWidth: 0
        }]
    };

    const modelPerformanceData = {
        labels: stats.redis.topModels.map(m => m.model),
        datasets: [{
            label: 'Cache Hits',
            data: stats.redis.topModels.map(m => m.hits),
            backgroundColor: '#3b82f6',
            borderWidth: 0
        }]
    };

    const cacheTypeDistribution = {
        labels: ['Exact Match', 'Semantic Match', 'Deduplication'],
        datasets: [{
            data: [
                stats.redis.hits - stats.redis.semanticMatches - stats.redis.deduplicationCount,
                stats.redis.semanticMatches,
                stats.redis.deduplicationCount
            ],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 0
        }]
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Cache Dashboard</h2>
                    <p className="mt-1 text-gray-600">
                        Monitor and manage your AI gateway caching system
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchCacheStats}
                        className={`px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 inline mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={exportCache}
                        className="px-4 py-2 text-green-600 bg-green-50 rounded-lg transition-colors hover:bg-green-100"
                    >
                        <Download className="inline mr-2 w-4 h-4" />
                        Export
                    </button>
                    <label className="px-4 py-2 text-purple-600 bg-purple-50 rounded-lg transition-colors cursor-pointer hover:bg-purple-100">
                        <Upload className="inline mr-2 w-4 h-4" />
                        Import
                        <input type="file" onChange={importCache} className="hidden" accept=".json" />
                    </label>
                    <button
                        onClick={() => setClearModalOpen(true)}
                        className="px-4 py-2 text-red-600 bg-red-50 rounded-lg transition-colors hover:bg-red-100"
                    >
                        <Trash2 className="inline mr-2 w-4 h-4" />
                        Clear Cache
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Overall Hit Rate</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {stats.combined.overallHitRate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Cost Saved</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                ${stats.combined.totalCostSaved.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Database className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Tokens Saved</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {stats.combined.totalTokensSaved.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Total Requests</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {stats.combined.totalRequests.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Activity className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex px-6 space-x-8" aria-label="Tabs">
                        {['overview', 'redis', 'analytics'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Cache Provider Status */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Redis Status */}
                                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Redis Cache</h3>
                                        <Server className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Provider</span>
                                            <span className="text-sm font-medium">{stats.redis.provider}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Hit Rate</span>
                                            <span className="text-sm font-medium">{stats.redis.hitRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cache Size</span>
                                            <span className="text-sm font-medium">
                                                {(stats.redis.cacheSize / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-green-200">
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(stats.redis.features).map(([feature, enabled]) => (
                                                    <div key={feature} className="flex items-center">
                                                        {enabled ? (
                                                            <CheckCircle className="mr-1 w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <XCircle className="mr-1 w-4 h-4 text-gray-400" />
                                                        )}
                                                        <span className="text-xs text-gray-600 capitalize">
                                                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {/* Hit Rate Chart */}
                            <div className="p-6 bg-gray-50 rounded-lg">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Cache Hit Rates</h3>
                                <div className="h-64">
                                    <Bar data={hitRateChartData} options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        }
                                    }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'redis' && (
                        <div className="space-y-6">
                            {/* Redis Specific Stats */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Semantic Matches</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {stats.redis.semanticMatches.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Deduplication Count</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {stats.redis.deduplicationCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Avg Response Time</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {stats.redis.avgResponseTime.toFixed(0)}ms
                                    </p>
                                </div>
                            </div>

                            {/* Cache Type Distribution */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="p-6 bg-gray-50 rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Cache Type Distribution</h3>
                                    <div className="h-64">
                                        <Doughnut data={cacheTypeDistribution} options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom' }
                                            }
                                        }} />
                                    </div>
                                </div>

                                {/* Top Models */}
                                <div className="p-6 bg-gray-50 rounded-lg">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Cached Models</h3>
                                    <div className="space-y-3">
                                        {stats.redis.topModels.map((model, index) => (
                                            <div key={model.model} className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {index + 1}. {model.model}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-600">{model.hits} hits</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* Model Performance */}
                            <div className="p-6 bg-gray-50 rounded-lg">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Model Cache Performance</h3>
                                <div className="h-64">
                                    <Bar data={modelPerformanceData} options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false }
                                        }
                                    }} />
                                </div>
                            </div>

                            {/* Top Users */}
                            <div className="p-6 bg-gray-50 rounded-lg">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Users by Cache Usage</h3>
                                <div className="space-y-3">
                                    {stats.redis.topUsers.map((user, index) => (
                                        <div key={user.userId} className="flex justify-between items-center p-3 bg-white rounded-lg">
                                            <div className="flex items-center">
                                                <span className="flex justify-center items-center mr-3 w-8 h-8 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {user.userId.substring(0, 8)}...
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-600">{user.hits} hits</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Clear Cache Modal */}
            {clearModalOpen && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
                    <div className="p-6 w-full max-w-md bg-white rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Clear Cache</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Cache Type</label>
                                <div className="px-3 py-2 w-full text-gray-700 bg-gray-50 rounded-lg border border-gray-300">
                                    Redis Cache
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Model (optional)</label>
                                <input
                                    type="text"
                                    value={clearOptions.model}
                                    onChange={(e) => setClearOptions({ ...clearOptions, model: e.target.value })}
                                    placeholder="e.g., gpt-4"
                                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Provider (optional)</label>
                                <input
                                    type="text"
                                    value={clearOptions.provider}
                                    onChange={(e) => setClearOptions({ ...clearOptions, provider: e.target.value })}
                                    placeholder="e.g., openai"
                                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                onClick={() => setClearModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearCache}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Clear Cache
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CacheDashboard;
