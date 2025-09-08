/**
 * Universal Semantics Test Component
 * 
 * Tests cross-lingual semantic representation by comparing how the same concept
 * is encoded across different languages using SAST primitives.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
        <div className="space-y-6">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                        Universal Semantics Test
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Concept to Test
                            </label>
                            <Input
                                placeholder="Enter a concept or sentence..."
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTest()}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Languages to Compare ({selectedLanguages.length} selected)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableLanguages.map((language) => (
                                    <Button
                                        key={language.code}
                                        variant={selectedLanguages.includes(language.code) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleLanguageToggle(language.code)}
                                        className="justify-start"
                                    >
                                        <span className="mr-2">{language.flag}</span>
                                        {language.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleTest} disabled={loading}>
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Target className="w-4 h-4 mr-2" />
                                )}
                                Test Universality
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Example Concepts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Try These Concepts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {conceptExamples.map((example, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => setConcept(example)}
                                className="text-xs"
                            >
                                <Lightbulb className="w-3 h-3 mr-1" />
                                {example}
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

            {/* Test Results */}
            {testResult && (
                <div className="space-y-6">
                    {/* Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                                    Universality Results
                                </CardTitle>
                                {getUniversalityBadge(testResult.isUniversal, testResult.unificationScore)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900 mb-2">
                                        {((testResult.unificationScore || 0) * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Semantic Unification Score
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                                        <div
                                            className={`h-3 rounded-full ${testResult.unificationScore > 0.8 ? 'bg-green-500' :
                                                testResult.unificationScore > 0.6 ? 'bg-blue-500' :
                                                    testResult.unificationScore > 0.4 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${(testResult.unificationScore || 0) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Language Translations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Languages className="w-5 h-5 mr-2 text-green-500" />
                                Cross-Lingual Translations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(testResult.translations).map(([langCode, translation]) => {
                                    const language = availableLanguages.find(l => l.code === langCode);
                                    return (
                                        <div key={langCode} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-2xl">{language?.flag || '🌐'}</div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {language?.name || langCode.toUpperCase()}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    "{translation}"
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* SAST Representations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Network className="w-5 h-5 mr-2 text-purple-500" />
                                SAST Semantic Representations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(testResult.sastRepresentations).map(([langCode, representation]) => {
                                    const language = availableLanguages.find(l => l.code === langCode);
                                    return (
                                        <div key={langCode} className="border rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-lg">{language?.flag || '🌐'}</span>
                                                <span className="font-medium">{language?.name || langCode.toUpperCase()}</span>
                                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                                <Badge variant="outline" className="text-purple-700 border-purple-300">
                                                    {representation.frameType} frame
                                                </Badge>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                                                <div className="text-gray-600">Primitives: {Object.keys(representation.primitives).length}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Confidence: {((representation.metadata.confidence || 0) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analysis Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                                Analysis Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {testResult.languages.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Languages Tested</div>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {Object.keys(testResult.sastRepresentations).length}
                                        </div>
                                        <div className="text-sm text-gray-600">SAST Representations</div>
                                    </div>

                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {testResult.isUniversal ? 'Yes' : 'Partial'}
                                        </div>
                                        <div className="text-sm text-gray-600">Universal Coverage</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h4 className="font-medium text-gray-900 mb-2">Key Findings:</h4>
                                    <ul className="space-y-1 text-sm text-gray-700">
                                        {testResult.unificationScore > 0.8 && (
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                High semantic consistency across all languages
                                            </li>
                                        )}
                                        {testResult.unificationScore > 0.6 && testResult.unificationScore <= 0.8 && (
                                            <li className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                                Moderate semantic consistency with some variations
                                            </li>
                                        )}
                                        {testResult.unificationScore <= 0.6 && (
                                            <li className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                Significant semantic variations between languages
                                            </li>
                                        )}
                                        <li className="flex items-center gap-2">
                                            <Network className="w-4 h-4 text-blue-500" />
                                            SAST successfully generated representations for {Object.keys(testResult.sastRepresentations).length} languages
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UniversalSemanticsTest;
