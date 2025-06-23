import React, { useState, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { debounce } from '@/utils/helpers';

interface UsageSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

export const UsageSearch: React.FC<UsageSearchProps> = ({
    onSearch,
    placeholder = 'Search prompts, models, or services...',
    className = ''
}) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchQuery: string) => {
            setIsSearching(false);
            onSearch(searchQuery);
        }, 300),
        [onSearch]
    );

    useEffect(() => {
        if (query) {
            setIsSearching(true);
            debouncedSearch(query);
        } else {
            setIsSearching(false);
            onSearch('');
        }
    }, [query, debouncedSearch, onSearch]);

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {query && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {isSearching && (
                <div className="absolute left-0 right-0 top-full mt-1">
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Searching...
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};