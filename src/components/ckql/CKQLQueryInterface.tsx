import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Clock, TrendingUp, AlertCircle, Lightbulb, Play, Loader2 } from 'lucide-react';
import CKQLService, { CKQLQueryResult, QuerySuggestion } from '../../services/ckql.service';

interface CKQLQueryInterfaceProps {
    onResults?: (results: CKQLQueryResult) => void;
    className?: string;
}

export const CKQLQueryInterface: React.FC<CKQLQueryInterfaceProps> = ({
    onResults,
    className = ''
}) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<CKQLQueryResult | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [examples, setExamples] = useState<QuerySuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Load example queries on mount
    useEffect(() => {
        loadExamples();
    }, []);

    // Get suggestions when query changes
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (query.length > 2) {
                getSuggestions(query);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const loadExamples = async () => {
        try {
            const exampleQueries = await CKQLService.getExampleQueries();
            setExamples(exampleQueries);
        } catch (error) {
            console.error('Failed to load example queries:', error);
        }
    };

    const getSuggestions = async (partialQuery: string) => {
        try {
            const suggestionList = await CKQLService.getSuggestions(partialQuery);
            setSuggestions(suggestionList);
            setShowSuggestions(suggestionList.length > 0);
            setSelectedSuggestionIndex(-1);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
        }
    };

    const executeQuery = async (queryText: string = query) => {
        if (!queryText.trim()) return;

        setIsLoading(true);
        setError(null);
        setShowSuggestions(false);

        try {
            const result = await CKQLService.executeQuery({
                query: queryText,
                limit: 50
            });

            setResults(result);
            onResults?.(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Query execution failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'Enter') {
                executeQuery();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    const selectedQuery = suggestions[selectedSuggestionIndex];
                    setQuery(selectedQuery);
                    executeQuery(selectedQuery);
                } else {
                    executeQuery();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                break;
        }
    };

    const selectSuggestion = (suggestion: string) => {
        setQuery(suggestion);
        executeQuery(suggestion);
    };

    const selectExample = (exampleQuery: string) => {
        setQuery(exampleQuery);
        inputRef.current?.focus();
    };

    return (
        <div className={`w-full max-w-4xl mx-auto animate-fade-in ${className}`}>
            {/* Query Input */}
            <div className="relative mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => query.length > 2 && setShowSuggestions(suggestions.length > 0)}
                        placeholder="Ask anything about your costs and performance... (e.g., 'What are my most expensive AI operations today?')"
                        className="input w-full pl-12 pr-16 py-4 text-lg rounded-2xl shadow-lg"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => executeQuery()}
                        disabled={isLoading || !query.trim()}
                        className="btn-primary absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-2 glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel z-50 max-h-60 overflow-y-auto animate-scale-in"
                    >
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => selectSuggestion(suggestion)}
                                className={`w-full text-left px-4 py-3 hover:bg-primary-500/5 transition-all duration-300 border-b border-primary-200/20 last:border-b-0 rounded-lg ${index === selectedSuggestionIndex ? 'bg-gradient-to-r from-primary-50/50 to-secondary-50/50' : 'text-light-text-primary dark:text-dark-text-primary'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary-500" />
                                    <span className="font-medium">{suggestion}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-8 glass rounded-2xl border border-danger-200/50 shadow-lg backdrop-blur-xl bg-gradient-to-br from-danger-50 to-danger-100/50 p-4 animate-scale-in">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-display font-bold text-danger-800 dark:text-danger-200">Query Error</span>
                            <p className="text-sm font-medium text-danger-700 dark:text-danger-300 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Display */}
            {results && (
                <div className="mb-8 glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-display font-bold gradient-text-primary">Query Results</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 glass px-3 py-1 rounded-xl shadow-lg backdrop-blur-xl border border-primary-200/30">
                                <Clock className="w-4 h-4 text-primary-500" />
                                <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">{results.execution_time_ms}ms</span>
                            </span>
                            <span className="glass px-3 py-1 rounded-xl shadow-lg backdrop-blur-xl border border-primary-200/30 font-medium text-light-text-secondary dark:text-dark-text-secondary">{results.total_count} results</span>
                        </div>
                    </div>

                    {/* Query Explanation */}
                    <div className="mb-6 p-4 glass border border-primary-200/30 shadow-lg backdrop-blur-xl rounded-2xl">
                        <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{results.explanation}</p>
                    </div>

                    {/* Insights */}
                    {results.insights && results.insights.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-accent-500" />
                                Key Insights
                            </h4>
                            <ul className="space-y-1">
                                {results.insights.map((insight, index) => (
                                    <li key={index} className="text-light-text-secondary dark:text-dark-text-secondary text-sm">• {insight}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Results Preview */}
                    {results.results.length > 0 && (
                        <div className="glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-50/30 to-secondary-50/30 px-4 py-2 border-b border-primary-200/30">
                                <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                    Showing {results.results.length} of {results.total_count} results
                                </span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {results.results.slice(0, 5).map((result, index) => (
                                    <div key={index} className="px-4 py-3 border-b border-primary-200/20 last:border-b-0 hover:bg-primary-500/5 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                                {result.operation_name || 'Unknown Operation'}
                                            </span>
                                            <div className="flex items-center gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                {result.cost_usd && (
                                                    <span className="text-success-600 font-medium">
                                                        ${result.cost_usd.toFixed(4)}
                                                    </span>
                                                )}
                                                {result.duration_ms && (
                                                    <span>{result.duration_ms}ms</span>
                                                )}
                                                <span className={`px-2 py-1 rounded-full text-xs ${result.status === 'success' ? 'bg-success-100 text-success-700' :
                                                    result.status === 'error' ? 'bg-danger-100 text-danger-700' :
                                                        'bg-secondary-100 text-secondary-700'
                                                    }`}>
                                                    {result.status}
                                                </span>
                                            </div>
                                        </div>
                                        {result.cost_narrative && (
                                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{result.cost_narrative}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Filters */}
                    {results.suggested_filters && results.suggested_filters.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Suggested Filters</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.suggested_filters.map((filter, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-primary-100/50 text-primary-700 dark:text-primary-300 text-sm rounded-full border border-primary-200/30"
                                    >
                                        {filter}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Example Queries */}
            {!results && examples.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {examples.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4">
                            <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary-500" />
                                {category.category}
                            </h3>
                            <div className="space-y-2">
                                {category.queries.map((exampleQuery, queryIndex) => (
                                    <button
                                        key={queryIndex}
                                        onClick={() => selectExample(exampleQuery)}
                                        className="w-full text-left text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-2 rounded transition-all duration-300 hover:scale-105"
                                    >
                                        "{exampleQuery}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CKQLQueryInterface;

