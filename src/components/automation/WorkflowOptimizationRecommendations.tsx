import React, { useState, useEffect, useMemo } from 'react';
import {
  LightBulbIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { automationService } from '../../services/automation.service';
import { WorkflowOptimizationRecommendation } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WorkflowOptimizationRecommendationsProps {
  workflowId?: string;
  startDate?: string;
  endDate?: string;
  onRecommendationClick?: (recommendation: WorkflowOptimizationRecommendation) => void;
}

export const WorkflowOptimizationRecommendations: React.FC<WorkflowOptimizationRecommendationsProps> = ({
  workflowId,
  startDate,
  endDate,
  onRecommendationClick
}) => {
  const [recommendations, setRecommendations] = useState<WorkflowOptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'immediate' | 'short_term' | 'long_term'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | WorkflowOptimizationRecommendation['category']>('all');
  const [sortBy, setSortBy] = useState<'savings' | 'effort' | 'type'>('savings');

  useEffect(() => {
    fetchRecommendations();
  }, [workflowId, startDate, endDate]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (workflowId) {
        response = await automationService.getWorkflowRecommendations(workflowId, {
          startDate,
          endDate
        });
        if (response.success) {
          setRecommendations(response.data.recommendations);
        }
      } else {
        response = await automationService.getAllRecommendations({
          startDate,
          endDate
        });
        if (response.success) {
          // Flatten recommendations from all workflows
          const allRecs = response.data.workflows.flatMap(w => 
            w.recommendations.map(r => ({ ...r, workflowId: w.workflowId, workflowName: w.workflowName }))
          );
          setRecommendations(allRecs);
        }
      }
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = recommendations.filter(rec => {
      if (filterType !== 'all' && rec.type !== filterType) return false;
      if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'savings':
          return b.potentialSavings - a.potentialSavings;
        case 'effort':
          const effortOrder = { low: 0, medium: 1, high: 2 };
          return effortOrder[a.implementationEffort] - effortOrder[b.implementationEffort];
        case 'type':
          const typeOrder = { immediate: 0, short_term: 1, long_term: 2 };
          return typeOrder[a.type] - typeOrder[b.type];
        default:
          return 0;
      }
    });

    return filtered;
  }, [recommendations, filterType, filterCategory, sortBy]);

  const totalPotentialSavings = useMemo(() => {
    return filteredAndSorted.reduce((sum, rec) => sum + rec.potentialSavings, 0);
  }, [filteredAndSorted]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'model_switch':
        return <ArrowPathIcon className="w-5 h-5" />;
      case 'caching':
        return <SparklesIcon className="w-5 h-5" />;
      default:
        return <LightBulbIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'model_switch':
        return 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
      case 'caching':
        return 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700';
      case 'batching':
        return 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700';
      case 'prompt_optimization':
        return 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700';
      default:
        return 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'immediate':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'short_term':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'long_term':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <span className="font-body">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-display font-bold gradient-text-primary mb-2">
              Optimization Recommendations
            </h3>
            <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
              {filteredAndSorted.length} recommendation{filteredAndSorted.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                Total Potential Savings
              </div>
              <div className="text-2xl font-display font-bold gradient-text-primary">
                {formatCurrency(totalPotentialSavings)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] flex items-center justify-center">
              <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
            >
              <option value="all">All Types</option>
              <option value="immediate">Immediate</option>
              <option value="short_term">Short Term</option>
              <option value="long_term">Long Term</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Category:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
            >
              <option value="all">All Categories</option>
              <option value="model_switch">Model Switch</option>
              <option value="caching">Caching</option>
              <option value="batching">Batching</option>
              <option value="prompt_optimization">Prompt Optimization</option>
              <option value="redundancy">Redundancy</option>
              <option value="workflow_design">Workflow Design</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
            >
              <option value="savings">Potential Savings</option>
              <option value="effort">Implementation Effort</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      {filteredAndSorted.length === 0 ? (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-12 text-center">
          <LightBulbIcon className="w-12 h-12 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary mb-4" />
          <p className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            No recommendations found
          </p>
          <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            {filterType !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'All workflows are optimized!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSorted.map((recommendation, index) => {
            const isExpanded = expandedCards.has(index);
            return (
              <div
                key={index}
                className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
                  onClick={() => toggleCard(index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getCategoryColor(recommendation.category)} flex items-center justify-center text-white flex-shrink-0`}>
                        {getCategoryIcon(recommendation.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                            {recommendation.title}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(recommendation.type)}`}>
                            {recommendation.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(recommendation.implementationEffort)}`}>
                            {recommendation.implementationEffort} effort
                          </span>
                        </div>
                        <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">
                          {recommendation.description}
                        </p>
                        {recommendation.workflowName && (
                          <p className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                            Workflow: {recommendation.workflowName}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <ArrowTrendingDownIcon className="w-4 h-4 text-[#06ec9e] dark:text-emerald-400" />
                            <span className="text-sm font-display font-bold gradient-text-primary">
                              {formatCurrency(recommendation.potentialSavings)}
                            </span>
                            <span className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                              ({recommendation.potentialSavingsPercentage.toFixed(0)}% savings)
                            </span>
                          </div>
                          {recommendation.estimatedTimeToImplement && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
                              <span className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                                {recommendation.estimatedTimeToImplement}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 border-t border-primary-200/20 dark:border-primary-500/10">
                    <div className="mt-4">
                      <h5 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                        Implementation Steps:
                      </h5>
                      <ol className="space-y-2">
                        {recommendation.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                              {stepIndex + 1}
                            </span>
                            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary flex-1">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    {recommendation.currentModel && recommendation.recommendedModel && (
                      <div className="mt-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/20">
                        <p className="text-sm font-body text-blue-800 dark:text-blue-300">
                          <span className="font-semibold">Model Switch:</span> {recommendation.currentModel} → {recommendation.recommendedModel}
                        </p>
                      </div>
                    )}
                    {onRecommendationClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecommendationClick(recommendation);
                        }}
                        className="mt-4 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        Apply Recommendation
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkflowOptimizationRecommendations;


