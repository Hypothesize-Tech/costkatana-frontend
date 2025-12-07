import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
    label: string;
    value: string | number;
    change?: {
        value: number;
        type: 'positive' | 'negative' | 'neutral';
    };
    icon?: React.ReactNode;
    className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    change,
    icon,
    className = ''
}) => {
    const formatChange = (val: number) => {
        const abs = Math.abs(val);
        const sign = val > 0 ? '+' : '';
        return `${sign}${abs.toFixed(1)}%`;
    };

    const getChangeIcon = () => {
        switch (change?.type) {
            case 'positive':
                return <ArrowUpIcon className="w-4 h-4" />;
            case 'negative':
                return <ArrowDownIcon className="w-4 h-4" />;
            case 'neutral':
                return <ArrowRightIcon className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getChangeColor = () => {
        switch (change?.type) {
            case 'positive':
                return 'text-success-500 dark:text-success-400';
            case 'negative':
                return 'text-danger-500 dark:text-danger-400';
            case 'neutral':
                return 'text-light-text-secondary dark:text-dark-text-secondary';
            default:
                return '';
        }
    };

    return (
        <div className={`glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary-400/50 ${className}`}>
            {icon && (
                <div className="mb-3 opacity-80">
                    {icon}
                </div>
            )}

            <div className="text-3xl font-display font-bold gradient-text-primary mb-2">
                {value}
            </div>

            <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">
                {label}
            </div>

            {change && (
                <div className={`flex items-center gap-1.5 text-sm font-display font-semibold ${getChangeColor()}`}>
                    {getChangeIcon()}
                    <span>{formatChange(change.value)}</span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
