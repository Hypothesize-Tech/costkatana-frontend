import { apiClient } from '@/config/api';
import React, { useEffect, useState } from 'react';

interface CacheMetrics {
    success: boolean;
    data: {
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
        };
        config: {
            defaultTTL: number;
            defaultTTLHours: number;
        };
    };
}

export const CacheDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        try {
            const response = await apiClient.get('/gateway/cache/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMetrics(response.data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Loading...</strong>
                <span className="block sm:inline">Fetching cache metrics...</span>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Cache Dashboard</h1>
                <button
                    onClick={fetchMetrics}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Cache Provider Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Cache Provider</h2>
                <p className="text-gray-700">Redis Cache</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Semantic Caching</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Deduplication</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">User Scoped</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Model Specific</span>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                    <p>Default TTL: {metrics.data.config.defaultTTLHours} hours ({metrics.data.config.defaultTTL} seconds)</p>
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md border">
                    <h2 className="text-lg font-semibold text-gray-700">Total Requests</h2>
                    <p className="text-3xl font-bold text-blue-600">{metrics.data.redis.totalRequests.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-md border border-green-200">
                    <h2 className="text-lg font-semibold text-green-700">Cache Hits</h2>
                    <p className="text-3xl font-bold text-green-600">{metrics.data.redis.hits.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow-md border border-red-200">
                    <h2 className="text-lg font-semibold text-red-700">Cache Misses</h2>
                    <p className="text-3xl font-bold text-red-600">{metrics.data.redis.misses.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-md border border-blue-200">
                    <h2 className="text-lg font-semibold text-blue-700">Hit Rate</h2>
                    <p className="text-3xl font-bold text-blue-600">{metrics.data.redis.hitRate.toFixed(1)}%</p>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg shadow-md border border-yellow-200">
                    <h2 className="text-lg font-semibold text-yellow-700">Cost Saved</h2>
                    <p className="text-2xl font-bold text-yellow-600">${metrics.data.redis.costSaved.toFixed(4)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg shadow-md border border-purple-200">
                    <h2 className="text-lg font-semibold text-purple-700">Tokens Saved</h2>
                    <p className="text-2xl font-bold text-purple-600">{metrics.data.redis.tokensSaved.toLocaleString()}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg shadow-md border border-indigo-200">
                    <h2 className="text-lg font-semibold text-indigo-700">Avg Response Time</h2>
                    <p className="text-2xl font-bold text-indigo-600">{metrics.data.redis.avgResponseTime.toFixed(2)}ms</p>
                </div>
            </div>

            {/* Advanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-md border">
                    <h2 className="text-lg font-semibold mb-3">Advanced Cache Metrics</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Semantic Matches:</span>
                            <span className="font-semibold">{metrics.data.redis.semanticMatches}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Deduplication Count:</span>
                            <span className="font-semibold">{metrics.data.redis.deduplicationCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cache Size:</span>
                            <span className="font-semibold">{(metrics.data.redis.cacheSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg shadow-md border">
                    <h2 className="text-lg font-semibold mb-3">Top Performing Models</h2>
                    <div className="space-y-2">
                        {metrics.data.redis.topModels.slice(0, 5).map((model: { model: string; hits: number }, index: number) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-gray-600">{model.model}:</span>
                                <span className="font-semibold">{model.hits} hits</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CacheDashboard;
