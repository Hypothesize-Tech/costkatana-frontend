import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    ChartBarIcon,
    Squares2X2Icon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    getLineChartOptions,
    getBarChartOptions,
    getDoughnutChartOptions,
    generateLineChartData,
    generateBarChartData,
    generateDoughnutChartData,
} from '../../utils/chartConfig';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SpendingTrends } from '../../services/adminUserSpending.service';

type ChartType = 'line' | 'bar' | 'doughnut' | 'area';

interface SpendingChartSwitcherProps {
    trendsData: SpendingTrends[];
    loading?: boolean;
}

export const SpendingChartSwitcher: React.FC<SpendingChartSwitcherProps> = ({
    trendsData,
    loading = false,
}) => {
    const [chartType, setChartType] = useState<ChartType>('line');

    if (loading || !trendsData || trendsData.length === 0) {
        return (
            <div className="glass backdrop-blur-xl rounded-xl p-4 sm:p-6 md:p-8 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 sm:p-2.5 rounded-xl glow-primary shadow-lg">
                        <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-display font-bold gradient-text-primary">
                        Spending Trends
                    </h3>
                </div>
                <div className="skeleton h-48 sm:h-56 md:h-64 rounded-lg" />
            </div>
        );
    }

    const labels = trendsData.map((item) => formatDate(item.date, 'MMM d'));
    const costData = trendsData.map((item) => item.totalCost);
    const tokensData = trendsData.map((item) => item.totalTokens);
    const requestsData = trendsData.map((item) => item.totalRequests);

    const chartOptions = {
        line: getLineChartOptions({
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const index = context.dataIndex;
                            return [
                                `Cost: ${formatCurrency(context.parsed.y)}`,
                                `Tokens: ${tokensData[index]?.toLocaleString() || 0}`,
                                `Requests: ${requestsData[index]?.toLocaleString() || 0}`,
                            ];
                        },
                    },
                },
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value: any) => formatCurrency(value),
                    },
                },
            },
        }),
        bar: getBarChartOptions({
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const index = context.dataIndex;
                            return [
                                `Cost: ${formatCurrency(context.parsed.y)}`,
                                `Tokens: ${tokensData[index]?.toLocaleString() || 0}`,
                                `Requests: ${requestsData[index]?.toLocaleString() || 0}`,
                            ];
                        },
                    },
                },
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value: any) => formatCurrency(value),
                    },
                },
            },
        }),
        doughnut: getDoughnutChartOptions({
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = costData.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        },
                    },
                },
            },
        }),
    };

    const renderChart = () => {
        switch (chartType) {
            case 'line':
            case 'area':
                return (
                    <Line
                        data={generateLineChartData(labels, [
                            {
                                label: 'Total Cost',
                                data: costData,
                                color: '#06ec9e',
                                fill: chartType === 'area',
                            },
                        ])}
                        options={chartOptions.line}
                    />
                );
            case 'bar':
                return (
                    <Bar
                        data={generateBarChartData(labels, [
                            {
                                label: 'Total Cost',
                                data: costData,
                                color: '#06ec9e',
                            },
                        ])}
                        options={chartOptions.bar}
                    />
                );
            case 'doughnut': {
                // For doughnut, we aggregate by time period
                const totalCost = costData.reduce((a, b) => a + b, 0);
                const averageCost = totalCost / costData.length;
                return (
                    <Doughnut
                        data={generateDoughnutChartData(
                            ['Total Spending', 'Average'],
                            [totalCost, averageCost],
                            ['#06ec9e', '#3b82f6']
                        )}
                        options={chartOptions.doughnut}
                    />
                );
            }
            default:
                return null;
        }
    };

    const chartIcons = {
        line: ArrowTrendingUpIcon,
        bar: ChartBarIcon,
        doughnut: Squares2X2Icon,
        area: ArrowTrendingUpIcon,
    };

    const chartLabels = {
        line: 'Line Chart',
        bar: 'Bar Chart',
        doughnut: 'Doughnut Chart',
        area: 'Area Chart',
    };

    const IconComponent = chartIcons[chartType];

    return (
        <div className="glass backdrop-blur-xl rounded-xl p-3 sm:p-4 md:p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 sm:p-2.5 rounded-xl glow-primary shadow-lg">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-display font-bold gradient-text-primary">
                            Spending Trends
                        </h3>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Platform-wide spending over time
                        </p>
                    </div>
                </div>

                {/* Chart Type Switcher */}
                <Menu as="div" className="relative">
                    <Menu.Button className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md text-light-text-primary dark:text-dark-text-primary">
                        <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
                        <span className="hidden xs:inline">{chartLabels[chartType]}</span>
                        <span className="xs:hidden">Chart</span>
                        <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-30 mt-2 w-48 backdrop-blur-xl rounded-lg shadow-xl border border-primary-200/30 bg-white dark:bg-gray-800 overflow-hidden">
                            <div className="py-1">
                                {(['line', 'bar', 'doughnut', 'area'] as ChartType[]).map((type) => {
                                    const TypeIcon = chartIcons[type];
                                    return (
                                        <Menu.Item key={type}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setChartType(type)}
                                                    className={`${active
                                                        ? 'bg-primary-500/10 dark:bg-primary-900/20'
                                                        : ''
                                                        } ${chartType === type
                                                            ? 'text-primary-600 dark:text-primary-400 font-semibold bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border-l-2 border-primary-500'
                                                            : 'text-light-text-primary dark:text-dark-text-primary'
                                                        } flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-all duration-200`}
                                                >
                                                    <TypeIcon className="w-4 h-4" />
                                                    {chartLabels[type]}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    );
                                })}
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            <div className="h-48 sm:h-56 md:h-64 chart-container">{renderChart()}</div>
        </div>
    );
};

