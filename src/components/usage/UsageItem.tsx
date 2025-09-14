// src/components/usage/UsageItem.tsx
import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  StarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { Usage } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ProactiveTip, TipData } from '../intelligence/ProactiveTip';
import { intelligenceService } from '../../services/intelligence.service';
import { FeedbackButton } from '../feedback/FeedbackButton';
import { feedbackService } from '../../services/feedback.service';
import { RequestScoring } from '../training/RequestScoring';

interface UsageItemProps {
  usage: Usage;
  onClick: (usage: Usage) => void;
  onOptimize?: (usage: Usage) => void;
  onSimulate?: (usage: Usage) => void;
}

export const UsageItem: React.FC<UsageItemProps> = ({
  usage,
  onClick,
  onOptimize,
  onSimulate
}) => {
  const [showTip, setShowTip] = useState(false);
  const [tipData, setTipData] = useState<TipData | null>(null);
  const [showScoring, setShowScoring] = useState(false);

  useEffect(() => {
    // Check if this usage needs a tip
    if (usage.totalTokens > 4000 || usage.cost > 0.5) {
      fetchTipsForUsage();
    }
  }, [usage]);

  const fetchTipsForUsage = async () => {
    try {
      const tips = await intelligenceService.getTipsForUsage(usage._id);
      if (tips.length > 0) {
        setTipData(tips[0])
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    }
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      openai: 'bg-gradient-to-r from-green-400/20 to-green-500/20 text-green-600 dark:text-green-400 border-green-300/30',
      anthropic: 'bg-gradient-to-r from-purple-400/20 to-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-300/30',
      google: 'bg-gradient-to-r from-blue-400/20 to-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-300/30',
      'aws-bedrock': 'bg-gradient-to-r from-orange-400/20 to-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-300/30',
    };
    return colors[service] || 'bg-gradient-to-r from-accent-400/20 to-accent-500/20 text-accent-600 dark:text-accent-400 border-accent-300/30';
  };

  const handleOptimizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOptimize) {
      onOptimize(usage);
    }
  };

  const handleSimulateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSimulate) {
      onSimulate(usage);
    }
  };

  const handleFeedbackSubmit = async (requestId: string, rating: boolean, comment?: string) => {
    try {
      const result = await feedbackService.submitFeedback(requestId, {
        rating,
        comment,
        implicitSignals: {
          sessionDuration: Date.now() - new Date(usage.createdAt).getTime()
        }
      });

      if (result.success) {
        // Feedback submitted successfully
      } else {
        console.error('Failed to submit feedback:', result.message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleTipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTip(!showTip);
  };

  return (
    <>
      <tr
        onClick={() => onClick(usage)}
        className="transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-secondary-50/30 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 border-b border-accent-200/30"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {usage.prompt.length > 50
                  ? usage.prompt.substring(0, 50) + '...'
                  : usage.prompt}
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {formatDate(usage.createdAt)}
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium glass border ${getServiceColor(usage.service)}`}>
            {usage.service}
          </span>
        </td>

        <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
          {usage.model}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-light-text-primary dark:text-dark-text-primary">
            {usage.totalTokens.toLocaleString()}
            {usage.totalTokens > 4000 && (
              <ExclamationCircleIcon className="inline-block ml-1 w-4 h-4 text-warning-500" />
            )}
          </div>
          <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            {usage.promptTokens} / {usage.completionTokens}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-light-text-primary dark:text-dark-text-primary">
            <CurrencyDollarIcon className="mr-1 w-4 h-4 text-success-500" />
            {formatCurrency(usage.cost)}
            {usage.cost > 0.5 && (
              <ExclamationCircleIcon className="ml-1 w-4 h-4 text-warning-500" />
            )}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <ClockIcon className="mr-1 w-4 h-4" />
            {usage.responseTime}ms
          </div>
        </td>

        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
          <div className="flex justify-end items-center space-x-2">
            {tipData && (
              <button
                onClick={handleTipClick}
                className="p-2 rounded-xl glass border border-accent-200/30 text-warning-500 hover:text-warning-600 hover:border-warning-300/50 hover:shadow-md transition-all duration-300"
                title="Optimization tip available"
              >
                <ExclamationCircleIcon className="w-4 h-4" />
              </button>
            )}
            {onOptimize && usage.totalTokens > 100 && (
              <button
                onClick={handleOptimizeClick}
                className="p-2 rounded-xl glass border border-accent-200/30 text-primary-500 hover:text-primary-600 hover:border-primary-300/50 hover:shadow-md transition-all duration-300"
                title="Optimize this prompt"
              >
                <SparklesIcon className="w-4 h-4" />
              </button>
            )}
            {onSimulate && (usage.cost > 0.01 || usage.totalTokens > 500) && (
              <button
                onClick={handleSimulateClick}
                className="p-2 rounded-xl glass border border-accent-200/30 text-purple-500 hover:text-purple-600 hover:border-purple-300/50 hover:shadow-md transition-all duration-300"
                title="Try What-If Simulation"
              >
                <BeakerIcon className="w-4 h-4" />
              </button>
            )}
            {usage.metadata?.requestId && (
              <FeedbackButton
                requestId={usage.metadata.requestId}
                onFeedbackSubmit={handleFeedbackSubmit}
                size="sm"
              />
            )}
            {usage.metadata?.requestId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowScoring(!showScoring);
                }}
                className="p-2 rounded-xl glass border border-accent-200/30 text-blue-500 hover:text-blue-600 hover:border-blue-300/50 hover:shadow-md transition-all duration-300"
                title="Score this request for training"
              >
                <StarIcon className="w-4 h-4" />
              </button>
            )}
            <ChevronRightIcon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
          </div>
        </td>
      </tr>

      {showTip && tipData && (
        <tr>
          <td colSpan={7} className="px-6 py-4 glass bg-gradient-to-r from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20 border-t border-warning-200/30">
            <ProactiveTip
              tipData={tipData}
              position="inline"
              onDismiss={() => setShowTip(false)}
              onAction={(action) => {
                if (action.type === 'optimize_prompt' && onOptimize) {
                  onOptimize(usage);
                }
                setShowTip(false);
              }}
            />
          </td>
        </tr>
      )}

      {showScoring && usage.metadata?.requestId && (
        <tr>
          <td colSpan={7} className="px-6 py-4 glass bg-gradient-to-r from-blue-50/30 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-800/20 border-t border-blue-200/30">
            <div className="max-w-md">
              <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Score this request for training
              </h4>
              <RequestScoring
                requestId={usage.metadata.requestId}
                size="sm"
                onScoreSubmitted={() => {
                  setShowScoring(false);
                }}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};