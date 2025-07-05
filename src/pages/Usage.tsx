import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, FunnelIcon, ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { UsageList } from '@/components/usage/UsageList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usePagination, useDebounce } from '@/hooks';
import { UsageFilters as IUsageFilters } from '@/types';
import toast from 'react-hot-toast';
import { UsageFilter } from '@/components/usage/UsageFilter';
import { TrackUsageModal } from '@/components/usage/TrackUsageModal';
import { useProject } from '@/contexts/ProjectContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Usage() {
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<IUsageFilters>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { selectedProject, setSelectedProject, projects, getSelectedProjectName } = useProject();

    const debouncedSearch = useDebounce(searchQuery, 500);
    const { limit } = usePagination();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['usage', filters, currentPage, limit, debouncedSearch, selectedProject],
        queryFn: () => usageService.getUsage({
            ...filters,
            page: currentPage,
            limit,
            projectId: selectedProject && selectedProject !== 'all' ? selectedProject : undefined
        }),
        keepPreviousData: true,
    });
    console.log("data", data)

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const blob = await usageService.exportUsage({
                format,
                startDate: filters.startDate,
                endDate: filters.endDate,
                service: filters.service,
                model: filters.model,
                projectId: selectedProject && selectedProject !== 'all' ? selectedProject : undefined
            });
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        refetch();
    };

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
                        {selectedProject !== 'all' && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">
                                • {getSelectedProjectName()}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0">
                    {/* Project Selection */}
                    <Menu as="div" className="inline-block relative text-left">
                        <div>
                            <Menu.Button className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                {getSelectedProjectName()}
                                <ChevronDownIcon className="-mr-1 ml-2 w-5 h-5" aria-hidden="true" />
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setSelectedProject('all')}
                                                className={`${active ? 'text-gray-900 bg-gray-100' : 'text-gray-700'
                                                    } ${selectedProject === 'all' ? 'bg-blue-50 text-blue-900' : ''
                                                    } group flex items-center px-4 py-2 text-sm w-full text-left`}
                                            >
                                                All Projects
                                            </button>
                                        )}
                                    </Menu.Item>
                                    {projects.map((project) => (
                                        <Menu.Item key={project._id}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setSelectedProject(project._id)}
                                                    className={`${active ? 'text-gray-900 bg-gray-100' : 'text-gray-700'
                                                        } ${selectedProject === project._id ? 'bg-blue-50 text-blue-900' : ''
                                                        } group flex items-center px-4 py-2 text-sm w-full text-left`}
                                                >
                                                    {project.name}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    <button
                        onClick={() => setShowTrackModal(true)}
                        className="inline-flex items-center btn-primary"
                    >
                        <PlusIcon className="mr-2 w-5 h-5" />
                        Track Usage
                    </button>
                    <div className="inline-block relative text-left">
                        <button
                            onClick={() => handleExport('csv')}
                            className="inline-flex items-center btn-outline"
                        >
                            <ArrowDownTrayIcon className="mr-2 w-5 h-5" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="p-4 card">
                <div className="flex flex-col gap-4 sm:flex-row">
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
                        className="inline-flex items-center btn-outline"
                    >
                        <FunnelIcon className="mr-2 w-5 h-5" />
                        Filters
                        {Object.keys(filters).length > 0 && (
                            <span className="inline-flex justify-center items-center ml-2 w-5 h-5 text-xs font-medium text-white rounded-full bg-primary-600">
                                {Object.keys(filters).length}
                            </span>
                        )}
                    </button>
                </div>

                {showFilters && (
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
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
                    pagination={data?.pagination}
                    usage={data?.usage || []}
                    onRefresh={handleRefresh}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Track Usage Modal */}
            <TrackUsageModal
                isOpen={showTrackModal}
                onClose={() => setShowTrackModal(false)}
                projectId={selectedProject}
            />
        </div>
    );
}