/**
 * Session Analytics Charts Component
 * Displays interactive charts for sessions, cost, and spans with bar/line/area toggle
 */

import React, { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Session } from '../../services/sessions.service';
import { ArrowDownTrayIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { exportData } from '../../utils/exportSessions';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface SessionAnalyticsChartsProps {
    sessions: Session[];
}

type ChartType = 'line' | 'bar' | 'area';

export const SessionAnalyticsCharts: React.FC<SessionAnalyticsChartsProps> = ({ sessions }) => {
    const [chartType, setChartType] = useState<ChartType>('line');

    // Group sessions by date
    const chartData = useMemo(() => {
        const groups: Record<string, { count: number; cost: number; spans: number }> = {};

        sessions.forEach(session => {
            const date = new Date(session.startedAt).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = { count: 0, cost: 0, spans: 0 };
            }
            groups[date].count++;
            groups[date].cost += session.summary?.totalCost || 0;
            groups[date].spans += session.summary?.totalSpans || 0;
        });

        // Sort by date
        const sortedDates = Object.keys(groups).sort((a, b) =>
            new Date(a).getTime() - new Date(b).getTime()
        );

        return sortedDates.map(date => ({
            date,
            count: groups[date].count,
            cost: groups[date].cost,
            spans: groups[date].spans
        }));
    }, [sessions]);

    const handleExport = (format: 'json' | 'excel') => {
        exportData(chartData, format, 'chart', 'session-analytics');
    };

    const getChartOptions = (title: string, yAxisLabel: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#1f2937'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 11
                    }
                },
                title: {
                    display: true,
                    text: yAxisLabel,
                    font: {
                        size: 12
                    }
                }
            }
        }
    });

    const createChartData = (label: string, data: number[], color: string, fillColor: string) => {
        const baseData = {
            labels: chartData.map(d => d.date),
            datasets: [
                {
                    label,
                    data,
                    borderColor: color,
                    backgroundColor: chartType === 'area' ? fillColor : color,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: chartType === 'area',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: color,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        };
        return baseData;
    };

    const ChartComponent = chartType === 'bar' ? Bar : Line;

    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-primary glow-primary">
                        <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold gradient-text-primary">Session Analytics</h3>
                </div>

                <div className="flex items-center gap-3">
                    {/* Chart Type Toggle */}
                    <div className="inline-flex rounded-lg border border-primary-200/30 p-1 bg-secondary-50 dark:bg-secondary-900/30">
                        {(['line', 'bar', 'area'] as ChartType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setChartType(type)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${chartType === type
                                        ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                        : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Export Menu */}
                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300">
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            Export
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel origin-top-right focus:outline-none">
                                <div className="py-2">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleExport('json')}
                                                className={`${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
                                                    } group flex items-center px-4 py-2 text-sm w-full text-left rounded-lg mx-2 transition-colors`}
                                            >
                                                Export as JSON
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleExport('excel')}
                                                className={`${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
                                                    } group flex items-center px-4 py-2 text-sm w-full text-left rounded-lg mx-2 transition-colors`}
                                            >
                                                Export as Excel
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sessions Count Chart */}
                <div className="glass rounded-lg border border-primary-200/20 p-4 bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50">
                    <div className="h-64">
                        <ChartComponent
                            data={createChartData(
                                'Sessions',
                                chartData.map(d => d.count),
                                '#3B82F6',
                                'rgba(59, 130, 246, 0.1)'
                            )}
                            options={getChartOptions('Sessions Count', 'Count') as any}
                        />
                    </div>
                </div>

                {/* Total Cost Chart */}
                <div className="glass rounded-lg border border-primary-200/20 p-4 bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50">
                    <div className="h-64">
                        <ChartComponent
                            data={createChartData(
                                'Cost',
                                chartData.map(d => d.cost),
                                '#10B981',
                                'rgba(16, 185, 129, 0.1)'
                            )}
                            options={{
                                ...getChartOptions('Total Cost', 'Cost ($)'),
                                plugins: {
                                    ...(getChartOptions('Total Cost', 'Cost ($)') as any).plugins,
                                    tooltip: {
                                        ...(getChartOptions('Total Cost', 'Cost ($)') as any).plugins.tooltip,
                                        callbacks: {
                                            label: (context: any) => `Cost: $${context.parsed.y.toFixed(4)}`
                                        }
                                    }
                                }
                            } as any}
                        />
                    </div>
                </div>

                {/* Total Spans Chart */}
                <div className="glass rounded-lg border border-primary-200/20 p-4 bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50">
                    <div className="h-64">
                        <ChartComponent
                            data={createChartData(
                                'Spans',
                                chartData.map(d => d.spans),
                                '#F59E0B',
                                'rgba(245, 158, 11, 0.1)'
                            )}
                            options={getChartOptions('Total Spans', 'Spans') as any}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

