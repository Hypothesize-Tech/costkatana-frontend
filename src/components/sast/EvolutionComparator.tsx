/**
 * Evolution Comparator Component
 * 
 * Interactive tool for comparing traditional Cortex vs SAST (Semantic Abstract Syntax Tree)
 * approaches, showing improvements in token reduction, ambiguity resolution, and semantic clarity.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Zap,
    ArrowRight,
    BarChart3,
    Brain,
    Globe,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    FileText,
    Lightbulb
} from 'lucide-react';
import { sastService, CortexEvolutionComparison } from '../../services/sast.service';

const EvolutionComparator: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [comparison, setComparison] = useState<CortexEvolutionComparison | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh', name: 'Chinese' }
    ];

    const exampleTexts = [
        "I saw a man on the hill with a telescope",
        "The report that the committee submitted was rejected",
        "Flying planes can be dangerous",
        "The chicken is ready to eat",
        "Time flies like an arrow",
        "The complex financial analysis requires detailed examination of market trends and consumer behavior patterns"
    ];

    const handleCompare = async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to compare');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await sastService.compareEvolution(inputText.trim(), selectedLanguage);
            setComparison(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Comparison failed');
            console.error('Comparison error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExampleSelect = (example: string) => {
        setInputText(example);
        setError(null);
    };

    const formatPercentage = (value: number | null | undefined) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0.0%';
        }
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };
    const formatNumber = (value: number | null | undefined) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        return value.toLocaleString();
    };

    const getImprovementColor = (value: number) => {
        if (value > 20) return 'text-green-600';
        if (value > 0) return 'text-blue-600';
        if (value < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getRecommendationBadge = (approach: string) => {
        const badges = {
            'sast': { color: 'bg-green-100 text-green-800', icon: <Brain className="w-3 h-3" />, text: 'SAST Recommended' },
            'traditional': { color: 'bg-blue-100 text-blue-800', icon: <FileText className="w-3 h-3" />, text: 'Traditional Cortex' },
            'hybrid': { color: 'bg-purple-100 text-purple-800', icon: <Lightbulb className="w-3 h-3" />, text: 'Hybrid Approach' }
        };

        const badge = badges[approach as keyof typeof badges] || badges.traditional;

        return (
            <Badge className={`flex items-center gap-1 ${badge.color}`}>
                {badge.icon}
                {badge.text}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-purple-500" />
                        Evolution Comparator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Input Text
                            </label>
                            <Textarea
                                placeholder="Enter text to compare traditional Cortex vs SAST approaches..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Language
                                </label>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button onClick={handleCompare} disabled={loading} className="w-full sm:w-auto">
                                    {loading ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Zap className="w-4 h-4 mr-2" />
                                    )}
                                    Compare
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Example Texts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Try These Examples</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {exampleTexts.map((example, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleExampleSelect(example)}
                                className="text-xs h-auto py-2 px-3 leading-tight"
                            >
                                {example.length > 40 ? `${example.substring(0, 37)}...` : example}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Comparison Results */}
            {comparison && (
                <div className="space-y-6">
                    {/* Overview Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                                    Comparison Results
                                </CardTitle>
                                {getRecommendationBadge(comparison.metadata.recommendedApproach)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${getImprovementColor(comparison.improvements.tokenReduction)}`}>
                                        {formatPercentage(comparison.improvements.tokenReduction)}
                                    </div>
                                    <div className="text-sm text-gray-600">Token Reduction</div>
                                    {comparison.improvements.tokenReduction > 0 ? (
                                        <TrendingDown className="w-4 h-4 mx-auto mt-1 text-green-500" />
                                    ) : (
                                        <TrendingUp className="w-4 h-4 mx-auto mt-1 text-red-500" />
                                    )}
                                </div>

                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${getImprovementColor(comparison.improvements.ambiguityReduction)}`}>
                                        {formatPercentage(comparison.improvements.ambiguityReduction)}
                                    </div>
                                    <div className="text-sm text-gray-600">Ambiguity Reduction</div>
                                    <Brain className="w-4 h-4 mx-auto mt-1 text-purple-500" />
                                </div>

                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${getImprovementColor(comparison.improvements.semanticClarityGain * 100)}`}>
                                        {formatPercentage(comparison.improvements.semanticClarityGain * 100)}
                                    </div>
                                    <div className="text-sm text-gray-600">Semantic Clarity</div>
                                    <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-blue-500" />
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {comparison.improvements.crossLingualCompatibility ? (
                                            <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                                        ) : (
                                            <AlertTriangle className="w-8 h-8 mx-auto text-orange-500" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">Cross-Lingual</div>
                                    <Globe className="w-4 h-4 mx-auto mt-1 text-indigo-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Comparison */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Traditional Cortex */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-blue-600">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Traditional Cortex
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Token Count</span>
                                        <Badge variant="outline">{formatNumber(comparison.traditionalCortex.tokenCount)}</Badge>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Ambiguity Level</span>
                                        <Badge
                                            variant={comparison.traditionalCortex.ambiguityLevel === 'high' ? 'destructive' :
                                                comparison.traditionalCortex.ambiguityLevel === 'medium' ? 'default' : 'secondary'}
                                        >
                                            {comparison.traditionalCortex.ambiguityLevel}
                                        </Badge>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Semantic Explicitness</span>
                                            <span>{((comparison.traditionalCortex.semanticExplicitness || 0) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${(comparison.traditionalCortex.semanticExplicitness || 0) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SAST Cortex */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-purple-600">
                                    <Brain className="w-5 h-5 mr-2" />
                                    SAST Cortex
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Primitive Count</span>
                                        <Badge variant="outline">{formatNumber(comparison.sastCortex.primitiveCount)}</Badge>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Ambiguities Resolved</span>
                                        <Badge variant="outline" className="text-green-700 border-green-300">
                                            {formatNumber(comparison.sastCortex.ambiguitiesResolved)}
                                        </Badge>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Semantic Explicitness</span>
                                            <span>{((comparison.sastCortex.semanticExplicitness || 0) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-500 h-2 rounded-full"
                                                style={{ width: `${(comparison.sastCortex.semanticExplicitness || 0) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Processing Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                                Processing Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="font-medium text-gray-700">Complexity Level</div>
                                    <div className="capitalize">{comparison.metadata.complexityLevel}</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">Processing Time</div>
                                    <div>{comparison.metadata.comparisonTime}ms</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">Processing Efficiency</div>
                                    <div className={getImprovementColor(comparison.improvements.processingEfficiency)}>
                                        {formatPercentage(comparison.improvements.processingEfficiency)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default EvolutionComparator;
