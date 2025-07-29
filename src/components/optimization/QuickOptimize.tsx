// src/components/optimization/QuickOptimize.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SparklesIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { optimizationService } from '@/services/optimization.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { renderFormattedContent } from '@/utils/formatters';
import { OptimizedPromptDisplay } from '../common/FormattedContent';

interface QuickOptimizeProps {
    className?: string;
}

export const QuickOptimize: React.FC<QuickOptimizeProps> = ({ className = '' }) => {
    const [prompt, setPrompt] = useState('');
    const [optimizationResult, setOptimizationResult] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();

    const optimizeMutation = useMutation({
        mutationFn: () => optimizationService.createOptimization({
            prompt,
            service: 'openai',
            model: 'gpt-4',
            enableCompression: true,
            enableContextTrimming: true,
            enableRequestFusion: true
        }),
        onSuccess: (data) => {
            setOptimizationResult(data);
            setShowResult(true);
            showNotification('Prompt optimized successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['optimizations'] });
            queryClient.invalidateQueries({ queryKey: ['optimization-stats'] });
        },
        onError: () => {
            showNotification('Failed to optimize prompt', 'error');
        }
    });

    const handleOptimize = () => {
        if (!prompt.trim()) {
            showNotification('Please enter a prompt to optimize', 'error');
            return;
        }
        optimizeMutation.mutate();
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Copied to clipboard!', 'success');
        } catch (error) {
            showNotification('Failed to copy to clipboard', 'error');
        }
    };

    const handleReset = () => {
        setPrompt('');
        setOptimizationResult(null);
        setShowResult(false);
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <SparklesIcon className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Quick Optimize</h3>
                </div>

                {!showResult ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter your prompt
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={6}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Paste your AI prompt here for instant optimization..."
                            />
                        </div>

                        <button
                            onClick={handleOptimize}
                            disabled={optimizeMutation.isPending || !prompt.trim()}
                            className="w-full flex items-center justify-center px-4 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {optimizeMutation.isPending ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    <span className="ml-2">Optimizing...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-4 h-4 mr-2" />
                                    Optimize Now
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                            ✨ AI-powered optimization • No configuration needed • Instant results
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Success Header */}
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center">
                                <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-900">
                                    Optimization Complete!
                                </span>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                                ${optimizationResult.costSaved?.toFixed(4) || '0.0000'} saved
                            </span>
                        </div>

                        {/* Optimized Prompt */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Optimized Prompt
                                </label>
                                <button
                                    onClick={() => handleCopy(optimizationResult.optimizedPrompt)}
                                    className="flex items-center px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    <ClipboardDocumentIcon className="w-3 h-3 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <OptimizedPromptDisplay
                                content={optimizationResult.optimizedPrompt}
                                maxHeight="max-h-48"
                            />
                        </div>

                        {/* Optimization Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="text-lg font-bold text-blue-600">
                                    {optimizationResult.improvementPercentage?.toFixed(1) || '0'}%
                                </div>
                                <div className="text-xs text-blue-700">Improvement</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                <div className="text-lg font-bold text-purple-600">
                                    {optimizationResult.tokensSaved || 0}
                                </div>
                                <div className="text-xs text-purple-700">Tokens Saved</div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                <div className="text-lg font-bold text-orange-600">
                                    {optimizationResult.suggestions?.length || 0}
                                </div>
                                <div className="text-xs text-orange-700">Techniques</div>
                            </div>
                        </div>

                        {/* Optimization Details */}
                        {optimizationResult.suggestions && optimizationResult.suggestions.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Applied Techniques</h4>
                                <div className="space-y-2">
                                    {optimizationResult.suggestions.map((suggestion: any, index: number) => (
                                        <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg border">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                                        {suggestion.type?.replace(/_/g, ' ') || 'Optimization'}
                                                    </span>
                                                    {suggestion.implemented && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                            Applied
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {renderFormattedContent(suggestion.description || suggestion.explanation || '')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Optimize Another
                            </button>
                            <button
                                onClick={() => handleCopy(optimizationResult.optimizedPrompt)}
                                className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Copy Result
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 