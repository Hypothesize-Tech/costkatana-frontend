// src/pages/Optimization.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    SparklesIcon,
    ChartBarIcon,
    AcademicCapIcon,
    PlusIcon,
    CheckCircleIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { optimizationService } from '../services/optimization.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { OptimizationCard } from '../components/optimization/OptimizationCard';
import { OptimizationForm } from '../components/optimization/OptimizationForm';
import { BulkOptimizer } from '../components/optimization/BulkOptimizer';
import { QuickOptimize } from '../components/optimization/QuickOptimize';
import { OptimizedPromptDisplay } from '../components/common/FormattedContent';
import { formatCurrency } from '../utils/formatters';
import { useNotifications } from '../contexts/NotificationContext';

export const Optimization: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<'all' | 'applied' | 'pending'>('all');
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: optimizations, isLoading } = useQuery(
        ['optimizations', filter],
        () => optimizationService.getOptimizations({
            applied: filter === 'all' ? undefined : filter === 'applied',
            sort: 'createdAt',
            order: 'desc'
        }),
        {
            refetchInterval: 30000, // Refresh every 30 seconds
        }
    );

    // Get counts for each filter
    const getFilterCount = (filterType: 'all' | 'pending' | 'applied') => {
        if (!optimizations?.data) return 0;

        switch (filterType) {
            case 'all':
                return optimizations.data.length;
            case 'applied':
                return optimizations.data.filter((o) => o.applied).length;
            case 'pending':
                return optimizations.data.filter((o) => !o.applied).length;
            default:
                return 0;
        }
    };

    // Calculate accurate statistics from optimizations data
    const calculateStats = () => {
        if (!optimizations?.data) return null;

        const totalOptimizations = optimizations.data.length;
        const appliedOptimizations = optimizations.data.filter((o) => o.applied).length;
        const totalSaved = optimizations.data.reduce((sum, opt) => sum + (opt.costSaved || 0), 0);
        const avgImprovement = optimizations.data.length > 0
            ? optimizations.data.reduce((sum, opt) => sum + (opt.improvementPercentage || 0), 0) / optimizations.data.length
            : 0;

        return {
            total: totalOptimizations,
            applied: appliedOptimizations,
            totalSaved,
            avgImprovement
        };
    };

    const calculatedStats = calculateStats();

    const applyMutation = useMutation(
        (id: string) => optimizationService.applyOptimization(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['optimizations']);
                showNotification('Optimization applied successfully!', 'success');
            },
            onError: () => {
                showNotification('Failed to apply optimization', 'error');
            },
        }
    );

    const feedbackMutation = useMutation(
        ({ id, feedback }: { id: string; feedback: any }) =>
            optimizationService.provideFeedback(id, feedback),
        {
            onSuccess: () => {
                showNotification('Thank you for your feedback!', 'success');
            },
        }
    );

    const handleApply = (id: string) => {
        applyMutation.mutate(id);
    };

    const handleFeedback = (id: string, helpful: boolean, comment?: string) => {
        feedbackMutation.mutate({
            id,
            feedback: { helpful, comment },
        });
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Prompt Optimization</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate('/optimizations/wizard')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <AcademicCapIcon className="mr-2 w-5 h-5" />
                            Cost Audit Wizard
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="mr-2 w-5 h-5" />
                            Advanced Optimization
                        </button>
                    </div>
                </div>
                <p className="text-gray-600">
                    AI-powered prompt optimization to reduce costs while maintaining quality
                </p>
            </div>

            {/* Stats Cards */}
            {calculatedStats && (
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(calculatedStats.totalSaved)}
                                </p>
                            </div>
                            <ChartBarIcon className="w-12 h-12 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Optimizations</p>
                                <p className="text-2xl font-bold text-gray-900">{calculatedStats.total}</p>
                            </div>
                            <SparklesIcon className="w-12 h-12 text-indigo-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Applied</p>
                                <p className="text-2xl font-bold text-blue-600">{calculatedStats.applied}</p>
                            </div>
                            <CheckCircleIcon className="w-12 h-12 text-blue-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Improvement</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {calculatedStats.avgImprovement.toFixed(1)}%
                                </p>
                            </div>
                            <ArrowTrendingUpIcon className="w-12 h-12 text-purple-600 opacity-20" />
                        </div>
                    </div>
                </div>
            )}

            {/* Show stats even when no optimizations exist */}
            {!calculatedStats && !isLoading && (
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(0)}</p>
                            </div>
                            <ChartBarIcon className="w-12 h-12 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Optimizations</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <SparklesIcon className="w-12 h-12 text-indigo-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Applied</p>
                                <p className="text-2xl font-bold text-blue-600">0</p>
                            </div>
                            <CheckCircleIcon className="w-12 h-12 text-blue-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Improvement</p>
                                <p className="text-2xl font-bold text-purple-600">0.0%</p>
                            </div>
                            <ArrowTrendingUpIcon className="w-12 h-12 text-purple-600 opacity-20" />
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Optimize Section */}
            <div className="mb-8">
                <QuickOptimize />
            </div>

            {/* Latest Optimization Preview */}
            {optimizations?.data && optimizations.data.length > 0 && (
                <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Latest Optimization</h3>
                        <span className="text-sm text-gray-500">
                            {new Date(optimizations.data[0].createdAt || optimizations.data[0].updatedAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
                            <div className="text-lg font-bold text-green-600">
                                {formatCurrency(optimizations.data[0].costSaved || 0)}
                            </div>
                            <div className="text-xs text-green-700">Savings</div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded border border-orange-200 text-center">
                            <div className="text-lg font-bold text-orange-600">
                                {formatCurrency(optimizations.data[0].originalCost || 0)}
                            </div>
                            <div className="text-xs text-orange-700">Original Cost</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border border-blue-200 text-center">
                            <div className="text-lg font-bold text-blue-600">
                                {optimizations.data[0].improvementPercentage?.toFixed(1) || '0'}%
                            </div>
                            <div className="text-xs text-blue-700">Improvement</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded border border-purple-200 text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {optimizations.data[0].tokensSaved || 0}
                            </div>
                            <div className="text-xs text-purple-700">Tokens Saved</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1">Original Prompt</label>
                            <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                                {optimizations.data[0].originalPrompt}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1">Optimized Prompt</label>
                            <OptimizedPromptDisplay
                                content={optimizations.data[0].optimizedPrompt}
                                maxHeight="max-h-32"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Optimization Form */}
            {showForm && (
                <div className="mb-8">
                    <OptimizationForm onClose={() => setShowForm(false)} />
                </div>
            )}

            {/* Bulk Optimizer */}
            <div className="mb-8">
                <BulkOptimizer />
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px space-x-8">
                        {(['all', 'pending', 'applied'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                <span className="ml-2 text-gray-400">
                                    ({getFilterCount(tab)})
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Optimizations List */}
            <div className="space-y-4">
                {optimizations?.data
                    .filter((opt) => {
                        if (filter === 'all') return true;
                        if (filter === 'applied') return opt.applied;
                        if (filter === 'pending') return !opt.applied;
                        return true;
                    })
                    .sort((a, b) => {
                        // Sort by createdAt date in descending order (most recent first)
                        const dateA = new Date(a.createdAt || a.updatedAt || 0);
                        const dateB = new Date(b.createdAt || b.updatedAt || 0);
                        return dateB.getTime() - dateA.getTime();
                    })
                    .map((optimization) => (
                        <OptimizationCard
                            key={optimization._id}
                            optimization={optimization}
                            onApply={handleApply}
                            onFeedback={handleFeedback}
                        />
                    ))}
            </div>

            {optimizations?.data.filter((opt) => {
                if (filter === 'all') return true;
                if (filter === 'applied') return opt.applied;
                if (filter === 'pending') return !opt.applied;
                return true;
            }).length === 0 && (
                    <div className="py-12 text-center">
                        <SparklesIcon className="mx-auto w-12 h-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {filter === 'all'
                                ? 'No optimizations yet'
                                : filter === 'applied'
                                    ? 'No applied optimizations'
                                    : 'No pending optimizations'
                            }
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'all'
                                ? 'Use the Quick Optimize tool above to get started.'
                                : filter === 'applied'
                                    ? 'Apply some optimizations to see them here.'
                                    : 'All optimizations have been applied.'
                            }
                        </p>
                    </div>
                )}
        </div>
    );
};