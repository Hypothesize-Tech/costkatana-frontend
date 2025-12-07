import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface TrendIndicatorProps {
    direction: 'improving' | 'degrading' | 'stable';
    value?: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
    direction,
    value,
    size = 'md',
    showLabel = true
}) => {
    const getColor = () => {
        switch (direction) {
            case 'improving':
                return 'text-green-600 dark:text-green-400';
            case 'degrading':
                return 'text-red-600 dark:text-red-400';
            case 'stable':
                return 'text-gray-500 dark:text-gray-400';
        }
    };

    const getIcon = () => {
        const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

        switch (direction) {
            case 'improving':
                return <ArrowTrendingUpIcon className={sizeClass} />;
            case 'degrading':
                return <ArrowTrendingDownIcon className={sizeClass} />;
            case 'stable':
                return <MinusIcon className={sizeClass} />;
        }
    };

    const getLabel = () => {
        switch (direction) {
            case 'improving':
                return 'Improving';
            case 'degrading':
                return 'Degrading';
            case 'stable':
                return 'Stable';
        }
    };

    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

    return (
        <div className={`inline-flex items-center gap-1.5 font-medium ${getColor()} ${textSize}`}>
            {getIcon()}
            {showLabel && <span>{getLabel()}</span>}
            {value !== undefined && <span>({Math.abs(value).toFixed(1)}%)</span>}
        </div>
    );
};

export default TrendIndicator;
