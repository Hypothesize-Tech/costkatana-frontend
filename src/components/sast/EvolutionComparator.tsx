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
        <div className="space-y-8">
            {/* Input Section */}
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text">
                        Evolution Comparator
                    </h2>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                            Input Text
                        </label>
                        <textarea
                            placeholder="Enter text to compare traditional Cortex vs SAST approaches..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            rows={4}
                            className="input resize-none"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                Language
                            </label>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="input"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button onClick={handleCompare} disabled={loading} className="btn-primary w-full sm:w-auto">
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Zap className="w-4 h-4 mr-2" />
                                )}
                                Compare
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Example Texts */}
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center glow-secondary">
                        <span className="text-white text-sm">💡</span>
                    </div>
                    <h3 className="font-display font-semibold gradient-text-secondary">Try These Examples</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {exampleTexts.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => handleExampleSelect(example)}
                            className="glass px-4 py-2 rounded-lg border border-primary-200/30 font-body text-sm text-light-text-primary dark:text-dark-text-primary hover:scale-105 transition-all duration-200 hover:border-primary-300/50"
                        >
                            {example.length > 40 ? `${example.substring(0, 37)}...` : example}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-danger-600 dark:text-danger-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-body">{error}</span>
                    </div>
                </div>
            )}

            {/* Comparison Results */}
            {comparison && (
                <div className="space-y-6">
                    {/* Overview Card */}
                    <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text">
                                    Comparison Results
                                </h3>
                            </div>
                            {getRecommendationBadge(comparison.metadata.recommendedApproach)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="glass rounded-lg p-6 border border-success-200/30 text-center">
                                <div className={`text-3xl font-display font-bold mb-2 ${getImprovementColor(comparison.improvements.tokenReduction) === 'text-green-600' ? 'gradient-text-success' : getImprovementColor(comparison.improvements.tokenReduction) === 'text-blue-600' ? 'gradient-text' : 'text-danger-600'}`}>
                                    {formatPercentage(comparison.improvements.tokenReduction)}
                                </div>
                                <div className="font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Token Reduction</div>
                                {comparison.improvements.tokenReduction > 0 ? (
                                    <TrendingDown className="w-5 h-5 mx-auto text-success-500" />
                                ) : (
                                    <TrendingUp className="w-5 h-5 mx-auto text-danger-500" />
                                )}
                            </div>

                            <div className="glass rounded-lg p-6 border border-secondary-200/30 text-center">
                                <div className={`text-3xl font-display font-bold mb-2 ${getImprovementColor(comparison.improvements.ambiguityReduction) === 'text-green-600' ? 'gradient-text-success' : getImprovementColor(comparison.improvements.ambiguityReduction) === 'text-blue-600' ? 'gradient-text' : 'text-danger-600'}`}>
                                    {formatPercentage(comparison.improvements.ambiguityReduction)}
                                </div>
                                <div className="font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Ambiguity Reduction</div>
                                <Brain className="w-5 h-5 mx-auto text-secondary-500" />
                            </div>

                            <div className="glass rounded-lg p-6 border border-accent-200/30 text-center">
                                <div className={`text-3xl font-display font-bold mb-2 ${getImprovementColor(comparison.improvements.semanticClarityGain * 100) === 'text-green-600' ? 'gradient-text-success' : getImprovementColor(comparison.improvements.semanticClarityGain * 100) === 'text-blue-600' ? 'gradient-text' : 'text-danger-600'}`}>
                                    {formatPercentage(comparison.improvements.semanticClarityGain * 100)}
                                </div>
                                <div className="font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Semantic Clarity</div>
                                <CheckCircle2 className="w-5 h-5 mx-auto text-accent-500" />
                            </div>

                            <div className="glass rounded-lg p-6 border border-warning-200/30 text-center">
                                <div className="text-3xl font-display font-bold mb-2">
                                    {comparison.improvements.crossLingualCompatibility ? (
                                        <CheckCircle2 className="w-10 h-10 mx-auto text-success-500" />
                                    ) : (
                                        <AlertTriangle className="w-10 h-10 mx-auto text-warning-500" />
                                    )}
                                </div>
                                <div className="font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Cross-Lingual</div>
                                <Globe className="w-5 h-5 mx-auto text-warning-500" />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Comparison */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Traditional Cortex */}
                        <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text">
                                    Traditional Cortex
                                </h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Token Count</span>
                                    <span className="glass px-3 py-1 rounded-full border border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-semibold">{formatNumber(comparison.traditionalCortex.tokenCount)}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Ambiguity Level</span>
                                    <span className={`glass px-3 py-1 rounded-full border font-display font-semibold ${comparison.traditionalCortex.ambiguityLevel === 'high' ? 'border-danger-200/30 bg-gradient-danger/20 text-danger-700 dark:text-danger-300' :
                                        comparison.traditionalCortex.ambiguityLevel === 'medium' ? 'border-warning-200/30 bg-gradient-warning/20 text-warning-700 dark:text-warning-300' :
                                            'border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300'
                                        }`}>
                                        {comparison.traditionalCortex.ambiguityLevel}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Semantic Explicitness</span>
                                        <span className="font-display font-semibold gradient-text">{((comparison.traditionalCortex.semanticExplicitness || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${(comparison.traditionalCortex.semanticExplicitness || 0) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SAST Cortex */}
                        <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center glow-secondary">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text-secondary">
                                    SAST Cortex
                                </h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Primitive Count</span>
                                    <span className="glass px-3 py-1 rounded-full border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-semibold">{formatNumber(comparison.sastCortex.primitiveCount)}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Ambiguities Resolved</span>
                                    <span className="glass px-3 py-1 rounded-full border border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-semibold">
                                        {formatNumber(comparison.sastCortex.ambiguitiesResolved)}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Semantic Explicitness</span>
                                        <span className="font-display font-semibold gradient-text-secondary">{((comparison.sastCortex.semanticExplicitness || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-secondary h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${(comparison.sastCortex.semanticExplicitness || 0) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Processing Metadata */}
                    <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center glow-accent">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-display font-bold gradient-text-accent">
                                Processing Details
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass rounded-lg p-4 border border-primary-200/30 text-center">
                                <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Complexity Level</div>
                                <div className="font-display font-bold gradient-text capitalize">{comparison.metadata.complexityLevel}</div>
                            </div>
                            <div className="glass rounded-lg p-4 border border-primary-200/30 text-center">
                                <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Processing Time</div>
                                <div className="font-display font-bold gradient-text">{comparison.metadata.comparisonTime}ms</div>
                            </div>
                            <div className="glass rounded-lg p-4 border border-primary-200/30 text-center">
                                <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Processing Efficiency</div>
                                <div className={`font-display font-bold ${getImprovementColor(comparison.improvements.processingEfficiency) === 'text-green-600' ? 'gradient-text-success' : getImprovementColor(comparison.improvements.processingEfficiency) === 'text-blue-600' ? 'gradient-text' : 'text-danger-600'}`}>
                                    {formatPercentage(comparison.improvements.processingEfficiency)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvolutionComparator;
