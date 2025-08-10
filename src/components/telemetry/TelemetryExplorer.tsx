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
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Telemetry Explorer</h2>
                <button onClick={() => refetch()} disabled={isFetching} className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1.5 rounded-lg">{isFetching ? 'Refreshing...' : 'Refresh'}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <input className="border rounded-lg px-3 py-2" placeholder="Operation name" onChange={e => setFilter({ operation_name: e.target.value || undefined })} />
                <select className="border rounded-lg px-3 py-2" onChange={e => setFilter({ status: e.target.value as any || undefined })}>
                    <option value="">Status (all)</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="unset">Unset</option>
                </select>
                <select className="border rounded-lg px-3 py-2" onChange={e => setFilter({ http_method: e.target.value || undefined })}>
                    <option value="">HTTP Method</option>
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                </select>
                <input className="border rounded-lg px-3 py-2" placeholder="Model" onChange={e => setFilter({ gen_ai_model: e.target.value || undefined })} />
            </div>

            {isLoading ? (
                <div className="animate-pulse space-y-3">{[...Array(6)].map((_, i) => (<div key={i} className="h-10 bg-gray-100 rounded-lg" />))}</div>
            ) : error ? (
                <div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">Failed to load telemetry</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-600 border-b">
                                <th className="px-3 py-2">Timestamp</th>
                                <th className="px-3 py-2">Service</th>
                                <th className="px-3 py-2">Operation</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Latency (ms)</th>
                                <th className="px-3 py-2">Cost ($)</th>
                                <th className="px-3 py-2">Trace ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={`${r.trace_id}-${r.span_id}-${i}`} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</td>
                                    <td className="px-3 py-2 truncate max-w-[160px]" title={r.service_name}>{r.service_name}</td>
                                    <td className="px-3 py-2 truncate max-w-[220px]" title={r.operation_name}>{r.operation_name}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-1 rounded text-xs ${r.status === 'error' ? 'bg-rose-100 text-rose-800' : r.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                                    </td>
                                    <td className="px-3 py-2">{Number(r.duration_ms || 0).toFixed(1)}</td>
                                    <td className="px-3 py-2">{Number(r.cost_usd || 0).toFixed(4)}</td>
                                    <td className="px-3 py-2 truncate max-w-[140px]" title={r.trace_id}>{r.trace_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-600">Page {pagination.page} of {pagination.total_pages} • {pagination.total} items</span>
                <div className="inline-flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-gray-100 disabled:opacity-50" disabled={pagination.page <= 1} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}>Prev</button>
                    <button className="px-3 py-1.5 rounded-lg bg-gray-100 disabled:opacity-50" disabled={pagination.page >= pagination.total_pages} onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}>Next</button>
                </div>
            </div>
        </div>
    );
};
