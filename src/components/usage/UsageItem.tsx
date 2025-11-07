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
        className="border-b transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-secondary-50/30 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 border-primary-200/30"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-secondary-900 dark:text-white">
                {usage.prompt.length > 50
                  ? usage.prompt.substring(0, 50) + '...'
                  : usage.prompt}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-300">
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

        <td className="px-6 py-4 text-sm whitespace-nowrap text-secondary-600 dark:text-secondary-300">
          {usage.model}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-secondary-900 dark:text-white">
            {usage.totalTokens.toLocaleString()}
            {usage.totalTokens > 4000 && (
              <ExclamationCircleIcon className="inline-block ml-1 w-4 h-4 text-warning-500" />
            )}
          </div>
          <div className="text-xs text-secondary-500 dark:text-secondary-400">
            {usage.promptTokens} / {usage.completionTokens}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-secondary-900 dark:text-white">
            <CurrencyDollarIcon className="mr-1 w-4 h-4 text-success-500" />
            {formatCurrency(usage.cost)}
            {usage.cost > 0.5 && (
              <ExclamationCircleIcon className="ml-1 w-4 h-4 text-warning-500" />
            )}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-300">
            <ClockIcon className="mr-1 w-4 h-4" />
            {usage.responseTime}ms
          </div>
        </td>

        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
          <div className="flex justify-end items-center space-x-2">
            {tipData && (
              <button
                onClick={handleTipClick}
                className="p-2 rounded-xl border transition-all duration-300 btn glass border-primary-200/30 text-warning-500 dark:text-warning-400 hover:text-warning-600 dark:hover:text-warning-300 hover:border-warning-300/50 hover:shadow-md"
                title="Optimization tip available"
              >
                <ExclamationCircleIcon className="w-4 h-4" />
              </button>
            )}
            {onOptimize && usage.totalTokens > 100 && (
              <button
                onClick={handleOptimizeClick}
                className="p-2 rounded-xl border transition-all duration-300 btn glass border-primary-200/30 text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:border-primary-300/50 hover:shadow-md"
                title="Optimize this prompt"
              >
                <SparklesIcon className="w-4 h-4" />
              </button>
            )}
            {onSimulate && (usage.cost > 0.01 || usage.totalTokens > 500) && (
              <button
                onClick={handleSimulateClick}
                className="p-2 text-purple-500 rounded-xl border transition-all duration-300 btn glass border-primary-200/30 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 hover:border-purple-300/50 hover:shadow-md"
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
                className="p-2 text-blue-500 rounded-xl border transition-all duration-300 btn dark:text-blue-400 glass border-primary-200/30 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-300/50 hover:shadow-md"
                title="Score this request for training"
              >
                <StarIcon className="w-4 h-4" />
              </button>
            )}
            <ChevronRightIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
          </div>
        </td>
      </tr>

      {showTip && tipData && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-gradient-to-r border-t glass from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200/30">
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
    </>
  );
};