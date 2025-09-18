/**
 * SAST Dashboard Component
 * 
 * Main dashboard for Semantic Abstract Syntax Tree functionality,
 * providing access to all SAST features and demonstrations.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
    Brain,
    Network,
    Search,
    Zap,
    Globe,
    BarChart3,
    FileText,
    Telescope,
    Cpu,
    Languages,
    TrendingUp,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { sastService, SemanticVocabularyStats, SastStats } from '../../services/sast.service';
import SemanticPrimitivesExplorer from './SemanticPrimitivesExplorer';
import EvolutionComparator from './EvolutionComparator';
import TelescopeDemo from './TelescopeDemo';
import UniversalSemanticsTest from './UniversalSemanticsTest';
import SastShowcase from './SastShowcase';

const SastDashboard: React.FC = () => {
    const [vocabularyStats, setVocabularyStats] = useState<SemanticVocabularyStats | null>(null);
    const [sastStats, setSastStats] = useState<SastStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [vocabData, statsData] = await Promise.all([
                sastService.getVocabularyStats(),
                sastService.getSastStats()
            ]);

            setVocabularyStats(vocabData);
            setSastStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load SAST data');
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPercentage = (value: number | null | undefined) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0.0%';
        }
        return `${value.toFixed(1)}%`;
    };

    const formatNumber = (value: number | null | undefined) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        return value.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="glass rounded-xl p-8 border border-primary-200/30 text-center">
                    <Cpu className="w-16 h-16 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Loading SAST Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="glass rounded-xl p-8 border border-danger-200/30 text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-danger-500" />
                    <p className="font-body text-danger-600 dark:text-danger-400 mb-4">{error}</p>
                    <button className="btn-primary" onClick={loadDashboardData}>
                        <Zap className="w-4 h-4 mr-2" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-display font-bold gradient-text-primary">
                                    SAST Dashboard
                                </h1>
                                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
                                    Semantic Abstract Syntax Tree - Next-generation language understanding
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <span className="glass px-4 py-2 rounded-full border border-success-200/30 bg-gradient-success/20 text-success-700 dark:text-success-300 font-display font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Active
                        </span>
                        <span className="glass px-4 py-2 rounded-full border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-semibold">
                            v2.0 SAST
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {vocabularyStats && sastStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                <Network className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-display font-bold gradient-text-primary mb-2">{formatNumber(vocabularyStats.totalPrimitives)}</div>
                        <h3 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Semantic Primitives</h3>
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                            Across {Object.keys(vocabularyStats.primitivesByCategory).length} categories
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                                <Languages className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-display font-bold gradient-text-success mb-2">{Object.keys(vocabularyStats.coverageByLanguage).length}</div>
                        <h3 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Cross-Lingual Support</h3>
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                            Supported languages
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-display font-bold gradient-text-secondary mb-2">{formatPercentage(sastStats.comparison.sastWinRate)}</div>
                        <h3 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">SAST Win Rate</h3>
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                            vs Traditional Cortex
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                                <Telescope className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-display font-bold gradient-text-accent mb-2">{formatNumber(sastStats.encoding.ambiguitiesResolved)}</div>
                        <h3 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">Ambiguity Resolution</h3>
                        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                            Total ambiguities resolved
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                <TabsList className="flex flex-wrap border-b border-primary-200/30 bg-transparent">
                    <TabsTrigger value="overview" className="flex items-center gap-2 px-6 py-4 font-display font-medium data-[state=active]:text-primary-700 data-[state=active]:dark:text-primary-300 data-[state=active]:bg-gradient-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary-500">
                        <BarChart3 className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="explorer" className="flex items-center gap-2 px-6 py-4 font-display font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-gradient-primary/5 transition-all duration-200">
                        <Search className="w-4 h-4" />
                        Explorer
                    </TabsTrigger>
                    <TabsTrigger value="comparator" className="flex items-center gap-2 px-6 py-4 font-display font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-gradient-primary/5 transition-all duration-200">
                        <Zap className="w-4 h-4" />
                        Comparator
                    </TabsTrigger>
                    <TabsTrigger value="telescope" className="flex items-center gap-2 px-6 py-4 font-display font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-gradient-primary/5 transition-all duration-200">
                        <Telescope className="w-4 h-4" />
                        Demo
                    </TabsTrigger>
                    <TabsTrigger value="universal" className="flex items-center gap-2 px-6 py-4 font-display font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-gradient-primary/5 transition-all duration-200">
                        <Globe className="w-4 h-4" />
                        Universal
                    </TabsTrigger>
                    <TabsTrigger value="showcase" className="flex items-center gap-2 px-6 py-4 font-display font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-gradient-primary/5 transition-all duration-200">
                        <FileText className="w-4 h-4" />
                        Showcase
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-8 space-y-8">
                    {vocabularyStats && sastStats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Vocabulary Breakdown */}
                            <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                        <Network className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold gradient-text-primary">
                                        Vocabulary Breakdown
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(vocabularyStats.primitivesByCategory).map(([category, count]) => (
                                        <div key={category} className="flex items-center justify-between">
                                            <span className="capitalize font-display font-medium text-light-text-primary dark:text-dark-text-primary">{category}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${vocabularyStats.totalPrimitives > 0 ? (count / vocabularyStats.totalPrimitives) * 100 : 0}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold gradient-text-success">
                                        Performance Metrics
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Semantic Accuracy</span>
                                            <span className="font-display font-semibold gradient-text-success">{formatPercentage((sastStats.encoding.semanticAccuracy || 0) * 100)}</span>
                                        </div>
                                        <div className="w-full h-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-success h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${(sastStats.encoding.semanticAccuracy || 0) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">Ambiguity Resolution Rate</span>
                                            <span className="font-display font-semibold gradient-text-secondary">{formatPercentage(sastStats.comparison.ambiguityResolutionRate)}</span>
                                        </div>
                                        <div className="w-full h-3 bg-light-background-secondary dark:bg-dark-background-secondary rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-secondary h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${sastStats.comparison.ambiguityResolutionRate || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-primary-200/30">
                                        <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl space-y-2">
                                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Average Processing Time: <span className="font-display font-semibold gradient-text-primary">{sastStats.encoding.averageProcessingTime?.toFixed(2) || '0.00'}ms</span></p>
                                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Total Comparisons: <span className="font-display font-semibold gradient-text-primary">{formatNumber(sastStats.comparison.totalComparisons)}</span></p>
                                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Success Rate: <span className="font-display font-semibold gradient-text-primary">{formatPercentage(
                                                sastStats.encoding.totalEncodings > 0
                                                    ? (sastStats.encoding.successfulEncodings / sastStats.encoding.totalEncodings) * 100
                                                    : 0
                                            )}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Language Support */}
                    {vocabularyStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Languages className="w-5 h-5 mr-2 text-indigo-500" />
                                    Cross-Lingual Coverage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {Object.entries(vocabularyStats.coverageByLanguage).map(([lang, coverage]) => (
                                        <div key={lang} className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="text-lg font-bold text-gray-900">{lang.toUpperCase()}</div>
                                            <div className="text-sm text-gray-600">{formatNumber(coverage)} terms</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="explorer">
                    <SemanticPrimitivesExplorer />
                </TabsContent>

                <TabsContent value="comparator">
                    <EvolutionComparator />
                </TabsContent>

                <TabsContent value="telescope">
                    <TelescopeDemo />
                </TabsContent>

                <TabsContent value="universal">
                    <UniversalSemanticsTest />
                </TabsContent>

                <TabsContent value="showcase">
                    <SastShowcase />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SastDashboard;
