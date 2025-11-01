import React, { useState, useEffect } from 'react';
import {
    TrophyIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    SparklesIcon,
    CalendarIcon,
    UsersIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';
import { SimulationTrackingService, LeaderboardEntry } from '../../services/simulationTracking.service';

interface OptimizationLeaderboardProps {
    timeRange?: 'week' | 'month' | 'quarter' | 'all';
    limit?: number;
    showUserRank?: boolean;
    currentUserId?: string;
}

export const OptimizationLeaderboard: React.FC<OptimizationLeaderboardProps> = ({
    timeRange = 'week',
    limit = 10,
    showUserRank = true,
    currentUserId
}) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, [timeRange, limit]);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            setError(null);

            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();

            switch (timeRange) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setDate(endDate.getDate() - 30);
                    break;
                case 'quarter':
                    startDate.setDate(endDate.getDate() - 90);
                    break;
                case 'all':
                default:
                    startDate.setFullYear(2020); // Far back date
                    break;
            }

            const entries = await SimulationTrackingService.getTopOptimizationWins(
                timeRange !== 'all' ? startDate.toISOString() : undefined,
                timeRange !== 'all' ? endDate.toISOString() : undefined,
                limit
            );

            const entriesWithRank = entries.map((entry: LeaderboardEntry, index: number) => ({
                ...entry,
                rank: index + 1
            }));

            setLeaderboard(entriesWithRank);

            // Find current user's rank if requested
            if (showUserRank && currentUserId) {
                const userEntry = entriesWithRank.find((entry: LeaderboardEntry) => entry.userId === currentUserId);
                if (userEntry) {
                    setUserRank(userEntry);
                } else {
                    // User might be outside top N, fetch their specific rank
                    // This would require an additional API endpoint
                    setUserRank(null);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <TrophyIcon className="h-6 w-6 text-gray-400" />;
            case 3:
                return <TrophyIcon className="h-6 w-6 text-amber-600" />;
            default:
                return (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">{rank}</span>
                    </div>
                );
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
            case 3:
                return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
            default:
                return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
        }
    };

    const getTimeRangeLabel = () => {
        switch (timeRange) {
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'quarter': return 'This Quarter';
            case 'all': return 'All Time';
            default: return 'This Week';
        }
    };

    const getOptimizationTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'model_switch':
                return '🔄';
            case 'context_trim':
                return '✂️';
            case 'prompt_optimize':
                return '🎯';
            default:
                return '⚡';
        }
    };

    if (loading) {
        return (
            <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl p-8">
                <div className="animate-pulse">
                    <div className="h-6 bg-light-bg-300 dark:bg-dark-bg-300 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-light-bg-300 dark:bg-dark-bg-300 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-light-bg-300 dark:bg-dark-bg-300 rounded w-1/4"></div>
                                    <div className="h-3 bg-light-bg-300 dark:bg-dark-bg-300 rounded w-1/6"></div>
                                </div>
                                <div className="h-6 bg-light-bg-300 dark:bg-dark-bg-300 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl border border-danger-200/30 shadow-2xl backdrop-blur-xl p-8">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                        <div className="text-danger-600 dark:text-danger-400 font-display font-bold">Error Loading Leaderboard</div>
                    </div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 font-body">{error}</p>
                    <button
                        onClick={loadLeaderboard}
                        className="px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-display font-semibold text-sm"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-primary/10 text-light-text-primary dark:text-dark-text-primary p-8 rounded-t-xl border-b border-primary-200/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary mr-4">
                            <TrophyIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold gradient-text">Top Optimization Wins</h2>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-body">{getTimeRangeLabel()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-display font-bold gradient-text">
                            {formatCurrency(leaderboard.reduce((sum, entry) => sum + entry.totalSavings, 0))}
                        </div>
                        <div className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-body">Total Saved</div>
                    </div>
                </div>
            </div>

            {/* Current User Rank (if applicable) */}
            {showUserRank && userRank && (
                <div className="glass p-6 border-b border-primary-200/30 bg-primary-500/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="mr-3">
                                {getRankIcon(userRank.rank || 0)}
                            </div>
                            <div>
                                <div className="font-display font-bold text-primary-700 dark:text-primary-300">Your Rank: #{userRank.rank}</div>
                                <div className="text-sm text-primary-600 dark:text-primary-400 font-body">
                                    {formatCurrency(userRank.totalSavings)} saved • {userRank.optimizationsApplied} optimizations
                                </div>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-display font-bold shadow-lg border ${getRankBadgeColor(userRank.rank || 0)}`}>
                            Rank #{userRank.rank}
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div className="divide-y divide-primary-200/30">
                {leaderboard.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="bg-gradient-primary p-4 rounded-2xl shadow-2xl glow-primary w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <SparklesIcon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-2">No Data Yet</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Be the first to apply optimizations and claim the top spot!
                        </p>
                    </div>
                ) : (
                    leaderboard.map((entry, index) => (
                        <div
                            key={entry.userId}
                            className={`p-6 hover:bg-primary-500/5 transition-all duration-300 hover:scale-105 ${entry.userId === currentUserId ? 'glass bg-primary-500/10 border-l-4 border-primary-500 shadow-lg' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                    <div className="mr-6">
                                        {getRankIcon(entry.rank || index + 1)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <h4 className="font-display font-bold text-light-text-primary dark:text-dark-text-primary text-lg">
                                                {entry.userName || `User ${entry.userId.slice(-6)}`}
                                            </h4>
                                            {entry.userId === currentUserId && (
                                                <span className="ml-3 px-3 py-1 bg-gradient-primary text-white text-xs rounded-xl font-display font-bold shadow-lg animate-pulse">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center mt-2 space-x-6 text-sm">
                                            <div className="flex items-center glass p-2 rounded-lg border border-success-200/30">
                                                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-success-500" />
                                                <span className="font-display font-semibold text-success-600 dark:text-success-400">
                                                    {formatCurrency(entry.totalSavings)}
                                                </span>
                                                <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted ml-1">saved</span>
                                            </div>
                                            <div className="flex items-center glass p-2 rounded-lg border border-primary-200/30">
                                                <ChartBarIcon className="h-4 w-4 mr-2 text-primary-500" />
                                                <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                                                    {entry.optimizationsApplied}
                                                </span>
                                                <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted ml-1">optimizations</span>
                                            </div>
                                            <div className="flex items-center glass p-2 rounded-lg border border-accent-200/30">
                                                <span className="mr-2 text-lg">{getOptimizationTypeIcon(entry.topOptimizationType)}</span>
                                                <span className="font-display font-medium text-accent-600 dark:text-accent-400 capitalize">
                                                    {entry.topOptimizationType.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-display font-bold gradient-text">
                                        {formatCurrency(entry.totalSavings)}
                                    </div>
                                    <div className="text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                                        <span className="font-display font-semibold">~{formatCurrency(entry.averageSavings)}</span>/opt
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="glass p-6 rounded-b-xl border-t border-primary-200/30 text-center">
                <div className="flex items-center justify-center text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                    <CalendarIcon className="h-4 w-4 mr-1 text-primary-500" />
                    Updated in real-time •
                    <UsersIcon className="h-4 w-4 ml-2 mr-1 text-primary-500" />
                    {leaderboard.length} participants
                </div>
            </div>
        </div>
    );
};

export default OptimizationLeaderboard;