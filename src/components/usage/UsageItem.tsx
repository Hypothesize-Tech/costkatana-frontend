// src/components/usage/UsageItem.tsx
import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Usage } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ProactiveTip } from '../intelligence';
import { intelligenceService } from '../../services/intelligence.service';

interface UsageItemProps {
  usage: Usage;
  onClick: (usage: Usage) => void;
  onOptimize?: (usage: Usage) => void;
}

export const UsageItem: React.FC<UsageItemProps> = ({
  usage,
  onClick,
  onOptimize
}) => {
  const [showTip, setShowTip] = useState(false);
  const [tipData, setTipData] = useState<any>(null);

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
        setTipData(tips[0]); // Get the most relevant tip
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    }
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      openai: 'bg-green-100 text-green-800',
      anthropic: 'bg-purple-100 text-purple-800',
      google: 'bg-blue-100 text-blue-800',
      'aws-bedrock': 'bg-orange-100 text-orange-800',
    };
    return colors[service] || 'bg-gray-100 text-gray-800';
  };

  const handleOptimizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOptimize) {
      onOptimize(usage);
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
        className="transition-colors cursor-pointer hover:bg-gray-50"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {usage.prompt.length > 50
                  ? usage.prompt.substring(0, 50) + '...'
                  : usage.prompt}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(usage.createdAt)}
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceColor(usage.service)}`}>
            {usage.service}
          </span>
        </td>

        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
          {usage.model}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {usage.totalTokens.toLocaleString()}
            {usage.totalTokens > 4000 && (
              <ExclamationCircleIcon className="inline-block ml-1 w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            {usage.promptTokens} / {usage.completionTokens}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-gray-900">
            <CurrencyDollarIcon className="mr-1 w-4 h-4 text-green-500" />
            {formatCurrency(usage.cost)}
            {usage.cost > 0.5 && (
              <ExclamationCircleIcon className="ml-1 w-4 h-4 text-yellow-500" />
            )}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="mr-1 w-4 h-4" />
            {usage.responseTime}ms
          </div>
        </td>

        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
          <div className="flex justify-end items-center space-x-2">
            {tipData && (
              <button
                onClick={handleTipClick}
                className="text-yellow-600 hover:text-yellow-900"
                title="Optimization tip available"
              >
                <ExclamationCircleIcon className="w-5 h-5" />
              </button>
            )}
            {onOptimize && usage.totalTokens > 100 && (
              <button
                onClick={handleOptimizeClick}
                className="text-indigo-600 hover:text-indigo-900"
                title="Optimize this prompt"
              >
                <SparklesIcon className="w-5 h-5" />
              </button>
            )}
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
        </td>
      </tr>

      {showTip && tipData && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-yellow-50">
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