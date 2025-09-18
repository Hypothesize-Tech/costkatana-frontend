/**
 * Semantic Primitives Explorer Component
 * 
 * Interactive tool for searching and exploring semantic primitives in the SAST vocabulary.
 * Allows filtering by category, language, and search terms.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Search,
    Filter,
    Network,
    Globe,
    BookOpen,
    Tag,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { sastService, SemanticSearchResult, SemanticSearchQuery } from '../../services/sast.service';

const SemanticPrimitivesExplorer: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<SemanticSearchQuery>({});
    const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [resultLimit, setResultLimit] = useState(10);

    const categories = [
        'concept', 'action', 'property', 'relation', 'quantity',
        'time', 'location', 'modality', 'logical', 'discourse'
    ];

    const languages = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

    const handleSearch = async () => {
        if (!searchTerm.trim() && !selectedCategory && !selectedLanguage) {
            setError('Please enter a search term or select filters');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const query: SemanticSearchQuery = {
                term: searchTerm.trim() || undefined,
                category: selectedCategory || undefined,
                language: selectedLanguage || undefined,
                limit: resultLimit
            };

            setSearchQuery(query);
            const response = await sastService.searchSemanticPrimitives(query);
            setSearchResults(response.results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedLanguage('');
        setSearchResults([]);
        setError(null);
        setSearchQuery({});
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            concept: 'bg-blue-100 text-blue-800',
            action: 'bg-green-100 text-green-800',
            property: 'bg-purple-100 text-purple-800',
            relation: 'bg-orange-100 text-orange-800',
            quantity: 'bg-red-100 text-red-800',
            time: 'bg-yellow-100 text-yellow-800',
            location: 'bg-teal-100 text-teal-800',
            modality: 'bg-pink-100 text-pink-800',
            logical: 'bg-indigo-100 text-indigo-800',
            discourse: 'bg-gray-100 text-gray-800'
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getMatchTypeIcon = (matchType: string) => {
        switch (matchType) {
            case 'exact': return <Tag className="w-3 h-3" />;
            case 'synonym': return <BookOpen className="w-3 h-3" />;
            case 'translation': return <Globe className="w-3 h-3" />;
            case 'relationship': return <Network className="w-3 h-3" />;
            default: return <Search className="w-3 h-3" />;
        }
    };

    const PrimitiveCard: React.FC<{ result: SemanticSearchResult }> = ({ result }) => {
        const { primitive, relevanceScore, matchType } = result;

        return (
            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                <div>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`glass px-3 py-1 rounded-full border font-display font-semibold text-xs ${getCategoryColor(primitive.category)}`}>
                                {primitive.category}
                            </span>
                            <span className="glass px-3 py-1 rounded-full border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-semibold text-xs flex items-center gap-1">
                                {getMatchTypeIcon(matchType)}
                                {matchType}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="font-display font-semibold gradient-text-primary">
                                {(relevanceScore * 100).toFixed(0)}%
                            </div>
                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">relevance</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-display font-bold gradient-text-primary">{primitive.baseForm}</span>
                                <code className="text-xs glass px-2 py-1 rounded border border-primary-200/30 bg-gradient-primary/10 text-primary-600 dark:text-primary-400">
                                    {primitive.id}
                                </code>
                            </div>
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">{primitive.definition}</p>
                        </div>

                        {primitive.synonyms.length > 0 && (
                            <div>
                                <h4 className="font-display font-medium text-light-text-primary dark:text-dark-text-primary text-xs mb-1">Synonyms:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {primitive.synonyms.slice(0, 5).map((synonym, index) => (
                                        <span key={index} className="glass px-2 py-1 rounded border border-success-200/30 bg-gradient-success/10 text-success-700 dark:text-success-300 font-body text-xs">
                                            {synonym}
                                        </span>
                                    ))}
                                    {primitive.synonyms.length > 5 && (
                                        <span className="glass px-2 py-1 rounded border border-secondary-200/30 bg-gradient-secondary/10 text-secondary-700 dark:text-secondary-300 font-body text-xs">
                                            +{primitive.synonyms.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {Object.keys(primitive.translations).length > 0 && (
                            <div>
                                <h4 className="font-display font-medium text-light-text-primary dark:text-dark-text-primary text-xs mb-1">Translations:</h4>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    {Object.entries(primitive.translations).slice(0, 4).map(([lang, terms]) => (
                                        <div key={lang} className="flex items-center gap-1">
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{lang.toUpperCase()}:</span>
                                            <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">{terms[0]}</span>
                                            {terms.length > 1 && (
                                                <span className="font-body text-light-text-tertiary dark:text-dark-text-tertiary">+{terms.length - 1}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between font-body text-light-text-secondary dark:text-dark-text-secondary text-xs pt-2 border-t border-primary-200/30">
                            <div className="flex items-center gap-3">
                                <span>Frequency: {primitive.frequency}</span>
                                <span>Abstract: {(primitive.abstractness * 100).toFixed(0)}%</span>
                            </div>
                            {primitive.relationships.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Network className="w-3 h-3" />
                                    <span>{primitive.relationships.length} relations</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                        <Search className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text-primary">
                        Semantic Primitives Explorer
                    </h2>
                </div>
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                Search Term
                            </label>
                            <input
                                placeholder="Enter word or concept..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                Category
                            </label>
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input">
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        <span className="capitalize">{category}</span>
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                Language
                            </label>
                            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="input">
                                <option value="">All languages</option>
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                Results
                            </label>
                            <select
                                value={resultLimit.toString()}
                                onChange={(e) => setResultLimit(parseInt(e.target.value))}
                                className="input"
                            >
                                <option value="5">5 results</option>
                                <option value="10">10 results</option>
                                <option value="20">20 results</option>
                                <option value="50">50 results</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleSearch} disabled={loading} className="btn-primary">
                            {loading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4 mr-2" />
                            )}
                            Search
                        </button>
                        <button onClick={handleClearSearch} className="btn-secondary">
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center gap-3 text-danger-600 dark:text-danger-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-body">{error}</span>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Search Results ({searchResults.length})
                        </h3>
                        {Object.keys(searchQuery).length > 0 && (
                            <div className="flex items-center gap-2 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                <Filter className="w-4 h-4" />
                                {searchQuery.term && <span className="glass px-2 py-1 rounded border border-primary-200/30 bg-gradient-primary/10 text-primary-700 dark:text-primary-300 font-display font-medium text-xs">"{searchQuery.term}"</span>}
                                {searchQuery.category && <span className="glass px-2 py-1 rounded border border-secondary-200/30 bg-gradient-secondary/10 text-secondary-700 dark:text-secondary-300 font-display font-medium text-xs">{searchQuery.category}</span>}
                                {searchQuery.language && <span className="glass px-2 py-1 rounded border border-accent-200/30 bg-gradient-accent/10 text-accent-700 dark:text-accent-300 font-display font-medium text-xs">{searchQuery.language?.toUpperCase()}</span>}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {searchResults.map((result, index) => (
                            <PrimitiveCard key={`${result.primitive.id}-${index}`} result={result} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {searchResults.length === 0 && !loading && !error && Object.keys(searchQuery).length > 0 && (
                <div className="glass rounded-xl p-12 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 text-primary-400" />
                    <h3 className="text-lg font-display font-semibold gradient-text-primary mb-2">No Results Found</h3>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        Try adjusting your search terms or filters to find semantic primitives.
                    </p>
                    <button onClick={handleClearSearch} className="btn-secondary">
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
};

export default SemanticPrimitivesExplorer;
