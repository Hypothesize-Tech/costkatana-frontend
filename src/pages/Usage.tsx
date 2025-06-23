import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { UsageList } from '@/components/usage/UsageList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usePagination, useDebounce } from '@/hooks';
import { UsageFilters as IUsageFilters } from '@/types';
import toast from 'react-hot-toast';
import { UsageFilter } from '@/components/usage/UsageFilter';
import { TrackUsageModal } from '@/components/usage/TrackUsageModal';

export default function Usage() {
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<IUsageFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedSearch = useDebounce(searchQuery, 500);
    const { page, limit, setPage, getPaginationProps } = usePagination();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['usage', filters, page, limit, debouncedSearch],
        queryFn: () => {
            if (debouncedSearch) {
                return usageService.searchUsage(debouncedSearch, { ...filters, page, limit } as any);
            }
            return usageService.getUsageHistory({ ...filters, page, limit });
        },
    });

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const blob = await usageService.exportUsage({ format, startDate: filters.startDate, endDate: filters.endDate, service: filters.service, model: filters.model });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `usage-export-${new Date().toISOString()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Usage data exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error('Failed to export usage data');
        }
    };

    const paginationProps = getPaginationProps(data?.pagination);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        API Usage
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Track and manage your AI API usage across all providers
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <button
                        onClick={() => setShowTrackModal(true)}
                        className="btn-primary inline-flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Track Usage
                    </button>
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => handleExport('csv')}
                            className="btn-outline inline-flex items-center"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search prompts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-outline inline-flex items-center"
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Filters
                        {Object.keys(filters).length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                                {Object.keys(filters).length}
                            </span>
                        )}
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <UsageFilter
                            onFilterChange={(filters) => setFilters(filters)}
                            services={[]}
                            models={[]}
                        />
                    </div>
                )}
            </div>

            {/* Usage List */}
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <UsageList
                    usage={data?.data || []}
                    pagination={paginationProps}
                    onPageChange={setPage}
                    onRefresh={refetch}
                />
            )}

            {/* Track Usage Modal */}
            <TrackUsageModal
                isOpen={showTrackModal}
                onClose={() => setShowTrackModal(false)}
            />
        </div>
    );
}