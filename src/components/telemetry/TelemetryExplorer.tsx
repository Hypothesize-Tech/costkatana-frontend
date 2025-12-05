import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { TelemetryQueryParams, TelemetrySearchResponse } from '../../types/telemetry';
import { Search, AlertTriangle } from 'lucide-react';

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
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-highlight shrink-0">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">Telemetry Explorer</h2>
                </div>
                <button onClick={() => refetch()} disabled={isFetching} className="btn btn-primary text-xs sm:text-sm w-full sm:w-auto">{isFetching ? 'Refreshing...' : 'Refresh'}</button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6 sm:grid-cols-2 md:grid-cols-4">
                <input className="input text-xs sm:text-sm" placeholder="Operation name" onChange={e => setFilter({ operation_name: e.target.value || undefined })} />
                <select className="input text-xs sm:text-sm" onChange={e => setFilter({ status: e.target.value as any || undefined })}>
                    <option value="">Status (all)</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="unset">Unset</option>
                </select>
                <select className="input text-xs sm:text-sm" onChange={e => setFilter({ http_method: e.target.value || undefined })}>
                    <option value="">HTTP Method</option>
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                </select>
                <input className="input text-xs sm:text-sm" placeholder="Model" onChange={e => setFilter({ gen_ai_model: e.target.value || undefined })} />
            </div>

            {isLoading ? (
                <div className="space-y-2.5 sm:space-y-3 md:space-y-4 animate-pulse">{[...Array(6)].map((_, i) => (<div key={i} className="h-10 sm:h-12 rounded-xl bg-gradient-primary/20" />))}</div>
            ) : error ? (
                <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-danger shrink-0">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm md:text-base font-body text-secondary-900 dark:text-white">
                            Failed to load telemetry
                        </span>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-primary-200/30">
                                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-secondary">Timestamp</th>
                                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-primary">Service</th>
                                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-primary">Operation</th>
                                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-highlight">Status</th>
                                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-accent">Latency (ms)</th>
                                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-success">Cost ($)</th>
                                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-secondary">Trace ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={`${r.trace_id}-${r.span_id}-${i}`} className="border-b transition-all duration-200 border-primary-200/20 hover:bg-gradient-primary/5">
                                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</td>
                                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-body text-secondary-900 dark:text-white truncate max-w-[120px] sm:max-w-[140px] md:max-w-[160px]" title={r.service_name}>{r.service_name}</td>
                                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-body text-secondary-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px] md:max-w-[220px]" title={r.operation_name}>{r.operation_name}</td>
                                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                                        <span className={`glass px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-display font-semibold border ${r.status === 'error' ? 'border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300' : r.status === 'success' ? 'border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300' : 'border-accent-200/30 bg-gradient-accent/20 text-accent-700 dark:text-accent-300'}`}>{r.status}</span>
                                    </td>
                                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold font-display gradient-text-accent">{Number(r.duration_ms || 0).toFixed(1)}</td>
                                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold font-display gradient-text-success">{Number(r.cost_usd || 0).toFixed(4)}</td>
                                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-mono text-secondary-600 dark:text-secondary-300 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[120px] md:max-w-[140px]" title={r.trace_id}>{r.trace_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
                <span className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">Page {pagination.page} of {pagination.total_pages} • {pagination.total} items</span>
                <div className="inline-flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button className="btn btn-secondary text-xs sm:text-sm flex-1 sm:flex-none" disabled={pagination.page <= 1} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}>Prev</button>
                    <button className="btn btn-secondary text-xs sm:text-sm flex-1 sm:flex-none" disabled={pagination.page >= pagination.total_pages} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}>Next</button>
                </div>
            </div>
        </div>
    );
};
