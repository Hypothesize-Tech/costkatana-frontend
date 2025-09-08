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
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getCategoryColor(primitive.category)}>
                                {primitive.category}
                            </Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {getMatchTypeIcon(matchType)}
                                {matchType}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {(relevanceScore * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">relevance</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-gray-900">{primitive.baseForm}</span>
                                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-600">
                                    {primitive.id}
                                </code>
                            </div>
                            <p className="text-sm text-gray-600">{primitive.definition}</p>
                        </div>

                        {primitive.synonyms.length > 0 && (
                            <div>
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Synonyms:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {primitive.synonyms.slice(0, 5).map((synonym, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {synonym}
                                        </Badge>
                                    ))}
                                    {primitive.synonyms.length > 5 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{primitive.synonyms.length - 5} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {Object.keys(primitive.translations).length > 0 && (
                            <div>
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Translations:</h4>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    {Object.entries(primitive.translations).slice(0, 4).map(([lang, terms]) => (
                                        <div key={lang} className="flex items-center gap-1">
                                            <span className="font-medium text-gray-600">{lang.toUpperCase()}:</span>
                                            <span className="text-gray-500">{terms[0]}</span>
                                            {terms.length > 1 && (
                                                <span className="text-gray-400">+{terms.length - 1}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
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
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Search Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Search className="w-5 h-5 mr-2 text-blue-500" />
                        Semantic Primitives Explorer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Search Term
                            </label>
                            <Input
                                placeholder="Enter word or concept..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Category
                            </label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            <span className="capitalize">{category}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Language
                            </label>
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All languages" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All languages</SelectItem>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang.toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Results
                            </label>
                            <Select
                                value={resultLimit.toString()}
                                onValueChange={(value) => setResultLimit(parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 results</SelectItem>
                                    <SelectItem value="10">10 results</SelectItem>
                                    <SelectItem value="20">20 results</SelectItem>
                                    <SelectItem value="50">50 results</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4 mr-2" />
                            )}
                            Search
                        </Button>
                        <Button variant="outline" onClick={handleClearSearch}>
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Search Results ({searchResults.length})
                        </h3>
                        {Object.keys(searchQuery).length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Filter className="w-4 h-4" />
                                {searchQuery.term && <Badge variant="outline">"{searchQuery.term}"</Badge>}
                                {searchQuery.category && <Badge variant="outline">{searchQuery.category}</Badge>}
                                {searchQuery.language && <Badge variant="outline">{searchQuery.language?.toUpperCase()}</Badge>}
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
                <Card className="text-center py-8">
                    <CardContent>
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search terms or filters to find semantic primitives.
                        </p>
                        <Button variant="outline" onClick={handleClearSearch}>
                            Clear Search
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SemanticPrimitivesExplorer;
