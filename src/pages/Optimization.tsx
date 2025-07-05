// src/pages/Optimization.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    SparklesIcon,
    RocketLaunchIcon,
    ChartBarIcon,
    ClockIcon,
    AcademicCapIcon,
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
    const navigate = useNavigate();

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
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prompt Optimization</h1>
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
                            <SparklesIcon className="mr-2 w-5 h-5" />
                            Optimize Prompt
                        </button>
                    </div>
                </div>
                <p className="text-gray-600">
                    AI-powered prompt optimization to reduce costs while maintaining quality
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Saved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(stats.totalSaved)}
                                </p>
                            </div>
                            <ChartBarIcon className="w-12 h-12 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Optimizations</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <SparklesIcon className="w-12 h-12 text-indigo-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Applied</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
                            </div>
                            <RocketLaunchIcon className="w-12 h-12 text-blue-600 opacity-20" />
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Improvement</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.avgImprovement.toFixed(1)}%
                                </p>
                            </div>
                            <ClockIcon className="w-12 h-12 text-purple-600 opacity-20" />
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
                <div className="py-12 text-center">
                    <SparklesIcon className="mx-auto w-12 h-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No optimizations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by optimizing your first prompt.
                    </p>
                </div>
            )}
        </div>
    );
};