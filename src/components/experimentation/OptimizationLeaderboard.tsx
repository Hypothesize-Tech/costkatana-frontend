import React, { useState, useEffect } from 'react';
import {
    Trophy,
    BarChart3,
    DollarSign,
    Sparkles,
    Calendar,
    Users,
    RotateCw,
    AlertTriangle,
    Scissors,
    Target
} from 'lucide-react';
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
                return <Trophy className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
            case 2:
                return <Trophy className="h-6 w-6 text-gray-400 dark:text-gray-500" />;
            case 3:
                return <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-500" />;
            default:
                return (
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{rank}</span>
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
        const iconProps = { className: 'h-4 w-4' };
        switch (type.toLowerCase()) {
            case 'model_switch':
                return <RotateCw {...iconProps} />;
            case 'context_trim':
                return <Scissors {...iconProps} />;
            case 'prompt_optimize':
                return <Target {...iconProps} />;
            default:
                return <Sparkles {...iconProps} />;
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
                        <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                        <div className="text-danger-600 dark:text-danger-400 font-display font-bold">Error Loading Leaderboard</div>
                    </div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 font-body">{error}</p>
                    <button
                        onClick={loadLeaderboard}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <RotateCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-primary/10 text-light-text-primary dark:text-dark-text-primary p-4 sm:p-6 md:p-8 rounded-t-xl border-b border-primary-200/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <div className="flex items-center flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary mr-3 sm:mr-4 flex-shrink-0">
                            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl font-display font-bold gradient-text">Top Optimization Wins</h2>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm font-body">{getTimeRangeLabel()}</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl font-display font-bold gradient-text">
                            {formatCurrency(leaderboard.reduce((sum, entry) => sum + entry.totalSavings, 0))}
                        </div>
                        <div className="text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm font-body">Total Saved</div>
                    </div>
                </div>
            </div>

            {/* Current User Rank (if applicable) */}
            {showUserRank && userRank && (
                <div className="glass p-4 sm:p-5 md:p-6 border-b border-primary-200/30 bg-primary-500/5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center flex-1 min-w-0">
                            <div className="mr-2 sm:mr-3 flex-shrink-0">
                                {getRankIcon(userRank.rank || 0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-display font-bold text-primary-700 dark:text-primary-300 text-sm sm:text-base">Your Rank: #{userRank.rank}</div>
                                <div className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 font-body">
                                    {formatCurrency(userRank.totalSavings)} saved • {userRank.optimizationsApplied} optimizations
                                </div>
                            </div>
                        </div>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-display font-bold shadow-lg border ${getRankBadgeColor(userRank.rank || 0)} flex-shrink-0`}>
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
                            <Sparkles className="h-8 w-8 text-white" />
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
                            className={`p-4 sm:p-5 md:p-6 sm:hover:bg-primary-500/5 transition-all duration-300 sm:hover:scale-105 ${entry.userId === currentUserId ? 'glass bg-primary-500/10 border-l-4 border-primary-500 shadow-lg' : ''
                                }`}
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center flex-1 min-w-0 w-full sm:w-auto">
                                    <div className="mr-3 sm:mr-6 flex-shrink-0">
                                        {getRankIcon(entry.rank || index + 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-display font-bold text-light-text-primary dark:text-dark-text-primary text-base sm:text-lg break-words">
                                                {entry.userName || `User ${entry.userId.slice(-6)}`}
                                            </h4>
                                            {entry.userId === currentUserId && (
                                                <span className="px-2 sm:px-3 py-1 bg-gradient-primary text-white text-xs rounded-xl font-display font-bold shadow-lg animate-pulse">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 gap-2 sm:gap-6 text-xs sm:text-sm">
                                            <div className="flex items-center glass p-2 rounded-lg border border-success-200/30">
                                                <DollarSign className="h-4 w-4 mr-2 text-success-500 dark:text-success-400 flex-shrink-0" />
                                                <span className="font-display font-semibold text-success-600 dark:text-success-400">
                                                    {formatCurrency(entry.totalSavings)}
                                                </span>
                                                <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted ml-1">saved</span>
                                            </div>
                                            <div className="flex items-center glass p-2 rounded-lg border border-primary-200/30">
                                                <BarChart3 className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400 flex-shrink-0" />
                                                <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                                                    {entry.optimizationsApplied}
                                                </span>
                                                <span className="text-xs font-body text-light-text-muted dark:text-dark-text-muted ml-1">optimizations</span>
                                            </div>
                                            <div className="flex items-center glass p-2 rounded-lg border border-accent-200/30">
                                                <span className="mr-2">{getOptimizationTypeIcon(entry.topOptimizationType)}</span>
                                                <span className="font-display font-medium text-accent-600 dark:text-accent-400 capitalize">
                                                    {entry.topOptimizationType.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-primary-200/30 pt-3 sm:pt-0">
                                    <div className="text-xl sm:text-2xl font-display font-bold gradient-text">
                                        {formatCurrency(entry.totalSavings)}
                                    </div>
                                    <div className="text-xs sm:text-sm font-body text-light-text-muted dark:text-dark-text-muted">
                                        <span className="font-display font-semibold">~{formatCurrency(entry.averageSavings)}</span>/opt
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="glass p-4 sm:p-5 md:p-6 rounded-b-xl border-t border-primary-200/30 text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-primary-500 dark:text-primary-400" />
                        Updated in real-time
                    </div>
                    <span className="hidden sm:inline"> • </span>
                    <div className="flex items-center">
                        <Users className="h-4 w-4 ml-0 sm:ml-2 mr-1 text-primary-500 dark:text-primary-400" />
                        {leaderboard.length} participants
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptimizationLeaderboard;