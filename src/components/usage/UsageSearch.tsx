import React, { useState, useCallback, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { debounce } from "@/utils/helpers";

interface UsageSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const UsageSearch: React.FC<UsageSearchProps> = ({
  onSearch,
  placeholder = "Search prompts, models, or services...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setIsSearching(false);
      onSearch(searchQuery);
    }, 300),
    [onSearch],
  );

  useEffect(() => {
    if (query) {
      setIsSearching(true);
      debouncedSearch(query);
    } else {
      setIsSearching(false);
      onSearch("");
    }
  }, [query, debouncedSearch, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input pl-12 pr-12"
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button
              onClick={handleClear}
              className="p-1 rounded-lg text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-primary-100/50 dark:hover:bg-primary-800/50 focus:outline-none transition-all duration-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {isSearching && (
        <div className="absolute left-0 right-0 top-full mt-2 z-10">
          <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3">
            <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <svg
                className="animate-spin h-4 w-4 mr-2 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Searching...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
