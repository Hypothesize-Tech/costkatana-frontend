import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercentageChange } from '@/utils/formatters';

interface StatsCardProps {
    title: string;
    value: number;
    change?: {
        value: number;
        percentage: number;
        trend: 'up' | 'down' | 'stable';
    };
    format?: 'currency' | 'number' | 'percentage';
    icon?: React.ComponentType<{ className?: string }>;
    loading?: boolean;
}

export const StatsCard = ({
    title,
    value,
    change,
    format = 'number',
    icon: Icon,
    loading = false,
}: StatsCardProps) => {
    const formatValue = () => {
        switch (format) {
            case 'currency':
                return formatCurrency(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            default:
                return formatNumber(value);
        }
    };

    const isPositive = change?.trend === 'up';
    const isNegative = change?.trend === 'down';

    return (
        <div className="p-6 card">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </dt>
                    <dd className="mt-2">
                        {loading ? (
                            <div className="w-24 h-8 skeleton" />
                        ) : (
                            <div className="flex flex-col gap-1">
                                <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {formatValue()}
                                </span>
                                {change && change.trend !== 'stable' && (
                                    <span
                                        className={cn(
                                            'inline-flex items-center text-sm font-semibold',
                                            isPositive && format === 'currency' ? 'text-danger-600' : 'text-success-600',
                                            isNegative && format === 'currency' ? 'text-success-600' : 'text-danger-600',
                                            !format || format === 'number' ? (isPositive ? 'text-success-600' : 'text-danger-600') : ''
                                        )}
                                    >
                                        {isPositive ? (
                                            <ArrowUpIcon className="flex-shrink-0 mr-1 w-4 h-4" />
                                        ) : (
                                            <ArrowDownIcon className="flex-shrink-0 mr-1 w-4 h-4" />
                                        )}
                                        <span className="sr-only">
                                            {isPositive ? 'Increased' : 'Decreased'} by
                                        </span>
                                        {formatPercentageChange(change.percentage)}
                                    </span>
                                )}
                            </div>
                        )}
                    </dd>
                </div>
                {Icon && (
                    <div className="ml-4">
                        <Icon className="w-8 h-8 text-gray-400" />
                    </div>
                )}
            </div>
        </div>
    );
};