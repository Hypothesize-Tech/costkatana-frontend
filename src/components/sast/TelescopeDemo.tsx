/**
 * Telescope Demo Component
 * 
 * Interactive demonstration of the classic "telescope ambiguity" example,
 * showing how SAST resolves structural ambiguities in natural language.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    Telescope,
    Brain,
    ArrowRight,
    Play,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Eye,
    Users,
    Lightbulb
} from 'lucide-react';
import { sastService, TelescopeDemo as TelescopeDemoType } from '../../services/sast.service';

const TelescopeDemo: React.FC = () => {
    const [demoData, setDemoData] = useState<TelescopeDemoType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedInterpretation, setSelectedInterpretation] = useState<number>(0);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        loadDemo();
    }, []);

    const loadDemo = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await sastService.getTelescopeDemo();
            setDemoData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load telescope demo');
            console.error('Demo load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const runAnalysis = () => {
        setShowAnalysis(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading telescope demo...</p>
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
                    <Button onClick={loadDemo} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!demoData) {
        return null;
    }

    const interpretationIcons = [
        { icon: <Eye className="w-5 h-5" />, color: "text-blue-500", description: "Instrument perspective" },
        { icon: <Users className="w-5 h-5" />, color: "text-green-500", description: "Possession perspective" }
    ];

    return (
        <div className="space-y-6">
            {/* Introduction */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Telescope className="w-5 h-5 mr-2 text-orange-500" />
                        Telescope Ambiguity Demo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            The classic "telescope sentence" demonstrates structural ambiguity in natural language.
                            Traditional parsers struggle with this, but SAST resolves it using semantic primitives
                            and syntactic analysis.
                        </p>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900 mb-2">
                                    "{demoData.explanation.sentence}"
                                </div>
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                    {demoData.explanation.ambiguityType}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Interpretations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-500" />
                        Possible Interpretations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {demoData.explanation.interpretations.map((interpretation, index) => (
                            <Card
                                key={index}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedInterpretation === index
                                    ? 'ring-2 ring-blue-500 border-blue-300'
                                    : 'border-gray-200'
                                    }`}
                                onClick={() => setSelectedInterpretation(index)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 ${interpretationIcons[index]?.color || 'text-gray-500'}`}>
                                            {interpretationIcons[index]?.icon || <Lightbulb className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 mb-1">
                                                Interpretation {index + 1}
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {interpretation}
                                            </p>
                                            <div className="mt-2">
                                                <Badge
                                                    variant={selectedInterpretation === index ? "default" : "outline"}
                                                    className="text-xs"
                                                >
                                                    {interpretationIcons[index]?.description}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* SAST Analysis */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                            SAST Resolution
                        </CardTitle>
                        {!showAnalysis && (
                            <Button onClick={runAnalysis}>
                                <Play className="w-4 h-4 mr-2" />
                                Run Analysis
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {showAnalysis ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-green-800">Resolution Complete</span>
                                </div>
                                <p className="text-green-700 text-sm">
                                    {demoData.explanation.resolution}
                                </p>
                            </div>

                            {/* Analysis Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {demoData.sastStats.ambiguitiesResolved}
                                        </div>
                                        <div className="text-sm text-gray-600">Ambiguities Resolved</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {((demoData.sastStats.semanticAccuracy || 0) * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">Semantic Accuracy</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {demoData.sastStats.averageProcessingTime?.toFixed(1) || '0.0'}ms
                                        </div>
                                        <div className="text-sm text-gray-600">Processing Time</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Semantic Tree Visualization */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Semantic Parse Tree</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">S</code>
                                            <ArrowRight className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-700">Main sentence structure</span>
                                        </div>

                                        <div className="ml-4 flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">NP</code>
                                            <ArrowRight className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-700">Agent: "I"</span>
                                        </div>

                                        <div className="ml-4 flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">VP</code>
                                            <ArrowRight className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-700">Action: "saw"</span>
                                        </div>

                                        <div className="ml-8 flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">PP</code>
                                            <ArrowRight className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-700">Instrument: "with telescope" → VP attachment</span>
                                            <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                                                Resolved
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Telescope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-600 mb-4">
                                Click "Run Analysis" to see how SAST resolves the structural ambiguity
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SAST Performance Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-blue-500" />
                        SAST Performance Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-lg font-bold text-gray-900">
                                {demoData.sastStats.totalEncodings.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Total Encodings</div>
                        </div>

                        <div>
                            <div className="text-lg font-bold text-green-600">
                                {(demoData.sastStats.totalEncodings > 0
                                    ? ((demoData.sastStats.successfulEncodings / demoData.sastStats.totalEncodings) * 100).toFixed(1)
                                    : '0.0'
                                )}%
                            </div>
                            <div className="text-xs text-gray-600">Success Rate</div>
                        </div>

                        <div>
                            <div className="text-lg font-bold text-purple-600">
                                {demoData.sastStats.ambiguitiesResolved.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Ambiguities Resolved</div>
                        </div>

                        <div>
                            <div className="text-lg font-bold text-blue-600">
                                {demoData.sastStats.averageProcessingTime?.toFixed(1) || '0.0'}ms
                            </div>
                            <div className="text-xs text-gray-600">Avg Processing</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TelescopeDemo;
