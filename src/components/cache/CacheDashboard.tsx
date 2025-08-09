import React, { useEffect, useState } from 'react';

interface CacheMetrics {
    hits: {
        exact: number;
        semantic: number;
        total: number;
    };
    misses: number;
    total: number;
    hitRate: number;
}

export const CacheDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/metrics/cache');
                if (!response.ok) {
                    throw new Error('Failed to fetch cache metrics');
                }
                const data = await response.json();
                setMetrics(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            }
        };

        const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
        fetchMetrics(); // Initial fetch

        return () => clearInterval(interval);
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
            <h1 className="text-3xl font-bold mb-4">Cache Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold">Total Requests</h2>
                    <p className="text-3xl">{metrics.total}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold">Cache Hits</h2>
                    <p className="text-3xl">{metrics.hits.total}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold">Cache Misses</h2>
                    <p className="text-3xl">{metrics.misses}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold">Hit Rate</h2>
                    <p className="text-3xl">{metrics.hitRate.toFixed(2)}%</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
                    <h2 className="text-lg font-semibold">Cache Metrics</h2>
                    <ul className="list-disc pl-4">
                        <li>Total Hits: {metrics.hits.total}</li>
                        <li> - Exact Hits: {metrics.hits.exact}</li>
                        <li> - Semantic Hits: {metrics.hits.semantic}</li>
                        <li>Misses: {metrics.misses}</li>
                        <li>Total Requests: {metrics.total}</li>
                        <li>Hit Rate: {metrics.hitRate.toFixed(2)}%</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CacheDashboard;
