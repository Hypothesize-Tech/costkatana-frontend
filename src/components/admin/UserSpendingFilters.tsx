import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import {
    FunnelIcon,
    CalendarIcon,
    XMarkIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';
import { AdminUserSpendingFilters } from '../../services/adminUserSpending.service';

interface UserSpendingFiltersProps {
    filters: AdminUserSpendingFilters;
    onFiltersChange: (filters: AdminUserSpendingFilters) => void;
    services: string[];
}

export const UserSpendingFilters: React.FC<UserSpendingFiltersProps> = ({
    filters,
    onFiltersChange,
    services,
}) => {
    const [dateRange, setDateRange] = useState<'custom' | '7d' | '30d' | '90d' | 'month' | 'year'>('30d');
    const [dateMenuOpen, setDateMenuOpen] = useState(false);
    const [serviceMenuOpen, setServiceMenuOpen] = useState(false);

    // Use state setters for popper elements
    const [dateReferenceElement, setDateReferenceElement] = useState<HTMLButtonElement | null>(null);
    const [datePopperElement, setDatePopperElement] = useState<HTMLDivElement | null>(null);
    const [serviceReferenceElement, setServiceReferenceElement] = useState<HTMLButtonElement | null>(null);
    const [servicePopperElement, setServicePopperElement] = useState<HTMLDivElement | null>(null);

    const { styles: dateStyles, attributes: dateAttributes } = usePopper(
        dateReferenceElement,
        datePopperElement,
        {
            placement: 'bottom-start',
            strategy: 'fixed',
            modifiers: [
                { name: 'offset', options: { offset: [0, 8] } },
                { name: 'preventOverflow', options: { padding: 8 } },
                { name: 'flip', options: { fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] } },
            ],
        }
    );

    const { styles: serviceStyles, attributes: serviceAttributes } = usePopper(
        serviceReferenceElement,
        servicePopperElement,
        {
            placement: 'bottom-start',
            strategy: 'fixed',
            modifiers: [
                { name: 'offset', options: { offset: [0, 8] } },
                { name: 'preventOverflow', options: { padding: 8 } },
                { name: 'flip', options: { fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] } },
            ],
        }
    );

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dateReferenceElement &&
                !dateReferenceElement.contains(event.target as Node) &&
                datePopperElement &&
                !datePopperElement.contains(event.target as Node)
            ) {
                setDateMenuOpen(false);
            }
            if (
                serviceReferenceElement &&
                !serviceReferenceElement.contains(event.target as Node) &&
                servicePopperElement &&
                !servicePopperElement.contains(event.target as Node)
            ) {
                setServiceMenuOpen(false);
            }
        };

        if (dateMenuOpen || serviceMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dateMenuOpen, serviceMenuOpen, dateReferenceElement, datePopperElement, serviceReferenceElement, servicePopperElement]);

    const handleQuickDateSelect = (range: '7d' | '30d' | '90d' | 'month' | 'year') => {
        setDateRange(range);
        const now = new Date();
        let startDate: Date;

        switch (range) {
            case '7d':
                startDate = subDays(now, 7);
                break;
            case '30d':
                startDate = subDays(now, 30);
                break;
            case '90d':
                startDate = subDays(now, 90);
                break;
            case 'month':
                startDate = startOfMonth(now);
                break;
            case 'year':
                startDate = startOfYear(now);
                break;
            default:
                startDate = subDays(now, 30);
        }

        onFiltersChange({
            ...filters,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
        });
    };

    const clearFilters = () => {
        onFiltersChange({});
        setDateRange('30d');
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    const activeFiltersCount = Object.keys(filters).filter(
        key => filters[key as keyof AdminUserSpendingFilters] !== undefined
    ).length;

    return (
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg glow-primary shadow-sm">
                        <FunnelIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-display font-bold gradient-text-primary">
                            Filters
                        </h3>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {activeFiltersCount > 0
                                ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}`
                                : 'No filters applied'}
                        </p>
                    </div>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 glass rounded-lg hover:bg-primary-500/10 transition-all duration-300 border border-primary-200/30"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range Picker */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        Date Range
                    </label>
                    <div className="relative">
                        <button
                            ref={setDateReferenceElement}
                            onClick={() => setDateMenuOpen(!dateMenuOpen)}
                            className="inline-flex items-center justify-between w-full px-3 py-2 text-sm font-display font-medium glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-primary-500" />
                                <span>
                                    {dateRange === 'custom'
                                        ? filters.startDate && filters.endDate
                                            ? `${format(new Date(filters.startDate), 'MMM d')} - ${format(new Date(filters.endDate), 'MMM d')}`
                                            : 'Custom'
                                        : dateRange === '7d'
                                            ? 'Last 7 days'
                                            : dateRange === '30d'
                                                ? 'Last 30 days'
                                                : dateRange === '90d'
                                                    ? 'Last 90 days'
                                                    : dateRange === 'month'
                                                        ? 'This Month'
                                                        : 'This Year'}
                                </span>
                            </div>
                            <ChevronDownIcon className="w-4 h-4 text-primary-500" />
                        </button>
                        {dateMenuOpen && dateReferenceElement && createPortal(
                            <div
                                ref={setDatePopperElement}
                                style={{
                                    ...dateStyles.popper,
                                    position: 'fixed',
                                }}
                                {...dateAttributes.popper}
                                className="z-[9999] w-56 backdrop-blur-xl rounded-lg shadow-xl border border-primary-200/30 bg-white dark:bg-gray-800 overflow-hidden"
                            >
                                <div className="py-1">
                                    {(['7d', '30d', '90d', 'month', 'year'] as const).map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => {
                                                handleQuickDateSelect(range);
                                                setDateMenuOpen(false);
                                            }}
                                            className={`${dateRange === range ? 'text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500' : 'text-light-text-primary dark:text-dark-text-primary'} w-full text-left px-4 py-2 text-sm transition-all duration-200 hover:bg-primary-500/10 dark:hover:bg-primary-900/20`}
                                        >
                                            {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : range === '90d' ? 'Last 90 days' : range === 'month' ? 'This Month' : 'This Year'}
                                        </button>
                                    ))}
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                </div>

                {/* Service Filter */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        Service
                    </label>
                    <div className="relative">
                        <button
                            ref={setServiceReferenceElement}
                            onClick={() => setServiceMenuOpen(!serviceMenuOpen)}
                            className="inline-flex items-center justify-between w-full px-3 py-2 text-sm font-display font-medium glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <span>{filters.service || 'All Services'}</span>
                            <ChevronDownIcon className="w-4 h-4 text-primary-500" />
                        </button>
                        {serviceMenuOpen && serviceReferenceElement && createPortal(
                            <div
                                ref={setServicePopperElement}
                                style={{
                                    ...serviceStyles.popper,
                                    position: 'fixed',
                                    minWidth: serviceReferenceElement?.offsetWidth || 'auto',
                                }}
                                {...serviceAttributes.popper}
                                className="z-[9999] backdrop-blur-xl rounded-lg shadow-xl border border-primary-200/30 bg-white dark:bg-gray-800 overflow-hidden max-h-60 overflow-y-auto"
                            >
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            onFiltersChange({ ...filters, service: undefined });
                                            setServiceMenuOpen(false);
                                        }}
                                        className={`${!filters.service ? 'text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500' : 'text-light-text-primary dark:text-dark-text-primary'} w-full text-left px-4 py-2 text-sm transition-all duration-200 hover:bg-primary-500/10 dark:hover:bg-primary-900/20`}
                                    >
                                        All Services
                                    </button>
                                    {services.map((service) => (
                                        <button
                                            key={service}
                                            onClick={() => {
                                                onFiltersChange({ ...filters, service });
                                                setServiceMenuOpen(false);
                                            }}
                                            className={`${filters.service === service ? 'text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500' : 'text-light-text-primary dark:text-dark-text-primary'} w-full text-left px-4 py-2 text-sm transition-all duration-200 hover:bg-primary-500/10 dark:hover:bg-primary-900/20`}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                </div>

                {/* Model Filter */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        Model
                    </label>
                    <input
                        type="text"
                        placeholder="Filter by model..."
                        value={filters.model || ''}
                        onChange={(e) =>
                            onFiltersChange({
                                ...filters,
                                model: e.target.value || undefined,
                            })
                        }
                        className="w-full px-3 py-2 text-sm font-display font-medium glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-light-text-secondary dark:placeholder:text-dark-text-secondary"
                    />
                </div>

                {/* User Search */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        Search User
                    </label>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-500" />
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={filters.userId || ''}
                            onChange={(e) =>
                                onFiltersChange({
                                    ...filters,
                                    userId: e.target.value || undefined,
                                })
                            }
                            className="w-full pl-10 pr-3 py-2 text-sm font-display font-medium glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-light-text-secondary dark:placeholder:text-dark-text-secondary"
                        />
                    </div>
                </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-primary-200/30 flex flex-wrap gap-2">
                    {filters.service && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold glass bg-primary-500/10 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg border border-primary-200/30">
                            Service: {filters.service}
                            <button
                                onClick={() => onFiltersChange({ ...filters, service: undefined })}
                                className="hover:text-primary-800 dark:hover:text-primary-300"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                    {filters.model && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold glass bg-primary-500/10 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg border border-primary-200/30">
                            Model: {filters.model}
                            <button
                                onClick={() => onFiltersChange({ ...filters, model: undefined })}
                                className="hover:text-primary-800 dark:hover:text-primary-300"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                    {filters.userId && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold glass bg-primary-500/10 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg border border-primary-200/30">
                            User: {filters.userId}
                            <button
                                onClick={() => onFiltersChange({ ...filters, userId: undefined })}
                                className="hover:text-primary-800 dark:hover:text-primary-300"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

