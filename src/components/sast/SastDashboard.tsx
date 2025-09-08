/**
 * SAST Dashboard Component
 * 
 * Main dashboard for Semantic Abstract Syntax Tree functionality,
 * providing access to all SAST features and demonstrations.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
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
                <div className="text-center">
                    <Cpu className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading SAST Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadDashboardData} variant="outline">
                        <Zap className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Brain className="w-8 h-8 mr-3 text-blue-600" />
                        SAST Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Semantic Abstract Syntax Tree - Next-generation language understanding
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-700 border-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                    </Badge>
                    <Badge variant="secondary">
                        v2.0 SAST
                    </Badge>
                </div>
            </div>

            {/* Stats Overview */}
            {vocabularyStats && sastStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Semantic Primitives</CardTitle>
                            <Network className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(vocabularyStats.totalPrimitives)}</div>
                            <p className="text-xs text-gray-600">
                                Across {Object.keys(vocabularyStats.primitivesByCategory).length} categories
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cross-Lingual Support</CardTitle>
                            <Languages className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(vocabularyStats.coverageByLanguage).length}</div>
                            <p className="text-xs text-gray-600">
                                Supported languages
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">SAST Win Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPercentage(sastStats.comparison.sastWinRate)}</div>
                            <p className="text-xs text-gray-600">
                                vs Traditional Cortex
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ambiguity Resolution</CardTitle>
                            <Telescope className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(sastStats.encoding.ambiguitiesResolved)}</div>
                            <p className="text-xs text-gray-600">
                                Total ambiguities resolved
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="explorer" className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Explorer
                    </TabsTrigger>
                    <TabsTrigger value="comparator" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Comparator
                    </TabsTrigger>
                    <TabsTrigger value="telescope" className="flex items-center gap-2">
                        <Telescope className="w-4 h-4" />
                        Demo
                    </TabsTrigger>
                    <TabsTrigger value="universal" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Universal
                    </TabsTrigger>
                    <TabsTrigger value="showcase" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Showcase
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {vocabularyStats && sastStats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Vocabulary Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Network className="w-5 h-5 mr-2 text-blue-500" />
                                        Vocabulary Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(vocabularyStats.primitivesByCategory).map(([category, count]) => (
                                            <div key={category} className="flex items-center justify-between">
                                                <span className="capitalize text-sm font-medium">{category}</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden"
                                                    >
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{
                                                                width: `${vocabularyStats.totalPrimitives > 0 ? (count / vocabularyStats.totalPrimitives) * 100 : 0}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Performance Metrics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                                        Performance Metrics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm">
                                                <span>Semantic Accuracy</span>
                                                <span>{formatPercentage((sastStats.encoding.semanticAccuracy || 0) * 100)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${(sastStats.encoding.semanticAccuracy || 0) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm">
                                                <span>Ambiguity Resolution Rate</span>
                                                <span>{formatPercentage(sastStats.comparison.ambiguityResolutionRate)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{ width: `${sastStats.comparison.ambiguityResolutionRate || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <p>Average Processing Time: {sastStats.encoding.averageProcessingTime?.toFixed(2) || '0.00'}ms</p>
                                                <p>Total Comparisons: {formatNumber(sastStats.comparison.totalComparisons)}</p>
                                                <p>Success Rate: {formatPercentage(
                                                    sastStats.encoding.totalEncodings > 0
                                                        ? (sastStats.encoding.successfulEncodings / sastStats.encoding.totalEncodings) * 100
                                                        : 0
                                                )}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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
