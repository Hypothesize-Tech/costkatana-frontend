import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import DataNetworkEffectsService from '../../services/dataNetworkEffects.service';
import MetricCard from '../../components/DataNetworkEffects/MetricCard';
import MetricShimmer from '../../components/DataNetworkEffects/Shimmer/MetricShimmer';
import CardShimmer from '../../components/DataNetworkEffects/Shimmer/CardShimmer';

const LearningLoop: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentOutcomes, setRecentOutcomes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, outcomes] = await Promise.all([
        DataNetworkEffectsService.getLearningStats(),
        DataNetworkEffectsService.getRecentOutcomes({ limit: 10 })
      ]);
      setStats(statsData);
      setRecentOutcomes(outcomes);
    } catch (error) {
      console.error('Failed to load learning loop data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          to="/admin/data-network-effects"
          className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text-primary mb-2">
            Learning Loop Statistics
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">
            Track recommendation outcomes and automatic weight adjustments
          </p>
        </div>

        {loading ? (
          <MetricShimmer count={4} />
        ) : stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Total Outcomes Tracked"
              value={(stats.totalOutcomes || stats.totalRecommendations || 0).toLocaleString()}
              icon={<ChartBarIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
            />
            <MetricCard
              label="Acceptance Rate"
              value={`${((stats.acceptanceRate || 0) * 100).toFixed(1)}%`}
              icon={<CheckCircleIcon className="w-5 h-5 text-success-500 dark:text-success-400" />}
              change={{
                value: 5.2,
                type: 'positive'
              }}
            />
            <MetricCard
              label="Active Models Learning"
              value={stats.activeModels || 0}
              icon={<CpuChipIcon className="w-5 h-5 text-highlight-500 dark:text-highlight-400" />}
            />
            <MetricCard
              label="Avg Weight Adjustment"
              value={`${((stats.avgWeightChange || 0) * 100).toFixed(2)}%`}
              icon={<ArrowTrendingUpIcon className="w-5 h-5 text-accent-500 dark:text-accent-400" />}
            />
          </div>
        )}

        {loading ? (
          <CardShimmer count={1} />
        ) : (
          <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 overflow-hidden">
            <div className="p-6 border-b border-primary-200/30">
              <div className="flex items-center gap-3">
                <LightBulbIcon className="w-6 h-6 text-accent-500 dark:text-accent-400" />
                <h2 className="text-xl font-display font-semibold gradient-text-primary">
                  Recent Recommendation Outcomes
                </h2>
              </div>
            </div>

            {recentOutcomes.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-light-text-secondary dark:text-dark-text-secondary">No outcomes recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-500/10 dark:bg-primary-900/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                        Decision Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                        Outcome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                        Cost Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase">
                        Weight Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-200/30 dark:divide-primary-900/30">
                    {recentOutcomes.map((outcome: any, idx: number) => (
                      <tr key={idx} className="hover:bg-primary-500/5 dark:hover:bg-primary-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                            {outcome.timestamp ? new Date(outcome.timestamp).toLocaleString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary font-display font-semibold">
                          {outcome.decisionType ? outcome.decisionType.replace('_', ' ') : outcome.recommendationType || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-display font-semibold rounded-full ${outcome.outcome === 'accepted' || outcome.outcome === 'success' || outcome.status === 'accepted'
                            ? 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-400'
                            : outcome.outcome === 'rejected' || outcome.outcome === 'failure' || outcome.status === 'rejected'
                              ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-400'
                              : 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-400'
                            }`}>
                            {outcome.outcome === 'accepted' || outcome.status === 'accepted' ? (
                              <CheckCircleIcon className="w-3 h-3" />
                            ) : outcome.outcome === 'rejected' || outcome.status === 'rejected' ? (
                              <XCircleIcon className="w-3 h-3" />
                            ) : null}
                            {outcome.outcome || outcome.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-success-500 dark:text-success-400" />
                            {outcome.costSavingsActual ? `$${outcome.costSavingsActual.toFixed(4)}` : outcome.actualSavings ? `$${outcome.actualSavings.toFixed(4)}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            {(outcome.feedbackWeight || 0) > 0 ? (
                              <ArrowTrendingUpIcon className="w-4 h-4 text-success-500 dark:text-success-400" />
                            ) : (outcome.feedbackWeight || 0) < 0 ? (
                              <ArrowTrendingUpIcon className="w-4 h-4 text-danger-500 dark:text-danger-400 rotate-180" />
                            ) : null}
                            <span className={`font-display font-semibold ${(outcome.feedbackWeight || 0) > 0 ? 'text-success-500 dark:text-success-400' : (outcome.feedbackWeight || 0) < 0 ? 'text-danger-500 dark:text-danger-400' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                              {(outcome.feedbackWeight || 0) > 0 ? '+' : ''}{((outcome.feedbackWeight || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningLoop;


