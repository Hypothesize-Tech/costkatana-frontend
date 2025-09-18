/**
 * Universal Semantics Test Component
 * 
 * Tests cross-lingual semantic representation by comparing how the same concept
 * is encoded across different languages using SAST primitives.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
    Globe,
    Languages,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    BarChart3,
    ArrowRight,
    Lightbulb,
    Network,
    Target
} from 'lucide-react';
import { sastService, UniversalSemanticTest } from '../../services/sast.service';

const UniversalSemanticsTest: React.FC = () => {
    const [concept, setConcept] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'es', 'fr']);
    const [testResult, setTestResult] = useState<UniversalSemanticTest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableLanguages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
    ];

    const conceptExamples = [
        'the sky is blue',
        'cats are curious',
        'water flows downhill',
        'fire is hot',
        'music brings joy',
        'friendship is valuable'
    ];

    const handleTest = async () => {
        if (!concept.trim()) {
            setError('Please enter a concept to test');
            return;
        }

        if (selectedLanguages.length < 2) {
            setError('Please select at least 2 languages for comparison');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await sastService.testUniversalSemantics(concept.trim(), selectedLanguages);
            setTestResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Universal test failed');
            console.error('Universal test error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageToggle = (languageCode: string) => {
        setSelectedLanguages(prev => {
            if (prev.includes(languageCode)) {
                return prev.filter(code => code !== languageCode);
            } else {
                return [...prev, languageCode];
            }
        });
    };

    const getUniversalityBadge = (isUniversal: boolean, score: number) => {
        if (isUniversal) {
            return (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Universal ({((score || 0) * 100).toFixed(1)}%)
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="text-orange-700 border-orange-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Partial ({((score || 0) * 100).toFixed(1)}%)
                </Badge>
            );
        }
    };

    return (
        <div className="space-y-8">
            {/* Input Section */}
            <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold gradient-text">
                        Universal Semantics Test
                    </h2>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                            Concept to Test
                        </label>
                        <input
                            placeholder="Enter a concept or sentence..."
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleTest()}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block mb-3 font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                            Languages to Compare ({selectedLanguages.length} selected)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableLanguages.map((language) => (
                                <button
                                    key={language.code}
                                    onClick={() => handleLanguageToggle(language.code)}
                                    className={`glass rounded-lg p-3 border transition-all duration-200 hover:scale-105 flex items-center gap-3 ${selectedLanguages.includes(language.code)
                                        ? 'border-primary-300/50 bg-gradient-primary/20 text-primary-700 dark:text-primary-300 glow-primary'
                                        : 'border-primary-200/30 text-light-text-primary dark:text-dark-text-primary hover:border-primary-300/50'
                                        }`}
                                >
                                    <span className="text-xl">{language.flag}</span>
                                    <span className="font-display font-medium">{language.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleTest} disabled={loading} className="btn-primary">
                            {loading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Target className="w-4 h-4 mr-2" />
                            )}
                            Test Universality
                        </button>
                    </div>
                </div>
            </div>

            {/* Example Concepts */}
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center glow-secondary">
                        <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-display font-semibold gradient-text-secondary">Try These Concepts</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {conceptExamples.map((example, index) => (
                        <button
                            key={index}
                            onClick={() => setConcept(example)}
                            className="glass px-4 py-2 rounded-lg border border-primary-200/30 font-body text-sm text-light-text-primary dark:text-dark-text-primary hover:scale-105 transition-all duration-200 hover:border-primary-300/50 flex items-center gap-2"
                        >
                            <Lightbulb className="w-3 h-3" />
                            {example}
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

            {/* Test Results */}
            {testResult && (
                <div className="space-y-6">
                    {/* Overview */}
                    <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-display font-bold gradient-text-primary">
                                    Universality Results
                                </h2>
                            </div>
                            {getUniversalityBadge(testResult.isUniversal, testResult.unificationScore)}
                        </div>
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-display font-bold gradient-text-primary mb-2">
                                    {((testResult.unificationScore || 0) * 100).toFixed(1)}%
                                </div>
                                <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                    Semantic Unification Score
                                </div>
                                <div className="w-full bg-light-background-secondary dark:bg-dark-background-secondary rounded-full h-3 mt-2">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${testResult.unificationScore > 0.8 ? 'bg-gradient-success' :
                                            testResult.unificationScore > 0.6 ? 'bg-gradient-primary' :
                                                testResult.unificationScore > 0.4 ? 'bg-gradient-warning' :
                                                    'bg-gradient-danger'
                                            }`}
                                        style={{ width: `${(testResult.unificationScore || 0) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Language Translations */}
                    <div className="glass rounded-xl p-8 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                                <Languages className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-display font-bold gradient-text-success">
                                Cross-Lingual Translations
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(testResult.translations).map(([langCode, translation]) => {
                                const language = availableLanguages.find(l => l.code === langCode);
                                return (
                                    <div key={langCode} className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel flex items-center gap-3">
                                        <div className="text-2xl">{language?.flag || '🌐'}</div>
                                        <div className="flex-1">
                                            <div className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                                {language?.name || langCode.toUpperCase()}
                                            </div>
                                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                                "{translation}"
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SAST Representations */}
                    <div className="glass rounded-xl p-8 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                                <Network className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-display font-bold gradient-text-secondary">
                                SAST Semantic Representations
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(testResult.sastRepresentations).map(([langCode, representation]) => {
                                const language = availableLanguages.find(l => l.code === langCode);
                                return (
                                    <div key={langCode} className="glass rounded-lg p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-lg">{language?.flag || '🌐'}</span>
                                            <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">{language?.name || langCode.toUpperCase()}</span>
                                            <ArrowRight className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                                            <span className="glass px-3 py-1 rounded border border-secondary-200/30 bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300 font-display font-semibold">
                                                {representation.frameType} frame
                                            </span>
                                        </div>

                                        <div className="glass rounded-lg p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl font-mono text-sm">
                                            <div className="font-body text-light-text-secondary dark:text-dark-text-secondary">Primitives: {Object.keys(representation.primitives).length}</div>
                                            <div className="font-body text-light-text-tertiary dark:text-dark-text-tertiary text-xs mt-1">
                                                Confidence: {((representation.metadata.confidence || 0) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Analysis Summary */}
                    <div className="glass rounded-xl p-8 border border-accent-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-display font-bold gradient-text-accent">
                                Analysis Summary
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="glass rounded-lg p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="text-2xl font-display font-bold gradient-text-primary">
                                        {testResult.languages.length}
                                    </div>
                                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Languages Tested</div>
                                </div>

                                <div className="glass rounded-lg p-6 border border-success-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="text-2xl font-display font-bold gradient-text-success">
                                        {Object.keys(testResult.sastRepresentations).length}
                                    </div>
                                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">SAST Representations</div>
                                </div>

                                <div className="glass rounded-lg p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <div className="text-2xl font-display font-bold gradient-text-secondary">
                                        {testResult.isUniversal ? 'Yes' : 'Partial'}
                                    </div>
                                    <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">Universal Coverage</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-primary-200/30">
                                <h4 className="font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Key Findings:</h4>
                                <ul className="space-y-1 font-body text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                    {testResult.unificationScore > 0.8 && (
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-success-500" />
                                            High semantic consistency across all languages
                                        </li>
                                    )}
                                    {testResult.unificationScore > 0.6 && testResult.unificationScore <= 0.8 && (
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-warning-500" />
                                            Moderate semantic consistency with some variations
                                        </li>
                                    )}
                                    {testResult.unificationScore <= 0.6 && (
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-danger-500" />
                                            Significant semantic variations between languages
                                        </li>
                                    )}
                                    <li className="flex items-center gap-2">
                                        <Network className="w-4 h-4 text-primary-500" />
                                        SAST successfully generated representations for {Object.keys(testResult.sastRepresentations).length} languages
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversalSemanticsTest;
