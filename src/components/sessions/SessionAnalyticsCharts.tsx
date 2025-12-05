/**
 * Session Analytics Charts Component
 * Displays three separate charts: Line, Bar, and Pie charts for session analytics
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type TooltipItem
} from 'chart.js';
import { Session } from '../../services/sessions.service';
import { ArrowDownTrayIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { exportData } from '../../utils/exportSessions';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface SessionAnalyticsChartsProps {
    sessions: Session[];
    dateFrom?: string; // Filter start date
    dateTo?: string; // Filter end date
}

type ChartViewType = 'line' | 'bar' | 'pie';

export const SessionAnalyticsCharts: React.FC<SessionAnalyticsChartsProps> = ({ sessions, dateFrom, dateTo }) => {
    const [isDark, setIsDark] = useState(false);
    const [activeChart, setActiveChart] = useState<ChartViewType>('line');

    // Detect theme
    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        return () => observer.disconnect();
    }, []);

    // Group sessions by date with smart interval selection based on date range
    const chartData = useMemo(() => {
        // Determine the actual date range to use
        let minDate: number;
        let maxDate: number;

        if (dateFrom && dateTo) {
            // Use filter dates if provided (to show full range even with no data)
            minDate = new Date(dateFrom).getTime();
            maxDate = new Date(dateTo).getTime();
        } else if (sessions.length > 0) {
            // Fallback to session dates if no filter dates
            const dates = sessions.map(s => new Date(s.startedAt).getTime());
            minDate = Math.min(...dates);
            maxDate = Math.max(...dates);
        } else {
            // No data at all - return empty structure
            return {
                dates: [],
                dataBySource: [],
                sources: [],
                sourceTotals: {}
            };
        }

        const dateRangeDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
        // Group by date and source
        const groups: Record<string, Record<string, { count: number; cost: number; spans: number; timestamp: number }>> = {};
        const sourceGroups: Record<string, { count: number; cost: number; spans: number }> = {};

        // Determine grouping interval based on date range
        let groupingInterval: 'day' | 'week' | 'month';
        let dateFormatter: (date: Date) => string;

        if (dateRangeDays <= 31) {
            // Less than 1 month: group by day
            groupingInterval = 'day';
            dateFormatter = (date: Date) => date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } else if (dateRangeDays <= 90) {
            // 1-3 months: group by week
            groupingInterval = 'week';
            dateFormatter = (date: Date) => {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay()); // Get Sunday of the week
                return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            };
        } else {
            // More than 3 months: group by month
            groupingInterval = 'month';
            dateFormatter = (date: Date) => date.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });
        }

        // Always include all possible sources (even if they have no data)
        const allPossibleSources = ['telemetry', 'manual', 'unified', 'in-app', 'integration'];
        const sources = allPossibleSources; // Show all sources regardless of data

        // Group sessions by date and source
        sessions.forEach(session => {
            const date = new Date(session.startedAt);
            const source = session.source || 'unified';
            let dateKey: string;
            let timestamp: number;

            if (groupingInterval === 'day') {
                // Group by exact day
                dateKey = dateFormatter(date);
                timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            } else if (groupingInterval === 'week') {
                // Group by week (Sunday to Saturday)
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                weekStart.setHours(0, 0, 0, 0);
                dateKey = dateFormatter(weekStart);
                timestamp = weekStart.getTime();
            } else {
                // Group by month
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                dateKey = dateFormatter(monthStart);
                timestamp = monthStart.getTime();
            }

            if (!groups[dateKey]) {
                groups[dateKey] = {};
            }
            if (!groups[dateKey][source]) {
                groups[dateKey][source] = { count: 0, cost: 0, spans: 0, timestamp };
            }
            groups[dateKey][source].count++;
            groups[dateKey][source].cost += session.summary?.totalCost || 0;
            groups[dateKey][source].spans += session.summary?.totalSpans || 0;

            // Also track totals by source for pie chart
            if (!sourceGroups[source]) {
                sourceGroups[source] = { count: 0, cost: 0, spans: 0 };
            }
            sourceGroups[source].count++;
            sourceGroups[source].cost += session.summary?.totalCost || 0;
            sourceGroups[source].spans += session.summary?.totalSpans || 0;
        });

        // Generate complete date range with zeros for missing dates (grouped by source)
        const completeDateRange: Array<{
            date: string;
            timestamp: number;
            sources: Record<string, { count: number; cost: number; spans: number }>;
            total: { count: number; cost: number; spans: number };
        }> = [];

        if (groupingInterval === 'day') {
            // Generate all days in range
            const current = new Date(minDate);
            current.setHours(0, 0, 0, 0);
            const end = new Date(maxDate);
            end.setHours(23, 59, 59, 999);

            while (current <= end) {
                const dateKey = dateFormatter(current);
                const timestamp = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();

                const sourceData: Record<string, { count: number; cost: number; spans: number }> = {};
                let totalCount = 0, totalCost = 0, totalSpans = 0;

                sources.forEach(source => {
                    const data = groups[dateKey]?.[source] || { count: 0, cost: 0, spans: 0 };
                    sourceData[source] = { count: data.count, cost: data.cost, spans: data.spans };
                    totalCount += data.count;
                    totalCost += data.cost;
                    totalSpans += data.spans;
                });

                completeDateRange.push({
                    date: dateKey,
                    timestamp,
                    sources: sourceData,
                    total: { count: totalCount, cost: totalCost, spans: totalSpans }
                });

                current.setDate(current.getDate() + 1);
            }
        } else if (groupingInterval === 'week') {
            // Generate all weeks in range
            const current = new Date(minDate);
            // Move to Sunday of the week
            current.setDate(current.getDate() - current.getDay());
            current.setHours(0, 0, 0, 0);
            const end = new Date(maxDate);

            while (current <= end) {
                const weekStart = new Date(current);
                const dateKey = dateFormatter(weekStart);
                const timestamp = weekStart.getTime();

                const sourceData: Record<string, { count: number; cost: number; spans: number }> = {};
                let totalCount = 0, totalCost = 0, totalSpans = 0;

                sources.forEach(source => {
                    const data = groups[dateKey]?.[source] || { count: 0, cost: 0, spans: 0 };
                    sourceData[source] = { count: data.count, cost: data.cost, spans: data.spans };
                    totalCount += data.count;
                    totalCost += data.cost;
                    totalSpans += data.spans;
                });

                completeDateRange.push({
                    date: dateKey,
                    timestamp,
                    sources: sourceData,
                    total: { count: totalCount, cost: totalCost, spans: totalSpans }
                });

                current.setDate(current.getDate() + 7);
            }
        } else {
            // Generate all months in range
            const current = new Date(minDate);
            current.setDate(1); // First day of month
            current.setHours(0, 0, 0, 0);
            const end = new Date(maxDate);

            while (current <= end) {
                const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
                const dateKey = dateFormatter(monthStart);
                const timestamp = monthStart.getTime();

                const sourceData: Record<string, { count: number; cost: number; spans: number }> = {};
                let totalCount = 0, totalCost = 0, totalSpans = 0;

                sources.forEach(source => {
                    const data = groups[dateKey]?.[source] || { count: 0, cost: 0, spans: 0 };
                    sourceData[source] = { count: data.count, cost: data.cost, spans: data.spans };
                    totalCount += data.count;
                    totalCost += data.cost;
                    totalSpans += data.spans;
                });

                completeDateRange.push({
                    date: dateKey,
                    timestamp,
                    sources: sourceData,
                    total: { count: totalCount, cost: totalCost, spans: totalSpans }
                });

                current.setMonth(current.getMonth() + 1);
            }
        }

        // Sort by timestamp
        completeDateRange.sort((a, b) => a.timestamp - b.timestamp);

        return {
            dates: completeDateRange.map(d => d.date),
            dataBySource: completeDateRange,
            sources: sources,
            sourceTotals: sourceGroups
        };
    }, [sessions, dateFrom, dateTo]);

    // Helper function to convert hex to RGB
    const colorToRgb = useCallback((hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 100, g: 116, b: 139 };
    }, []);

    // Calculate summary statistics (used for potential future display)
    const _stats = useMemo(() => {
        if (!chartData || !chartData.dataBySource || chartData.dataBySource.length === 0) {
            return {
                totalSessions: 0,
                totalCost: 0,
                totalSpans: 0,
                avgCost: 0
            };
        }
        const totalSessions = chartData.dataBySource.reduce((sum, d) => sum + d.total.count, 0);
        const totalCost = chartData.dataBySource.reduce((sum, d) => sum + d.total.cost, 0);
        const totalSpans = chartData.dataBySource.reduce((sum, d) => sum + d.total.spans, 0);
        const avgCost = totalSessions > 0 ? totalCost / totalSessions : 0;

        return {
            totalSessions,
            totalCost,
            totalSpans,
            avgCost
        };
    }, [chartData]);

    const handleExport = (format: 'json' | 'excel') => {
        if (!chartData || !chartData.dataBySource || chartData.dataBySource.length === 0) {
            return;
        }
        // Flatten the data for export
        const flattenedData = chartData.dataBySource.map(d => {
            const sourceData: Record<string, number> = {};
            chartData.sources.forEach(source => {
                sourceData[`${source}_count`] = d.sources[source]?.count || 0;
                sourceData[`${source}_cost`] = d.sources[source]?.cost || 0;
                sourceData[`${source}_spans`] = d.sources[source]?.spans || 0;
            });
            return {
                date: d.date,
                ...sourceData,
                total_count: d.total.count,
                total_cost: d.total.cost,
                total_spans: d.total.spans
            };
        });
        exportData(flattenedData as unknown as Session[], format, 'chart', 'session-analytics');
    };

    // Theme-aware colors
    const colors = useMemo(() => ({
        text: {
            primary: isDark ? '#f8fafc' : '#0f172a',
            secondary: isDark ? '#cbd5e1' : '#475569',
            muted: isDark ? '#94a3b8' : '#64748b'
        },
        grid: {
            line: isDark ? 'rgba(203, 213, 225, 0.1)' : 'rgba(15, 23, 42, 0.08)',
            zero: isDark ? 'rgba(203, 213, 225, 0.2)' : 'rgba(15, 23, 42, 0.15)'
        },
        tooltip: {
            bg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)',
            border: isDark ? 'rgba(6, 236, 158, 0.3)' : 'rgba(6, 236, 158, 0.2)'
        }
    }), [isDark]);

    // Source colors mapping
    const sourceColors = useMemo(() => ({
        telemetry: '#3B82F6', // Blue
        manual: '#10B981', // Green
        unified: '#8B5CF6', // Purple
        'in-app': '#F59E0B', // Amber
        integration: '#EF4444', // Red
    }), []);

    // Common chart options for Line and Bar charts
    const commonChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: colors.text.primary
                }
            },
            tooltip: {
                backgroundColor: colors.tooltip.bg,
                borderColor: colors.tooltip.border,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold' as const,
                    family: 'Inter, system-ui, sans-serif'
                },
                bodyFont: {
                    size: 13,
                    family: 'Inter, system-ui, sans-serif'
                },
                titleColor: colors.text.primary,
                bodyColor: colors.text.secondary,
                displayColors: true,
                callbacks: {
                    title: (tooltipItems: Array<{ label?: string }>) => {
                        return tooltipItems[0]?.label || '';
                    },
                    label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;

                        if (label === 'Cost ($)') {
                            return `${label}: $${value.toFixed(4)}`;
                        } else if (label === 'Spans') {
                            return `${label}: ${value.toLocaleString()}`;
                        } else {
                            return `${label}: ${value.toLocaleString()}`;
                        }
                    },
                    labelColor: (tooltipItem: TooltipItem<'line' | 'bar'>) => {
                        const color = typeof tooltipItem.dataset.borderColor === 'string'
                            ? tooltipItem.dataset.borderColor
                            : '#06ec9e';
                        return {
                            borderColor: color,
                            backgroundColor: color
                        };
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: colors.grid.line,
                    drawBorder: false
                },
                ticks: {
                    color: colors.text.muted,
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif'
                    },
                    padding: 10,
                    maxRotation: 45,
                    minRotation: 0
                },
                border: {
                    color: colors.grid.line
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: colors.grid.line,
                    drawBorder: false,
                    zeroLineColor: colors.grid.zero,
                    zeroLineWidth: 1.5
                },
                ticks: {
                    color: colors.text.muted,
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif'
                    },
                    padding: 10,
                    callback: function (value: string | number) {
                        if (typeof value === 'number') {
                            if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'k';
                            }
                            return value.toLocaleString();
                        }
                        return value;
                    }
                },
                border: {
                    color: colors.grid.line
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart' as const
        }
    }), [colors]);

    // Line chart options
    const lineChartOptions = useMemo(() => ({
        ...commonChartOptions,
        elements: {
            point: {
                radius: 5,
                hoverRadius: 7,
                borderWidth: 2,
                hoverBorderWidth: 3
            },
            line: {
                tension: 0.4,
                borderWidth: 3
            }
        }
    }), [commonChartOptions]);

    // Bar chart options
    const barChartOptions = useMemo(() => ({
        ...commonChartOptions,
        elements: {
            bar: {
                borderRadius: 6,
                borderSkipped: false
            }
        }
    }), [commonChartOptions]);

    // Pie chart options
    const pieChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: colors.text.primary
                }
            },
            tooltip: {
                backgroundColor: colors.tooltip.bg,
                borderColor: colors.tooltip.border,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold' as const,
                    family: 'Inter, system-ui, sans-serif'
                },
                bodyFont: {
                    size: 13,
                    family: 'Inter, system-ui, sans-serif'
                },
                titleColor: colors.text.primary,
                bodyColor: colors.text.secondary,
                displayColors: true,
                callbacks: {
                    label: (context: TooltipItem<'doughnut'>) => {
                        const label = context.label || '';
                        const value = typeof context.parsed === 'number' ? context.parsed : 0;
                        const dataset = context.dataset;
                        const total = (dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

                        if (label === 'Cost ($)') {
                            return `${label}: $${value.toFixed(4)} (${percentage}%)`;
                        } else if (label === 'Spans') {
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        } else {
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart' as const
        }
    }), [colors]);

    // Line chart data - showing sessions by source
    const lineChartData = useMemo(() => {
        if (!chartData || !chartData.dataBySource || chartData.dataBySource.length === 0) {
            return { labels: [], datasets: [] };
        }

        const pointBorder = isDark ? '#0f172a' : '#ffffff';
        const opacity = isDark ? '0.3' : '0.15';

        // Create datasets for each source showing sessions count
        const datasets = chartData.sources.map(source => {
            const color = sourceColors[source as keyof typeof sourceColors] || '#64748b';
            const rgb = colorToRgb(color);

            return {
                label: `${source.charAt(0).toUpperCase() + source.slice(1)} - Sessions`,
                data: chartData.dataBySource.map(d => d.sources[source]?.count || 0),
                borderColor: color,
                backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: color,
                pointBorderColor: pointBorder,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: pointBorder
            };
        });

        return {
            labels: chartData.dates,
            datasets
        };
    }, [chartData, isDark, sourceColors, colorToRgb]);

    // Bar chart data - showing sessions by source
    const barChartData = useMemo(() => {
        if (!chartData || !chartData.dataBySource || chartData.dataBySource.length === 0) {
            return { labels: [], datasets: [] };
        }

        const opacity = isDark ? '0.8' : '0.6';

        // Create datasets for each source showing sessions count
        const datasets = chartData.sources.map(source => {
            const color = sourceColors[source as keyof typeof sourceColors] || '#64748b';
            const rgb = colorToRgb(color);

            return {
                label: `${source.charAt(0).toUpperCase() + source.slice(1)}`,
                data: chartData.dataBySource.map(d => d.sources[source]?.count || 0),
                backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`,
                borderColor: color,
                borderWidth: 2
            };
        });

        return {
            labels: chartData.dates,
            datasets
        };
    }, [chartData, isDark, sourceColors, colorToRgb]);

    // Pie chart data (showing distribution by source)
    const pieChartData = useMemo(() => {
        if (!chartData || !chartData.sources || chartData.sources.length === 0) {
            return { labels: [], datasets: [] };
        }

        const opacity = isDark ? '0.8' : '0.7';
        const labels: string[] = [];
        const data: number[] = [];
        const backgroundColors: string[] = [];
        const borderColors: string[] = [];

        // Show all sources, even if they have zero data
        chartData.sources.forEach(source => {
            const total = chartData.sourceTotals[source]?.count || 0;
            labels.push(source.charAt(0).toUpperCase() + source.slice(1));
            data.push(total); // Include even if 0
            const color = sourceColors[source as keyof typeof sourceColors] || '#64748b';
            const rgb = colorToRgb(color);
            backgroundColors.push(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
            borderColors.push(color);
        });

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    hoverOffset: 8
                }
            ]
        };
    }, [chartData, isDark, sourceColors, colorToRgb]);

    if (!chartData || chartData.dataBySource.length === 0) {
        return (
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
                <div className="text-center py-12">
                    <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-secondary-400 dark:text-secondary-600" />
                    <p className="text-secondary-600 dark:text-secondary-400 text-lg font-medium">
                        No session data available
                    </p>
                    <p className="text-secondary-500 dark:text-secondary-500 text-sm mt-2">
                        Analytics will appear once you have session data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-gradient-primary glow-primary shadow-lg flex-shrink-0">
                        <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-display font-bold text-secondary-900 dark:text-white">
                            Session Analytics
                        </h3>
                        <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">
                            Interactive chart visualizations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Export Menu */}
                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 dark:border-secondary-700/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 dark:hover:border-primary-500/50 transition-all duration-300">
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
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel origin-top-right focus:outline-none">
                                <div className="py-2">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleExport('json')}
                                                className={`${active
                                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                                    : 'text-secondary-700 dark:text-secondary-300'
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
                                                className={`${active
                                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                                    : 'text-secondary-700 dark:text-secondary-300'
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

            {/* Chart Tabs */}
            <div className="mb-4 sm:mb-5 md:mb-6">
                <div className="inline-flex rounded-lg border border-primary-200/30 dark:border-primary-500/20 p-1 bg-secondary-50 dark:bg-secondary-900/50 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveChart('line')}
                        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-md transition-all duration-300 ${activeChart === 'line'
                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-500/10'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-1 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current opacity-80"></span>
                            <span className="hidden sm:inline">Line Chart</span>
                            <span className="sm:hidden">Line</span>
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveChart('bar')}
                        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-md transition-all duration-300 ${activeChart === 'bar'
                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-500/10'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-1 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current opacity-80"></span>
                            <span className="hidden sm:inline">Bar Chart</span>
                            <span className="sm:hidden">Bar</span>
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveChart('pie')}
                        className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-md transition-all duration-300 ${activeChart === 'pie'
                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-500/10'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-1 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current opacity-80"></span>
                            <span className="hidden sm:inline">Pie Chart</span>
                            <span className="sm:hidden">Pie</span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Active Chart Display */}
            <div className="glass rounded-lg border border-primary-200/20 dark:border-primary-500/10 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-light-bg-100/30 to-light-bg-200/20 dark:from-dark-bg-200/30 dark:to-dark-bg-300/20">
                {/* Line Chart */}
                {activeChart === 'line' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                            <div className="w-1 h-4 sm:h-6 bg-gradient-primary rounded-full"></div>
                            <h4 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white">Line Chart</h4>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-auto">Trend Analysis</span>
                        </div>
                        <div className="h-64 sm:h-80 md:h-96">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>
                )}

                {/* Bar Chart */}
                {activeChart === 'bar' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                            <div className="w-1 h-4 sm:h-6 bg-gradient-highlight rounded-full"></div>
                            <h4 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white">Bar Chart</h4>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-auto">Comparison View</span>
                        </div>
                        <div className="h-64 sm:h-80 md:h-96">
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                    </div>
                )}

                {/* Pie Chart */}
                {activeChart === 'pie' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                            <div className="w-1 h-4 sm:h-6 bg-gradient-accent rounded-full"></div>
                            <h4 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white">Distribution</h4>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-auto">Total Breakdown</span>
                        </div>
                        <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center">
                            <Doughnut data={pieChartData} options={pieChartOptions} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

