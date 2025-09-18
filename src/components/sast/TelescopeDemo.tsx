/**
 * Telescope Demo Component
 * 
 * Interactive demonstration of the classic "telescope ambiguity" example,
 * showing how SAST resolves structural ambiguities in natural language.
 */

import React, { useState, useEffect } from 'react';
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
                <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Loading telescope demo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl p-8 border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-danger-500" />
                <p className="font-body text-danger-600 dark:text-danger-400 mb-4">{error}</p>
                <button onClick={loadDemo} className="btn-primary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </button>
            </div>
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
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                        <Telescope className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text-accent">
                        Telescope Ambiguity Demo
                    </h2>
                </div>
                <div className="space-y-4">
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                        The classic "telescope sentence" demonstrates structural ambiguity in natural language.
                        Traditional parsers struggle with this, but SAST resolves it using semantic primitives
                        and syntactic analysis.
                    </p>

                    <div className="glass rounded-lg p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-primary/10">
                        <div className="text-center">
                            <div className="text-lg font-display font-bold gradient-text-primary mb-2">
                                "{demoData.explanation.sentence}"
                            </div>
                            <span className="glass px-3 py-1 rounded-full border border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 font-display font-semibold">
                                {demoData.explanation.ambiguityType}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Possible Interpretations */}
            <div className="glass rounded-xl p-8 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center glow-secondary">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text-secondary">
                        Possible Interpretations
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {demoData.explanation.interpretations.map((interpretation, index) => (
                        <div
                            key={index}
                            className={`glass rounded-xl p-6 border cursor-pointer transition-all duration-300 hover:scale-105 ${selectedInterpretation === index
                                ? 'border-primary-300/50 shadow-xl glow-primary'
                                : 'border-primary-200/30 hover:border-primary-300/50'
                                }`}
                            onClick={() => setSelectedInterpretation(index)}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${interpretationIcons[index]?.color === 'text-blue-500' ? 'bg-gradient-primary glow-primary' : 'bg-gradient-success glow-success'}`}>
                                    <div className="text-white">
                                        {interpretationIcons[index]?.icon || <Lightbulb className="w-6 h-6" />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 text-lg">
                                        Interpretation {index + 1}
                                    </div>
                                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-3">
                                        {interpretation}
                                    </p>
                                    <div>
                                        <span className={`glass px-3 py-1 rounded-full border font-display font-medium text-sm ${selectedInterpretation === index
                                            ? 'border-primary-200/30 bg-gradient-primary/20 text-primary-700 dark:text-primary-300'
                                            : 'border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300'
                                            }`}>
                                            {interpretationIcons[index]?.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SAST Resolution */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="p-8 border-b border-primary-200/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-display font-bold gradient-text-success">
                                SAST Resolution
                            </h2>
                        </div>
                        {!showAnalysis && (
                            <button onClick={runAnalysis} className="btn-primary">
                                <Play className="w-4 h-4 mr-2" />
                                Run Analysis
                            </button>
                        )}
                    </div>
                </div>
                <div className="p-8">
                    {showAnalysis ? (
                        <div className="space-y-4">
                            <div className="glass rounded-lg p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-success/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-5 h-5 text-success-600" />
                                    <span className="font-display font-medium text-success-700 dark:text-success-300">Resolution Complete</span>
                                </div>
                                <p className="font-body text-success-700 dark:text-success-300 text-sm">
                                    {demoData.explanation.resolution}
                                </p>
                            </div>

                            {/* Analysis Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="glass rounded-lg p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                                    <div className="text-2xl font-display font-bold gradient-text-primary">
                                        {demoData.sastStats.ambiguitiesResolved}
                                    </div>
                                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Ambiguities Resolved</div>
                                </div>

                                <div className="glass rounded-lg p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                                    <div className="text-2xl font-display font-bold gradient-text-success">
                                        {((demoData.sastStats.semanticAccuracy || 0) * 100).toFixed(1)}%
                                    </div>
                                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Semantic Accuracy</div>
                                </div>

                                <div className="glass rounded-lg p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                                    <div className="text-2xl font-display font-bold gradient-text-secondary">
                                        {demoData.sastStats.averageProcessingTime?.toFixed(1) || '0.0'}ms
                                    </div>
                                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Processing Time</div>
                                </div>
                            </div>

                            {/* Semantic Tree Visualization */}
                            <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                                        <span className="text-white text-sm">🌳</span>
                                    </div>
                                    <h3 className="font-display font-semibold gradient-text-accent text-lg">
                                        Semantic Parse Tree
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                        <code className="glass px-2 py-1 rounded border border-primary-200/30 bg-gradient-primary/10 text-primary-600 dark:text-primary-400 text-xs">S</code>
                                        <ArrowRight className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Main sentence structure</span>
                                    </div>

                                    <div className="ml-4 flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                        <code className="glass px-2 py-1 rounded border border-success-200/30 bg-gradient-success/10 text-success-600 dark:text-success-400 text-xs">NP</code>
                                        <ArrowRight className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Agent: "I"</span>
                                    </div>

                                    <div className="ml-4 flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                                        <code className="glass px-2 py-1 rounded border border-secondary-200/30 bg-gradient-secondary/10 text-secondary-600 dark:text-secondary-400 text-xs">VP</code>
                                        <ArrowRight className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Action: "saw"</span>
                                    </div>

                                    <div className="ml-8 flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                                        <code className="glass px-2 py-1 rounded border border-accent-200/30 bg-gradient-accent/10 text-accent-600 dark:text-accent-400 text-xs">PP</code>
                                        <ArrowRight className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                        <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Instrument: "with telescope" → VP attachment</span>
                                        <span className="glass px-2 py-1 rounded border border-success-200/30 bg-gradient-success/10 text-success-700 dark:text-success-300 font-display font-semibold text-xs">
                                            Resolved
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Telescope className="w-16 h-16 mx-auto mb-4 text-primary-300" />
                            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                Click "Run Analysis" to see how SAST resolves the structural ambiguity
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* SAST Performance Stats */}
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text-primary">
                        SAST Performance Statistics
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-lg font-display font-bold gradient-text-primary">
                            {demoData.sastStats.totalEncodings.toLocaleString()}
                        </div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">Total Encodings</div>
                    </div>

                    <div>
                        <div className="text-lg font-display font-bold gradient-text-success">
                            {(demoData.sastStats.totalEncodings > 0
                                ? ((demoData.sastStats.successfulEncodings / demoData.sastStats.totalEncodings) * 100).toFixed(1)
                                : '0.0'
                            )}%
                        </div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">Success Rate</div>
                    </div>

                    <div>
                        <div className="text-lg font-display font-bold gradient-text-secondary">
                            {demoData.sastStats.ambiguitiesResolved.toLocaleString()}
                        </div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">Ambiguities Resolved</div>
                    </div>

                    <div>
                        <div className="text-lg font-display font-bold gradient-text-accent">
                            {demoData.sastStats.averageProcessingTime?.toFixed(1) || '0.0'}ms
                        </div>
                        <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs">Avg Processing</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelescopeDemo;
