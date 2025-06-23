// src/components/usage/UsageItem.tsx
import React from 'react';
import { 
  SparklesIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { Usage } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

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

  return (
    <tr 
      onClick={() => onClick(usage)}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
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
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {usage.model}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {usage.totalTokens.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">
          {usage.promptTokens} / {usage.completionTokens}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
          {formatCurrency(usage.cost)}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-1" />
          {usage.responseTime}ms
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {onOptimize && usage.totalTokens > 100 && (
            <button
              onClick={handleOptimizeClick}
              className="text-indigo-600 hover:text-indigo-900"
              title="Optimize this prompt"
            >
              <SparklesIcon className="h-5 w-5" />
            </button>
          )}
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </div>
      </td>
    </tr>
  );
};