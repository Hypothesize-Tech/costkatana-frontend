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
        <div className={`w-full max-w-4xl mx-auto ${className}`}>
            {/* Query Input */}
            <div className="relative mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => query.length > 2 && setShowSuggestions(suggestions.length > 0)}
                        placeholder="Ask anything about your costs and performance... (e.g., 'What are my most expensive AI operations today?')"
                        className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => executeQuery()}
                        disabled={isLoading || !query.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
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
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => selectSuggestion(suggestion)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${index === selectedSuggestionIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                    <span>{suggestion}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Query Error</span>
                    </div>
                    <p className="text-red-600 mt-1">{error}</p>
                </div>
            )}

            {/* Results Display */}
            {results && (
                <div className="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {results.execution_time_ms}ms
                            </span>
                            <span>{results.total_count} results</span>
                        </div>
                    </div>

                    {/* Query Explanation */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800">{results.explanation}</p>
                    </div>

                    {/* Insights */}
                    {results.insights && results.insights.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                Key Insights
                            </h4>
                            <ul className="space-y-1">
                                {results.insights.map((insight, index) => (
                                    <li key={index} className="text-gray-700 text-sm">• {insight}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Results Preview */}
                    {results.results.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-700">
                                    Showing {results.results.length} of {results.total_count} results
                                </span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {results.results.slice(0, 5).map((result, index) => (
                                    <div key={index} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">
                                                {result.operation_name || 'Unknown Operation'}
                                            </span>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                {result.cost_usd && (
                                                    <span className="text-green-600 font-medium">
                                                        ${result.cost_usd.toFixed(4)}
                                                    </span>
                                                )}
                                                {result.duration_ms && (
                                                    <span>{result.duration_ms}ms</span>
                                                )}
                                                <span className={`px-2 py-1 rounded-full text-xs ${result.status === 'success' ? 'bg-green-100 text-green-700' :
                                                        result.status === 'error' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {result.status}
                                                </span>
                                            </div>
                                        </div>
                                        {result.cost_narrative && (
                                            <p className="text-sm text-gray-600 mt-1">{result.cost_narrative}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Filters */}
                    {results.suggested_filters && results.suggested_filters.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Suggested Filters</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.suggested_filters.map((filter, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
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
                        <div key={categoryIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                {category.category}
                            </h3>
                            <div className="space-y-2">
                                {category.queries.map((exampleQuery, queryIndex) => (
                                    <button
                                        key={queryIndex}
                                        onClick={() => selectExample(exampleQuery)}
                                        className="w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
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

