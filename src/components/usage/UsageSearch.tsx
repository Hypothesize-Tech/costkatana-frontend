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
        <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pr-12 pl-12 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-primary-200/30 dark:border-primary-700/30 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:ring-2 focus:ring-[#06ec9e] focus:border-transparent transition-all duration-300 min-h-[44px] [touch-action:manipulation]"
        />
        {query && (
          <div className="flex absolute inset-y-0 right-0 items-center pr-4">
            <button
              onClick={handleClear}
              className="p-1 rounded-lg transition-all duration-300 btn text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-primary-100/50 dark:hover:bg-primary-800/50 focus:outline-none"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {isSearching && (
        <div className="absolute right-0 left-0 top-full z-10 mt-2">
          <div className="p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
              <svg
                className="mr-2 w-4 h-4 animate-spin text-[#06ec9e]"
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
