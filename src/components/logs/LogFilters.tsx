import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { FiFilter, FiSearch, FiCalendar, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface LogFiltersProps {
    onFilterChange: (filters: any) => void;
}

export const LogFilters: React.FC<LogFiltersProps> = ({ onFilterChange }) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [service, setService] = useState<string | null>(null);
    const [aiModel, setAiModel] = useState<string | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    useEffect(() => {
        const filters: any = {};

        if (startDate) filters.startDate = startDate.toISOString();
        if (endDate) filters.endDate = endDate.toISOString();
        if (service) filters.service = service;
        if (aiModel) filters.aiModel = aiModel;
        if (projectId) filters.projectId = projectId;
        if (status) filters.status = status;
        if (searchText) filters.search = searchText;

        onFilterChange(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, service, aiModel, projectId, status, searchText]);

    const handleClearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setService(null);
        setAiModel(null);
        setProjectId(null);
        setStatus(null);
        setSearchText('');
    };

    const serviceOptions = [
        { value: 'aws-bedrock', label: 'AWS Bedrock' },
        { value: 'openai', label: 'OpenAI' },
        { value: 'anthropic', label: 'Anthropic' },
        { value: 'google-ai', label: 'Google AI' },
        { value: 'huggingface', label: 'Hugging Face' },
        { value: 'cohere', label: 'Cohere' },
        { value: 'cortex', label: 'Cortex' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
    ];

    const customSelectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'transparent',
            borderColor: state.isFocused ? 'rgba(6, 236, 158, 0.5)' : 'rgba(6, 236, 158, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(6, 236, 158, 0.1)' : 'none',
            borderRadius: '0.75rem',
            padding: '0.125rem',
            '&:hover': {
                borderColor: 'rgba(6, 236, 158, 0.3)',
            },
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: 'var(--select-menu-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(6, 236, 158, 0.2)',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? 'rgba(6, 236, 158, 0.1)' : 'transparent',
            color: 'var(--select-option-color)',
            '&:active': {
                backgroundColor: 'rgba(6, 236, 158, 0.2)',
            },
        }),
        singleValue: (base: any) => ({
            ...base,
            color: 'var(--select-value-color)',
        }),
        placeholder: (base: any) => ({
            ...base,
            color: 'var(--select-placeholder-color)',
        }),
    };

    return (
        <>
            <style>{`
                :root {
                    --select-menu-bg: rgb(255, 255, 255);
                    --select-option-color: rgb(15, 23, 42);
                    --select-value-color: rgb(15, 23, 42);
                    --select-placeholder-color: rgb(148, 163, 184);
                }
                .dark {
                    --select-menu-bg: rgb(30, 41, 59);
                    --select-option-color: rgb(248, 250, 252);
                    --select-value-color: rgb(248, 250, 252);
                    --select-placeholder-color: rgb(148, 163, 184);
                }
                .react-datepicker {
                    background-color: var(--select-menu-bg);
                    border: 1px solid rgba(6, 236, 158, 0.2);
                    border-radius: 0.75rem;
                    font-family: inherit;
                }
                .react-datepicker__header {
                    background-color: rgba(6, 236, 158, 0.05);
                    border-bottom: 1px solid rgba(6, 236, 158, 0.2);
                    border-radius: 0.75rem 0.75rem 0 0;
                }
                .react-datepicker__current-month,
                .react-datepicker__day-name,
                .react-datepicker__day {
                    color: var(--select-option-color);
                }
                .react-datepicker__day:hover {
                    background-color: rgba(6, 236, 158, 0.1);
                }
                .react-datepicker__day--selected {
                    background-color: #06ec9e;
                    color: white;
                }
            `}</style>

            <div className="card shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold gradient-text-primary flex items-center gap-2">
                        <FiFilter className="text-primary-500 dark:text-primary-400" />
                        Filters
                    </h3>
                    {(startDate || endDate || service || aiModel || projectId || status || searchText) && (
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                            <FiX />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Search */}
                <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                        <FiSearch className="inline mr-1" />
                        Search
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search in logs..."
                            className="w-full pl-10 pr-4 py-2.5 bg-light-panel dark:bg-dark-panel border border-primary-200/30 dark:border-primary-500/20 rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all backdrop-blur-xl"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                        <FiCalendar className="inline mr-1" />
                        Date Range
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1 block font-medium">From</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Start date"
                                className="w-full px-4 py-2.5 bg-light-panel dark:bg-dark-panel border border-primary-200/30 dark:border-primary-500/20 rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all backdrop-blur-xl"
                                dateFormat="MMM d, yyyy"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1 block font-medium">To</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate || undefined}
                                placeholderText="End date"
                                className="w-full px-4 py-2.5 bg-light-panel dark:bg-dark-panel border border-primary-200/30 dark:border-primary-500/20 rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all backdrop-blur-xl"
                                dateFormat="MMM d, yyyy"
                            />
                        </div>
                    </div>

                    {/* Quick date presets */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                const now = new Date();
                                setStartDate(new Date(now.getTime() - 60 * 60 * 1000));
                                setEndDate(now);
                            }}
                            className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                            Last hour
                        </button>
                        <button
                            onClick={() => {
                                const now = new Date();
                                setStartDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
                                setEndDate(now);
                            }}
                            className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                            Last 24h
                        </button>
                        <button
                            onClick={() => {
                                const now = new Date();
                                setStartDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
                                setEndDate(now);
                            }}
                            className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                            Last 7d
                        </button>
                    </div>
                </div>

                {/* Service */}
                <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Service</label>
                    <Select
                        value={serviceOptions.find(opt => opt.value === service)}
                        onChange={(option) => setService(option?.value || null)}
                        options={serviceOptions}
                        isClearable
                        placeholder="Select service..."
                        styles={customSelectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>

                {/* Model */}
                <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">AI Model</label>
                    <input
                        type="text"
                        value={aiModel || ''}
                        onChange={(e) => setAiModel(e.target.value || null)}
                        placeholder="e.g., claude-3-sonnet, gpt-4"
                        className="w-full px-4 py-2.5 bg-light-panel dark:bg-dark-panel border border-primary-200/30 dark:border-primary-500/20 rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all backdrop-blur-xl"
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Status</label>
                    <Select
                        value={statusOptions.find(opt => opt.value === status)}
                        onChange={(option) => setStatus(option?.value || null)}
                        options={statusOptions}
                        isClearable
                        placeholder="All statuses"
                        styles={customSelectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>

                {/* Advanced Filters Toggle */}
                <div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                        <span>Advanced Filters</span>
                        {showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
                    </button>

                    {showAdvanced && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                            {/* Project ID */}
                            <div>
                                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Project ID</label>
                                <input
                                    type="text"
                                    value={projectId || ''}
                                    onChange={(e) => setProjectId(e.target.value || null)}
                                    placeholder="Enter project ID"
                                    className="w-full px-4 py-2.5 bg-light-panel dark:bg-dark-panel border border-primary-200/30 dark:border-primary-500/20 rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all backdrop-blur-xl"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters Summary */}
                <div className="pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                    <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                        {!startDate && !endDate && !service && !aiModel && !projectId && !status && !searchText && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 italic">None</span>
                        )}
                        {startDate && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                                From: {startDate.toLocaleDateString()}
                            </span>
                        )}
                        {endDate && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                                To: {endDate.toLocaleDateString()}
                            </span>
                        )}
                        {service && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                                Service: {service}
                            </span>
                        )}
                        {aiModel && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                                Model: {aiModel}
                            </span>
                        )}
                        {status && status !== 'all' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                                Status: {status}
                            </span>
                        )}
                        {searchText && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                                Search: "{searchText}"
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
