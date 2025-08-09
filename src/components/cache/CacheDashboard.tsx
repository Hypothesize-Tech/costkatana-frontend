import React, { useEffect, useState } from 'react';

interface CacheStats {
  hits: {
    exact: number;
    semantic: number;
    total: number;
  };
  misses: number;
  total: number;
}

export const CacheDashboard: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/metrics/cache');
        if (!response.ok) {
          throw new Error('Failed to fetch cache stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    fetchStats(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="p-4">Loading cache stats...</div>;
  }

  const hitRate = stats.total > 0 ? (stats.hits.total / stats.total) * 100 : 0;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cache Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold">Total Requests</h2>
          <p className="text-3xl">{stats.total}</p>
        </div>
        <div className="p-4 bg-green-800 rounded-lg">
          <h2 className="text-lg font-semibold">Cache Hits</h2>
          <p className="text-3xl">{stats.hits.total}</p>
        </div>
        <div className="p-4 bg-red-800 rounded-lg">
          <h2 className="text-lg font-semibold">Cache Misses</h2>
          <p className="text-3xl">{stats.misses}</p>
        </div>
        <div className="p-4 bg-blue-800 rounded-lg">
          <h2 className="text-lg font-semibold">Hit Rate</h2>
          <p className="text-3xl">{hitRate.toFixed(2)}%</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-lg col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold">Hit Breakdown</h2>
          <p>Exact: {stats.hits.exact}</p>
          <p>Semantic: {stats.hits.semantic}</p>
        </div>
      </div>
    </div>
  );
};
