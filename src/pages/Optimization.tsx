// src/pages/Optimization.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SparklesIcon,
    RocketLaunchIcon,
    ChartBarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { optimizationService } from '../services/optimization.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { OptimizationCard } from '../components/optimization/OptimizationCard';
import { OptimizationForm } from '../components/optimization/OptimizationForm';
import { BulkOptimizer } from '../components/optimization/BulkOptimizer';
import { formatCurrency } from '../utils/formatters';
import { useNotifications } from '../contexts/NotificationContext';

export const Optimization: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<'all' | 'applied' | 'pending'>('all');
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();

    const { data: optimizations, isLoading } = useQuery(
        ['optimizations', filter],
        () => optimizationService.getOptimizations({
            applied: filter === 'all' ? undefined : filter === 'applied',
        }),
        {
            refetchInterval: 30000, // Refresh every 30 seconds
        }
    );

    const { data: stats } = useQuery(
        ['optimization-stats'],
        () => optimizationService.getOptimizationSummary()
    );

    const applyMutation = useMutation(
        (id: string) => optimizationService.applyOptimization(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['optimizations']);
                queryClient.invalidateQueries(['optimization-stats']);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Prompt Optimization</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Optimize Prompt
                    </button>
                </div>
                <p className="text-gray-600">
                    AI-powered prompt optimization to reduce costs while maintaining quality
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.data.totalSaved)}
                                </p>
                            </div>
                            <ChartBarIcon className="h-12 w-12 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Optimizations</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.data.total}</p>
                            </div>
                            <SparklesIcon className="h-12 w-12 text-indigo-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Applied</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.data.applied}</p>
                            </div>
                            <RocketLaunchIcon className="h-12 w-12 text-blue-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Improvement</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.data.avgImprovement.toFixed(1)}%
                                </p>
                            </div>
                            <ClockIcon className="h-12 w-12 text-purple-600 opacity-20" />
                        </div>
                    </div>
                </div>
            )}

            {/* Optimization Form */}
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
                    <nav className="-mb-px flex space-x-8">
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
                                {optimizations && (
                                    <span className="ml-2 text-gray-400">
                                        ({tab === 'all'
                                            ? optimizations.data.length
                                            : tab === 'applied'
                                                ? optimizations.data.filter((o) => o.applied).length
                                                : optimizations.data.filter((o) => !o.applied).length})
                                    </span>
                                )}
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
                        return !opt.applied;
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

            {optimizations?.data.length === 0 && (
                <div className="text-center py-12">
                    <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No optimizations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by optimizing your first prompt.
                    </p>
                </div>
            )}
        </div>
    );
};