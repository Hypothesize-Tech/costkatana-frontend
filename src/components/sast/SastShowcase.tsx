/**
 * SAST Showcase Component
 * 
 * Displays a comprehensive showcase of SAST capabilities with multiple example
 * comparisons between traditional Cortex and SAST approaches.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    FileText,
    TrendingUp,
    TrendingDown,
    Brain,
    Globe,
    BarChart3,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Eye,
    Target
} from 'lucide-react';
import { sastService, SastShowcase as SastShowcaseType } from '../../services/sast.service';

const SastShowcase: React.FC = () => {
    const [showcaseData, setShowcaseData] = useState<SastShowcaseType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedExample, setSelectedExample] = useState<number | null>(null);

    useEffect(() => {
        loadShowcase();
    }, []);

    const loadShowcase = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await sastService.getSastShowcase();
            setShowcaseData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load SAST showcase');
            console.error('Showcase load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPercentage = (value: number | null | undefined) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0.0%';
        }
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };



    const getImprovementColor = (value: number) => {
        if (value > 20) return 'text-green-600';
        if (value > 0) return 'text-blue-600';
        if (value < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getComplexityBadge = (complexity: string) => {
        const badges = {
            simple: 'bg-green-100 text-green-800',
            moderate: 'bg-yellow-100 text-yellow-800',
            complex: 'bg-red-100 text-red-800'
        };
        return badges[complexity as keyof typeof badges] || badges.simple;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading SAST showcase...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardContent className="p-6 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadShowcase} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!showcaseData) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Summary Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-500" />
                        SAST Showcase Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {formatPercentage(showcaseData.summary.avgTokenReduction)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Token Reduction</div>
                            <TrendingDown className="w-4 h-4 mx-auto mt-1 text-green-500" />
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {formatPercentage(showcaseData.summary.avgAmbiguityReduction)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Ambiguity Reduction</div>
                            <Brain className="w-4 h-4 mx-auto mt-1 text-purple-500" />
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {formatPercentage(showcaseData.summary.avgSemanticGain * 100)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Semantic Gain</div>
                            <TrendingUp className="w-4 h-4 mx-auto mt-1 text-blue-500" />
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">
                                {((showcaseData.summary.universalCompatibility || 0) * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-600">Universal Compatible</div>
                            <Globe className="w-4 h-4 mx-auto mt-1 text-indigo-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Example Comparisons */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2 text-orange-500" />
                        Example Comparisons ({showcaseData.examples.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {showcaseData.examples.map((example, index) => (
                            <Card
                                key={index}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedExample === index
                                    ? 'ring-2 ring-blue-500 border-blue-300'
                                    : 'border-gray-200'
                                    }`}
                                onClick={() => setSelectedExample(selectedExample === index ? null : index)}
                            >
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        {/* Example Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 mb-2">
                                                    "{example.inputText}"
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={getComplexityBadge(example.metadata.complexityLevel)}
                                                    >
                                                        {example.metadata.complexityLevel}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                                                        {example.language.toUpperCase()}
                                                    </Badge>
                                                    <Badge
                                                        variant={example.metadata.recommendedApproach === 'sast' ? 'default' : 'outline'}
                                                        className={
                                                            example.metadata.recommendedApproach === 'sast'
                                                                ? 'bg-green-100 text-green-800'
                                                                : ''
                                                        }
                                                    >
                                                        {example.metadata.recommendedApproach}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                {selectedExample === index ? (
                                                    <Eye className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>

                                        {/* Quick Metrics */}
                                        <div className="grid grid-cols-4 gap-4 text-center text-sm">
                                            <div>
                                                <div className={`font-semibold ${getImprovementColor(example.improvements.tokenReduction)}`}>
                                                    {formatPercentage(example.improvements.tokenReduction)}
                                                </div>
                                                <div className="text-xs text-gray-600">Tokens</div>
                                            </div>
                                            <div>
                                                <div className={`font-semibold ${getImprovementColor(example.improvements.ambiguityReduction)}`}>
                                                    {formatPercentage(example.improvements.ambiguityReduction)}
                                                </div>
                                                <div className="text-xs text-gray-600">Ambiguity</div>
                                            </div>
                                            <div>
                                                <div className={`font-semibold ${getImprovementColor(example.improvements.semanticClarityGain * 100)}`}>
                                                    {formatPercentage(example.improvements.semanticClarityGain * 100)}
                                                </div>
                                                <div className="text-xs text-gray-600">Clarity</div>
                                            </div>
                                            <div>
                                                <div className="flex justify-center">
                                                    {example.improvements.crossLingualCompatibility ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-600">X-Lingual</div>
                                            </div>
                                        </div>

                                        {/* Detailed View */}
                                        {selectedExample === index && (
                                            <div className="mt-4 pt-4 border-t space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Traditional Cortex */}
                                                    <Card className="bg-blue-50">
                                                        <CardContent className="p-3">
                                                            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                                                <FileText className="w-4 h-4 mr-1" />
                                                                Traditional Cortex
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>Tokens:</span>
                                                                    <span className="font-medium">{example.traditionalCortex.tokenCount}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Ambiguity:</span>
                                                                    <Badge size="sm" variant="outline">
                                                                        {example.traditionalCortex.ambiguityLevel}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Semantic Explicitness:</span>
                                                                    <span className="font-medium">
                                                                        {((example.traditionalCortex.semanticExplicitness || 0) * 100).toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* SAST Cortex */}
                                                    <Card className="bg-purple-50">
                                                        <CardContent className="p-3">
                                                            <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                                                                <Brain className="w-4 h-4 mr-1" />
                                                                SAST Cortex
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>Primitives:</span>
                                                                    <span className="font-medium">{example.sastCortex.primitiveCount}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Resolved:</span>
                                                                    <Badge size="sm" className="bg-green-100 text-green-800">
                                                                        {example.sastCortex.ambiguitiesResolved}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Semantic Explicitness:</span>
                                                                    <span className="font-medium">
                                                                        {((example.sastCortex.semanticExplicitness || 0) * 100).toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                <div className="text-xs text-gray-600 text-center">
                                                    Processing time: {example.metadata.comparisonTime}ms |
                                                    Efficiency: {formatPercentage(example.improvements.processingEfficiency)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                        Performance Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Success Rate by Complexity */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">SAST Effectiveness by Complexity</h4>
                            <div className="space-y-2">
                                {['simple', 'moderate', 'complex'].map(complexity => {
                                    const examplesOfComplexity = showcaseData.examples.filter(ex =>
                                        ex.metadata.complexityLevel === complexity
                                    );
                                    const avgImprovement = examplesOfComplexity.length > 0
                                        ? examplesOfComplexity.reduce((sum, ex) => sum + ex.improvements.semanticClarityGain, 0) / examplesOfComplexity.length
                                        : 0;

                                    return (
                                        <div key={complexity} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={getComplexityBadge(complexity)}>
                                                    {complexity}
                                                </Badge>
                                                <span className="text-sm text-gray-600">
                                                    ({examplesOfComplexity.length} examples)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500"
                                                        style={{ width: `${Math.max(0, avgImprovement * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">
                                                    {formatPercentage(avgImprovement * 100)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Key Achievements */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Key Achievements</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    <div>
                                        <div className="font-medium text-green-800">
                                            {showcaseData.examples.filter(ex => ex.improvements.tokenReduction > 0).length} / {showcaseData.examples.length}
                                        </div>
                                        <div className="text-sm text-green-600">Token reductions achieved</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                    <div>
                                        <div className="font-medium text-purple-800">
                                            {showcaseData.examples.reduce((sum, ex) => sum + ex.sastCortex.ambiguitiesResolved, 0)}
                                        </div>
                                        <div className="text-sm text-purple-600">Total ambiguities resolved</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <Zap className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <div className="font-medium text-blue-800">
                                            {showcaseData.examples.filter(ex => ex.metadata.recommendedApproach === 'sast').length} / {showcaseData.examples.length}
                                        </div>
                                        <div className="text-sm text-blue-600">SAST recommended cases</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                                    <Globe className="w-6 h-6 text-indigo-600" />
                                    <div>
                                        <div className="font-medium text-indigo-800">
                                            {showcaseData.examples.filter(ex => ex.improvements.crossLingualCompatibility).length} / {showcaseData.examples.length}
                                        </div>
                                        <div className="text-sm text-indigo-600">Cross-lingual compatible</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SastShowcase;
