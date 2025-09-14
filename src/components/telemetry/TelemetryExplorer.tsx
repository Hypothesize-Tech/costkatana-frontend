import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { TelemetryQueryParams, TelemetrySearchResponse } from '../../types/telemetry';

export const TelemetryExplorer: React.FC = () => {
    const [filters, setFilters] = useState<TelemetryQueryParams>({ limit: 20, page: 1, sort_by: 'timestamp', sort_order: 'desc' });

    const { data, isLoading, error, refetch, isFetching } = useQuery<TelemetrySearchResponse>({
        queryKey: ['telemetry-search', filters],
        queryFn: () => TelemetryAPI.queryTelemetry(filters),
        keepPreviousData: true,
        staleTime: 10000,
    });

    const records = data?.data || [];
    const pagination = data?.pagination || { page: 1, total_pages: 1, total: 0 } as any;

    const setFilter = (patch: Partial<TelemetryQueryParams>) => setFilters(prev => ({ ...prev, ...patch, page: 1 }));

    return (
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center glow-accent">
                        <span className="text-white text-lg">🔍</span>
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text">Telemetry Explorer</h2>
                </div>
                <button onClick={() => refetch()} disabled={isFetching} className="btn-primary">{isFetching ? 'Refreshing...' : 'Refresh'}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input className="input" placeholder="Operation name" onChange={e => setFilter({ operation_name: e.target.value || undefined })} />
                <select className="input" onChange={e => setFilter({ status: e.target.value as any || undefined })}>
                    <option value="">Status (all)</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="unset">Unset</option>
                </select>
                <select className="input" onChange={e => setFilter({ http_method: e.target.value || undefined })}>
                    <option value="">HTTP Method</option>
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                </select>
                <input className="input" placeholder="Model" onChange={e => setFilter({ gen_ai_model: e.target.value || undefined })} />
            </div>

            {isLoading ? (
                <div className="animate-pulse space-y-4">{[...Array(6)].map((_, i) => (<div key={i} className="h-12 bg-gradient-primary/20 rounded-xl" />))}</div>
            ) : error ? (
                <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-danger/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center glow-danger">
                            <span className="text-white text-sm">⚠️</span>
                        </div>
                        <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                            Failed to load telemetry
                        </span>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                <th className="px-4 py-3 text-left font-display font-semibold gradient-text">Timestamp</th>
                                <th className="px-4 py-3 text-left font-display font-semibold gradient-text">Service</th>
                                <th className="px-4 py-3 text-left font-display font-semibold gradient-text">Operation</th>
                                <th className="px-4 py-3 text-left font-display font-semibold gradient-text">Status</th>
                                <th className="px-4 py-3 text-left font-display font-semibold gradient-text">Latency (ms)</th>
                                <th className="px-4 py-3 text-left font-display font-semibold gradient-text">Cost ($)</th>
                                <th className="px-4 py-3 text-left font-display font-semibold gradient-text">Trace ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={`${r.trace_id}-${r.span_id}-${i}`} className="border-b border-primary-200/20 hover:bg-gradient-primary/5 transition-all duration-200">
                                    <td className="px-4 py-3 font-body text-light-text-secondary dark:text-dark-text-secondary">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</td>
                                    <td className="px-4 py-3 font-body text-light-text-primary dark:text-dark-text-primary truncate max-w-[160px]" title={r.service_name}>{r.service_name}</td>
                                    <td className="px-4 py-3 font-body text-light-text-primary dark:text-dark-text-primary truncate max-w-[220px]" title={r.operation_name}>{r.operation_name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`glass px-3 py-1 rounded-full font-display font-semibold border ${r.status === 'error' ? 'border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300' : r.status === 'success' ? 'border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300' : 'border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300'}`}>{r.status}</span>
                                    </td>
                                    <td className="px-4 py-3 font-display font-semibold gradient-text-warning">{Number(r.duration_ms || 0).toFixed(1)}</td>
                                    <td className="px-4 py-3 font-display font-semibold gradient-text-success">{Number(r.cost_usd || 0).toFixed(4)}</td>
                                    <td className="px-4 py-3 font-mono text-light-text-secondary dark:text-dark-text-secondary text-sm truncate max-w-[140px]" title={r.trace_id}>{r.trace_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-6 flex items-center justify-between">
                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Page {pagination.page} of {pagination.total_pages} • {pagination.total} items</span>
                <div className="inline-flex gap-3">
                    <button className="btn-secondary" disabled={pagination.page <= 1} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}>Prev</button>
                    <button className="btn-secondary" disabled={pagination.page >= pagination.total_pages} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}>Next</button>
                </div>
            </div>
        </div>
    );
};
