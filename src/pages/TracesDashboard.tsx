import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CurrencyDollarIcon,
    CircleStackIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlayIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ArrowPathIcon,
    EyeIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { TraceService, Trace, TraceQuery } from '../services/trace.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';

export const TracesDashboard: React.FC = () => {
    const [traces, setTraces] = useState<Trace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<'startTime' | 'duration' | 'totalCost'>('startTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    const [stats, setStats] = useState({
        totalTraces: 0,
        avgDuration: 0,
        totalCost: 0,
        totalTokens: 0
    });

    useEffect(() => {
        loadTraces();
        loadStats();
    }, [pagination.page, statusFilter, sortBy, sortOrder]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchTerm !== undefined) {
                setPagination(prev => ({ ...prev, page: 1 }));
                loadTraces();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const loadTraces = async () => {
        try {
            setLoading(true);
            const query: TraceQuery = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm || undefined,
                status: statusFilter || undefined
            };

            const response = await TraceService.getTraces(query);
            setTraces(response.traces);
            setPagination(response.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load traces');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await TraceService.getTraceStats();
            setStats({
                totalTraces: response.totalTraces,
                avgDuration: response.averageDuration,
                totalCost: response.totalCost,
                totalTokens: response.totalTokens
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleDeleteTrace = async (traceId: string) => {
        if (window.confirm('Are you sure you want to delete this trace?')) {
            try {
                await TraceService.deleteTrace(traceId);
                loadTraces();
                loadStats();
            } catch (err) {
                console.error('Failed to delete trace:', err);
            }
        }
    };

    const formatDuration = (duration: number | undefined) => {
        if (!duration) return '-';
        if (duration < 1000) return `${duration}ms`;
        return `${(duration / 1000).toFixed(2)}s`;
    };

    const formatCost = (cost: number) => {
        return `$${cost.toFixed(4)}`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'running':
                return <PlayIcon className="w-5 h-5 text-blue-500" />;
            default:
                return <CircleStackIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'running':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Traces Dashboard</h1>
                    <p className="text-gray-600">Monitor and analyze your AI workflow traces</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        to="/analytics"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50"
                    >
                        <ChartBarIcon className="mr-2 w-4 h-4" />
                        Analytics
                    </Link>
                    <button
                        onClick={loadTraces}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent shadow-sm hover:bg-blue-700"
                    >
                        <ArrowPathIcon className="mr-2 w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="overflow-hidden bg-white rounded-lg shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CircleStackIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1 ml-5 w-0">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Traces</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.totalTraces.toLocaleString()}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden bg-white rounded-lg shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClockIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1 ml-5 w-0">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Duration</dt>
                                    <dd className="text-lg font-medium text-gray-900">{formatDuration(stats.avgDuration)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden bg-white rounded-lg shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CurrencyDollarIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1 ml-5 w-0">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                                    <dd className="text-lg font-medium text-gray-900">{formatCost(stats.totalCost)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden bg-white rounded-lg shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CircleStackIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1 ml-5 w-0">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tokens</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.totalTokens.toLocaleString()}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block py-2 pr-3 pl-10 w-full leading-5 placeholder-gray-500 bg-white rounded-md border border-gray-300 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search traces..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <select
                                className="block py-2 pr-10 pl-3 w-full text-base rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="running">Running</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                className="block py-2 pr-10 pl-3 w-full text-base rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field as any);
                                    setSortOrder(order as any);
                                }}
                            >
                                <option value="startTime-desc">Newest First</option>
                                <option value="startTime-asc">Oldest First</option>
                                <option value="duration-desc">Longest Duration</option>
                                <option value="duration-asc">Shortest Duration</option>
                                <option value="totalCost-desc">Highest Cost</option>
                                <option value="totalCost-asc">Lowest Cost</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Traces Table */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Traces {pagination.total > 0 && `(${pagination.total})`}
                    </h3>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="py-12 text-center">
                        <XCircleIcon className="mx-auto mb-4 w-12 h-12 text-red-500" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">Error Loading Traces</h3>
                        <p className="text-gray-600">{error}</p>
                    </div>
                ) : traces.length === 0 ? (
                    <div className="py-12 text-center">
                        <CircleStackIcon className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No Traces Found</h3>
                        <p className="text-gray-600">Start tracking your AI workflows to see traces here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Trace
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Cost
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Tokens
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Started
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {traces.map((trace) => (
                                    <tr key={trace._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{trace.name}</div>
                                                <div className="text-sm text-gray-500">{trace.traceId.substring(0, 8)}...</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(trace.status)}
                                                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trace.status)}`}>
                                                    {trace.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {formatDuration(trace.duration)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {formatCost(trace.totalCost)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {trace.totalTokens.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(trace.startTime).toLocaleDateString()} {new Date(trace.startTime).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    to={`/traces/${trace._id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/traces/${trace._id}/analysis`}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <ChartBarIcon className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteTrace(trace._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.pages}
                            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}; 